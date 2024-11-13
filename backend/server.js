// Import dotenv to manage environment variables
import dotenv from 'dotenv'; 
import express from 'express'; // Import the Express framework for building the server
import cors from 'cors'; // Import CORS middleware to enable cross-origin requests
import { setRoutes } from './routes.js'; // Import the function to set up application routes
import { authenticate } from './auth.js'; // Import the authenticate function for user validation

// Load environment variables from the .env file into process.env
dotenv.config();

// Retrieve the backend URL from environment variables
const backendURL = process.env.BACKEND_URL;

// Initialize an Express application
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: false }));

// Health check route to ensure the backend is operational
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' }); // Respond with a simple message
});

// Authentication middleware to validate incoming requests
const authMiddleware = async (req, res, next) => {
  // Validate the token in the request headers
  const currentUser = await authenticate(req.headers); 

  if (!currentUser) {
    // Send a 401 Unauthorized response if authentication fails
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
  }

  // Attach the authenticated user info to the req object for use in routes
  req.user = currentUser;

  // Proceed to the next middleware or route handler
  next();
};

// Create a new Express router
const router = express.Router();

// Apply the authentication middleware to the router to protect all routes
app.use(authMiddleware, router); // Secure all routes with the authentication middleware

// Set up your application routes
setRoutes(router);

// Start the Express server and listen on port 3000
app.listen(3000, function () {
  console.log(`Listening at ${backendURL}`); // Log the backend URL to the console
  console.log('NODE_ENV:', process.env.NODE_ENV); // Log the current Node environment
});
