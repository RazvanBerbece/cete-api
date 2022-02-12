import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Cete from "../models/Cete/Cete.js";
import Response from "../models/Response/Response.js";
import STATUS_CODES from "../models/StatusCode/statuses.js";

/**
 * POST ROUTE
 * Uploads audio data to a specific user's entry in Azure Storage
 * @param req: JSON POST Form
 *      audioData: base64 encoded data string
 *      timestamp: UNIX current timestamp
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    context.log('HTTP trigger function (v1/upload/audio) is processing a POST request.');

    // Authenticate POST request
    // TODO

    // Check that req.body exists in order to create a Cete object
    if (req.body) {
        // Create a Cete object from the POST form key:value pairs
        const ceteObj = new Cete();
        const resultData = JSON.parse(req.rawBody); // parse rawBody string data (POST form) to JSON object

        if (!resultData.data) {
            context.res = {
                status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_DATA, 
                body: new Response(
                    new Date().toLocaleString(), 
                    '/api/v1/upload/audio', 
                    { 
                        error: `InvalidRequest : POST Request has no body.` 
                    }
                )
            };
        }

        // Request has visible data
        ceteObj.setUserId(resultData.userId)
        ceteObj.setIsArchived(resultData.data.isArchived);
        ceteObj.setTimestamp(resultData.timestamp);
        ceteObj.setData(resultData.data.audioData);
    
        context.res = {
            status: 200,
            body: new Response(
                new Date().toLocaleString(), 
                '/api/v1/upload/audio', 
                { message: `Uploading Audio endpoint in progress.` }
            )
        };
    }
    else {
        // Request doesn't have a body, no data to parse
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_BODY, 
            body: new Response(
                new Date().toLocaleString(), 
                '/api/v1/upload/audio', 
                { 
                    error: `InvalidRequest : POST Request has no body.` 
                }
            )
        };
    }

};

export default httpTrigger;