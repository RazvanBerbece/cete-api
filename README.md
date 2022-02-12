# cete-api
API for the audio-based content-sharing social network app Cete. 

Built in NodeJS.

# 1 Progress
Also available in **Projects**

[~] Logic Models (Cete, User, Response, etc.)

[~] Azure functions (v1/...)

[~] CI/CD (testing, deployment)

[ ] Audio Data Processing (storage, retrieval from storage unit)

# 2 Endpoints
- GET ```api/v1/``` -> Get a sample resposne from the server stating the port it's listening on
- POST abc
- etc.

# 3 Tech Stack
## 3.1 Languages & Frameworks
- NodeJS, TypeScript (writing the code)
- Azure functions (serverless)
- ESLint (linting)
- Mocha (testing)
## 3.2 Server Hosting
The Endpoints are hosted and executed as Azure functions. Azure provides reliable, scalable, serverless features for NodeJS projects. 
## 3.3 Data Storage
tbc

# 4 DevOps
## 4.1 CI
Uses GitHub Actions to run the npm scripts which install the npm packages, compile the TS code to JS code and execute the test scripts.
See the CI workflow in ```.github/CI.yml```.

## 4.2 CD
Uses GitHub Actions to run the npm scripts which will containerise / deploy the app to the Cloud.
See the CD workflow in ```.github/CD.yml```.
