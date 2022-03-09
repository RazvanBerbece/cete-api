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
 * CLASS StorageBlobClient
 * API for the Azure Storage Container (Blob Storage) tool suite
 *
 * Handles connection, uploading & downloading data and returning useful outputs
 *
 */
const storage_blob_1 = require("@azure/storage-blob");
class StorageBlobClient {
    constructor(blobContainerName) {
        // Constant used to dynamically refer to either the staging or production environment on Azure, 
        // based on the ENVIRONMENT env variable
        // Declared here as .env is loaded a while after the 'func start' call
        const ENV = process.env['ENVIRONMENT'].toUpperCase();
        // initialise BlobServiceClient
        this.blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(process.env[`AZURE_${ENV}_STORAGE_ACC_CONN_STRING`]);
        this.blobContainerClient = this.blobServiceClient.getContainerClient(blobContainerName);
    }
    /* Uploads audio data (base64 encoded) from the cete argument to a Blob on Azure with an audio/wav content-type.
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
            const visibilityPath = archived == true ? 'archived' : 'public';
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
     * Downloads a list of items from the Azure blobs under userId
     * @param userId - the downloaded cetes will haven been posted by the user with userId
     * @param archived - whether to get publicly visible cetes or archived ones
     * @returns number of cetes downloaded, Error if failed
     */
    downloadCetesDataForUserIdFromWAVBlob(userId, archived, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cetes = [];
            const visibilityPath = archived == true ? 'archived' : 'public';
            try {
                const getMetadataResult = yield this.getCetesMetadataForUserIdFromWAVBlob(userId, archived, limit);
                if (getMetadataResult instanceof Error) {
                    return Error(getMetadataResult.message);
                }
                else {
                    for (let i = 0; i < getMetadataResult.length; ++i) {
                        // Get a block blob client for current blob in iteration
                        const blockBlobClient = this.blobContainerClient.getBlockBlobClient(getMetadataResult[i].name);
                        const downloadBlockBlobResponse = yield blockBlobClient.download(0);
                        cetes.push(yield StorageBlobClient.streamToString(downloadBlockBlobResponse.readableStreamBody));
                    }
                    console.log(cetes);
                    return cetes;
                }
            }
            catch (err) {
                return Error(`${err}`);
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
}
exports.default = StorageBlobClient;
//# sourceMappingURL=BlobClient.js.map