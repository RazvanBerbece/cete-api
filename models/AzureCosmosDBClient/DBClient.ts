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

        // Initialise CosmosClient
        // With Connection String (Option 1)
        // this.client = new CosmosClient(process.env[`COSMOS_${ENV}_DB_CONN_STRING`]);
        // With Endpoint & Key (Option 2)
        const endpoint = process.env[`COSMOS_${ENV}_DB_ENDPOINT`];
        const key = process.env[`COSMOS_${ENV}_DB_KEY`];
        this.client = new CosmosClient({ endpoint, key });
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
    public updateCeteInCeteIndexing(updatedCete: Cete): Promise<CeteDictIndexing | Error> {
        return new Promise((resolve, reject) => {
            this.container.item(updatedCete.getCeteId(), updatedCete.getUserId()).replace(updatedCete.getIndexingDict())
            .then((result) => {
                resolve(result.resource);
            })
            .catch((err) => {
                reject(Error(`${err}. Could not update Cete in indexing`));
            });
        });
    }

    /**
     * Deletes an existing ceteObj from the indexing table
     * @param ceteId - Cete with ceteId to be deleted
     * @returns void, err if error occurs while deleting the Cete
     */
    public deleteCeteFromCeteIndexing(ceteId: string): Promise<string | Error> {
        return new Promise((resolve, reject) => {
            // Get Cete object from upstream (holds filepath and userId, which are necessary to delete the Blob in which the Cete is and for partitioning)
            this.getCetefromCeteIndexing(ceteId)
            .then((ceteFromUpstreamResult: Cete) => {
                // Delete Blob which contains the audio data
                const blobClient = new StorageBlobClient("cetes");
                blobClient.deleteCeteBlob(ceteFromUpstreamResult)
                .then(() => {
                    // Delete Cete from indexing
                    this.container.item(ceteId, ceteFromUpstreamResult.getUserId()).delete()
                    .then(() => {
                        resolve(ceteId);
                    })
                    .catch((err) => {
                        // Failed to delete Cete from Indexing
                        reject(err);
                    });
                })
                .catch((err) => {
                    // Failed to delete Blob with Cete audiodata
                    reject(err);
                });
            })
            .catch((err: Error) => {
                // Failed to get Cete from Indexing
                reject(err);
            });
        });
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
            const updateResource = await this.updateCeteInCeteIndexing(cete)
            if (updateResource instanceof Error) {
                return ["NaN", updateResource.message];
            }
            else {
                // Upload Cete data to WAV Blob
                const blobClient = new StorageBlobClient("cetes");
                const uploadOpStatus = await blobClient.uploadCeteToWAVBlob(cete);
                if (uploadOpStatus != 1) {
                    return ["NaN", uploadOpStatus.message];
                }
                return [cete.getCeteId(), ""];
            }
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
    public getCetefromCeteIndexing(ceteId: string): Promise<Cete | Error> {
        return new Promise((resolve, reject) => {

            const querySelectSpec = DBClient.getQuerySpec(`SELECT * FROM c WHERE c.id='${ceteId}'`);

            this.container.items.query(querySelectSpec).fetchAll()
            .then((result) => {

                if (result.resources.length) {
                    const ceteData = result.resources[0];

                    // Build Cete object from upstream
                    const cete = new Cete();
                    cete.setCeteId(ceteId);
                    cete.setTimestamp(ceteData.timestamp);
                    cete.setUserId(ceteData.userId);
                    cete.setIsArchived(ceteData.isArchived);
                    cete.setListens(ceteData.listens);
                    cete.setFilePath(ceteData.data.filepath)
    
                    resolve(cete);
                }
                else {
                    // 0 rows returned
                    reject(Error(`Indexing database has no Cete with ceteId ${ceteId}`))
                }

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