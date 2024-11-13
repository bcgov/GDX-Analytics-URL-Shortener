// Import the main CSS file for styling
import './assets/main.css';

// Import necessary functions from Vue and libraries
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';// Main application component
import router from './router';// Router for navigation

// Import the Keycloak initialization function for authentication
import { initializeKeycloak } from './services/keycloak';
// Import the user store to manage user state
import { useUserStore } from '@/stores/userStore';

const app = createApp(App); // Create the Vue application instance

// Initialize Pinia for state management
const pinia = createPinia();
app.use(pinia); // Register Pinia with the app
app.use(router); // Register the router with the app
// Get the instance of the user store to manage user authentication and data
const userStore = useUserStore(); // User store instance

// Initialize Keycloak for authentication before mounting the application

initializeKeycloak(userStore)
  .then((keycloak) => {
    if (keycloak && keycloak.authenticated) { // Ensure keycloak is defined
      app.mount('#app'); // Mount the app if the user is authenticated
    } else if (keycloak) {
      keycloak.login(); // Trigger Keycloak login if not authenticated
    } else {
      console.error('Keycloak is undefined; cannot proceed with login or mounting');
    }
  })
  .catch((error) => {
    console.error('Keycloak initialization failed:', error);
  });

