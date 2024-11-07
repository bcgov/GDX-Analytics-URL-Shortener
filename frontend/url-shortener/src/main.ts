// Import the main CSS file for styling
import './assets/main.css'

// Import necessary functions from Vue and libraries
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue'; // Main application component
import router from './router'; // Router for navigation

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
const userStore = useUserStore(); 

// Initialize Keycloak for authentication before mounting the application
initializeKeycloak(userStore).then(() => {
    // Only mount the app after Keycloak has been successfully initialized
    app.mount('#app'); 
}).catch((error) => {
    // Handle any errors that occur during Keycloak initialization
    console.error('Keycloak initialization failed:', error);
    // Optionally, you can redirect to an error page or show a user-friendly message.
});
