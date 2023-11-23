import mongoose from 'mongoose';
import { passport, keycloakClient, tokenset } from './server.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema for your data
const urlSchema = new mongoose.Schema({
  targetUrl: { type: String, required: true },
  description: { type: String },
  expiryDate: { type: Date },
  shortenedUrlString: { type: String, unique: true },
  customId: { type: Number, unique: true, required: true, default: 999 },
});

// Create a model based on the schema
const UrlModel = mongoose.model('Url', urlSchema);

export const setRoutes = (router) => {
  // Function to generate a random string
  function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  }

  // Middleware to check if the user is authenticated
  const checkAuthenticated = (req, res, next) => {
    if (req?.session?.passport?.user) {
      return next();
    }
    res.redirect('/');
  };

  // Route to handle authentication callback
  router.get('/auth/callback', (req, res, next) => {
    passport.authenticate('oidc', {
      successRedirect: '/home',
      failureRedirect: '/',
    })(req, res, next);
  });

  // Route to render the home page
  router.get('/', (req, res, next) => {
    res.render('index', {});
  });

  // Route to initiate authentication
  router.get('/auth', (req, res, next) => {
    passport.authenticate('oidc')(req, res, next);
  });

  // Route to render the home page after authentication
  router.get('/home', checkAuthenticated, (req, res, next) => {
    res.render('home', {
      username: `${req.session.passport.user.given_name} ${req.session.passport.user.family_name}`,
    });
  });

  // Route to handle user logout
  router.get('/logout', (req, res, next) => {
    req.session.destroy();
    const retUrl = `${process.env.SSO_AUTH_SERVER_URL}/realms/${
      process.env.SSO_REALM
    }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
      process.env.SSO_LOGOUT_REDIRECT_URI,
    )}&id_token_hint=${tokenset.id_token}`;
    res.redirect(`https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(retUrl)}`);
  });

  // Route to shorten a URL
  router.post('/shorten', async (req, res, next) => {
    const { targetUrl, description, expiryDate } = req.body;

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
  });

  // ... (other routes)
};
