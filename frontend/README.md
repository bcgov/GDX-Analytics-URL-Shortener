# URL-S Frontend

Instructions for configuring and starting the URL-S frontend app, Vue.js, and its dependencies.

Before doing the the frontend install and start, the Backend application must be installed and started. Follow instructions in the README in the Backend folder.

## Local Setup

**`Step 1`**. - Copy the .env.template file and create a .env file in frontend/url-shortener with all env variables as given

**`Step 2`**. Open a new terminal (option to do this in VS Code). Do not use the terminal that is running the backend code. Change directory to the frontend/url-shortener folder.
  
**`Step 3`**. From the /url-shortener folder, run `npm install` in the terminal to install required dependencies.
 
**`Step 4`**. From the /url-shortener folder, run `npm run dev` in the terminal to start the app.

**`Step 5`**. Open a browser and visit the app dev site at http://localhost:5173

**`Step 6`**. If you are already logged into a gov website on the browser with your email then you won't be prompted for a login screen otherwise you will see a Microsoft MFA enabled login screen where you will have to enter your government email and and password with MFA code.

## Note

API calls from frontend to backend are secured by keycloack and are encoded into JWT tokens which are validated in the backend before it sends a response.