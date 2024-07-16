# URL-S Frontend

Instructions for configuring and starting the URL-S frontend app, Vue.js, and its dependencies.

Before doing the the frontend install and start, the Backend application must be installed and started. Follow instructions in the README in the Backend folder.

## Local Setup

**`Step 1`**. - Create a .env file in frontend/url-shortener with these values

VITE_FRONTEND_BASE_URL=http://localhost:5173
VITE_BACKEND_BASE_URL=http://localhost:3000


**`Step 2`**. Open a new terminal (option to do this in MS Code). Do not use the terminal that is running the backend code. Change directory to the frontend/url-shortener folder.
  
**`Step 3`**. From the /url-shortener folder, run `npm install` in the terminal to install required dependencies.
 
**`Step 4`**. From the /url-shortener folder, run `npm run dev` in the terminal to start the app.

**`Step 5`**. Open a browser and visit the app dev site at http://localhost:5173