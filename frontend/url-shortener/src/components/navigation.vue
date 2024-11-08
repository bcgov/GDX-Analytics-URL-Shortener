<template>
  <nav>
    <div class="nav-left">
      <!-- Navigation link to the Home (shorten) page -->
      <router-link to="/shorten">Home</router-link>
      <!-- Navigation link to the Existing URLs page -->
      <router-link to="/urls">Existing URLs</router-link>
    </div>
    <div class="nav-right">
      <!-- Navigation link to the Help page -->
      <router-link to="/">Help</router-link>
      <!-- Navigation link to the Admin page -->
      <router-link to="/">Admin</router-link>
      <!-- Button to trigger logout -->
      <button @click="handleLogout">Logout</button>
    </div>
  </nav>
</template>

<script>
// Import the logout function from the keycloak service
import { logout } from '@/services/keycloak';

export default {
  methods: {
    // Method to handle the logout action
    handleLogout() {
      logout(); // Call the logout function when the button is clicked
    },
  },
};
</script>
