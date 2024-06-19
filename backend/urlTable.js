import { UrlModel } from './db.js';

export const getUrlTable = async (req, res, next) => {
  try {
    // Retrieve the list of URLs from the database and sort by 'createdTime'
    const urlTable = await UrlModel.find().sort({ createdTime:-1 }); // 1 for ascending, -1 for descending
    res.json(urlTable);
  } catch (error) {
    console.error('Error retrieving URL table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


