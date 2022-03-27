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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CLASS StorageBlobClient
 * API for the Azure Storage Container (Blob Storage) tool suite
 *
 * Handles connection, uploading & downloading data and returning useful outputs
 *
 */
const storage_blob_1 = require("@azure/storage-blob");
const DBClient_1 = __importDefault(require("../AzureCosmosDBClient/DBClient"));
const Cete_1 = __importDefault(require("../Cete/Cete"));
class StorageBlobClient {
    constructor(blobContainerName) {
        // Constant used to dynamically refer to either the staging or production environment on Azure, 
        // based on the ENVIRONMENT env variable
        // Declared here as .env is loaded a while after the "func start" call
        const ENV = process.env["ENVIRONMENT"].toUpperCase();
        // Initialise BlobServiceClient
        // With Connection String (1)
        // this.blobServiceClient = BlobServiceClient.fromConnectionString(process.env[`AZURE_${ENV}_STORAGE_ACC_CONN_STRING`]);
        // With Storage Account Name & Shared Key
        const storageAccountName = "cetestgstorageacc";
        const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(storageAccountName, process.env[`AZURE_${ENV}_STORAGE_ACC_KEY`]);
        this.blobServiceClient = new storage_blob_1.BlobServiceClient(`https://cetestgstorageacc.blob.core.windows.net`, sharedKeyCredential);
        this.blobContainerClient = this.blobServiceClient.getContainerClient(blobContainerName);
    }
    /**
     * Uploads audio data (base64 encoded) from the cete argument to a Blob on Azure with an audio/wav content-type.
     * @param cete - cete to be uploaded to Blob
     * @returns 1 if successful, Error if failed
     */
    uploadCeteToWAVBlob(cete) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get filepath from cete object. Use filepath as a Blob name.
            const blobName = cete.getFilePath();
            if (blobName == "NaN") {
                return Error("Cete does not have a filepath set");
            }
            // Get a block blob client
            const blockBlobClient = this.blobContainerClient.getBlockBlobClient(blobName);
            // Upload audio type data to the blob
            const data = cete.getData();
            const blobOptions = { blobHTTPHeaders: { blobContentType: "audio/wav" } };
            const uploadBlobResponse = yield blockBlobClient.upload(data, data.length, blobOptions);
            console.log("Blob was uploaded successfully. requestId:", uploadBlobResponse.requestId);
            // TODO: Maybe return processed thumbnail ? (if done on server-side)
            return 1;
        });
    }
    /**
     * Deletes all records of the given Cete object from the upstreadm databases
     * @param cete - Cete object to be deleted from all storage
     * @returns 1 if successful, error if not
     */
    deleteCeteBlob(cete) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get filepath from cete object. Use filepath as Blob name for Blob to be deleted..
            const blobName = cete.getFilePath();
            if (blobName == "NaN") {
                throw Error("Cete does not have a filepath set");
            }
            // Get the block blob client for the blobName and delete it
            try {
                const blobDeleteResponse = yield this.blobContainerClient.deleteBlob(blobName);
                console.log(blobDeleteResponse);
                return 1;
            }
            catch (err) {
                throw Error(err);
            }
        });
    }
    /**
     * Deletes all records of the given Cete object from the upstreadm databases
     * @param cete - Cete object to be deleted from all storage
     * @returns 1 if successful, error if not
     */
    deleteCeteBlob(cete) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get filepath from cete object. Use filepath as Blob name for Blob to be deleted..
            const blobName = cete.getFilePath();
            if (blobName == "NaN") {
                throw Error("Cete does not have a filepath set");
            }
            // Get the block blob client for the blobName and delete it
            try {
                const blobDeleteResponse = yield this.blobContainerClient.deleteBlob(blobName);
                console.log(blobDeleteResponse);
                return 1;
            }
            catch (err) {
                throw Error(err);
            }
        });
    }
    /**
     * Gets a list of metadata items from the Azure blobs under userId
     * @param userId - the downloaded cetes will haven been posted by the user with userId
     * @param archived - whether to get publicly visible cetes or archived ones
     * @param countLimit - how many cetes to load from userId/s blob
     * @returns number of cetes downloaded, Error if failed
     */
    getCetesMetadataForUserIdFromWAVBlob(userId, archived, countLimit) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const cetes = [];
            const visibilityPath = archived == true ? "archived" : "public";
            try {
                try {
                    for (var _b = __asyncValues(this.blobContainerClient.listBlobsFlat({ prefix: `${userId}/${visibilityPath}` })), _c; _c = yield _b.next(), !_c.done;) {
                        const blob = _c.value;
                        if (cetes.length >= countLimit) {
                            break;
                        }
                        cetes.push(blob);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return cetes;
            }
            catch (err) {
                return Error(`${err}`);
            }
        });
    }
    /**
     * Can add partial data downlaod for a server-processed thumbnail (to investigate)
     *
     * Downloads a list of items from the Azure blobs under userId
     * @param userId - the downloaded cetes will haven been posted by the user with userId
     * @param archived - whether to get publicly visible cetes or archived ones
     * @returns number of cetes downloaded, Error if failed
     */
    downloadCetesForProfile(userId, archived, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cetes = []; // will be returned and will hold Cete objects under userId with the given visibility
            try {
                // Connect to Azure DB using the DBClient internal API
                const database_client = new DBClient_1.default(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");
                const getMetadataResult = yield this.getCetesMetadataForUserIdFromWAVBlob(userId, archived, limit);
                if (getMetadataResult instanceof Error) {
                    return Error(getMetadataResult.message);
                }
                else {
                    for (let i = 0; i < getMetadataResult.length; ++i) {
                        // Populate a Cete object to be added to the list of objects
                        const ceteObj = new Cete_1.default();
                        // // Get a block blob client for current blob in iteration & download
                        // const blockBlobClient = this.blobContainerClient.getBlockBlobClient(getMetadataResult[i].name);
                        // const downloadBlockBlobResponse = await blockBlobClient.download(0);
                        // // Set data of the ceteObj with the string streamed from the .download() result
                        // ceteObj.setData(await StorageBlobClient.streamToString(downloadBlockBlobResponse.readableStreamBody));
                        // Get CeteId from BlobItem name
                        ceteObj.setCeteId(yield StorageBlobClient.getCeteIdFromBlobItem(getMetadataResult[i]));
                        // Set remaining ceteObj fields
                        ceteObj.setUserId(userId);
                        // Get Cete timestamp & other upstream current values and populate the Cete object
                        const resource = yield database_client.getCetefromCeteIndexing(ceteObj.getCeteId());
                        if (resource instanceof Error) {
                            return Error(`${resource.message}`);
                        }
                        else {
                            ceteObj.setTimestamp(resource.getTimestamp());
                            ceteObj.setListens(resource.getListens());
                            ceteObj.setIsArchived(resource.getisArchived());
                            cetes.push(ceteObj.getDictForProfile());
                        }
                    }
                    return cetes;
                }
            }
            catch (err) {
                return Error(err);
            }
        });
    }
    /**
     * Downloads cete audioData from the WAV Blob using the filepath stored in the CosmosDB Indexing
     * @param userId - id of user downloading the cete data
     * @param ceteId - id of cete data to be downloaded
     * @returns CeteDictWithData if successful, Error if failed
     */
    downloadCeteFromWAVBlob(userId, ceteId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Connect to Azure DB using the DBClient internal API
            const database_client = new DBClient_1.default(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");
            try {
                // Get Cete Filepath & timestamp from indexing
                const response = yield database_client.getCetefromCeteIndexing(ceteId);
                if (response instanceof Cete_1.default) {
                    const filepath = response.getFilePath();
                    // Populate a Cete object to be added to the list of objects
                    const ceteObj = new Cete_1.default();
                    // Get a block blob client for current blob in iteration & download
                    const blockBlobClient = this.blobContainerClient.getBlockBlobClient(filepath);
                    const downloadBlockBlobResponse = yield blockBlobClient.download(0);
                    // Set data of the ceteObj with the string streamed from the .download() result
                    ceteObj.setData(yield StorageBlobClient.streamToString(downloadBlockBlobResponse.readableStreamBody));
                    // Set ceteObj fields
                    ceteObj.setIsArchived(response.getisArchived());
                    ceteObj.setUserId(userId);
                    ceteObj.setCeteId(ceteId);
                    ceteObj.setTimestamp(response.getTimestamp());
                    ceteObj.setListens(response.getListens());
                    return Promise.resolve(ceteObj.getCeteDictWithData());
                }
            }
            catch (err) {
                return Promise.reject(Error(`${err.message}. Could not retrieve Cete from indexing database`));
            }
        });
    }
    /**
     * UTILS
     */
    static streamToString(readableStream) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const chunks = [];
                readableStream.on("data", (data) => {
                    chunks.push(data.toString());
                });
                readableStream.on("end", () => {
                    resolve(chunks.join(""));
                });
                readableStream.on("error", reject);
            });
        });
    }
    /**
     * Returns the ceteId of a BlobItem using the .name field
     * @param blobItem - BlobItem object used to get ceteId from
     * @returns ceteId
     */
    static getCeteIdFromBlobItem(blobItem) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let ceteId;
                const filepath = blobItem.name;
                // Iterate backwards through string and create ceteId between ".wav" and the last "/" (/ceteId.wav)
                // Skip the .wav right to left
                let reversedCeteId = "";
                for (let i = filepath.length - 5; i >= 0; i--) {
                    if (filepath[i] != "/") {
                        reversedCeteId += filepath[i];
                    }
                    else {
                        // the iteratively built string has to be reversed to give the expected ceteId
                        ceteId = reversedCeteId.split("").reverse().join("");
                        resolve(ceteId);
                    }
                }
                reject();
            });
        });
    }
}
exports.default = StorageBlobClient;
//# sourceMappingURL=BlobClient.js.map