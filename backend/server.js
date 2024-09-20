import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Issuer, Strategy } from 'openid-client';
import { setRoutes } from './routes.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const backendURL = process.env.SSO_LOGOUT_REDIRECT_URI;
const store = new session.MemoryStore();
const app = express();

// Use CORS middleware
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.json());
app.use(
  session({
    secret: process.env.SSO_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

const router = express.Router();
setRoutes(router);
app.use('/', router);

// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

const keycloakIssuer = await Issuer.discover(
  `${process.env.SSO_AUTH_SERVER_URL}/realms/${process.env.SSO_REALM}/.well-known/openid-configuration`,
);

const keycloakClient = new keycloakIssuer.Client({
  client_id: process.env.SSO_CLIENT_ID,
  client_secret: process.env.SSO_CLIENT_SECRET,
  redirect_uris: [`${backendURL}auth/callback`],
  response_types: ['code'],
});

let tokenset = {};
passport.use(
  'oidc',
  new Strategy({ client: keycloakClient }, (tokenSet, userinfo, done) => {
    tokenset = tokenSet;
    return done(null, tokenSet.claims());
  }),
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// ---------------------------------------
// Serve the frontend files
// ---------------------------------------

// Serve static files (like the Vue.js build files)
app.use(express.static(join(__dirname, 'dist')));

// Catch-all route: for any route that doesn't match API, serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ---------------------------------------
// Start the server
// ---------------------------------------
app.listen(3000, function () {
  console.log(`Listening at ${backendURL}`);
  console.log('NODE_ENV:', process.env.NODE_ENV);
});

export { passport, keycloakClient, tokenset };
