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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CLASS DBClient
 * API for the Azure SQL tool suite (SQL Server, SQL Database)
 *
 * Handles getting credentials, connection, running queries and returning useful outputs
 *
 */
// import crypto from "crypto";
const cosmos_1 = require("@azure/cosmos");
const storage_blob_1 = require("@azure/storage-blob");
class DBClient {
    /**
     * Creates a CosmosDB Client and Blob Storage Client using environment variables for the connection strings
     *     - connects to the CosmosDB database with databaseId and gets the container with containerId within that database
     *     - connects to the blobContainerName Blob Container
     * @param databaseId - id for database to connect client to
     * @param containerId - id for container within the database object returned from the databaseId
     */
    constructor(databaseId, containerId, blobContainerName) {
        // Constant used to dynamically refer to either the staging or production environment on Azure, 
        // based on the ENVIRONMENT env variable
        // Declared here as .env is loaded a while after the 'func start' call
        const ENV = process.env['ENVIRONMENT'].toUpperCase();
        // initialise CosmosClient
        this.client = new cosmos_1.CosmosClient(process.env[`COSMOS_${ENV}_DB_CONN_STRING`]);
        this.database = this.client.database(databaseId);
        this.container = this.database.container(containerId);
        // initialise BlobServiceClient
        this.blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(process.env[`AZURE_${ENV}_STORAGE_ACC_CONN_STRING`]);
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
    updateCeteInCeteIndexing(updatedCete) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { resource: updatedItemFromUpstream } = yield this.container.item(updatedCete.getCeteId()).replace(updatedCete.getDict());
                // console.log(updatedItemFromUpstream);
                return;
            }
            catch (err) {
                return Error(`${err}`);
            }
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
                const { resource: createdItem } = yield this.container.items.create(cete.getDict());
                cete.setCeteId(createdItem.id);
                const setFilePathStatus = cete.setFilePath();
                if (setFilePathStatus != 1) { // setFilePath() failed, return Error message
                    return ["NaN", setFilePathStatus.message];
                }
                // Update Cete in CosmosDB table with the generated filepath
                this.updateCeteInCeteIndexing(cete);
                // Upload Cete data to MP3 Blob
                const uploadOpStatus = yield this.uploadCeteToWAVBlob(cete);
                if (uploadOpStatus != 1) {
                    return ["NaN", uploadOpStatus.message];
                }
                return [cete.getCeteId(), ""];
            }
            catch (err) {
                return ["NaN", err];
            }
        });
    }
    /**
     * Queries the -ExistingCeteIDs DB to find the 'id' argument.
     * Returns 0 is not in DB, 1 if in DB, or throws errors
     * @param {string} id - ID of a Cete (ceteId) against which the -ExistingCeteIDs DB is queried
     * @returns {boolean} status - 1 (in DB), 0 (not in DB), throw err
     */
    existsInCeteIndexing(id) {
        const querySelectSpec = DBClient.getQuerySpec(`SELECT * FROM c WHERE id='${id}'`);
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
     * Azure Storage & Blob Management Functions
     */
    /**
     * Uploads audio data (base64 encoded) from the cete argument to a Blob on Azure with an audio/wav content-type.
     * @param cete - cete to be uplaoded to Blob
     * @returns - 1 if successful, Error if failed
     */
    uploadCeteToWAVBlob(cete) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const uploadBlobResponse = yield blockBlobClient.upload(data, data.length, blobOptions);
            console.log("Blob was uploaded successfully. requestId:", uploadBlobResponse.requestId);
            // TODO: Maybe return processed thumbnail ? (if done on server-side)
            return 1;
        });
    }
    getCetesFromUserWAVBlob() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (var _b = __asyncValues(this.blobContainerClient.listBlobsFlat()), _c; _c = yield _b.next(), !_c.done;) {
                    const blob = _c.value;
                    console.log("\t", blob.name);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
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