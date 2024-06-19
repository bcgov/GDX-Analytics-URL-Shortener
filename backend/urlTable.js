import { UrlModel } from './db.js';

export const getUrlTable = async (req, res, next) => {
  try {
    // Retrieve the list of URLs from the database and sort by 'createdTime'
    let urlTable = await UrlModel.find().sort({ createdTime:-1 }); // 1 for ascending, -1 for descending
    
    // Update shortenedUrlString with the short URL domain
    urlTable = urlTable.map((url) => {
      url.shortenedUrlString = `https://link.gov.bc.ca/${url.shortenedUrlString}`;
      return url;
    });

    res.json(urlTable);
  } catch (error) {
    console.error('Error retrieving URL table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


