/**
 * Endpoint that triggers the return of a detailed populated model of a Cete with ceteId
 * Includes metadata + audio data in base64
 */

import { AzureFunction, Context } from "@azure/functions"
import Response from "../models/Response/Response.js";
import StorageBlobClient from "../models/AzureBlobStorageClient/BlobClient";
import STATUS_CODES from "../models/StatusCode/statuses.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {

    context.log('HTTP trigger function (v1/get/cete) is processing a GET request.');

    // Get query params
    const userId = context.req.query.userId;
    const ceteId = context.req.query.ceteId;
    
    if (typeof ceteId === 'undefined' || typeof userId === 'undefined') {
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_CETEID_OR_PARAM,
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/get/cete', 
                { message: `InvalidRequestNoCeteOrUserID : GET Request has no Cete ID or user ID query parameter` }
            ),
            headers: {
                'Content-Type': 'application/json'
            }
        };  
    }
    else {    
        // Instantiate Blob Storage client and get data
        const blobClient = new StorageBlobClient('cetes');
        const ceteDownloadResult = await blobClient.downloadCeteFromWAVBlob(userId, ceteId);
        if (ceteDownloadResult instanceof Error) {
            context.res = {
                status: STATUS_CODES.SERVER_GET_AUDIO_DATA_FROM_BLOB,
                body: new Response(
                    new Date().toLocaleString(), 
                    'api/v1/get/cete', 
                    { message: `ErrorGetDataFromBlob : ${ceteDownloadResult.message}. GET Request has downloaded no data.` }
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
                    'api/v1/get/cete', 
                    { 
                        message: `Downloaded cete data for cete with id ${ceteId}`,
                        data: ceteDownloadResult
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