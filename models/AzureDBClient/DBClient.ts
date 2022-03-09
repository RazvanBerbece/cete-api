/**
 * CLASS DBClient
 * API for the Azure SQL tool suite (SQL Server, SQL Database)
 * 
 * Handles getting credentials, connection, running queries and returning useful outputs
 * 
 */
// import crypto from "crypto";
import { Container, CosmosClient, Database, SqlQuerySpec } from "@azure/cosmos";
import Cete from "../Cete/Cete";

class DBClient {

    private client: CosmosClient;
    private database: Database;
    private container: Container;

    /**
     * Creates a CosmosDB Client using the connection string
     * Also connects to the database with databaseId and gets the container with contairId within that database
     * @param databaseId - id for database to connect client to
     * @param containerId - id for container within the database object returned from the databaseId
     */
    constructor(databaseId: string, containerId: string) {
        this.client = new CosmosClient(process.env[`COSMOS_${process.env['ENVIRONMENT'].toUpperCase()}_DB_CONN_STRING`]);
        this.database = this.client.database(databaseId);
        this.container = this.database.container(containerId);
    }

    /**
     * Updates an existing ceteObj in the indexing table
     * @param updatedCete - Cete with existing ceteId to be updated. Uses the rest of the object fields to update
     * @returns void, err if error occurs while updating the Cete
     */
    public async updateCeteInCeteIndexing(updatedCete: Cete) {
        try {
            const { resource: updatedItemFromUpstream } = await this.container.item(updatedCete.getCeteId()).replace(updatedCete.getDict())
            // console.log(updatedItemFromUpstream);
            return;
        }
        catch (err) {
            return err;
        }
    }

    /**
     * Deletes an existing ceteObj from the indexing table
     * @param ceteToDelete - Cete with existing ceteId to be deleted
     * @returns void, err if error occurs while deleting the Cete
     */
    public async deleteCeteFromCeteIndexing(ceteToDelete: Cete) {
        try {
            const { resource: deleteOpResult } = await this.container.item(ceteToDelete.getCeteId()).delete();
            // console.log(deleteOpResult);
            return;
        }
        catch (err) {
            return err;
        }
    }

    /**
     * 
     * These are accessed by other processes directly, and manage running queries on the DB
     */
    /**
     * Inserts a new ceteObj in the CosmosDB indexing table
     * @return: {id, err}: string[] - stored id of Cete if successful, error message if failed
     */
    public async insertNewCeteInCeteIndexing(cete: Cete) {
        try {
            const { resource: createdItem } = await this.container.items.create(cete.getDict());

            cete.setCeteId(createdItem.id);
            const setFilePathStatus = cete.setFilePath();
            if (setFilePathStatus != 1) { // setFilePath() failed, return Error message
                return ["NaN", setFilePathStatus.message];
            }

            this.updateCeteInCeteIndexing(cete)
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