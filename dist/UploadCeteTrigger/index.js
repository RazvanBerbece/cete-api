"use strict";
/**
 * Endpoint that triggers the storage of the JSON object attached in the body of the POST request
 * in CosmosDB (Indexing - metadata) and Azure Storage (Blob - audio data)
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
const Cete_js_1 = __importDefault(require("../models/Cete/Cete.js"));
const Response_js_1 = __importDefault(require("../models/Response/Response.js"));
const statuses_js_1 = __importDefault(require("../models/StatusCode/statuses.js"));
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * POST ROUTE
 * Uploads audio data to a specific user's entry in Azure Storage
 * @param req: JSON POST Form
 *      audioData: base64 encoded data string
 *      timestamp: UNIX current timestamp
 */
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/upload/cete) is processing a POST request.');
        // TODO: Authenticate POST request
        if (!req.body) { // CHECK -- POST body exists
            context.res = {
                status: statuses_js_1.default.CLIENT_INVALID_REQUEST_NO_BODY,
                body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/upload/cete', {
                    error: `InvalidRequestNoBody : POST Request has no body.`
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        const resultData = JSON.parse(req.rawBody); // parse rawBody string data (POST JSON) to JSON object
        if (!resultData.data) { // CHECK -- POST body has data field
            context.res = {
                status: statuses_js_1.default.CLIENT_INVALID_REQUEST_NO_DATA,
                body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/upload/cete', {
                    error: `InvalidRequestNoData : POST Request body has no data.`
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        // Request has visible data, so create object & set object fields using the public access methods
        // Use values from the POST key:value pairs
        const ceteObj = new Cete_js_1.default();
        ceteObj.setUserId(resultData.userId);
        ceteObj.setIsArchived(resultData.isArchived);
        ceteObj.setTimestamp(resultData.timestamp);
        ceteObj.setData(resultData.data.audioData);
        // Generate ID and process filepath for Cete
        // and store in SQL Collection
        const indexingOutput = yield Cete_js_1.default.processAndStoreCete(ceteObj);
        switch (indexingOutput[0]) {
            case "NaN":
                // error occured, id is NaN
                context.res = {
                    status: statuses_js_1.default.SERVER_DB_ERROR,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/upload/cete', {
                        error: `ServerDBError: Server could not upload Cete metadata to database. ${indexingOutput[1]}.`,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                break;
            default:
                context.res = {
                    status: 200,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/upload/cete', {
                        message: `Uploaded Cete metadata to database successfully.`,
                        ceteId: ceteObj.getCeteId()
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map