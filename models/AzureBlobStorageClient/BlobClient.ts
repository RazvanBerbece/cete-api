/**
 * CLASS StorageBlobClient
 * API for the Azure Storage Container (Blob Storage) tool suite
 * 
 * Handles connection, uploading & downloading data and returning useful outputs
 * 
 */
import { BlobItem, BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import DBClient from "../AzureCosmosDBClient/DBClient";
import Cete from "../Cete/Cete";
import { CeteDictProfile, CeteDictWithData } from "../Cete/CeteTypes";

class StorageBlobClient {

    // Azure Storage Container fields (Blob Storage)
    private blobServiceClient: BlobServiceClient;
    private blobContainerClient: ContainerClient;

    constructor(blobContainerName: string) {

        // Constant used to dynamically refer to either the staging or production environment on Azure, 
        // based on the ENVIRONMENT env variable
        // Declared here as .env is loaded a while after the 'func start' call
        const ENV = process.env['ENVIRONMENT'].toUpperCase();

        // initialise BlobServiceClient
        this.blobServiceClient = BlobServiceClient.fromConnectionString(process.env[`AZURE_${ENV}_STORAGE_ACC_CONN_STRING`]);
        this.blobContainerClient = this.blobServiceClient.getContainerClient(blobContainerName);

    }

    /** 
     * Uploads audio data (base64 encoded) from the cete argument to a Blob on Azure with an audio/wav content-type.
     * @param cete - cete to be uploaded to Blob
     * @returns 1 if successful, Error if failed
     */
    public async uploadCeteToWAVBlob(cete: Cete): Promise<1 | Error> {

        // Create blob name
        const blobName = cete.getFilePath();
        if (blobName == "NaN") {
            return Error("Cete does not have a filepath.");
        }

        // Get a block blob client
        const blockBlobClient = this.blobContainerClient.getBlockBlobClient(blobName);

        // Upload audio type data to the blob
        const data = cete.getData();
        const blobOptions = { blobHTTPHeaders: { blobContentType: 'audio/wav' } };
        const uploadBlobResponse = await blockBlobClient.upload(data, data.length, blobOptions);
        console.log(
            "Blob was uploaded successfully. requestId:",
            uploadBlobResponse.requestId
        );

        // TODO: Maybe return processed thumbnail ? (if done on server-side)
        return 1;

    }

    /**
     * Gets a list of metadata items from the Azure blobs under userId
     * @param userId - the downloaded cetes will haven been posted by the user with userId
     * @param archived - whether to get publicly visible cetes or archived ones
     * @param countLimit - how many cetes to load from userId/s blob
     * @returns number of cetes downloaded, Error if failed
     */
    public async getCetesMetadataForUserIdFromWAVBlob(userId: string, archived: boolean, countLimit: number): Promise<BlobItem[] | Error> {

        const cetes = [];
        const visibilityPath = archived == true ? 'archived' : 'public';

        try {
            for await (const blob of this.blobContainerClient.listBlobsFlat({ prefix: `${userId}/${visibilityPath}` })) {
                if (cetes.length >= countLimit) { 
                    break; 
                }
                cetes.push(blob)
            }
            return cetes;
        }
        catch (err) {
            return Error(`${err}`);
        }
    }

    /**
     * Can add partial data downlaod for a server-processed thumbnail (to investigate)
     * 
     * Downloads a list of items from the Azure blobs under userId
     * @param userId - the downloaded cetes will haven been posted by the user with userId
     * @param archived - whether to get publicly visible cetes or archived ones
     * @returns number of cetes downloaded, Error if failed
     */
    public async downloadCetesForProfile(userId: string, archived: boolean, limit: number): Promise<CeteDictProfile[] | Error> {

        const cetes = []; // will be returned and will hold Cete objects under userId with the given visibility

        try {

            // Connect to Azure DB using the DBClient internal API
            const database_client = new DBClient(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");

            const getMetadataResult = await this.getCetesMetadataForUserIdFromWAVBlob(userId, archived, limit);
            if (getMetadataResult instanceof Error) {
                return Error(getMetadataResult.message);
            }
            else {
                for (let i = 0; i < getMetadataResult.length; ++i) {

                    // Populate a Cete object to be added to the list of objects
                    const ceteObj = new Cete();

                    // // Get a block blob client for current blob in iteration & download
                    // const blockBlobClient = this.blobContainerClient.getBlockBlobClient(getMetadataResult[i].name);
                    // const downloadBlockBlobResponse = await blockBlobClient.download(0);

                    // // Set data of the ceteObj with the string streamed from the .download() result
                    // ceteObj.setData(await StorageBlobClient.streamToString(downloadBlockBlobResponse.readableStreamBody));

                    // Get CeteId from BlobItem name
                    ceteObj.setCeteId(await StorageBlobClient.getCeteIdFromBlobItem(getMetadataResult[i]));

                    // Set remaining ceteObj fields
                    ceteObj.setUserId(userId);

                    // Get Cete timestamp
                    await database_client.getCetefromCeteIndexing(ceteObj.getCeteId())
                    .then((response: Cete) => {
                        ceteObj.setTimestamp(response.getTimestamp());
                        ceteObj.setListens(response.getListens());
                        ceteObj.setIsArchived(response.getisArchived());
                        cetes.push(ceteObj.getDictForProfile());
                    })
                    .catch(() => {
                        return Error(`ServerErrorGetTimestampFromIndexing : Failed to get timestamp for cete with id ${ceteObj.getCeteId()}`)
                    });

                }

                return cetes;
            }
        }
        catch (err) {
            return Error(`${err}`);
        }

    }

    /**
     * Downloads cete audioData from the WAV Blob using the filepath stored in the CosmosDB Indexing
     * @param userId - id of user downloading the cete data
     * @param ceteId - id of cete data to be downloaded
     * @returns CeteDictWithData if successful, Error if failed
     */
    public async downloadCeteFromWAVBlob(userId: string, ceteId: string): Promise<CeteDictWithData | Error> {
        return new Promise((resolve, reject) => {
            try {

                let filepath: string;
    
                // Connect to Azure DB using the DBClient internal API
                const database_client = new DBClient(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");
    
                // Get Cete Filepath & timestamp from indexing
                database_client.getCetefromCeteIndexing(ceteId)
                .then(async (response: Cete) => {
    
                    filepath = response.getFilePath();
                    
                    // Populate a Cete object to be added to the list of objects
                    const ceteObj = new Cete();
    
                    // Get a block blob client for current blob in iteration & download
                    const blockBlobClient = this.blobContainerClient.getBlockBlobClient(filepath);
                    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    
                    // Set data of the ceteObj with the string streamed from the .download() result
                    ceteObj.setData(await StorageBlobClient.streamToString(downloadBlockBlobResponse.readableStreamBody));
    
                    // Set ceteObj fields
                    ceteObj.setIsArchived(response.getisArchived());
                    ceteObj.setUserId(userId);
                    ceteObj.setCeteId(ceteId);
                    ceteObj.setTimestamp(response.getTimestamp());
                    ceteObj.setListens(response.getListens());
                    
                    resolve(ceteObj.getCeteDictWithData());
                })
                .catch((err) => {
                    reject(Error(`ServerErrorGetIdFromIndexing : ${err} ~> Failed to get audio data for cete with id ${ceteId}`));
                });
            }
            catch (err) {
                reject(Error(`${err}`));
            }
        });
    }

    /**
     * UTILS
     */
     public static async streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks = [];

            readableStream.on("data", (data) => {
                chunks.push(data.toString());
            });

            readableStream.on("end", () => {
                resolve(chunks.join(""));
            });

            readableStream.on("error", reject);
        });
    }
    /**
     * Returns the ceteId of a BlobItem using the .name field
     * @param blobItem - BlobItem object used to get ceteId from
     * @returns ceteId
     */
    public static async getCeteIdFromBlobItem(blobItem: BlobItem): Promise<string> {
        return new Promise((resolve, reject) => {
            let ceteId: string;
            const filepath = blobItem.name;
            // Iterate backwards through string and create ceteId between '.wav' and the last '/' (/ceteId.wav)
            // Skip the .wav right to left
            let reversedCeteId= '';
            for (let i = filepath.length - 5; i >= 0; i--) {
                if (filepath[i] != '/') {
                    reversedCeteId += filepath[i];
                }
                else {
                    // the iteratively built string has to be reversed to give the expected ceteId
                    ceteId = reversedCeteId.split('').reverse().join('');
                    resolve(ceteId);
                }
            } 
            reject();
        });
    }

}

export default StorageBlobClient;