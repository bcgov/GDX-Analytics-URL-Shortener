import { UrlModel } from './db.js';

export const getUrlSummary = async (req, res) => {
  const customId = req.params.customId;

  try {
    // Query the database to get the URL details based on customId
    const urlDetails = await UrlModel.findOne({ customId });

    if (!urlDetails) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Send the URL details as a JSON response
    res.json({
      targetUrl: urlDetails.targetUrl,
      description: urlDetails.description,
      expiryDate: urlDetails.expiryDate,
      shortenedUrlString: urlDetails.shortenedUrlString,
      customId: urlDetails.customId,
    });
  } catch (error) {
    console.error('Error retrieving URL details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
