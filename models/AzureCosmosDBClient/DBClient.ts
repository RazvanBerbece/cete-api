/**
 * CLASS DBClient
 * API for the Azure CosmosDB tool suite
 * 
 * Handles getting credentials, connection, running queries and returning useful outputs
 * 
 */
import { Container, CosmosClient, Database, SqlQuerySpec } from "@azure/cosmos";
import StorageBlobClient from "../AzureBlobStorageClient/BlobClient";
import Cete from "../Cete/Cete";
import { CeteDictIndexing } from "../Cete/CeteTypes";

class DBClient {

    // CosmosDB fields
    private client: CosmosClient;
    private database: Database;
    private container: Container;

    /**
     * Creates a CosmosDB Client using the environment variable for the connection string
     *     - connects to the CosmosDB database with databaseId and gets the container with containerId within that database
     * @param databaseId - id for database to connect client to
     * @param containerId - id for container within the database object returned from the databaseId
     */
    constructor(databaseId: string, containerId: string) {

        // Constant used to dynamically refer to either the staging or production environment on Azure, 
        // based on the ENVIRONMENT env variable
        // Declared here as .env is loaded a while after the 'func start' call
        const ENV = process.env['ENVIRONMENT'].toUpperCase();

        // initialise CosmosClient
        this.client = new CosmosClient(process.env[`COSMOS_${ENV}_DB_CONN_STRING`]);
        this.database = this.client.database(databaseId);
        this.container = this.database.container(containerId);
    }

    /**
     * CosmosDB Management Functions
     */
    /**
     * Updates an existing ceteObj in the indexing table
     * @param updatedCete - Cete with existing ceteId to be updated. Uses the rest of the object fields to update
     * @returns void, err if error occurs while updating the Cete
     */
    public async updateCeteInCeteIndexing(updatedCete: Cete): Promise<CeteDictIndexing | Error> {
        return new Promise((resolve, reject) => {
            this.container.item(updatedCete.getCeteId()).replace(updatedCete.getIndexingDict())
            .then((result) => {
                resolve(result.resource);
            })
            .catch((err) => {
                reject(err);
            });
        });
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
            const { resource: createdItem } = await this.container.items.create(cete.getIndexingDict());

            cete.setCeteId(createdItem.id);
            const setFilePathStatus = cete.processFilePath();
            if (setFilePathStatus != 1) { // setFilePath() failed, return Error message
                return ["NaN", setFilePathStatus.message];
            }

            // Update Cete in CosmosDB table with the generated filepath
            this.updateCeteInCeteIndexing(cete)
            .then(async () => {
                // Upload Cete data to WAV Blob
                const blobClient = new StorageBlobClient("cetes");
                const uploadOpStatus = await blobClient.uploadCeteToWAVBlob(cete);
                if (uploadOpStatus != 1) {
                    return ["NaN", uploadOpStatus.message];
                }
                return [cete.getCeteId(), ""];
            })
            .catch((err) => {
                return ["NaN", err];
            });
        }
        catch (err) {
            return ["NaN", err];
        }

    }

    /**
     * Queries the -ExistingCeteIDs DB to find the 'id' argument.
     * Returns 0 is not in DB, 1 if in DB, or throws errors
     * @param {string} ceteId - ID of a Cete (ceteId) against which the -ExistingCeteIDs DB is queried
     * @returns {boolean} status - 1 (in DB), 0 (not in DB), throw err
     */
    public existsInCeteIndexing(ceteId: string): void {

        const querySelectSpec = DBClient.getQuerySpec(`SELECT * FROM c WHERE id='${ceteId}'`);
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
     * Gets a cete object with ceteId from the CosmosDB Indexing DB 
     * @param ceteId - id of cete to be downloaded
     * @returns cete object as in CosmosDB
     */
    public getCetefromCeteIndexing(ceteId: string) {
        return new Promise((resolve, reject) => {
            const querySelectSpec = DBClient.getQuerySpec(`SELECT * FROM c WHERE c.id='${ceteId}'`);
            this.container.items.query(querySelectSpec).fetchAll()
            .then((result) => {
                resolve(result.resources[0]);
            })
            .catch((err) => {
                reject(err);
            });
        });
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