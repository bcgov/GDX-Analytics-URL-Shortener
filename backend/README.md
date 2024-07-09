# URL-S Backend

Instructions for configuring and starting the URL-S backend apps: Node.js Express and MongoDB.

## Local Setup
 **`Step 1`**. Make sure you have Node.js installed in your local machine. Type node -v in Terminal. This repo has been tested with Node version 20.10.0 LTS. If you do not have Node, download from here - https://nodejs.org/en/. npm will be installed alongside node.js.
 
 **`Step 2`**. Install and start MongoDB. Install Homebrew. Then `brew tap mongodb/brew` and  `brew install mongodb-community@7.0`. Start the database service with `brew services start mongodb-community`. If you encounter a 'Permission denied' error, you may need to rerun the command with elevated privileges using `sudo brew services start mongodb-community`.
 
 **`Step 3`**. Make sure you have the MongoDB Compass (GUI) app available. This desktop app is used to manage MongoDB databases. Install with `brew install --cask mongodb-compass`. Check that you can connect to the database at localhost:27017 (mongodb://localhost:27017).
 
 **`Step 4`**. In the /backend folder, create a new file and rename as '.env' to store the BC Government Single Sign-on(SSO) secret. Copy '.env.template' contents to '.env'. Make sure first line of this file is NODE_ENV=development as given in the template.
  
  Download the secret from https://bcgov.github.io/sso-requests; click Login; select the URL Shortener project; click Download in INTEGRATION DETAILS; Open the downloaded .json file in a text editor. Copy the secret value in "credentials": {"secret": "SSO_CLIENT_SECRET"} and paste it as the value to SSO_CLIENT_SECRET in your '.env' file. Make sure not to include any quotations around SSO_CLIENT_SECRET. Note that .gitignore lists .env - it will not be added to the repository. 
 
 **`Step 5`**. From the /backend folder, run `npm install` in the terminal to install required dependencies.
 
 **`Step 6`**. From the /backend folder, run `npm run start` in the terminal to start the backend app.

**`Step 7`**. Open a browser and visit http://localhost:3000/. Click 'Proceed to login...' to enter your IDIR credentials

**`Step 8`**. Complete the the Frontend installation steps in the /frontend folder README.

## OpenShift dev pod Setup

**`Step 1`**. Move all sso related environment variables from .env file to OpenShift secrets. Use env.template file for example entries. Make sure to also add NODE_ENV=production in the secrets as well
**`Step 2`**. Install a new mongodb service in OpenShift within the dev project using the MongoDB (Ephemeral) template already provided by OpenShift, as a part of this setup, you will be setting up the credentials for mongodb to later use in the application.
**`Step 3`**. Setup the app using "Import from Git" strategy and pull the https://github.com/bcgov/GDX-Analytics-URL-Shortener/tree/gdxdsd-6863-move-local-to-OpenShift/backend code.
A port forwading in the backend service is required to forward the traffic from 8080 to 3000. So yaml file of backend service sshould have these values
spec:
  ports:
    - name: 8080-tcp
      protocol: TCP
      port: 8080
      targetPort: 3000
**`Step 4`**. A docker file at backend/Dockerfile is provided as part of this folder which is enough to provide insutructions to OpenShift and to start the backend server. This should create a pod and route in dev project where backend will accessible and connected to the database.


## Details

## Single Sign-on Pre-requisite

- We needed a BC Government Single Sign-on integration with client type `confidential` before we could start using SSO in the URL-S app
- We went to [SSO Onboarding](https://github.com/bcgov/sso-keycloak/wiki/SSO-Onboarding) to learn about and request this integration.
