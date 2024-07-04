# URL-S Frontend

Instructions for configuring and starting the URL-S frontend app, Vue.js, and its dependencies.

Before doing the the frontend install and start, the Backend application must be installed and started. Follow instructions in the README in the Backend folder.

## Local Setup

**`.env File`** - Create a .env file in frontend/url-shortener with these values

VITE_FRONTEND_BASE_URL=http://localhost:5173
VITE_BACKEND_BASE_URL=http://localhost:3000


**`Step 1`**. Open a new terminal (option to do this in MS Code). Do not use the terminal that is running the backend code. Change directory to the frontend/url-shortener folder.
  
**`Step 2`**. From the /url-shortener folder, run `npm install` in the terminal to install required dependencies.
 
**`Step 3`**. From the /url-shortener folder, run `npm run dev` in the terminal to start the app.

**`Step 4`**. Open a browser and visit the app dev site at http://localhost:5173

### Openshift dev Setup 

To host the app in dev project of Openshift, follow this process:

**`Step 1`**. Setup the app using "Import from Git" strategy and pull the https://github.com/bcgov/GDX-Analytics-URL-Shortener/tree/gdxdsd-6863-move-local-to-openshift/frontend/url-shortener code.

A docker file at frontend/url-shortener/Dockerfile is provided as part of this folder which is enough to provide insutructions to openshift and to start a http server to serve the static files. This should create a pod and route in dev project where frontend will accessible.
 
If you would like to know more about we did the openshift setup like route setting, secrets, services etc, then please contact us.