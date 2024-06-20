import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Log the current environment mode
console.log('NODE_ENV:', process.env.NODE_ENV);

// Determine if the environment is local or not
const isLocal = process.env.NODE_ENV === 'development';
const mongodbHost = isLocal ? 'localhost' : (process.env.MONGODB_HOST || 'mongodb');
const mongodbDatabase = 'mongodb';  // Your database name
const mongodbPort = '27017';  // Fixed port

let mongoURL;

if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
  const mongodbUser = process.env.MONGODB_USER;
  const mongodbPassword = process.env.MONGODB_PASSWORD;
  if (isLocal) {
    mongoURL = `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  } else {
    mongoURL = `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  }
} else {
  if (isLocal) {
    mongoURL = `mongodb://${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  } else {
    mongoURL = `mongodb://${mongodbHost}:${mongodbPort}/${mongodbDatabase}`;
  }
}

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    // Optionally retry connection after a delay or exit the process
    setTimeout(connectToDatabase, 5000); // Retry after 5 seconds
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
