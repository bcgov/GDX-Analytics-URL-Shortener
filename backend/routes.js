import { UrlModel } from './db.js';
import { checkAuthenticated, handleAuthCallback, renderHomePage, initiateAuth, renderHomePageAfterAuth, handleUserLogout } from './auth.js';
import { shortenUrl } from './urlShortener.js';
import { getUrlSummary } from './urlSummary.js';
import { getUrlTable } from './urlTable.js';
import RateLimit from 'express-rate-limit';

const authLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});
export const setRoutes = (router) => {
  // Set up rate limiter: maximum of 100 requests per 15 minutes
  const authRateLimiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per windowMs
  });

  // Add routes related to authentication using the exported functions
  router.get('/auth/callback', authRateLimiter, handleAuthCallback);
  router.get('/', renderHomePage);
  router.get('/auth', authLimiter, initiateAuth);
  router.get('/home', checkAuthenticated, renderHomePageAfterAuth);
  router.get('/logout', handleUserLogout);
  // Route to shorten a URL
  router.post('/shorten', limiter, shortenUrl);
  // Rate limiter: maximum of 100 requests per 15 minutes
  const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per windowMs
  });
  // Route to retrieve URL details based on custom ID
  router.get('/url-summary/:customId', limiter, getUrlSummary);
  // Route to retrieve the table of URLs
  router.get('/urls', limiter, getUrlTable);

// ... (other routes)
};
