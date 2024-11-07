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

// Retrieve the Single Sign-On (SSO) configuration endpoint and audience 
// (client ID) from the environment variables.
const ssoConfigurationEndpoint = process.env.SSO_CONFIGURATION_ENDPOINT;
const audience = process.env.SSO_CLIENT_ID;

let _ssoConfig = null; // Cache for the SSO configuration to avoid redundant network calls.

// Function to retrieve SSO configuration from the configured endpoint.
const getConfiguration = async () => {
  // Return the cached configuration if already fetched.
  if (_ssoConfig) return _ssoConfig;

  // Fetch the issuer and JWKS URI from the SSO configuration endpoint.
  const { issuer, jwks_uri } = await axios.get(ssoConfigurationEndpoint).then(res => res.data);

  // Fetch the JWKS from the JWKS URI obtained above.
  const jwks = await axios.get(jwks_uri).then(res => res.data);
  
  // Cache the configuration for future use.
  _ssoConfig = { jwks, issuer };
  return _ssoConfig; // Return the SSO configuration.
};

// Function to validate the JWT signature.
const validateJWTSignature = async (token) => {
  try {
    // Decode the JWT to get its header, which contains metadata including the key ID (kid).
    const { header } = jws.decode(token);
    
    // Retrieve the SSO configuration (JWKS and issuer).
    const { jwks, issuer } = await getConfiguration();
    
    // Find the appropriate key in the JWKS using the key ID from the JWT header.
    const key = jwks.keys.find((jwkKey) => jwkKey.kid === header.kid);
    if (!key) return null; // Return null if no matching key is found.

    // Convert the JWK to PEM format for signature verification.
    const pem = jwkToPem(key);

    // Verify the JWT using the PEM key, audience, and issuer.
    const { identity_provider, idir_user_guid: idir_userid, email, client_roles, family_name, given_name } = jwt.verify(token, pem, {
      audience,
      issuer,
      maxAge: '8h', // Token is valid for 8 hours.
      ignoreExpiration: true, // Ignore expiration checks for this verification.
    });

    // Check if the identity provider is valid and that a user ID exists.
    if (!['idir', 'azureidir'].includes(identity_provider) || !idir_userid) {
      throw new createHttpError.Unauthorized('IDP is not IDIR'); // Throw an error if validation fails.
    }

    // Log a success message with user information for monitoring or debugging.
    console.log(`Authorization successful for user: ${email} (ID: ${idir_userid})`);

    // Return an object with user information extracted from the token.
    return { idir_userid, email, client_roles: client_roles || [], family_name, given_name, bearerToken: token };
  } catch (err) {
    // Log any errors that occur during JWT validation for troubleshooting.
    console.log('JWT validation error:', err);
    return false; // Return false if validation fails.
  }
};

// Main function to authenticate a user based on the request headers.
export const authenticate = async (headers) => {
  // Extract the Authorization header from the incoming request headers.
  const { Authorization, authorization } = headers || {};
  const authHeader = Authorization || authorization; // Use either variant of the header.
  
  // Return false if no Authorization header is present.
  if (!authHeader) return false;

  // Extract the bearer token from the Authorization header.
  const bearerToken = authHeader.split('Bearer ')[1];
  
  // Validate the JWT signature and retrieve the current user information.
  const currentUser = await validateJWTSignature(bearerToken);
  
  // If validation fails, return the result.
  if (!currentUser) return currentUser;

  // Attach the bearer token to the current user object for further use.
  currentUser.bearerToken = bearerToken;
  
  return currentUser; // Return the current user object with all relevant info.
};
