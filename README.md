# cete-api
**Serverless** API for the audio-based content-sharing social network app Cete. 

Built in TypeScript & NodeJS. Published on the Cloud through the Azure Function App.

It uses the Cloud [cete-infrastructure](https://github.com/RazvanBerbece/cete-infrastructure) for resources (app func, storage, etc.)

# 1 Progress
Also available in **Projects**

[~] Logic Models (~~Cete~~, User, Response, etc.)

[~] Azure functions (~~v1/~~, v1/upload/audio, v1/get/audio)

[~] CI/CD (testing, ~deployment~)

[~] Audio Data Processing (~~metadata storage~~, audio data storage, retrieval from storage unit/s)

# 2 Endpoints
- GET ```https://cete-api.azurewebsites.net/api/v1/``` -> Get a sample resposne from the server stating the port it's listening on
- POST ```https://cete-api.azurewebsites.net/api/v1/upload/audio``` -> Post an audio file to the endpoint to store it in the Azure storage
- etc.

## 2.1 Endpoints Request Templates
1. POST ```api/v1/upload/audio```

    REQ {
            "userId": <string>,
            "timestamp": <int_UNIX_TIME>, 
            "data": {
                "audioData": <string_base64>,
                "isArchived": <boolean>
            }
        }

    RES {
            "timestamp": <int_UNIX_TIME>, 
            "route": <string>,
            "data": {
                "message": <string>,
                "ceteId": <string>
        }
}
    

# 3 Tech Stack
## 3.1 Languages & Frameworks
- NodeJS, TypeScript, JavaScript (writing the code)
- Azure Function App (serverless & publishing)
- ESLint (linting)
- Mocha (testing)
- GitHub Actions (CI/CD)
## 3.2 Server Hosting
The Endpoints are hosted and executed as Azure functions. Azure provides reliable, scalable, serverless features for NodeJS projects. 
Each endpoint is deployed to Azure Function App and routed through ```api/v1/```. See '**2 Endpoints**' for each function and it's parameters & outputs. For sample request bodies, see '**2.1 Endpoints Request Templates**'
## 3.3 Data Storage
tbc

# 4 DevOps
## 4.1 CI
Uses GitHub Actions to run the npm scripts which install the npm packages, compile the TS code to JS code and execute the test scripts.
See the CI workflow in ```.github/CI.yml```.

## 4.2 CD
Uses GitHub Actions to run the npm scripts which will build the JS app out of the TypeScript source, lint and test the code. If the build is successful and the testing cases pass, the project folder will be deployed to Azure Function App automatically.
See the CD workflow in ```.github/CD.yml```.

# 5 Usage
In order to run the project locally, the dependencies have to be installed first (Node@x.y.z, the packages in package.json, package_lock.json, etc.).
The ```dist/``` folder holds the transpiled TypeScript code which is actually run with the ```npm start``` command.
