"use strict";
/**
 * Endpoint called to increment the number of listens of a Cete (when a 'listen' counts as legal)
 * Updates Cete object in process and then in CosmosDB Indexing
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
const DBClient_1 = __importDefault(require("../models/AzureCosmosDBClient/DBClient"));
const Cete_js_1 = __importDefault(require("../models/Cete/Cete.js"));
const httpTrigger = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/listen/cete) is processing a PUT request.');
        // Get query params
        const userId = context.req.query.userId;
        const ceteId = context.req.query.ceteId;
        if (typeof ceteId === 'undefined' || typeof userId === 'undefined') {
            context.res = {
                status: statuses_1.default.CLIENT_INVALID_REQUEST_NO_CETEID_OR_PARAM,
                body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', { message: `InvalidRequestNoCeteOrUserID : GET Request has no Cete ID or user ID` }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        else {
            // Initialise Cete object in process (set ceteId, userId, data.filepath, archived, timestamp (pulled) , listens (pulled]))
            const ceteToBeListened = new Cete_js_1.default();
            ceteToBeListened.setCeteId(ceteId);
            ceteToBeListened.setUserId(userId);
            // Connect to Azure DB using the DBClient internal API
            const database_client = new DBClient_1.default(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");
            const resource = yield database_client.getCetefromCeteIndexing(ceteId);
            if (resource instanceof Error) {
                context.res = {
                    status: statuses_1.default.SERVER_LISTEN_AUDIO,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', { message: `ServerListenCete : ${resource.message}. Cete did not update listens upstream.` }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
            else {
                // Continue building Cete object with data from upstream to match update target format
                ceteToBeListened.setTimestamp(resource.getTimestamp());
                ceteToBeListened.setFilePath(resource.getFilePath());
                // Download current listen count from upstream & increment
                ceteToBeListened.setListens(resource.getListens());
                ceteToBeListened.incrementListens();
                // Update object upstream
                const listenedResource = yield database_client.updateCeteInCeteIndexing(ceteToBeListened);
                if (listenedResource instanceof Error) {
                    context.res = {
                        status: statuses_1.default.SERVER_LISTEN_AUDIO,
                        body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', { message: `ServerListenCete : ${listenedResource.message}. Cete did not update listens upstream.` }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
                else {
                    context.res = {
                        status: statuses_1.default.SUCCESS,
                        body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', { message: `Successfully registered listen for Cete ${listenedResource.id}. New 'listened' count is ${listenedResource.listens}` }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
            }
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map