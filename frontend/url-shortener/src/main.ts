import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import the Keycloak initialization function
import { initializeKeycloak } from './services/keycloak';
import { useUserStore } from '@/stores/userStore'; // Import userStore here

const app = createApp(App);

// Initialize Pinia
const pinia = createPinia();
app.use(pinia); // Make sure to use Pinia before mounting the app
app.use(router);

// Get the user store instance
const userStore = useUserStore(); 

// Initialize Keycloak before mounting the app
initializeKeycloak(userStore).then(() => {
    app.mount('#app'); // Only mount after Keycloak is initialized
}).catch((error) => {
    console.error('Keycloak initialization failed:', error);
    // Optionally, handle errors here, e.g., redirecting to an error page.
});
