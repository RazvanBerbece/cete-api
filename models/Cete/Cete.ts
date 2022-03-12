/**
 * CLASS Cete
 * Logical model for a "Cete", an audio file which gets uploaded / shared / archived / liked
 * 
 * The ceteId field works as a backend identifier for each Cete. It helps in storing and maybe searching for Cetes
 * 
 * It also contains a filepath field, which is initialised with 'NaN' 
 * and can be updated with the actual filepath where the audio file will be stored on the storage blob
 */
import DBClient from "../AzureCosmosDBClient/DBClient";

export type CeteDict = {
    id: string,
    userId: string,
    timestamp: Date,
    data: {
        audioData: string,
        filepath: string
    },
    isArchived: boolean
};

export type CeteDictIndexing = {
    id: string,
    userId: string,
    timestamp: Date,
    data: {
        filepath: string
    },
    isArchived: boolean
};

export type CeteDictProfile = {
    id: string,
    userId: string,
    timestamp: Date,
    isArchived: boolean
};

export type CeteDictWithData = {
    id: string,
    userId: string,
    timestamp: Date,
    data: {
        audioData: string,
    },
    isArchived: boolean
};

class Cete {

    // Processed by server
    private id: string;
    private filepath: string;

    // Obtained from Client
    private userId: string;
    private timestamp: Date; 
    private data: string;
    private isArchived: boolean;

    constructor() {
        this.isArchived = false;
        this.filepath = 'NaN';
    }

    /**
     * Public access methods for Cete fields
     */
    public getCeteId(): string {
        return this.id;
    }
    public getUserId(): string {
        return this.userId;
    }
    public getTimestamp(): Date {
        return this.timestamp;
    }
    public getData(): string {
        return this.data;
    }
    public getisArchived(): boolean {
        return this.isArchived;
    }
    public getFilePath(): string {
        return this.filepath;
    }

    /**
     * Public setter methods for Cete fields
     */
    public setCeteId(newCeteId: string) {
        this.id = newCeteId;
    }
    public setUserId(newUserId: string) {
        this.userId = newUserId;
    }
    public setTimestamp(newTimestamp: Date) {
        this.timestamp = newTimestamp;
    }
    public setData(newData: string) {
        this.data = newData;
    }
    public setIsArchived(newIsArchived: boolean) {
        this.isArchived = newIsArchived;
    }
    public setFilePath() {
        // filepath is of form:
        //      1. Cetes/userId/public/ceteId.wav,      when isArchived = false
        //      2. Cetes/userId/archived/ceteId.wav,    when isArchived = true 
        // Only set filepath if userId and ceteId are set
        if (!this.getCeteId() || !this.getUserId()) {
            return Error("Cannot process path for a Cete without a userId and a ceteId");
        }
        this.filepath = this.getisArchived() ? `${this.getUserId()}/archived/${this.getCeteId()}.wav` : `${this.getUserId()}/public/${this.getCeteId()}.wav`
        return 1;
    }

    public getDict(): CeteDict {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            data: {
                audioData: this.getData(),
                filepath: this.getFilePath()
            },
            isArchived: this.getisArchived()
        };
    }

    public getCeteDictWithData(): CeteDictWithData {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            data: {
                audioData: this.getData(),
            },
            isArchived: this.getisArchived()
        };
    }

    public getDictForProfile(): CeteDictProfile {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            isArchived: this.getisArchived()
        };
    }

    /**
     * Get a dictionary representation of the Cete but without the audioData field
     * @returns Indexing-friendly dict of a Cete (drops the audioData field)
     */
    public getIndexingDict(): CeteDictIndexing {
        return {
            id: this.getCeteId(),
            userId: this.getUserId(),
            timestamp: this.getTimestamp(),
            data: {
                filepath: this.getFilePath()
            },
            isArchived: this.getisArchived()
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
    public static processAndStoreCete(cete: Cete): Promise<string[]> {

        return new Promise((resolve, reject) => {

            // Connect to Azure DB using the DBClient internal API
            const database_client = new DBClient(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");

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

export default Cete;