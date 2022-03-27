/**
 * Endpoint that triggers the deletion of a Cete with ceteId
 * Deletes from indexing & Storage (removes all blobs)
 */

import { AzureFunction, Context } from "@azure/functions";
import Response from "../models/Response/Response";
import DBClient from "../models/AzureCosmosDBClient/DBClient";
import STATUS_CODES from "../models/StatusCode/statuses";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {

    context.log('HTTP trigger function (v1/delete/cete) is processing a DELETE request.');

    // Get query params
    const ceteId = context.req.query.ceteId;

    // Connect to Azure DB using the DBClient internal API
    const database_client = new DBClient(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");

    // Delete all references to the Cete with ceteId from all storage units (CosmosDB, Azure Storage)
    try {
        await database_client.deleteCeteFromCeteIndexing(ceteId);
        context.res = {
            status: STATUS_CODES.SUCCESS,
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/delete/cete', 
                { 
                    message: `Successfully deleted Cete with ceteId ${ceteId}.`,
                }
            ),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
    catch (err) {
        context.res = {
            status: STATUS_CODES.SERVER_DELETE_CETE,
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/delete/cete', 
                { 
                    message: `Failed to delete Cete with ceteId ${ceteId}.`,
                    error: err.message !== undefined ? err.message : err.body.message // use either processed error message or message received from Azure, whichever is available
                }
            ),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

};

export default httpTrigger;