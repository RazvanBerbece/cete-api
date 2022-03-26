"use strict";
/**
 * Endpoint that triggers the incrementing of the number of listens of a Cete (when a 'listen' counts as legal - Client / Frontend responsibility)
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
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const httpTrigger = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/listen/cete) is processing a PUT request.');
        // Get query params
        const userId = context.req.query.userId;
        const ceteId = context.req.query.ceteId;
        if (typeof ceteId === 'undefined' || typeof userId === 'undefined') {
            context.res = {
                status: statuses_1.default.CLIENT_INVALID_REQUEST_NO_CETEID_OR_PARAM,
                body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', {
                    message: `Failed to register listen for cete with ceteId ${ceteId}`,
                    error: `InvalidRequestNoCeteOrUserID : GET Request has no Cete ID or user ID`
                }),
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
            try {
                const resource = yield database_client.getCetefromCeteIndexing(ceteId);
                // Continue building Cete object with data from upstream to match update target format
                ceteToBeListened.setTimestamp(resource.getTimestamp());
                ceteToBeListened.setFilePath(resource.getFilePath());
                // Download current listen count from upstream & increment
                ceteToBeListened.setListens(resource.getListens());
                ceteToBeListened.incrementListens();
                // Update object upstream
                try {
                    const listenedResource = yield database_client.updateCeteInCeteIndexing(ceteToBeListened);
                    console.log("GOT HERE M3");
                    context.res = {
                        status: statuses_1.default.SUCCESS,
                        body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', {
                            message: `Successfully registered listen for Cete ${listenedResource.id}. New 'listened' count is ${listenedResource.listens}`
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
                catch (err) {
                    console.log("GOT HERE M1");
                    context.res = {
<<<<<<< HEAD
                        status: statuses_1.default.SERVER_LISTEN_AUDIO,
                        body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', {
                            message: `Failed to register listen for Cete with ceteId ${ceteId}`,
                            error: err.message
=======
                        status: statuses_1.default.SUCCESS,
                        body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', {
                            message: `Successfully registered listen for Cete ${listenedResource.id}. New 'listened' count is ${listenedResource.listens}`
>>>>>>> 3c3ec7f (IMPLEMENT DeleteCeteTrigger)
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
            }
            catch (err) {
                context.res = {
                    status: statuses_1.default.SERVER_LISTEN_AUDIO,
                    body: new Response_js_1.default(new Date().toLocaleString(), 'api/v1/listen/cete', {
                        message: `Failed to register listen for Cete with ceteId ${ceteId}`,
                        error: err.message
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