import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
//console.log('NODE_ENV:', process.env.NODE_ENV);

// Determine MongoDB connection details based on environment

// Check if the environment is local development
const isLocal = process.env.NODE_ENV === 'local';

// Set MongoDB host based on environment variables or default to 'mongodb-dev' for non-local
const mongodbHost = isLocal ? 'localhost' : (process.env.MONGODB_HOST || 'mongodb-dev');

// Set MongoDB database name based on environment variables or default to 'mongodb' for non-local
const mongodbDatabase = isLocal ? 'mongodb' : (process.env.MONGODB_DATABASE || 'mongodb');

// MongoDB port number (default is 27017)
const mongodbPort = '27017';  // MongoDB port

let mongoURL;

// Construct MongoDB connection URL
if (isLocal) {
  mongoURL = `mongodb://${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
} else {
  // Use credentials if provided for non-local environments
  if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
    const mongodbUser = process.env.MONGODB_USER;
    const mongodbPassword = process.env.MONGODB_PASSWORD;
    mongoURL = `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  }
}

// Debugging console logs for connection details
//console.log('MONGODB_HOST:', mongodbHost);
//console.log('MONGODB_USER:', process.env.MONGODB_USER);
//console.log('MONGODB_PASSWORD:', process.env.MONGODB_PASSWORD ? 'set' : 'not set');
//console.log('MongoDB Connection URL:', mongoURL);

let connectionAttempts = 0;
const maxConnectionAttempts = 3; // Adjust as needed

// Function to connect to MongoDB with retry logic
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURL, {
      serverSelectionTimeoutMS: 30000, // Timeout for server selection
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    connectionAttempts++;
    if (connectionAttempts < maxConnectionAttempts) {
      console.log(`Retrying connection in 5 seconds (Attempt ${connectionAttempts}/${maxConnectionAttempts})`);
      setTimeout(connectToDatabase, 5000); // Retry after 5 seconds
    } else {
      console.error(`Max connection attempts (${maxConnectionAttempts}) reached. Exiting process.`);
      process.exit(1); // Exit process after max attempts
    }
  }
}

// Initial connection attempt
connectToDatabase();

// Define schema for URL data

const urlSchema = new mongoose.Schema({
  targetUrl: { type: String, required: true },
  description: { type: String },
  expiryDate: { type: Date },
  shortenedUrlString: { type: String, unique: true },
  customId: { type: Number, unique: true, required: true, default: 999 },
  createdTime: { type: Date },
});

// Create model based on schema
export const UrlModel = mongoose.model('Url', urlSchema);
