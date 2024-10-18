import dotenv from 'dotenv'; // Import dotenv for environment variables
import express from 'express';
import cors from 'cors';
import { setRoutes } from './routes.js';
import { authenticate } from './auth.js'; // Import the authenticate function

// Load environment variables from .env file
dotenv.config();

const backendURL = process.env.BACKEND_URL;

const app = express();
// Use CORS middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check route to ensure the backend is running
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const currentUser = await authenticate(req.headers); // Validate the token

  if (!currentUser) {
    // Send 401 Unauthorized if authentication fails
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
  }

  // Attach the user info to req object for use in routes
  req.user = currentUser;

  // Proceed to the next middleware/route handler
  next();
};

const router = express.Router();

// Apply the middleware to the routes you want to protect
app.use(authMiddleware, router); // Secure all routes with the auth middleware

// Set up your routes
setRoutes(router);

// Start the server
app.listen(3000, function () {
  console.log(`Listening at ${backendURL}`);
  console.log('NODE_ENV:', process.env.NODE_ENV);
});
