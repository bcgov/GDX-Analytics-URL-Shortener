// Import the Keycloak library for authentication management
import Keycloak from 'keycloak-js';

// Flag to check if Keycloak has been initialized to prevent multiple initializations
let isKeycloakInitialized = false; 

// Function to initialize Keycloak and handle user authentication
export const initializeKeycloak = async (userStore) => {
  // Check if Keycloak has already been initialized
  if (isKeycloakInitialized) {
    return; // Prevent re-initialization
  }

  // Options for login, including the redirect URI after successful authentication
  const loginOptions = {
    redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI,
    idpHint: '', // Optional: can be used to specify the identity provider hint
  };

  // Create a new Keycloak instance with the specified configuration
  const _kc = new Keycloak({
    url: `${import.meta.env.VITE_SSO_AUTH_SERVER_URL}`, // Keycloak server URL
    realm: `${import.meta.env.VITE_SSO_REALM}`, // Keycloak realm
    clientId: `${import.meta.env.VITE_SSO_CLIENT_ID}`, // Client ID for the application
  });

  try {
    // Initialize the user store with values from localStorage, if any
    userStore.initStore(); 
    isKeycloakInitialized = true; // Set the flag to true after initialization

    // Event handler for token expiration
    _kc.onTokenExpired = async () => {
      try {
        // Update the token with a minimum validity of 30 seconds
        await _kc.updateToken(30);
        userStore.setToken(_kc.token); // Store the new token in userStore
        console.log('Token updated:', userStore.token); // Log the updated token
      } catch (error) {
        // Log an error if token refresh fails
        console.error('Failed to refresh token', error);
      }
    };

    // Initialize Keycloak and check for existing session
    const auth = await _kc.init({
      pkceMethod: 'S256', // Use Proof Key for Code Exchange for security
      checkLoginIframe: false, // Disable login iframe check
      onLoad: 'check-sso', // Check if the user is logged in
    });

    if (auth) {
      // If authentication is successful, store the initial token
      userStore.setToken(_kc.token); 
      userStore.setUser(_kc.tokenParsed); // Store user information from the token
      console.log('Keycloak initialized, token:', userStore.token);

      // Clean up the URL by removing query parameters after successful login
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to the original URL if available
      const originalUrl = localStorage.getItem('originalUrl'); // Retrieve stored original URL
      if (originalUrl && originalUrl !== window.location.href) {
        localStorage.removeItem('originalUrl'); // Clear the stored URL to prevent repeated redirects
        window.location.href = originalUrl; // Redirect to the original URL
      }

      return _kc; // Return the Keycloak instance for further use
    } else {
      // If not authenticated, store the current URL before login
      localStorage.setItem('originalUrl', window.location.href);
      _kc.login(loginOptions); // Attempt login if user is not authenticated
    }
  } catch (err) {
    // Log any error that occurs during Keycloak initialization
    console.error('Error during Keycloak initialization:', err);
  }
};

// Logout function to handle user logout
export const logout = () => {
  // Redirect the user to the Keycloak logout endpoint with proper return URL
  window.location.href = `https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(
    `${import.meta.env.VITE_SSO_AUTH_SERVER_URL}/realms/${
      import.meta.env.VITE_SSO_REALM
    }/protocol/openid-connect/logout?post_logout_redirect_uri=` +
      import.meta.env.VITE_SSO_REDIRECT_URI + // Specify the redirect URI after logout
      '&client_id=' +
      import.meta.env.VITE_SSO_CLIENT_ID // Client ID for logout request
  )}`;
};
