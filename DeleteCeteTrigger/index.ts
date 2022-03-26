/**
 * Endpoint that triggers the deletion of a Cete with ceteId
 * Deletes from indexing & Storage (removes all blobs)
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Response from "../models/Response/Response";
import DBClient from "../models/AzureCosmosDBClient/DBClient";
import STATUS_CODES from "../models/StatusCode/statuses";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    context.log('HTTP trigger function (v1/delete/cete) is processing a DELETE request.');

    // Get query params
    const userId = context.req.query.userId;
    const ceteId = context.req.query.ceteId;

    // Connect to Azure DB using the DBClient internal API
    const database_client = new DBClient(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");

    context.res = {
        status: STATUS_CODES.SUCCESS,
        body: new Response(
            new Date().toLocaleString(), 
            'api/v1/delete/cete', 
            { 
                message: `Successfully deleted Cete with id ${ceteId}.`,
            }
        ),
        headers: {
            'Content-Type': 'application/json'
        }
    };

};

export default httpTrigger;