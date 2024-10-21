import Keycloak from 'keycloak-js';

let isKeycloakInitialized = false; // Flag to check if Keycloak has been initialized

export const initializeKeycloak = async (userStore) => {
  if (isKeycloakInitialized) {
    return; // Prevent re-initialization
  }

  const loginOptions = {
    redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI,
    idpHint: '',
  };

  const _kc = new Keycloak({
    url: `${import.meta.env.VITE_SSO_AUTH_SERVER_URL}`,
    realm: `${import.meta.env.VITE_SSO_REALM}`,
    clientId: `${import.meta.env.VITE_SSO_CLIENT_ID}`,
  });

  try {
    userStore.initStore(); // Initialize store with values from localStorage
    isKeycloakInitialized = true; // Set the flag to true

    _kc.onTokenExpired = async () => {
      try {
        await _kc.updateToken(30);
        userStore.setToken(_kc.token); // Store the new token
        console.log('Token updated:', userStore.token);
      } catch (error) {
        console.error('Failed to refresh token', error);
      }
    };

    const auth = await _kc.init({
      pkceMethod: 'S256',
      checkLoginIframe: false,
      onLoad: 'check-sso',
    });

    if (auth) {
      userStore.setToken(_kc.token); // Store the initial token
      userStore.setUser(_kc.tokenParsed); // Assuming tokenParsed contains user info
      console.log('Keycloak initialized, token:', userStore.token);

      // Clean up the URL after successful login
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to the original URL if available
      const originalUrl = localStorage.getItem('originalUrl');
      if (originalUrl && originalUrl !== window.location.href) {
        localStorage.removeItem('originalUrl'); // Clear stored URL to prevent repeated redirects
        window.location.href = originalUrl; // Redirect to the stored URL
      }

      return _kc;
    } else {
      // Store the current URL before login
      localStorage.setItem('originalUrl', window.location.href);
      _kc.login(loginOptions); // Attempt login if not authenticated
    }
  } catch (err) {
    console.error('Error during Keycloak initialization:', err);
  }
};

// Logout function remains unchanged
export const logout = () => {
  window.location.href = `https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(
    `${import.meta.env.VITE_SSO_AUTH_SERVER_URL}/realms/${
      import.meta.env.VITE_SSO_REALM
    }/protocol/openid-connect/logout?post_logout_redirect_uri=` +
      import.meta.env.VITE_SSO_REDIRECT_URI +
      '&client_id=' +
      import.meta.env.VITE_SSO_CLIENT_ID
  )}`;
};
