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
const Cete_js_1 = __importDefault(require("../models/Cete/Cete.js"));
const Response_js_1 = __importDefault(require("../models/Response/Response.js"));
const statuses_js_1 = __importDefault(require("../models/StatusCode/statuses.js"));
/**
 * POST ROUTE
 * Uploads audio data to a specific user's entry in Azure Storage
 * @param req: JSON POST Form
 *      audioData: base64 encoded data string
 *      timestamp: UNIX current timestamp
 */
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/upload/audio) is processing a POST request.');
        // Authenticate POST request
        // TODO
        // Check that req.body exists in order to create a Cete object
        if (req.body) {
            // Create a Cete object from the POST form key:value pairs
            const ceteObj = new Cete_js_1.default();
            const resultData = JSON.parse(req.rawBody); // parse rawBody string data (POST form) to JSON object
            if (!resultData.data) {
                context.res = {
                    status: statuses_js_1.default.CLIENT_INVALID_REQUEST_NO_DATA,
                    body: new Response_js_1.default(new Date().toLocaleString(), '/api/v1/upload/audio', {
                        error: `InvalidRequest : POST Request has no body.`
                    })
                };
            }
            // Request has visible data
            ceteObj.setUserId(resultData.userId);
            ceteObj.setIsArchived(resultData.data.isArchived);
            ceteObj.setTimestamp(resultData.timestamp);
            ceteObj.setData(resultData.data.audioData);
            context.res = {
                status: 200,
                body: new Response_js_1.default(new Date().toLocaleString(), '/api/v1/upload/audio', { message: `Uploading Audio endpoint in progress.` })
            };
        }
        else {
            // Request doesn't have a body, no data to parse
            context.res = {
                status: statuses_js_1.default.CLIENT_INVALID_REQUEST_NO_BODY,
                body: new Response_js_1.default(new Date().toLocaleString(), '/api/v1/upload/audio', {
                    error: `InvalidRequest : POST Request has no body.`
                })
            };
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map