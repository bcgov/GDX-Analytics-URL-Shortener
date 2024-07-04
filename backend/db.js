import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Log the current environment mode
//console.log('NODE_ENV:', process.env.NODE_ENV);

// Determine if the environment is local or not
const isLocal = process.env.NODE_ENV === 'development';
const mongodbHost = isLocal ? 'localhost' : (process.env.MONGODB_HOST || 'mongodb-dev');
const mongodbDatabase = isLocal ? 'mongodb' : (process.env.MONGODB_DATABASE || 'mongodb');  // Your database name
const mongodbPort = '27017';  // Fixed port

let mongoURL;
//if there is a env variables, then 
if (isLocal) {
  mongoURL = `mongodb://${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
} else {
  if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
    const mongodbUser = process.env.MONGODB_USER;
    const mongodbPassword = process.env.MONGODB_PASSWORD;
    mongoURL = `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  }
}

//console logging statements for debugging the connection
//console.log('MONGODB_HOST:', mongodbHost);
//console.log('MONGODB_USER:', process.env.MONGODB_USER);
//console.log('MONGODB_PASSWORD:', process.env.MONGODB_PASSWORD ? 'set' : 'not set');
//console.log('MongoDB Connection URL:', mongoURL);

let connectionAttempts = 0;
const maxConnectionAttempts = 3; // Adjust this as needed

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURL, {
      serverSelectionTimeoutMS: 30000, // Keep this for retry logic
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
      process.exit(1); // Exit the process after max attempts
    }
  }
}

connectToDatabase();

// Create a schema for your data
const urlSchema = new mongoose.Schema({
  targetUrl: { type: String, required: true },
  description: { type: String },
  expiryDate: { type: Date },
  shortenedUrlString: { type: String, unique: true },
  customId: { type: Number, unique: true, required: true, default: 999 },
  createdTime: { type: Date },
});

// Create a model based on the schema
export const UrlModel = mongoose.model('Url', urlSchema);
