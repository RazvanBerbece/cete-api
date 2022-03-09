/**
 * CLASS StorageBlobClient
 * API for the Azure Storage Container (Blob Storage) tool suite
 * 
 * Handles connection, uploading & downloading data and returning useful outputs
 * 
 */
import { BlobClient, BlobItem, BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import Cete from "../Cete/Cete";

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

    /* Uploads audio data (base64 encoded) from the cete argument to a Blob on Azure with an audio/wav content-type.
     * @param cete - cete to be uplaoded to Blob
     * @returns - 1 if successful, Error if failed
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
     * Downloads a list of items from the Azure blobs under userId
     * @param userId - the downloaded cetes will haven been posted by the user with userId
     * @param archived - whether to get publicly visible cetes or archived ones
     * @returns number of cetes downloaded, Error if failed
     */
    public async downloadCetesDataForUserIdFromWAVBlob(userId: string, archived: boolean, limit: number): Promise<BlobItem[] | Error> {

        const cetes = [];

        try {

            const getMetadataResult = await this.getCetesMetadataForUserIdFromWAVBlob(userId, archived, limit);
            if (getMetadataResult instanceof Error) {
                return Error(getMetadataResult.message);
            }
            else {
                for (let i = 0; i < getMetadataResult.length; ++i) {
                    // Get a block blob client for current blob in iteration
                    const blockBlobClient = this.blobContainerClient.getBlockBlobClient(getMetadataResult[i].name);
                    const downloadBlockBlobResponse = await blockBlobClient.download(0);
                    cetes.push(await StorageBlobClient.streamToString(downloadBlockBlobResponse.readableStreamBody))
                }

                console.log(cetes);
                return cetes;
            }
        }
        catch (err) {
            return Error(`${err}`);
        }

    }

    /**
     * UTILS
     */
     public static async streamToString(readableStream) {
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

}

export default StorageBlobClient;