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
 */
const tedious_1 = require("tedious");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
class DBClient {
    constructor() {
        this.config = {
            authentication: {
                options: {
                    userName: process.env['DB_USER'],
                    password: process.env['DB_PASSWORD']
                },
                type: 'default'
            },
            server: process.env['DB_HOST'],
            options: {
                database: process.env['DB_NAME'],
                encrypt: true,
                port: parseInt(process.env["DB_PORT"])
            }
        };
        this.connection = null;
        console.log(this.config);
    }
    /**
     * PRIVATE ACCESS
     * These run in background when running the public access methods
     */
    /**
     * Establish a connection to the Azure SQL DB using the mysql package
     */
    establishConnection() {
        this.connection = new tedious_1.Connection(this.config);
        this.connection.connect();
    }
    /**
     * PUBLIC ACCESS
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
            while (this.existsInCeteIndexing(idToInsert)) {
                idToInsert = crypto_1.default.randomBytes(20).toString('hex');
            }
            this.connection.close();
            this.connection = null;
        }
        catch (err) {
            return ["", err];
        }
        // Establish the connection before running INSERT query
        this.establishConnection();
        const query = `INSERT INTO ExistingCeteIDs (ceteId, flag) VALUES ('${idToInsert}', ${1});`;
        this.connection.on("connect", err => {
            if (err) {
                console.log(err.message);
                return ["", err.message];
            }
            else {
                const request = new tedious_1.Request(query, (err, rowCount) => {
                    if (err) {
                        console.log(err.message);
                        return ["", err.message];
                    }
                    else {
                        console.log(`${rowCount} row(s) returned`);
                        return [idToInsert, ""];
                    }
                });
                // request.on("row", columns => {
                //     columns.forEach(column => {
                //         console.log("%s\t%s", column.metadata.colName, column.value);
                //     });
                // });
                this.connection.execSql(request);
            }
        });
        return [idToInsert, ""];
    }
    existsInCeteIndexing(id) {
        // Establish the connection before runnign queries
        this.establishConnection();
        const query = `SELECT * FROM ExistingCeteIDs WHERE 'ceteId' is '${id};'`;
        this.connection.on("connect", err => {
            if (err) {
                console.log(err.message);
                throw err.message;
            }
            else {
                const request = new tedious_1.Request(query, (err, rowCount) => {
                    if (err) {
                        console.log(err.message);
                        throw err.message;
                    }
                    else {
                        if (rowCount) {
                            // id already exists if the returned rowCount is not 0
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                });
                request.on('requestCompleted', () => {
                    // Next SQL statement.
                });
                this.connection.execSql(request);
            }
        });
        return false;
    }
}
exports.default = DBClient;
//# sourceMappingURL=DBClient.js.map