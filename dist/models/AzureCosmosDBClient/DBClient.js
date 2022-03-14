"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CLASS DBClient
 * API for the Azure CosmosDB tool suite
 *
 * Handles getting credentials, connection, running queries and returning useful outputs
 *
 */
const cosmos_1 = require("@azure/cosmos");
const BlobClient_1 = __importDefault(require("../AzureBlobStorageClient/BlobClient"));
const Cete_1 = __importDefault(require("../Cete/Cete"));
class DBClient {
    /**
     * Creates a CosmosDB Client using the environment variable for the connection string
     *     - connects to the CosmosDB database with databaseId and gets the container with containerId within that database
     * @param databaseId - id for database to connect client to
     * @param containerId - id for container within the database object returned from the databaseId
     */
    constructor(databaseId, containerId) {
        // Constant used to dynamically refer to either the staging or production environment on Azure, 
        // based on the ENVIRONMENT env variable
        // Declared here as .env is loaded a while after the 'func start' call
        const ENV = process.env['ENVIRONMENT'].toUpperCase();
        // initialise CosmosClient
        this.client = new cosmos_1.CosmosClient(process.env[`COSMOS_${ENV}_DB_CONN_STRING`]);
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
    updateCeteInCeteIndexing(updatedCete) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.container.item(updatedCete.getCeteId()).replace(updatedCete.getIndexingDict())
                    .then((result) => {
                    resolve(result.resource);
                })
                    .catch((err) => {
                    reject(err);
                });
            });
        });
    }
    /**
     * Deletes an existing ceteObj from the indexing table
     * @param ceteToDelete - Cete with existing ceteId to be deleted
     * @returns void, err if error occurs while deleting the Cete
     */
    deleteCeteFromCeteIndexing(ceteToDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { resource: deleteOpResult } = yield this.container.item(ceteToDelete.getCeteId()).delete();
                // console.log(deleteOpResult);
                return;
            }
            catch (err) {
                return Error(`${err}`);
            }
        });
    }
    /**
     * Inserts a new ceteObj in the CosmosDB indexing table
     * @return: {id, err}: string[] - stored id of Cete if successful, error message if failed
     */
    insertNewCeteInCeteIndexing(cete) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { resource: createdItem } = yield this.container.items.create(cete.getIndexingDict());
                cete.setCeteId(createdItem.id);
                const setFilePathStatus = cete.processFilePath();
                if (setFilePathStatus != 1) { // setFilePath() failed, return Error message
                    return ["NaN", setFilePathStatus.message];
                }
                // Update Cete in CosmosDB table with the generated filepath
                this.updateCeteInCeteIndexing(cete)
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    // Upload Cete data to WAV Blob
                    const blobClient = new BlobClient_1.default("cetes");
                    const uploadOpStatus = yield blobClient.uploadCeteToWAVBlob(cete);
                    if (uploadOpStatus != 1) {
                        return ["NaN", uploadOpStatus.message];
                    }
                    return [cete.getCeteId(), ""];
                }))
                    .catch((err) => {
                    return ["NaN", err];
                });
            }
            catch (err) {
                return ["NaN", err];
            }
        });
    }
    /**
     * Queries the -ExistingCeteIDs DB to find the 'id' argument.
     * Returns 0 is not in DB, 1 if in DB, or throws errors
     * @param {string} ceteId - ID of a Cete (ceteId) against which the -ExistingCeteIDs DB is queried
     * @returns {boolean} status - 1 (in DB), 0 (not in DB), throw err
     */
    existsInCeteIndexing(ceteId) {
        const querySelectSpec = DBClient.getQuerySpec(`SELECT * FROM c WHERE id='${ceteId}'`);
        this.container.items
            .query(querySelectSpec)
            .fetchAll()
            .then((result) => {
            if (result) {
                return 1;
            }
            else
                return 0;
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
    getCetefromCeteIndexing(ceteId) {
        return new Promise((resolve, reject) => {
            const querySelectSpec = DBClient.getQuerySpec(`SELECT * FROM c WHERE c.id='${ceteId}'`);
            this.container.items.query(querySelectSpec).fetchAll()
                .then((result) => {
                const ceteData = result.resources[0];
                // Build Cete object from upstream
                const cete = new Cete_1.default();
                cete.setCeteId(ceteId);
                cete.setTimestamp(ceteData.timestamp);
                cete.setUserId(ceteData.userId);
                cete.setIsArchived(ceteData.isArchived);
                cete.setListens(ceteData.listens);
                cete.setFilePath(ceteData.data.filepath);
                resolve(cete);
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
    static getQuerySpec(sqlCmd) {
        return {
            query: sqlCmd
        };
    }
}
exports.default = DBClient;
//# sourceMappingURL=DBClient.js.map