# URL-S Backend

Instructions for configuring and starting the URL-S backend apps: Node.js Express and MongoDB.

## Local Setup - TLDR
 **`Step 1`**. Make sure you have Node.js installed in your local machine. If not download from here https://nodejs.org/en/ 
 
 **`Step 2`**. Make sure you have MongoDB running. Install Homebrew and then `brew install mongodb-community@7.0`. Make sure you have the Mongoos Compass GUI app available - find it at https://www.mongodb.com/try/download/compass. Start the database servce with `brew services start mongodb-community`
 
 **`Step 3`**. Create an .env file to store the BC Government Single Sign-on SSO secret. Copy .env.template to .env. Download the secret from https://bcgov.github.io/sso-requests; click Login; select the URL Shortener project; click Download in INTEGRATION DETAILS; Open the downloaded .json file in a text editor. Copy and paste the secret value into the new .env file. Note that .gitignore lists .env - it will not be added to the repository. 
 
 **`Step 4`**. From the backend folder, run `npm install` in the terminal to install required dependencies.
 
 **`Step 5`**. From the backend folder, run `npm run start` in the terminal to start the app.


## Details

## Single Sign-on Pre-requisite

- We needed a BC Government Single Sign-on integration with client type `confidential` before we could start using SSO in the URL-S app
- We went to [SSO Onboarding](https://github.com/bcgov/sso-keycloak/wiki/SSO-Onboarding) to learn about and request this integration.
