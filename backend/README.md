# URL-S Backend

Instructions for configuring and starting the URL-S backend apps: Node.js Express and MongoDB.

## Local Setup
 **`Step 1`**. Make sure you have Node.js installed in your local machine. Type node -v in Terminal. This repo has been tested with Node version 20.10.0 LTS. If you do not have Node, download from here - https://nodejs.org/en/. npm will be installed alongside node.js.
 
 **`Step 2`**. Install and start MongoDB. Install Homebrew. Then `brew tap mongodb/brew` and  `brew install mongodb-community@7.0`. Start the database service with `brew services start mongodb-community`
 
 **`Step 3`**. Make sure you have the MongoDB Compass (GUI) app available. This desktop app is used to manage MongoDB databases. Install with `brew install --cask mongodb-compass`. Check that you can connect to the database at localhost:27017 (mongodb://localhost:27017).
 
 **`Step 4`**. In the /backend folder, create an .env file to store the BC Government Single Sign-on SSO secret. Copy .env.template to .env. Download the secret from https://bcgov.github.io/sso-requests; click Login; select the URL Shortener project; click Download in INTEGRATION DETAILS; Open the downloaded .json file in a text editor. Copy and paste the secret value into the new .env file. Note that .gitignore lists .env - it will not be added to the repository. 
 
 **`Step 5`**. From the /backend folder, run `npm install` in the terminal to install required dependencies.
 
 **`Step 6`**. From the /backend folder, run `npm run start` in the terminal to start the backend app.

**`Step 7`**. Open a browser and visit http://localhost:3000/. Click 'Proceed to login...' to enter your IDIR credentials

**`Step 8`**. Complete the the Frontend installation steps in the /frontend folder README.



## Details

## Single Sign-on Pre-requisite

- We needed a BC Government Single Sign-on integration with client type `confidential` before we could start using SSO in the URL-S app
- We went to [SSO Onboarding](https://github.com/bcgov/sso-keycloak/wiki/SSO-Onboarding) to learn about and request this integration.
