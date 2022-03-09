/**
 * CLASS DBClient
 * API for the Azure SQL tool suite (SQL Server, SQL Database)
 * 
 * Handles getting credentials, connection, running queries and returning useful outputs
 * 
 */
// import crypto from "crypto";
import { Container, CosmosClient, Database, SqlQuerySpec } from "@azure/cosmos";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import Cete from "../Cete/Cete";

class DBClient {

    // CosmosDB fields
    private client: CosmosClient;
    private database: Database;
    private container: Container;

    // Azure Storage Container fields (Blob Storage)
    private blobServiceClient: BlobServiceClient;
    private blobContainerClient: ContainerClient;

    /**
     * Creates a CosmosDB Client and Blob Storage Client using environment variables for the connection strings
     *     - connects to the CosmosDB database with databaseId and gets the container with containerId within that database
     *     - connects to the blobContainerName Blob Container
     * @param databaseId - id for database to connect client to
     * @param containerId - id for container within the database object returned from the databaseId
     */
    constructor(databaseId: string, containerId: string, blobContainerName: string) {

        // Constant used to dynamically refer to either the staging or production environment on Azure, 
        // based on the ENVIRONMENT env variable
        // Declared here as .env is loaded a while after the 'func start' call
        const ENV = process.env['ENVIRONMENT'].toUpperCase();

        // initialise CosmosClient
        this.client = new CosmosClient(process.env[`COSMOS_${ENV}_DB_CONN_STRING`]);
        this.database = this.client.database(databaseId);
        this.container = this.database.container(containerId);

        // initialise BlobServiceClient
        this.blobServiceClient = BlobServiceClient.fromConnectionString(process.env[`AZURE_${ENV}_STORAGE_ACC_CONN_STRING`]);
        this.blobContainerClient = this.blobServiceClient.getContainerClient(blobContainerName);
    }

    /**
     * CosmosDB Management Functions
     */
    /**
     * Updates an existing ceteObj in the indexing table
     * @param updatedCete - Cete with existing ceteId to be updated. Uses the rest of the object fields to update
     * @returns void, err if error occurs while updating the Cete
     */
    public async updateCeteInCeteIndexing(updatedCete: Cete): Promise<void | Error> {
        try {
            const { resource: updatedItemFromUpstream } = await this.container.item(updatedCete.getCeteId()).replace(updatedCete.getDict())
            // console.log(updatedItemFromUpstream);
            return;
        }
        catch (err) {
            return Error(`${err}`);
        }
    }

    /**
     * Deletes an existing ceteObj from the indexing table
     * @param ceteToDelete - Cete with existing ceteId to be deleted
     * @returns void, err if error occurs while deleting the Cete
     */
    public async deleteCeteFromCeteIndexing(ceteToDelete: Cete): Promise<void | Error> {
        try {
            const { resource: deleteOpResult } = await this.container.item(ceteToDelete.getCeteId()).delete();
            // console.log(deleteOpResult);
            return;
        }
        catch (err) {
            return Error(`${err}`);
        }
    }

    /**
     * Inserts a new ceteObj in the CosmosDB indexing table
     * @return: {id, err}: string[] - stored id of Cete if successful, error message if failed
     */
    public async insertNewCeteInCeteIndexing(cete: Cete): Promise<string[]> {
        try {
            const { resource: createdItem } = await this.container.items.create(cete.getDict());

            cete.setCeteId(createdItem.id);
            const setFilePathStatus = cete.setFilePath();
            if (setFilePathStatus != 1) { // setFilePath() failed, return Error message
                return ["NaN", setFilePathStatus.message];
            }

            // Update Cete in CosmosDB table with the generated filepath
            this.updateCeteInCeteIndexing(cete)

            // Upload Cete data to MP3 Blob
            const uploadOpStatus = await this.uploadCeteToMP3Blob(cete);
            if (uploadOpStatus != 1) {
                return ["NaN", uploadOpStatus.message];
            }

            return [cete.getCeteId(), ""];
        }
        catch (err) {
            return ["NaN", err];
        }

    }

    /**
     * Queries the -ExistingCeteIDs DB to find the 'id' argument.
     * Returns 0 is not in DB, 1 if in DB, or throws errors
     * @param {string} id - ID of a Cete (ceteId) against which the -ExistingCeteIDs DB is queried
     * @returns {boolean} status - 1 (in DB), 0 (not in DB), throw err
     */
    public existsInCeteIndexing(id: string): void {

        const querySelectSpec = DBClient.getQuerySpec(`SELECT * FROM c WHERE id='${id}'`);
        this.container.items
        .query(querySelectSpec)
        .fetchAll()
        .then((result) => {
            if (result) {
                return 1;
            }
            else return 0;
        })
        .catch((err) => {
            throw err;
        });

    }

    /**
     * Azure Storage & Blob Management Functions
     */ 
    public async uploadCeteToMP3Blob(cete: Cete): Promise<1 | Error> {

        // Create blob name
        const blobName = cete.getFilePath();
        if (blobName == "NaN") {
            return Error("Cete does not have a filepath.");
        }

        // Get a block blob client
        const blockBlobClient = this.blobContainerClient.getBlockBlobClient(blobName);

        // Upload data to the blob
        const data = cete.getData();
        const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
        console.log(
            "Blob was uploaded successfully. requestId: ",
            uploadBlobResponse.requestId
        );

        // TODO: Maybe return processed thumbnail ? (if done on server-side)
        return 1;

    }

    /**
     * STATIC UTILS
     */
    /**
     * Returns a dictionary which can be used as a query configuration with the @azure/cosmos
     * @param sqlCmd - SQL Command to containerise
     * @returns expected format dictionary for CosmosDB
     */
    public static getQuerySpec(sqlCmd: string): SqlQuerySpec {
        return {
            query: sqlCmd
        };
    }

}

export default DBClient;