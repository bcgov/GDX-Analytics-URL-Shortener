// urlShortener.js

import { UrlModel } from './db.js';
import { generateRandomString } from './randomstring.js';

export const shortenUrl = async (req, res, next) => {
  const { targetUrl, description, expiryDate, createdTime } = req.body;

  try {
    // Get the latest customId from the database
    const lastUrl = await UrlModel.findOne({}, {}, { sort: { customId: -1 } }).exec();
    const idCounter = lastUrl ? lastUrl.customId : 999;

    // Increment the counter for the next submission
    const nextId = idCounter + 1;

    // Generate a unique shortened URL string
    const shortenedUrlString = generateRandomString(6);

    // Create a new document in the MongoDB collection
    const urlDocument = new UrlModel({
      targetUrl,
      description,
      expiryDate,
      createdTime,
      shortenedUrlString,
      customId: nextId,
    });

    // Save the document to the database
    await urlDocument.save();

    // Construct the complete shortened URL
    const shortenedUrl = `https://link.gov.bc.ca/${shortenedUrlString}`;

    // Respond with the shortened URL and custom ID
    res.json({ shortenedUrl, customId: nextId });
  } catch (error) {
    // Handle errors
    console.error('Error processing URL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
