<template>
  <div>
    <div class="url-shortener">
      <h1 class="form-heading">Short URL Form</h1>
      <form @submit.prevent="submitForm">
  <div class="input-group">
    <div class="input-container">
      <label for="targetURL">Target URL:</label>
      <input v-model="targetUrl" placeholder="Enter URL to shorten" :disabled="formSubmitted"/>
      <span class="error" v-if="!isValidUrl(targetUrl) && targetUrl">Please enter a valid URL (e.g., http://example.com)</span>
    </div>
    <div class="input-container">
      <label for="expiryDate">Expiry Date (Optional):</label>
      <input type="date" v-model="expiryDate" placeholder="Choose Expiry Date" :disabled="formSubmitted"/>
      <span class="error" v-if="isPastDate(expiryDate) && expiryDate">Please select a future expiry date</span>
    </div>
    <div class="input-container">
      <label for="description">Notes (Optional):</label>
      <textarea v-model="description" placeholder="Enter Notes" :disabled="formSubmitted"></textarea>
    </div>
    <button type="submit" :disabled="isSubmitting || formSubmitted">
      {{ isSubmitting || formSubmitted ? 'Form submitted successfully' : 'Shorten URL' }}
    </button>
    <div v-if="formSubmitted">
    <p style="text-align: right"><router-link to="/shorten" @click="reloadPage">Click to create a new Short URL</router-link></p>
    </div>
  </div>
</form>
<br />
<br />
<div v-if="formSubmitted">
    <div style="text-align:center;">
        <strong style="font-size: 1.5em;">Short URL: </strong> <!-- Doubling the font size -->
        <a :href="shortenedUrl" class="short-url" style="font-size: 1.5em;">{{ shortenedUrl.replace('https://', '') }}</a> <!-- Doubling the font size -->
        <a href="#" class="copy-btn" @click="copyToClipboard(shortenedUrl.replace('https://', ''))">
            <img src="../assets/copy.svg" alt="Copy icon">
        </a>
    </div>
</div>

      <br />
      <br />
      <div v-if="shortenedUrl" class="url-details">
        <p><strong style="color: black;">Additional details:</strong></p>
        <p><strong>Full Short URL:</strong> 
        <a :href="shortenedUrl" class="full-short-url">{{ shortenedUrl }}</a> 
        <a href="#" class="copy-btn" @click="copyToClipboard(shortenedUrl)">
            <img src="../assets/copy.svg" alt="Copy icon">
        </a>
    </p>
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
import { useRouter } from 'vue-router';
const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const customId = ref('');
const shortenedUrl = ref('');
const error = ref('');
const createdTime = ref('');
const formattedTime = ref('');
const isSubmitting = ref(false);
const formSubmitted = ref(false);
const internalLink = computed(() => `http://localhost:5173/url-summary/${customId.value}`);

const submitForm = async () => {
  isSubmitting.value = true;
  //console.log('isSubmitting:', isSubmitting.value);
  //console.log('formSubmitted:', formSubmitted.value);

  try {
    const currentTime = new Date();
    const localTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
    const response = await axios.post('http://localhost:3000/shorten', {
      targetUrl: targetUrl.value,
      description: description.value,
      expiryDate: expiryDate.value,
      createdTime: localTime,
    });
    shortenedUrl.value = response.data.shortenedUrl;
    customId.value = response.data.customId;
    error.value = '';
    createdTime.value = localTime;
    formattedTime.value = formatTime(localTime);
    formSubmitted.value = true; // Set formSubmitted to true after successful submission
  } catch (err: any) {
    if (err.response) {
      error.value = err.response.data.message || 'Error occurred';
    } else {
      error.value = 'Error occurred';
    }
  } finally {
    isSubmitting.value = false;
    //console.log('isSubmitting:', isSubmitting.value);
    //console.log('formSubmitted:', formSubmitted.value);
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
const router = useRouter();

const reloadPage = () => {
  location.reload();
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

const copyToClipboard = (text) => {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
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
button:disabled {
  background-color: lightgray;
  color: gray; 
  cursor: not-allowed;
}


.short-url {
  color: blue; /* You can adjust the color as needed */
  font-weight: bold;
}

.copy-btn {
  display: inline-block;
  width: 18px; /* Adjust as needed */
  height: 18px; /* Adjust as needed */
  background-image: url('../assets/copy.svg'); /* Path to your copy icon */
  background-size: cover;
  background-repeat: no-repeat;
  cursor: pointer;
  margin-left: 10px; /* Adjust as needed for spacing */
}


.copy-btn:hover {
  background-color: #0056b3; /* Darker blue color on hover */
}
</style>
