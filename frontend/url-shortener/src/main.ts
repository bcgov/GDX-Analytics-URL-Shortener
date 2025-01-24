// Import global CSS file for app-wide styling
import './assets/main.css';

// Import necessary libraries and modules from Vue
import { createApp, nextTick } from 'vue'; // Vue core functions
import { createPinia } from 'pinia'; // State management library
import App from './App.vue'; // Root component of the application
import router from './router'; // Router instance for navigation
import { initializeKeycloak } from './services/keycloak'; // Function to initialize Keycloak authentication
import { useUserStore } from '@/stores/userStore'; // Store for managing user-related data

// Extend the global Window interface to include Snowplow's method
declare global {
  interface Window {
    snowplow?: (...args: any[]) => void; // Optional Snowplow analytics function
  }
}

// Create the Vue application instance
const app = createApp(App);

// Initialize Pinia for state management and register it with the app
const pinia = createPinia();
app.use(pinia).use(router); // Register both Pinia and Router instances

// Access the user store to manage authentication and user-related state
const userStore = useUserStore();

// Initialize Keycloak for authentication
initializeKeycloak(userStore)
  .then((keycloak) => {
    if (keycloak && keycloak.authenticated) {
      // If Keycloak is initialized and the user is authenticated

      // Attach Snowplow analytics to Vue's global properties for app-wide access
      app.config.globalProperties.$snowplow = window.snowplow;

      // Track page views and refresh link clicks on route changes
      router.afterEach((to, from) => {
        nextTick(() => {
          if (window.snowplow) {
            window.snowplow('trackPageView', to.fullPath); // Track page views
            window.snowplow('refreshLinkClickTracking'); // Refresh link tracking
          }
        });
      });
      

      // Mount the Vue app to the DOM only if authentication is successful
      app.mount('#app');
    } else if (keycloak) {
      // If the user is not authenticated, trigger the Keycloak login process
      keycloak.login();
    } else {
      // Handle the case where Keycloak is undefined
      console.error('Keycloak is undefined; cannot proceed with login or mounting');
    }
  })
  .catch((error) => {
    // Log any errors that occur during Keycloak initialization
    console.error('Keycloak initialization failed:', error);
  });
