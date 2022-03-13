"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CLASS Cete
 * Logical model for a "Cete", an audio file which gets uploaded / shared / archived / liked
 *
 * The ceteId field works as a backend identifier for each Cete. It helps in storing and maybe searching for Cetes
 *
 * It also contains a filepath field, which is initialised with 'NaN'
 * and can be updated with the actual filepath where the audio file will be stored on the storage blob
 */
const DBClient_1 = __importDefault(require("../AzureCosmosDBClient/DBClient"));
class Cete {
    constructor() {
        this.isArchived = false;
        this.filepath = 'NaN';
        this.listens = 0;
    }
    /**
     * Public access methods for Cete fields
     */
    getCeteId() {
        return this.id;
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
    getListens() {
        return this.listens;
    }
    /**
     * Public setter methods for Cete fields
     */
    setCeteId(newCeteId) {
        this.id = newCeteId;
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
    setFilePath(newFilePath) {
        this.filepath = newFilePath;
    }
    processFilePath() {
        // filepath is of form:
        //      1. Cetes/userId/public/ceteId.wav,      when isArchived = false
        //      2. Cetes/userId/archived/ceteId.wav,    when isArchived = true 
        // Only set filepath if userId and ceteId are set
        if (!this.getCeteId() || !this.getUserId()) {
            return Error("Cannot process path for a Cete without a userId and a ceteId");
        }
        this.filepath = this.getisArchived() ? `${this.getUserId()}/archived/${this.getCeteId()}.wav` : `${this.getUserId()}/public/${this.getCeteId()}.wav`;
        return 1;
    }
    setListens(newListens) {
        this.listens = newListens;
    }
    incrementListens() {
        this.listens += 1;
    }
    getDict() {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            data: {
                audioData: this.getData(),
                filepath: this.getFilePath()
            },
            isArchived: this.getisArchived(),
            listens: this.getListens()
        };
    }
    getCeteDictWithData() {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            data: {
                audioData: this.getData(),
            },
            isArchived: this.getisArchived(),
            listens: this.getListens()
        };
    }
    getDictForProfile() {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            isArchived: this.getisArchived(),
            listens: this.getListens()
        };
    }
    /**
     * Get a dictionary representation of the Cete but without the audioData field
     * @returns Indexing-friendly dict of a Cete (drops the audioData field)
     */
    getIndexingDict() {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            data: {
                filepath: this.getFilePath()
            },
            isArchived: this.getisArchived(),
            listens: this.getListens()
        };
    }
    /**
     * Cete statics
     */
    /**
     * Saves a Cete metadata to the SQL Collection.
     * It uses the default CosmosDB itemID for indexing and the Cete object to be stored
     *
     * @returns output: string[] - first index is the Cete id, if the op was successful,
     *                             second index is the error message, if the op failed
     */
    static processAndStoreCete(cete) {
        return new Promise((resolve, reject) => {
            // Connect to Azure DB using the DBClient internal API
            const database_client = new DBClient_1.default(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");
            // Store a new ID for a Cete
            database_client.insertNewCeteInCeteIndexing(cete)
                .then((response) => {
                // Return output based on the result of the DB operation
                switch (response[1]) {
                    case "":
                        resolve([response[0], ""]);
                        break;
                    default:
                        // failed, return err message
                        reject(["NaN", response[1]]);
                        break;
                }
            });
        });
    }
}
exports.default = Cete;
//# sourceMappingURL=Cete.js.map