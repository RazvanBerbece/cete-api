import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Response from "../models/Response/Response.js";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function (v1/upload/audio) is processing a POST request.');
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: new Response(
            203, 
            new Date().toLocaleString(), 
            '/api/v1/upload/audio', 
            { message: `Uploading Audio endpoint in progress.` }
        )
    };
};

export default httpTrigger;