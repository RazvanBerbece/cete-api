/**
 * CLASS DBClient
 * API for the Azure SQL tool suite (SQL Server, SQL Database)
 * 
 * Handles getting credentials, connection, running queries and returning useful outputs
 * 
 */
import { Container, CosmosClient, Database, SqlQuerySpec } from "@azure/cosmos";
import crypto from "crypto";

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
        this.client = new CosmosClient(process.env["COSMOS_STG_DB_CONN_STRING"]);
        this.database = this.client.database(databaseId);
        this.container = this.database.container(containerId);
    }

    /**
     * 
     * These are accessed by other processes directly, and manage running queries on the DB
     */
    /**
     * 
     * @return: {id, err}: string[] - stored id of Cete if successful, error message if failed
     */
    public async insertNewCeteIDInCeteIndexing() {

        // INDEX CETE 
        // 1. Generate random id and insert
        // let idToInsert = crypto.randomBytes(20).toString('hex');
        // try {
        //     // @ts-ignore: Value will be the right type at run-time
        //     while(this.existsInCeteIndexing(idToInsert) == 1) {
        //         idToInsert = crypto.randomBytes(20).toString('hex');;
        //     }
        //     // Configure query & execute it after establishing the connection
        //     const query = `INSERT INTO c (flag) VALUES (${idToInsert}, 1)`;
        //     // etc.
        // }
        // catch (err) {
        //     // console.log(err);
        //     return ["NaN", err];
        // }
        // 2. Use in-built CosmosDB indexing feature
        try {
            const { resource: createdItem } = await this.container.items.create({flag: true});
            console.log(createdItem);
            return [createdItem.id, ""];
        }
        catch (err) {
            return ["NaN", err];
        }

    }

    /**
     * Queries the -ExistingCeteIDs DB to find the 'id' argument.
     * Returns 0 is not in DB, 1 if in DB, or throws errors
     * 
     * @param {string} id - ID of a Cete against which the -ExistingCeteIDs DB is queried
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