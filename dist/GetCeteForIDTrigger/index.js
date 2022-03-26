"use strict";
/**
 * Endpoint for detailed view of a Cete
 */
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
const Response_js_1 = __importDefault(require("../models/Response/Response.js"));
const BlobClient_1 = __importDefault(require("../models/AzureBlobStorageClient/BlobClient"));
const statuses_js_1 = __importDefault(require("../models/StatusCode/statuses.js"));
const httpTrigger = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/get/cete) is processing a GET request.');
        // Get query params
        const userId = context.req.query.userId;
        const ceteId = context.req.query.ceteId;
        if (typeof ceteId === 'undefined' || typeof userId === 'undefined') {
            context.res = {
                status: statuses_js_1.default.CLIENT_INVALID_REQUEST_NO_CETEID_OR_PARAM,
                body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/cete', { message: `InvalidRequestNoCeteOrUserID : GET Request has no Cete ID or user ID query parameter` }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        else {
            // Instantiate Blob Storage client and get data
            const blobClient = new BlobClient_1.default('cetes');
            const ceteDownloadResult = yield blobClient.downloadCeteFromWAVBlob(userId, ceteId);
            if (ceteDownloadResult instanceof Error) {
                context.res = {
                    status: statuses_js_1.default.SERVER_GET_AUDIO_DATA_FROM_BLOB,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/cete', { message: `ErrorGetDataFromBlob : ${ceteDownloadResult.message}. GET Request has downloaded no data.` }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
            else {
                context.res = {
                    status: statuses_js_1.default.SUCCESS,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/cete', {
                        message: `Downloaded cete data for cete with id ${ceteId}`,
                        data: ceteDownloadResult
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map