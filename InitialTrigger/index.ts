import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Response from "../models/Response/Response.js";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function (v1/) processed a GET request.');
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: new Response(
            200, 
            new Date().toLocaleString(), 
            '/api/v1/', 
            { message: `cete-api routes up and running!` }
        )
    };
};

export default httpTrigger;