// Import the defineStore function from Pinia to create a new store
import { defineStore } from 'pinia';

// Define a new store called 'user'
export const useUserStore = defineStore('user', {
  // State function to hold user information and token
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null, // Retrieve user from local storage or initialize to null
    token: localStorage.getItem('token') || null, // Retrieve token from local storage or initialize to null
  }),
  actions: {
    // Initialize store state by retrieving user and token from local storage
    initStore() {
      this.user = JSON.parse(localStorage.getItem('user')) || null; // Fetch and set user
      this.token = localStorage.getItem('token') || null; // Fetch and set token
    },
    // Set user data and save it to local storage
    setUser(user) {
      this.user = user; // Update user in the store
      localStorage.setItem('user', JSON.stringify(user)); // Save user to local storage
    },
    // Set the authentication token and save it to local storage
    setToken(token) {
      this.token = token; // Update token in the store
      localStorage.setItem('token', token); // Save token to local storage
    },
    // Clear user data and token from both the store and local storage
    clearUser() {
      this.user = null; // Reset user to null
      this.token = null; // Reset token to null
      localStorage.removeItem('user'); // Remove user from local storage
      localStorage.removeItem('token'); // Remove token from local storage
    },
  },
});
