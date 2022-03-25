import { AzureFunction, Context } from "@azure/functions";
import Response from "../models/Response/Response.js";
import StorageBlobClient from "../models/AzureBlobStorageClient/BlobClient";
import STATUS_CODES from "../models/StatusCode/statuses.js";

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {

    context.log('HTTP trigger function (v1/get/profile/cetes) is processing a GET request.');

    // Get query params
    const userId = context.req.query.userId;
    const archived = context.req.query.archived;
    let limitCount = parseInt(context.req.query.limit);

    if (typeof userId === 'undefined' || typeof archived === 'undefined') {
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_UID_OR_PARAM,
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/get/profile/cetes', 
                { message: `InvalidRequestNoUIDOrVisibility : GET Request has no UID or visibility query parameter` }
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
                status: STATUS_CODES.SERVER_GET_AUDIO_METADATA_FROM_UID_BLOB,
                body: new Response(
                    new Date().toLocaleString(), 
                    'api/v1/get/profile/cetes', 
                    { message: `ServerErrorGetFromUIDBlobs : ${cetesDownloadResult.message}. GET Request has downloaded no data.` }
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
                    'api/v1/get/profile/cetes', 
                    { 
                        message: `Downloaded ${cetesDownloadResult.length} cetes for user ${userId}`,
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