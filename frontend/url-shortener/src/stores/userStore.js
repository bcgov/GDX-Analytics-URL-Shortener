import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    initStore() {
      this.user = JSON.parse(localStorage.getItem('user')) || null;
      this.token = localStorage.getItem('token') || null;
    },
    setUser(user) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user)); // Save to local storage
    },
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token); // Save to local storage
    },
    clearUser() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user'); // Clear from local storage
      localStorage.removeItem('token'); // Clear from local storage
    },
  },
});
