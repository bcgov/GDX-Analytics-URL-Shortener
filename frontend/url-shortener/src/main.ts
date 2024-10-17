import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import the Keycloak initialization function
import { initializeKeycloak } from './services/keycloak';


const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize Keycloak before mounting the app
initializeKeycloak().then(() => {
    app.mount('#app');
  }).catch((error) => {
    console.error('Keycloak initialization failed:', error);
    // Optionally, handle errors here, e.g., redirecting to an error page.
  });
