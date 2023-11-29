import { passport, keycloakClient, tokenset } from './server.js';

// Middleware to check if the user is authenticated
export const checkAuthenticated = (req, res, next) => {
  if (req?.session?.passport?.user) {
    return next();
  }
  res.redirect('/');
};

// Route to handle authentication callback
export const handleAuthCallback = (req, res, next) => {
  passport.authenticate('oidc', {
    successRedirect: '/home',
    failureRedirect: '/',
  })(req, res, next);
};

// Route to render the home page
export const renderHomePage = (req, res, next) => {
  res.render('index', {});
};

// Route to initiate authentication
export const initiateAuth = (req, res, next) => {
  passport.authenticate('oidc')(req, res, next);
};

// Route to render the home page after authentication
export const renderHomePageAfterAuth = (req, res, next) => {
  res.render('home', {
    username: `${req.session.passport.user.given_name} ${req.session.passport.user.family_name}`,
  });
};

// Route to handle user logout
export const handleUserLogout = (req, res, next) => {
  req.session.destroy();
  const retUrl = `${process.env.SSO_AUTH_SERVER_URL}/realms/${
    process.env.SSO_REALM
  }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
    process.env.SSO_LOGOUT_REDIRECT_URI,
  )}&id_token_hint=${tokenset.id_token}`;
  res.redirect(`https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(retUrl)}`);
};
