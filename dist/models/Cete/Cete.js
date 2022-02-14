"use strict";
/**
 * CLASS Cete
 * Logical model for a "Cete", an audio file which gets uploaded / shared / archived / liked
 *
 * The ceteId field works as a backend identifier for each Cete. It helps in storing and maybe searching for Cetes
 *
 * It also contains a filepath field, which is initialised with 'NaN'
 * and can be updated with the actual filepath where the audio file will be stored on the storage blob
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DBClient_1 = __importDefault(require("../AzureDBClient/DBClient"));
class Cete {
    constructor() {
        this.isArchived = false;
        this.filepath = 'NaN';
    }
    /**
     * Public access methods for Cete fields
     */
    getCeteId() {
        return this.ceteId;
    }
    getUserId() {
        return this.userId;
    }
    getTimestamp() {
        return this.timestamp;
    }
    getData() {
        return this.data;
    }
    getisArchived() {
        return this.isArchived;
    }
    getFilePath() {
        return this.filepath;
    }
    /**
     * Public setter methods for Cete fields
     */
    setCeteId(newCeteId) {
        this.ceteId = newCeteId;
    }
    setUserId(newUserId) {
        this.userId = newUserId;
    }
    setTimestamp(newTimestamp) {
        this.timestamp = newTimestamp;
    }
    setData(newData) {
        this.data = newData;
    }
    setIsArchived(newIsArchived) {
        this.isArchived = newIsArchived;
    }
    setFilePath() {
        // filepath is of form:
        //      1. Cetes/userId/visible/ceteId.mp3,     when isArchived = false
        //      2. Cetes/userId/archived/ceteId.mp3,    when isArchived = true 
        return;
    }
    /**
     * Cete statics
     */
    /**
     * Generates a random ID using the crypto package for newly uploaded Cetes
     * Then queries the CeteIndexing SQL database > CeteIDs table to see if the ID exists
     *  1. If it does, generate a new ID and retry
     *  2. If it doesn't exist, INSERT it
     *
     * @returns output: string[] - first index is the id, if the op was successful,
     *                             second index is the error message, if the op failed
     */
    static generateAndStoreCeteId() {
        // Connect to Azure DB using the DBClient internal API
        const database_client = new DBClient_1.default();
        // Store
        const output = database_client.insertNewCeteIDInCeteIndexing();
        // Return output based on the result of the DB operation
        switch (output[1]) {
            case "":
                // successful, return id
                return [output[0], ""];
            default:
                // failed, return err message
                return ["NaN", output[1]];
        }
    }
}
exports.default = Cete;
//# sourceMappingURL=Cete.js.map