import { AzureFunction, Context } from "@azure/functions";
import Response from "../models/Response/Response.js";
import STATUS_CODES from "../models/StatusCode/statuses.js";

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {
    context.log('HTTP trigger function (v1/) is processing a GET request.');
    context.res = {
        status: STATUS_CODES.SUCCESS,
        body: new Response(
            new Date().toLocaleString(), 
            '/api/v1/', 
            { message: `cete-api routes up and running!` }
        )
    };
};

export default httpTrigger;