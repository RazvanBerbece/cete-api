"use strict";
/**
 * Endpoint that triggers the deletion of a Cete with ceteId
 * Deletes from indexing & Storage (removes all blobs)
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
const Response_1 = __importDefault(require("../models/Response/Response"));
const DBClient_1 = __importDefault(require("../models/AzureCosmosDBClient/DBClient"));
const statuses_1 = __importDefault(require("../models/StatusCode/statuses"));
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function (v1/delete/cete) is processing a DELETE request.');
        // Get query params
        const userId = context.req.query.userId;
        const ceteId = context.req.query.ceteId;
        // Connect to Azure DB using the DBClient internal API
        const database_client = new DBClient_1.default(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");
        context.res = {
            status: statuses_1.default.SUCCESS,
            body: new Response_1.default(new Date().toLocaleString(), 'api/v1/delete/cete', {
                message: `Successfully deleted Cete with id ${ceteId}.`,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map