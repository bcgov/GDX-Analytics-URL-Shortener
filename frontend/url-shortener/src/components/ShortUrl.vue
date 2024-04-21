<template>
  <div>
    <div class="url-shortener">
      <h1 class="form-heading">Short URL Form</h1>
      <form @submit.prevent="shortenURL">
        <div class="input-group">
          <div class="input-container">
            <label for="targetURL">Target URL:</label>
            <input v-model="targetUrl" placeholder="Enter URL to shorten"/>
            <span class="error" v-if="!isValidUrl(targetUrl) && targetUrl">Please enter a valid URL (e.g., http://example.com)</span>
          </div>
          <div class="input-container">
            <label for="expiryDate">Expiry Date (Optional):</label>
            <input type="date" v-model="expiryDate" placeholder="Choose Expiry Date" />
            <span class="error" v-if="isPastDate(expiryDate) && expiryDate">Please select a future expiry date</span>
          </div>
          <div class="input-container">
            <label for="description">Notes (Optional):</label>
            <textarea v-model="description" placeholder="Enter Notes"></textarea>
          </div>
          <button type="submit">Shorten URL</button>
        </div>
      </form>
      <br />
      <br />
      <div v-if="shortenedUrl" class="url-details">
        <p><strong>Short URL:</strong> <a :href="shortenedUrl">{{ shortenedUrl }}</a></p>
        <p><strong>Target URL:</strong> <a :href="targetUrl">{{ targetUrl }}</a></p>
        <p><strong>Internal Link: </strong> 
          <a :href="internalLink">{{ internalLink }}</a>
        </p>
        <p><strong>Expiry Date:</strong> {{ expiryDate }}</p>
        <p><strong>Created Time:</strong> {{ formattedTime }}</p>
        <p><strong>Notes:</strong> {{ description }}</p>
      </div>
      <div v-if="error" class="error-message">
        <p><strong>Error:</strong> {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';

const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const customId = ref('');
const shortenedUrl = ref('');
const error = ref('');
const createdTime = ref('');
const formattedTime = ref('');
const internalLink = computed(() => `http://localhost:5173/url-summary/${customId.value}`);

const shortenURL = async () => {
  try {
    const currentTime = new Date();
    const localTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
    const response = await axios.post('http://localhost:3000/shorten', {
      targetUrl: targetUrl.value,
      description: description.value,
      expiryDate: expiryDate.value,
      createdTime: localTime, // Send localTime instead of currentTime
    });
    shortenedUrl.value = response.data.shortenedUrl;
    customId.value = response.data.customId;
    error.value = '';
    createdTime.value = localTime; // Store localTime in createdTime
    formattedTime.value = formatTime(localTime); // Format localTime when submit button is pressed
  } catch (err: any) {
    if (err.response) {
      error.value = err.response.data.message || 'Error occurred';
    } else {
      error.value = 'Error occurred';
    }
  }
};


const formatTime = (time) => {
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const hour = String(time.getHours()).padStart(2, '0');
  const minute = String(time.getMinutes()).padStart(2, '0');
  const second = String(time.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}, ${hour}:${minute}:${second}`;
};

// Function to check if the URL is in a valid format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
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
