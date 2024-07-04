import dotenv from 'dotenv'; // Import dotenv for environment variables
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Issuer, Strategy } from 'openid-client';
import { setRoutes } from './routes.js';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const backendURL = process.env.NODE_ENV === 'production'
  ? 'https://gdx-analytics-url-shortener-backend-c6d33e-dev.apps.silver.devops.gov.bc.ca/'
  : 'http://localhost:3000/';

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
  }),
);

app.use(express.urlencoded({ extended: false }));

const router = express.Router();

setRoutes(router);

app.use('/', router);

const keycloakIssuer = await Issuer.discover(
  `${process.env.SSO_AUTH_SERVER_URL}/realms/${process.env.SSO_REALM}/.well-known/openid-configuration`,
);

const keycloakClient = new keycloakIssuer.Client({
  client_id: process.env.SSO_CLIENT_ID,
  client_secret: process.env.SSO_CLIENT_SECRET,
  redirect_uris: [`${backendURL}auth/callback`],  // Using backendURL here
  response_types: ['code'],
});

// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

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

app.listen(3000, function () {
  console.log(`Listening at ${backendURL}`);
  console.log('NODE_ENV:', process.env.NODE_ENV);
});

export { passport, keycloakClient, tokenset };
