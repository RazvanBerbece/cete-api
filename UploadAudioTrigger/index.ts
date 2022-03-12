import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Cete from "../models/Cete/Cete.js";
import Response from "../models/Response/Response.js";
import STATUS_CODES from "../models/StatusCode/statuses.js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

/**
 * POST ROUTE
 * Uploads audio data to a specific user's entry in Azure Storage
 * @param req: JSON POST Form
 *      audioData: base64 encoded data string
 *      timestamp: UNIX current timestamp
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    context.log('HTTP trigger function (v1/upload/profile/cete) is processing a POST request.');

    // TODO: Authenticate POST request

    if (!req.body) { // CHECK -- POST body exists
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_BODY, 
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/upload/profile/cete', 
                { 
                    error: `InvalidRequestNoBody : POST Request has no body.` 
                }
            )
        };
    }

    const resultData = JSON.parse(req.rawBody); // parse rawBody string data (POST JSON) to JSON object
    if (!resultData.data) { // CHECK -- POST body has data field
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_DATA, 
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/upload/profile/cete', 
                { 
                    error: `InvalidRequestNoData : POST Request body has no data.` 
                }
            )
        };
    }

    // Request has visible data, so create object & set object fields using the public access methods
    // Use values from the POST key:value pairs
    const ceteObj = new Cete();
    ceteObj.setUserId(resultData.userId)
    ceteObj.setIsArchived(resultData.isArchived);
    ceteObj.setTimestamp(resultData.timestamp);
    ceteObj.setData(resultData.data.audioData);

    // Generate ID and process filepath for Cete
    // and store in SQL Collection
    const indexingOutput = await Cete.processAndStoreCete(ceteObj);
    switch (indexingOutput[0]) {
        case "NaN":
            // error occured, id is NaN
            context.res = {
                status: STATUS_CODES.SERVER_DB_ERROR,
                body: new Response(
                    new Date().toLocaleString(), 
                    'api/v1/upload/profile/cete', 
                    { 
                        error: `ServerDBError: Server could not upload Cete metadata to database. ${indexingOutput[1]}.`,
                    }
                ),
                headers: {
                    'Content-Type': 'application/json'
                }
            }; 
            break;
        default:
            context.res = {
                status: 200,
                body: new Response(
                    new Date().toLocaleString(), 
                    'api/v1/upload/profile/cete', 
                    { 
                        message: `Uploaded Cete metadata to database successfully.`,
                        ceteId: ceteObj.getCeteId() 
                    }
                ),
                headers: {
                    'Content-Type': 'application/json'
                }
            }; 
    }

};

export default httpTrigger;