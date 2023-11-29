import { UrlModel } from './db.js';

export const getUrlTable = async (req, res, next) => {
  try {
    // Retrieve the list of URLs from the database
    const urlTable = await UrlModel.find();
    res.json(urlTable);
  } catch (error) {
    console.error('Error retrieving URL table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


