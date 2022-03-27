# cete-api
**Serverless** API for the audio-based content-sharing social network app Cete. 

Built in TypeScript & NodeJS. Published on the Cloud through the Azure Function App.

It uses the Cloud [cete-infrastructure](https://github.com/RazvanBerbece/cete-infrastructure) for resources (app func, storage, etc.)

# 1 Progress
[~] Logic Models (~~Cete~~, User, Response, etc.)

[~] Azure functions (Cete, User System, etc.)

[ ] Functions Security (Request Authorization, Auth)

[~] CI/CD (testing, ~deployment~)

[~] Audio Data Processing (~~metadata storage~~, ~~audio data storage~~, retrieval from storage unit/s)

# 2 Endpoints
All REST responses for the URLs below carry a payload of type application/json.

[x] GET ```https://cete-api.azurewebsites.net/api/v1/``` -> Get a sample resposne from the server stating the port it's listening on.

[x] POST ```https://cete-api.azurewebsites.net/api/v1/upload/cete``` -> Post an audio file to the endpoint to store it in the Azure storage under userId (defaults to 'public' visibility).

[x] GET ```https://cete-api.azurewebsites.net/api/v1/get/profile``` -> Get a list of Cete objects under a userId with the given visibility. Limits the amount of objects retrieved through the 'limit' query parameter.

[x] GET ```https://cete-api.azurewebsites.net/api/v1/get/cete``` -> Get a cete object with base64 audioData which can be translated on client-side to play audio.

[~] GET ```https://cete-api.azurewebsites.net/api/v1/get/feed``` -> Get a list of Cetes to be displayed on a user feed.

[x] PUT ```https://cete-api.azurewebsites.net/api/v1/listen/cete``` -> Increments the 'listened' count of a Cete (with the given ceteId) upstream by 1. 

[x] DELETE ```https://cete-api.azurewebsites.net/api/v1/delete/cete``` -> Deletes a Cete (with the given ceteId) from upstream.

## 2.1 Endpoints Request Templates
1. POST ```api/v1/upload/cete```

        {
            "userId": <string>,
            "timestamp": <int_UNIX_TIME>, 
            "data": {
                "audioData": <string_base64>
            },
            "isArchived": <boolean>
        }

## 2.2 Endpoints Request Templates (Responses)
1. POST ```api/v1/upload/cete``` (RESPONSE)

        {
            "timestamp": <int_UNIX_TIME>, 
            "route": <string>,
            "resource": {
                "message": <string>,
                "ceteId": <string>
            }
        }

# 3 Tech Stack
## 3.1 Languages & Frameworks
- NodeJS, TypeScript, JavaScript (Language)
- Azure Function App (Serverless & publishing)
- Azure Storage & CosmosDB (Data storage)
- ESLint (linting)
- Mocha (testing)
- GitHub Actions (CI/CD)

# 4 Infrastructure
The infrastructure is built using Azure Cloud and its resources.
Implemented as IaC (Infrastructure as Code) using Terraform, the code can be easily maintained, modified and deployed to Azure Cloud and Terraform Cloud.
## 4.1 Server Hosting
The Endpoints are hosted and executed as Azure functions. Azure provides reliable, scalable, serverless features for NodeJS projects. 
Each endpoint is deployed to Azure Function App and routed through ```api/v1/```. See '**2 Endpoints**' for each function and it's parameters & outputs. For sample request bodies, see '**2.1 Endpoints Request Templates**'.
Sample Azure Func command : `func new --name AzureFuncName --template "HTTP trigger" --authlevel "anonymous"`
## 4.2 Data Storage
Uses CosmosDB for metadata indexing. Actual audio data is stored in Azure Storage Containers within WAV-type Blobs.
## 4.3 Logging
Uses the UI-based option of App Logs for an AI Workspace.

# 5 DevOps
## 5.1 CI
Uses GitHub Actions to run the npm scripts which install the npm packages, compile the TS code to JS code and execute the test scripts.
See the CI workflow in ```.github/TestIntegrationFlow.yml```.

## 5.2 CD
Uses GitHub Actions to run the npm scripts which will build the JS app out of the TypeScript source, lint and test the code. If the build is successful and the testing cases pass, the project folder will be deployed to the staging or production environment in Azure Function App automatically.

See the CD staging workflow in ```.github/DeployStgAppToAzure.yml```.

See the CD production workflow in ```.github/DeployPrdAppToAzure.yml```.

# 6 Usage
In order to run the project locally, the dependencies have to be installed first (Node@x.y.z, the packages in package.json, package_lock.json, etc.).
The ```dist/``` folder holds the transpiled TypeScript code which is actually run with the ```npm start``` command.