/**
 * Endpoints that triggers the return of a list of profile-rendering-friendly Cete objects
 * Includes metadata but no audio data in base64.
 */

import { AzureFunction, Context } from "@azure/functions";
import Response from "../models/Response/Response.js";
import StorageBlobClient from "../models/AzureBlobStorageClient/BlobClient";
import STATUS_CODES from "../models/StatusCode/statuses.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {

    context.log('HTTP trigger function (v1/get/profile) is processing a GET request.');

    // Get query params
    const userId = context.req.query.userId;
    const archived = context.req.query.archived;
    let limitCount = parseInt(context.req.query.limit);

    if (typeof userId === 'undefined' || typeof archived === 'undefined') {
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_UID_OR_PARAM,
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/get/profile', 
                { 
                    message: `Failed to GET Cetes for profile with userId ${userId}.`,
                    error: `InvalidRequestNoUIDOrVisibility : GET Request has no UID or visibility query parameter` 
                }
            ),
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
        const blobClient = new StorageBlobClient('cetes');
        const cetesDownloadResult = await blobClient.downloadCetesForProfile(userId, (archived === 'true'), limitCount); // convert 'archive' var to a boolean

        if (cetesDownloadResult instanceof Error) {
            context.res = {
                status: STATUS_CODES.SERVER_GET_CETES_FOR_PROFILE,
                body: new Response(
                    new Date().toLocaleString(), 
                    'api/v1/get/profile', 
                    { 
                        message: `Failed to GET Cetes for profile with userId ${userId}.`,
                        error: cetesDownloadResult.message
                    }
                ),
                headers: {
                    'Content-Type': 'application/json'
                }
            }; 
        }
        else {
            context.res = {
                status: STATUS_CODES.SUCCESS,
                body: new Response(
                    new Date().toLocaleString(), 
                    'api/v1/get/profile', 
                    { 
                        message: `Downloaded ${cetesDownloadResult.length} Cetes for user ${userId}`,
                        data: cetesDownloadResult
                    }
                ),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

    }

};

export default httpTrigger;