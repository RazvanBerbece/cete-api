"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CLASS DBClient
 * API for the Azure SQL tool suite (SQL Server, SQL Database)
 *
 * Handles getting credentials, connection, running queries and returning useful outputs
 *
 */
const tedious_1 = require("tedious");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
class DBClient {
    constructor() {
        // Configs used to connect to the Azure DB
        this.config = {
            authentication: {
                options: {
                    userName: process.env['DB_USER'],
                    password: process.env['DB_PASSWORD']
                },
                type: 'default'
            },
            server: process.env['DB_HOST'],
            database: process.env['DB_NAME'],
            user: process.env['DB_USER'],
            password: process.env['DB_PASSWORD'],
            port: parseInt(process.env["DB_PORT"]),
            options: {
                encrypt: true,
            }
        };
        this.initialiseConnection();
        // Initialise executeSQL() function as a Promise-based method
        // to safely use async features
        this.executeSQL = (query, params) => new Promise((resolve, reject) => {
            let result = null; // makes the rows returned by the execSql() in the on 'row' event
            const request = new tedious_1.Request(query, (err, rowCount) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(rowCount);
                    resolve(result);
                }
            });
            // Iteratively add the passed params (VALUES, etc.) as parameters for the SQL request
            for (const param in params) {
                // @ts-ignore: Skipping line as param[1] will be right type at run-time
                request.addParameter(param[0], param[1], param[2]);
            }
            console.log(request);
            // Build result out of the returned rows after executing the query
            request.on('row', columns => {
                columns.forEach(column => {
                    result += column.value;
                });
            });
            // Listen for the on 'connect' event and run execSql() once connected
            this.connection.on('connect', err => {
                if (err) {
                    reject(err);
                }
                else {
                    this.connection.execSql(request);
                }
            });
            this.connection.connect();
        });
    }
    /**
     *
     * These run in background when running the public access methods
     */
    /**
     * Initialise the connection to the SQL DB using the config object
     */
    initialiseConnection() {
        this.connection = new tedious_1.Connection(this.config);
    }
    /**
     *
     * These are accessed by other processes directly, and manage runnign queries on the DB
     */
    /**
     *
     * @return: {id, err}: string[] - stored id of Cete if successful, error message if failed
     */
    insertNewCeteIDInCeteIndexing() {
        // Generate random id
        let idToInsert = crypto_1.default.randomBytes(20).toString('hex');
        try {
            // Generate random IDs until a unique one is generated
            let lookupResult = this.existsInCeteIndexing(idToInsert);
            // @ts-ignore: Skipping line as lookupResult will be comparable at run-time
            while (lookupResult) {
                switch (lookupResult) {
                    case -2:
                        return ["", "LookupIDErrorReturn : Returned before completing request"];
                    case -1:
                        return ["", "LookupIDErrorSQL : Error occured while executing SQL request"];
                    case 1:
                        // Generate another random ID and run the lookup again
                        idToInsert = crypto_1.default.randomBytes(20).toString('hex');
                        lookupResult = this.existsInCeteIndexing(idToInsert);
                        break;
                    case 0:
                        // found unused ID
                        break;
                }
            }
        }
        catch (err) {
            return ["", err];
        }
        // Configure query & execute it after establishing the connection
        const query = `INSERT INTO [dbo].[stg-ExistingCeteIDs] (ceteId, flag) VALUES (@id, @flag)`;
        // Execute the SQL query, replacing the VALUES
        this.executeSQL(query, [
            ['id', tedious_1.TYPES.NVarChar, idToInsert],
            ['flag', tedious_1.TYPES.Bit, 1]
        ])
            .then((value) => {
            console.log(value);
            return 0;
        })
            .catch((err) => {
            console.log(err);
            return -1;
        });
        return [idToInsert, ""];
    }
    /**
     * Queries the -ExistingCeteIDs DB to find the 'id' argument.
     * Returns 0 is not in DB, 1 if in DB, or negative numbers for errors
     *
     * @param {string} id - ID of a Cete against which the -ExistingCeteIDs DB is queried
     * @returns {number} status - 0 is not in DB, 1 if found, -1 for errors
     */
    existsInCeteIndexing(id) {
        const queryCreate = `CREATE TABLE [stg-ExistingCeteIDs] (ceteId VARCHAR(50), flag BIT)`;
        this.executeSQL(queryCreate, undefined)
            .then((value) => {
            console.log(value);
            return 0;
        })
            .catch((err) => {
            console.log(err);
            return -1;
        });
        const query = `SELECT * FROM [dbo].[stg-ExistingCeteIDs] WHERE ceteId='${id}'`;
        /**
         * Execute query with no params (undefined argument)
         */
        this.executeSQL(query, undefined)
            .then((value) => {
            console.log(value);
            return 0;
        })
            .catch((err) => {
            console.log(err);
            return -1;
        });
    }
}
exports.default = DBClient;
//# sourceMappingURL=DBClient.js.map