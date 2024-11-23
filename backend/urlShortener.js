import moment from 'moment-timezone'; // Import Moment.js with timezone support
import { UrlModel } from './db.js';
import { generateRandomString } from './randomstring.js';
import { authenticateMiddleware } from './auth.js'; // Import the middleware

// Helper function to generate the next customId
const getNextCustomId = async () => {
  const lastUrl = await UrlModel.findOne({}, {}, { sort: { customId: -1 } }).exec();
  return lastUrl ? lastUrl.customId + 1 : 1000; // Start from 1000 if none exists
};

export const shortenUrl = [
  authenticateMiddleware, // Middleware to enforce authentication
  async (req, res) => {
    const { targetUrl, description, expiryDate } = req.body;

    // Validate input
    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' });
    }
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return res.status(400).json({ error: 'Invalid expiryDate format' });
    }

    try {
      // Log the user object to ensure it's populated correctly
      console.log('Authenticated User:', req.user);

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
        createdBy: req.user ? req.user.idir_username : 'unknown', // Ensure createdBy is assigned
        versions: [], // Initialize an empty array for versioning
        updatedAt: null, // Set updatedAt as null initially
        editedBy: null, // Set editedBy as null initially
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
  },
];


export const updateUrl = [
  authenticateMiddleware, // Middleware to enforce authentication
  async (req, res) => {
    const { customId } = req.params; // Extract customId from the request parameters
    const { targetUrl, expiryDate, description } = req.body;

    // Validate input
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return res.status(400).json({ error: 'Invalid expiryDate format' });
    }

    try {
      // Find the existing URL document using customId
      const urlDocument = await UrlModel.findOne({ customId });

      if (!urlDocument) {
        return res.status(404).json({ error: 'URL not found' });
      }

      // Log the user object to ensure it's populated correctly
      console.log('Authenticated User:', req.user);

      // Add the current values to the versions array before updating
      urlDocument.versions.push({
        targetUrl: urlDocument.targetUrl,
        expiryDate: urlDocument.expiryDate,
        description: urlDocument.description,
        updatedAt: new Date(), // Current timestamp for versioning
        editedBy: req.user ? req.user.idir_username : 'unknown', // Track who edited
      });

      // Update the fields with new values
      if (targetUrl) urlDocument.targetUrl = targetUrl;
      if (expiryDate) urlDocument.expiryDate = expiryDate;
      if (description) urlDocument.description = description;

      // Update the main document with new `updatedAt` and `editedBy`
      urlDocument.updatedAt = new Date(); // Set updated timestamp
      urlDocument.editedBy = req.user ? req.user.idir_username : 'unknown'; // Set who edited

      // Save the updated document
      await urlDocument.save();

      res.json({ message: 'URL updated successfully', urlDocument });
    } catch (error) {
      console.error('Error updating URL:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];


export const getHistory = [
  authenticateMiddleware, // Use middleware to enforce authentication
  async (req, res) => {
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
  },
];
