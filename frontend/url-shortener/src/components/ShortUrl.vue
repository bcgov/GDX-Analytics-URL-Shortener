<template>
  <div>
    <div class="url-shortener">
      <h1 class="form-heading">Short URL Form</h1>
      <form @submit.prevent="shortenURL">
        <div class="input-group">
          <div class="input-container">
            <label for="targetURL">Target URL:</label>
            <input v-model="targetUrl" placeholder="Enter URL to shorten" required />
            <span class="error" v-if="!isValidUrl(targetUrl) && targetUrl">Please enter a valid URL (e.g., http://example.com)</span>
          </div>
          <div class="input-container">
            <label for="expiryDate">Expiry Date:</label>
            <input type="date" v-model="expiryDate" placeholder="Choose Expiry Date" required />
            <span class="error" v-if="isPastDate(expiryDate) && expiryDate">Please select a future expiry date</span>
          </div>
          <div class="input-container">
            <label for="description">Notes:</label>
            <textarea v-model="description" placeholder="Enter Notes"></textarea>
          </div>
          <button type="submit">Shorten URL</button>
        </div>
      </form>
      <br />
      <div v-if="shortenedUrl" class="url-details">
        <p><strong>Short URL:</strong> <a :href="shortenedUrl">{{ shortenedUrl }}</a></p>
        <p><strong>Target URL:</strong> <a :href="targetUrl">{{ targetUrl }}</a></p>
        <p><strong>Internal Link: </strong> 
          <router-link :to="{ name: 'url-summary', params: { customId: customId } }">
            {{ customId }}
          </router-link>
        </p>
        <p><strong>Expiry Date:</strong> {{ expiryDate }}</p>
        <p><strong>Created Time:</strong> {{ createdTime }}</p>
        <p><strong>Notes:</strong> {{ description }}</p>
      </div>
      <div v-if="error" class="error-message">
        <p><strong>Error:</strong> {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const customId = ref('');
const shortenedUrl = ref('');
const error = ref('');
let createdTime = ref('');

const shortenURL = async () => {
  try {
    const currentTime = new Date().toLocaleString();
    const response = await axios.post('http://localhost:3000/shorten', {
      targetUrl: targetUrl.value,
      description: description.value,
      expiryDate: expiryDate.value,
      createdTime: currentTime,
    });
    shortenedUrl.value = response.data.shortenedUrl;
    customId.value = response.data.customId;
    error.value = '';
    createdTime.value = currentTime; // Update createdTime when submit button is pressed
  } catch (err: any) {
    if (err.response) {
      error.value = err.response.data.message || 'Error occurred';
    } else {
      error.value = 'Error occurred';
    }
  }
};

// Function to check if the URL is in a valid format
const isValidUrl = (url) => {
  const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
  return pattern.test(url);
};

// Function to check if the expiry date is in the past
const isPastDate = (date) => {
  const currentDate = new Date();
  const selectedDate = new Date(date);
  return selectedDate < currentDate;
};

</script>

<style scoped>
.url-shortener {
  margin-top: 20px;
}

.form-heading {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-container {
  margin-bottom: 10px;
}

.error-message {
  margin-top: 20px;
  color: red;
}

.error {
  color: red;
}
</style>
