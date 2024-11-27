// Import necessary libraries for handling HTTP errors, making HTTP requests, 
// verifying JSON Web Tokens (JWT), and managing JSON Web Key Sets (JWKS).
import createHttpError from 'http-errors';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jws from 'jws';
import jwkToPem from 'jwk-to-pem';
import dotenv from 'dotenv';

// Load environment variables from a .env file for configuration.
dotenv.config();

// Define environment variables for configuration.
const { SSO_CONFIGURATION_ENDPOINT, SSO_CLIENT_ID } = process.env;

// Cache for the SSO configuration to avoid redundant network calls.
let _ssoConfig = null;

// Function to retrieve SSO configuration from the configured endpoint.
const getConfiguration = async () => {
  try {
    // Return the cached configuration if already fetched.
    if (_ssoConfig) return _ssoConfig;

    // Fetch the issuer and JWKS URI from the SSO configuration endpoint.
    const { issuer, jwks_uri } = await axios
      .get(SSO_CONFIGURATION_ENDPOINT)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching SSO configuration:', err.message);
        throw new createHttpError.InternalServerError('Failed to fetch SSO configuration');
      });

    // Fetch the JWKS from the JWKS URI obtained above.
    const jwks = await axios
      .get(jwks_uri)
      .then(res => res.data)
      .catch(err => {
        console.error('Error fetching JWKS:', err.message);
        throw new createHttpError.InternalServerError('Failed to fetch JWKS');
      });

    // Cache the configuration for future use.
    _ssoConfig = { jwks, issuer };
    return _ssoConfig;
  } catch (err) {
    console.error('Configuration fetch error:', err.message);
    throw err; // Re-throw the error for higher-level handling.
  }
};

// Function to validate the JWT signature.
const validateJWTSignature = async (token) => {
  try {
    // Decode the JWT to get its header, which contains metadata including the key ID (kid).
    const { header } = jws.decode(token);
    if (!header) throw new createHttpError.Unauthorized('Invalid JWT format');

    // Retrieve the SSO configuration (JWKS and issuer).
    const { jwks, issuer } = await getConfiguration();

    // Find the appropriate key in the JWKS using the key ID from the JWT header.
    const key = jwks.keys.find((jwkKey) => jwkKey.kid === header.kid);
    if (!key) throw new createHttpError.Unauthorized('Unable to find matching JWKS key');

    // Convert the JWK to PEM format for signature verification.
    const pem = jwkToPem(key);

    // Verify the JWT using the PEM key, audience, and issuer.
    const decodedToken = jwt.verify(token, pem, {
      audience: SSO_CLIENT_ID,
      issuer,
      maxAge: '8h', // Token is valid for 8 hours.
    });

    // Check if the identity provider is valid and that a user ID exists.
    const { identity_provider, idir_username, name, email, family_name, given_name } = decodedToken;
    if (!['idir', 'azureidir'].includes(identity_provider) || !idir_username) {
      throw new createHttpError.Unauthorized('Invalid identity provider or missing user ID');
    }

    // Log a success message with user information for monitoring or debugging.
    console.log(`Authorization successful for user: ${email} (IDIR: ${idir_username}, Name: ${name})`);

    // Return an object with user information extracted from the token.
    return { idir_username, email: email || null, family_name, given_name, bearerToken: token };
  } catch (err) {
    // Log any errors that occur during JWT validation for troubleshooting.
    console.error('JWT validation error:', err.message);
    return false; // Return false if validation fails.
  }
};

// Main function to authenticate a user based on the request headers.
export const authenticate = async (headers) => {
  try {
    // Extract the Authorization header from the incoming request headers.
    const { Authorization, authorization } = headers || {};
    const authHeader = Authorization || authorization; // Use either variant of the header.

    // Validate the Authorization header format.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or malformed Authorization header');
      return false;
    }

    // Extract the bearer token from the Authorization header.
    const bearerToken = authHeader.split('Bearer ')[1];

    // Validate the JWT signature and retrieve the current user information.
    const currentUser = await validateJWTSignature(bearerToken);

    // Return the validated user object or false if validation fails.
    return currentUser;
  } catch (err) {
    // Log any errors that occur during authentication for troubleshooting.
    console.error('Authentication error:', err.message);
    return false;
  }
};
// Middleware to enforce authentication
export const authenticateMiddleware = async (req, res, next) => {
  try {
    const user = await authenticate(req.headers);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user; // Attach the user object to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Authentication middleware error:', err.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
