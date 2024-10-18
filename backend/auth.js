import * as fs from 'fs';
import createHttpError from 'http-errors';
import * as path from 'path';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jws from 'jws';
import jwkToPem from 'jwk-to-pem';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ssoConfigurationEndpoint = process.env.SSO_CONFIGURATION_ENDPOINT;
const audience = process.env.SSO_CLIENT_ID;

let _ssoConfig = null;

// Get SSO configuration
const getConfiguration = async () => {
  if (_ssoConfig) return _ssoConfig;

  const { issuer, jwks_uri } = await axios.get(ssoConfigurationEndpoint).then(res => res.data);
  const jwks = await axios.get(jwks_uri).then(res => res.data);
  
  _ssoConfig = { jwks, issuer };
  return _ssoConfig;
};

// Validate JWT signature
const validateJWTSignature = async (token) => {
  try {
    const { header } = jws.decode(token);
    const { jwks, issuer } = await getConfiguration();
    
    const key = jwks.keys.find((jwkKey) => jwkKey.kid === header.kid);
    if (!key) return null;

    const pem = jwkToPem(key);

    const { identity_provider, idir_user_guid: idir_userid, email, client_roles, family_name, given_name } = jwt.verify(token, pem, {
      audience,
      issuer,
      maxAge: '8h',
      ignoreExpiration: true,
    });

    if (!['idir', 'azureidir'].includes(identity_provider) || !idir_userid) {
      throw new createHttpError.Unauthorized('IDP is not IDIR');
    }

    // Log success message with user info
    console.log(`Authorization successful for user: ${email} (ID: ${idir_userid})`);

    return { idir_userid, email, client_roles: client_roles || [], family_name, given_name, bearerToken: token };
  } catch (err) {
    console.log('JWT validation error:', err);
    return false;
  }
};

// Main authenticate function
export const authenticate = async (headers) => {
  const { Authorization, authorization } = headers || {};
  const authHeader = Authorization || authorization;
  if (!authHeader) return false;

  const bearerToken = authHeader.split('Bearer ')[1];
  const currentUser = await validateJWTSignature(bearerToken);
  if (!currentUser) return currentUser;

  currentUser.bearerToken = bearerToken;
  return currentUser;
};
