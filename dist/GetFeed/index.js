"use strict";
/**
 * Endpoint to get feed of cetes for user with userId passed as query parameter
 * Processes :
 *  1. Gets preferences for userId (from CosmosDB)
 *  2. Looks for first 9-10 (TODO: Pagination) cetes that match preferences (location, views, likes, tags (?))
 *  3. Return list of cetes which match preferences
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
const statuses_1 = __importDefault(require("../models/StatusCode/statuses"));
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const httpTrigger = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/get/feed) is processing a GET request.');
        // Get query params
        const userId = context.req.query.userId;
        if (typeof userId === 'undefined') {
            context.res = {
                status: statuses_1.default.CLIENT_INVALID_REQUEST_NO_UID_OR_PARAM,
                body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/feed', {
                    message: `Failed to GET feed for user with userId ${userId}`,
                    error: `InvalidRequestNoUIDOrVisibility : GET Request has no UID or visibility query parameter`
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        context.res = {
            status: statuses_1.default.SUCCESS,
            body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/get/feed', {
                message: `Downloaded feed data for user ${userId}`,
                data: ""
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map