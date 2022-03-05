/**
 * CLASS Cete
 * Logical model for a "Cete", an audio file which gets uploaded / shared / archived / liked
 * 
 * The ceteId field works as a backend identifier for each Cete. It helps in storing and maybe searching for Cetes
 * 
 * It also contains a filepath field, which is initialised with 'NaN' 
 * and can be updated with the actual filepath where the audio file will be stored on the storage blob
 */
import DBClient from "../AzureDBClient/DBClient";

class Cete {

    // Processed by server
    private ceteId: string;
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
        return this.ceteId;
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
        this.ceteId = newCeteId;
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
    public static generateAndStoreCeteId(): Promise<string[]> {

        return new Promise((resolve, reject) => {
            // Connect to Azure DB using the DBClient internal API
            const database_client = new DBClient(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Indexes");

            // Store a new ID for a Cete
            database_client.insertNewCeteIDInCeteIndexing()
            .then((response: string[]) => {
                // Return output based on the result of the DB operation
                switch (response[1]) {
                    case "":
                        // successful, return Cete id
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