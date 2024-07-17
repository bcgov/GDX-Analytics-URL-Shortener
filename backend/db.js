import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
//console.log('NODE_ENV:', process.env.NODE_ENV);

// Determine MongoDB connection details based on environment

// Check if the environment is local


// Set MongoDB host based on environment variables or default to 'mongodb-dev' for non-local
const mongodbHost = 'mongodb-tools';

// Set MongoDB database name based on environment variables or default to 'mongodb' for non-local
const mongodbDatabase = 'mongo-urls-db';

// MongoDB port number (default is 27017)
const mongodbPort = '27017';  // MongoDB port

let mongoURL;

const mongodbUser = 'dbuser';
const mongodbPassword = 'dbpass';
mongoURL = `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;

// Debugging console logs for connection details
console.log('MONGODB_HOST:', mongodbHost);
console.log('MONGODB_USER:', mongodbUser);
console.log('MONGODB_PASSWORD:', mongodbPassword ? 'set' : 'not set');
console.log('MongoDB Connection URL:', mongoURL);

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
