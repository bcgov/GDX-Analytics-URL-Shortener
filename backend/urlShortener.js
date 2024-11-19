import moment from 'moment-timezone'; // Import Moment.js with timezone support
import { UrlModel } from './db.js';
import { generateRandomString } from './randomstring.js';

// Helper function to generate the next customId
const getNextCustomId = async () => {
  const lastUrl = await UrlModel.findOne({}, {}, { sort: { customId: -1 } }).exec();
  return lastUrl ? lastUrl.customId + 1 : 1000; // Start from 1000 if none exists
};

export const shortenUrl = async (req, res, next) => {
  const { targetUrl, description, expiryDate } = req.body;

  try {
    // Get the current time in the Pacific/Vancouver timezone
    const createdTime = moment.tz('America/Vancouver').toDate();

    // Generate the next customId
    const nextId = await getNextCustomId();

    // Generate a unique shortened URL string
    let shortenedUrlString;
    do {
      shortenedUrlString = generateRandomString(6);
    } while (await UrlModel.exists({ shortenedUrlString }));

    // Create a new document in the MongoDB collection
    const urlDocument = new UrlModel({
      targetUrl,
      description,
      expiryDate: expiryDate || null, // Allow expiryDate to be optional
      createdTime,
      shortenedUrlString,
      customId: nextId,
      versions: [], // Initialize an empty array for versioning
    });

    // Save the document to the database
    await urlDocument.save();

    // Construct the complete shortened URL
    const shortenedUrl = `${process.env.CUSTOM_DOMAIN}/${shortenedUrlString}`;

    // Respond with the shortened URL and custom ID
    res.json({ shortenedUrl, customId: nextId });
  } catch (error) {
    console.error('Error processing URL:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateUrl = async (req, res, next) => {
  const { customId } = req.params; // Extract customId from the request parameters
  const { targetUrl, expiryDate } = req.body;

  try {
    // Find the existing URL document using customId
    const urlDocument = await UrlModel.findOne({ customId });

    if (!urlDocument) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Add the current values to the versions array before updating
    urlDocument.versions.push({
      targetUrl: urlDocument.targetUrl,
      expiryDate: urlDocument.expiryDate,
      updatedAt: new Date(), // Current timestamp
    });

    // Update the fields with new values
    if (targetUrl) urlDocument.targetUrl = targetUrl;
    if (expiryDate) urlDocument.expiryDate = expiryDate;

    // Save the updated document
    await urlDocument.save();

    res.json({ message: 'URL updated successfully', urlDocument });
  } catch (error) {
    console.error('Error updating URL:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getHistory = async (req, res, next) => {
  const { customId } = req.params; // Extract customId from the request parameters

  try {
    // Find the URL document using customId
    const urlDocument = await UrlModel.findOne({ customId });

    if (!urlDocument) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Respond with the version history
    res.json({ versions: urlDocument.versions });
  } catch (error) {
    console.error('Error fetching version history:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
