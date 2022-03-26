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
const Response_js_1 = __importDefault(require("../models/Response/Response.js"));
const BlobClient_1 = __importDefault(require("../models/AzureBlobStorageClient/BlobClient"));
const statuses_js_1 = __importDefault(require("../models/StatusCode/statuses.js"));
const httpTrigger = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/get/profile) is processing a GET request.');
        // Get query params
        const userId = context.req.query.userId;
        const archived = context.req.query.archived;
        let limitCount = parseInt(context.req.query.limit);
        if (typeof userId === 'undefined' || typeof archived === 'undefined') {
            context.res = {
                status: statuses_js_1.default.CLIENT_INVALID_REQUEST_NO_UID_OR_PARAM,
                body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/profile', { message: `InvalidRequestNoUIDOrVisibility : GET Request has no UID or visibility query parameter` }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        else {
            if (typeof limitCount === 'undefined') {
                limitCount = 9; // works in increments of 9, maybe it can help client-side and pagination
            }
            // Instantiate Blob Storage client and get data
            const blobClient = new BlobClient_1.default('cetes');
            const cetesDownloadResult = yield blobClient.downloadCetesForProfile(userId, (archived === 'true'), limitCount); // convert 'archive' var to a boolean
            if (cetesDownloadResult instanceof Error) {
                context.res = {
                    status: statuses_js_1.default.SERVER_GET_AUDIO_METADATA_FROM_UID_BLOB,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/profile', { message: `ErrorGetProfileCetesFromUIDBlobs : ${cetesDownloadResult.message}. GET Request has downloaded no data.` }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
            else {
                context.res = {
                    status: statuses_js_1.default.SUCCESS,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/profile', {
                        message: `Downloaded ${cetesDownloadResult.length} cetes for user ${userId}`,
                        data: cetesDownloadResult
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