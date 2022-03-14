/**
 * Endpoint called to increment the number of listens of a Cete (when a 'listen' counts as legal)
 * Updates Cete object in process and then in CosmosDB Indexing
 */

import { AzureFunction, Context } from "@azure/functions";
import Response from "../models/Response/Response.js";
import STATUS_CODES from "../models/StatusCode/statuses";
import DBClient from "../models/AzureCosmosDBClient/DBClient";
import Cete from "../models/Cete/Cete.js";

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {

    context.log('HTTP trigger function (v1/listen/cete) is processing a PUT request.');

    // Get query params
    const userId = context.req.query.userId;
    const ceteId = context.req.query.ceteId;

    if (typeof ceteId === 'undefined' || typeof userId === 'undefined') {
        context.res = {
            status: STATUS_CODES.CLIENT_INVALID_REQUEST_NO_CETEID_OR_PARAM,
            body: new Response(
                new Date().toLocaleString(), 
                'api/v1/listen/cete', 
                { message: `InvalidRequestNoCeteOrUserID : GET Request has no Cete ID or user ID` }
            ),
            headers: {
                'Content-Type': 'application/json'
            }
        };  
    }
    else {
        
        // Initialise Cete object in process (set ceteId, userId, data.filepath, archived, timestamp (pulled) , listens (pulled]))
        const ceteToBeListened = new Cete();
        ceteToBeListened.setCeteId(ceteId);
        ceteToBeListened.setUserId(userId);

        // Connect to Azure DB using the DBClient internal API
        const database_client = new DBClient(`cete-${process.env["ENVIRONMENT"]}-indexing`, "Cetes");

        await database_client.getCetefromCeteIndexing(ceteId)
        .then(async (resource: Cete) => {

            // Continue building Cete object with data from upstream to match update target format
            ceteToBeListened.setTimestamp(resource.getTimestamp());
            ceteToBeListened.setFilePath(resource.getFilePath());

            // Download current listen count from upstream & increment
            ceteToBeListened.setListens(resource.getListens());
            ceteToBeListened.incrementListens();

            // Update object upstream
            await database_client.updateCeteInCeteIndexing(ceteToBeListened)
            .then(() => {
                context.res = {
                    status: STATUS_CODES.SUCCESS,
                    body: new Response(
                        new Date().toLocaleString(), 
                        'api/v1/listen/cete', 
                        { message: `Successfully registered listen for Cete ${ceteId}.` }
                    ),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            })
            .catch((err) => {
                context.res = {
                    status: STATUS_CODES.SERVER_LISTEN_AUDIO,
                    body: new Response(
                        new Date().toLocaleString(), 
                        'api/v1/listen/cete', 
                        { message: `ServerListenCete : ${err}. Cete did not update listens upstream.` }
                    ),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };  
            });

        })
        .catch((err) => {
            context.res = {
                status: STATUS_CODES.SERVER_LISTEN_AUDIO,
                body: new Response(
                    new Date().toLocaleString(), 
                    'api/v1/listen/cete', 
                    { message: `ServerListenCete : ${err}. Cete did not update listens upstream.` }
                ),
                headers: {
                    'Content-Type': 'application/json'
                }
            };  
        });

    }

};

export default httpTrigger;