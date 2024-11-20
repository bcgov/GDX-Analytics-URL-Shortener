// Import necessary functions for URL shortening, summary retrieval, and URL table management.
import { shortenUrl } from './urlShortener.js';
import { getUrlSummary } from './urlSummary.js';
import { getUrlTable } from './urlTable.js';
import RateLimit from 'express-rate-limit'; // Import the rate-limiting middleware for Express.

const authLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes duration for the rate limit.
  max: 100, // Allow a maximum of 100 requests within the 15-minute window.
});

// Rate limiter for general requests: maximum of 100 requests per 15 minutes
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes duration for the rate limit.
  max: 100, // Allow a maximum of 100 requests within the 15-minute window.
});

// Function to set up routes for the application
export const setRoutes = (router) => {
  // Set up rate limiter for authentication-related routes
  const authRateLimiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes duration for the rate limit.
    max: 100, // Allow a maximum of 100 requests within the 15-minute window.
  });

  // Route to shorten a URL
  router.post('/create', limiter, shortenUrl); // Apply rate limiter to the URL shortening route.

  // Route to retrieve URL details based on custom ID
  router.get('/url-summary/:customId', limiter, getUrlSummary); // Apply rate limiter to the URL summary retrieval route.

  // Route to retrieve the table of URLs
  router.get('/urls', limiter, getUrlTable); // Apply rate limiter to the URL table retrieval route.

  // ... (additional routes can be defined here)
};
