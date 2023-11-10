<template>
  <div>
    <h1>URL Shortener</h1>
    <form @submit.prevent="shortenURL">
      <input v-model="originalUrl" placeholder="Enter URL to shorten" />
      <button type="submit">Shorten URL</button>
    </form>
    <div v-if="shortenedUrl">
      <p>Shortened URL: {{ shortenedUrl }}</p>
    </div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const originalUrl = ref('');
const shortenedUrl = ref('');
const error = ref('');

const shortenURL = async () => {
  try {
    console.log('Attempting URL Shortening...');
    const response = await axios.post('http://localhost:3000/shorten', { originalUrl: originalUrl.value });
    console.log('Response:', response.data); // Log the response data
    shortenedUrl.value = response.data.shortenedUrl;
    error.value = ''; // Reset error on successful response
  } catch (err: any) {
    console.error('Error:', err);
    if (err.response) {
      error.value = err.response.data.message || 'Error occurred';
    } else {
      error.value = 'Error occurred';
    }

    if (!(err instanceof Error)) {
      console.error('Unexpected Error:', err);
      error.value = 'Unexpected Error occurred';
    }
  }
};


</script>
