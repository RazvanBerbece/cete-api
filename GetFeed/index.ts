/**
 * Endpoint to get feed of cetes for user with userId passed as query parameter
 * Processes :
 *  1. Gets preferences for userId (from CosmosDB)
 *  2. Looks for first 9-10 (TODO: Pagination) cetes that match preferences (location, views, likes, tags (?))
 *  3. Return list of cetes which match preferences
 */

import { AzureFunction, Context } from "@azure/functions";
import Response from "../models/Response/Response.js";
import STATUS_CODES from "../models/StatusCode/statuses";

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {

    context.log('HTTP trigger function (v1/get/feed) is processing a GET request.');

    // Get query params
    const userId = context.req.query.userId;

    if (typeof userId === 'undefined') {
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_UID_OR_PARAM,
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/get/feed', 
                { message: `InvalidRequestNoUIDOrVisibility : GET Request has no UID or visibility query parameter` }
            ),
            headers: {
                'Content-Type': 'application/json'
            }
        };  
    }

    context.res = {
        status: STATUS_CODES.SUCCESS,
        body: new Response(
            new Date().toLocaleString(), 
            'api/v1/get/feed', 
            { 
                message: `Downloaded feed data for user ${userId}`,
                data: ""
            }
        ),
        headers: {
            'Content-Type': 'application/json'
        }
    };

};

export default httpTrigger;