<template>
    <nav>
      <div class="nav-left">
        <router-link to="/shorten">Home</router-link>
        <router-link to="/urls">Existing URLs</router-link>
      </div>
      <div class="nav-right">
        <router-link to="/">Help</router-link>
        <router-link to="/">Admin</router-link>
        <button @click="handleLogout">Logout</button>
      </div>
      
    </nav>
    
  </template>
  <script>
  import { logout } from '@/services/keycloak'; // Import the logout function
  
  export default {
    methods: {
      handleLogout() {
        logout(); // Call the logout function when the button is clicked
      },
    },
  };
  </script>
  