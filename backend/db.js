import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Determine environment
const env = process.env.NODE_ENV;
const isLocal = env === 'local';
const isDevelopment = env === 'development';

console.log(`Environment: ${env}`);

// Set MongoDB host based on environment variables
const mongodbHost = process.env.MONGODB_HOST;
const mongodbDatabase = process.env.MONGODB_DATABASE;
const mongodbPort = process.env.MONGODB_PORT;

// Only log non-sensitive information in 'development' and full details in 'local'
if (isLocal || isDevelopment) {
  console.log(`MongoDB Host: ${mongodbHost}`);
  console.log(`MongoDB Database: ${mongodbDatabase}`);
  console.log(`MongoDB Port: ${mongodbPort}`);
}

let mongoURL;

// Construct MongoDB connection URL
if (isLocal) {
  mongoURL = `mongodb://${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  console.log(`Local MongoDB URL: ${mongoURL}`);
} else {
  if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
    const mongodbUser = process.env.MONGODB_USER;
    const mongodbPassword = process.env.MONGODB_PASSWORD;

    // Only log MongoDB User in 'local', not in 'development'
    if (isLocal) {
      console.log(`MongoDB User: ${mongodbUser}`);
    }

    mongoURL = `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  } else {
    console.error("MongoDB credentials are missing in the environment variables.");
    process.exit(1); // Exit if credentials are missing
  }
}

let connectionAttempts = 0;
const maxConnectionAttempts = 3;

// Function to connect to MongoDB with retry logic
async function connectToDatabase() {
  try {
    if (isLocal || isDevelopment) {
      console.log('Attempting to connect to MongoDB...');
    }

    await mongoose.connect(mongoURL, {
      serverSelectionTimeoutMS: 30000, // Timeout for server selection
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);

    // Only log full error and URL in 'local'
    if (isLocal) {
      console.error('Full Error:', err);
      console.error('MongoDB URL:', mongoURL);
    }

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
  createdTime: { type: Date, default: Date.now },
  createdBy: { type: String },
  updatedAt: { type: Date, default: null },
  editedBy: { type: String, default: "" },
  versions: [
    {
      targetUrl: { type: String },
      expiryDate: { type: Date },
      description: { type: String },
      updatedAt: { type: Date, default: Date.now },
      editedBy: { type: String },
    },
  ],
});

// Create model based on schema
export const UrlModel = mongoose.model('Url', urlSchema);
