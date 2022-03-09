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
class DBClient {
    /**
     * Creates a CosmosDB Client using the connection string
     * Also connects to the database with databaseId and gets the container with contairId within that database
     * @param databaseId - id for database to connect client to
     * @param containerId - id for container within the database object returned from the databaseId
     */
    constructor(databaseId, containerId) {
        this.client = new cosmos_1.CosmosClient(process.env[`COSMOS_${process.env['ENVIRONMENT'].toUpperCase()}_DB_CONN_STRING`]);
        this.database = this.client.database(databaseId);
        this.container = this.database.container(containerId);
    }
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
                return err;
            }
        });
    }
    /**
     * Deletes an existing ceteObj from the indexing table
     * @param updatedCete - Cete with existing ceteId to be deleted
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
                return err;
            }
        });
    }
    /**
     *
     * These are accessed by other processes directly, and manage running queries on the DB
     */
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
                this.updateCeteInCeteIndexing(cete);
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