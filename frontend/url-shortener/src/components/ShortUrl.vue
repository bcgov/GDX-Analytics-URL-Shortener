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
          <strong style="font-size: 1.5em;">Short URL: </strong>
          <a :href="shortenedUrl" class="short-url" style="font-size: 1.5em;">{{ shortenedUrl.replace('https://', '') }}</a>
          <a href="#" class="copy-btn" @click="copyToClipboard(shortenedUrl.replace('https://', ''))">
            <img src="../assets/copy.svg" alt="Copy icon">
          </a>
          <p style="color: green;">{{ copiedMessage }}</p>
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
        <div class="target-url-container">
          <p><strong>Target URL:</strong><a :href="targetUrl" class="target-url">{{ targetUrl }}</a></p>
        </div>
        <p><strong>Internal Link:</strong>
          <a :href="internalLink">{{ internalLink }}</a>
        </p>
        <p><strong>Expiry Date:</strong> {{ expiryDate }}</p>
        <p><strong>Created On:</strong> {{ formattedTime }}</p>
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
const createdTime = ref<string>('');
const formattedTime = ref('');
const isSubmitting = ref(false);
const formSubmitted = ref(false);
const copiedMessage = ref('');
const frontendURL = window.location.origin;

const front = import.meta.env.VITE_FRONT;
const back = import.meta.env.VITE_BACK;

console.log(front);
console.log(back);


let backendURL = 'http://localhost:3000';

if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-dev.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-dev.apps.silver.devops.gov.bc.ca';
} else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-test.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-test.apps.silver.devops.gov.bc.ca';
} else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-tools.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-tools.apps.silver.devops.gov.bc.ca';
}
console.log('frontendURL:', window.location.origin);
console.log('backendURL:', backendURL);
console.log('mode:', import.meta.env.MODE);

const internalLink = computed(() => `${frontendURL}/url-summary/${customId.value}`);
const router = useRouter();

const submitForm = async () => {
  isSubmitting.value = true;

  try {
    const currentTime = new Date();
    const localTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));

    // Determine backend URL based on environment mode
    let baseUrl = 'http://localhost:3000/';

    if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-dev.apps.silver.devops.gov.bc.ca') {
      baseUrl = 'https://gdx-analytics-url-shortener-backend-c6d33e-dev.apps.silver.devops.gov.bc.ca/';
    } else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-test.apps.silver.devops.gov.bc.ca') {
      baseUrl = 'https://gdx-analytics-url-shortener-backend-c6d33e-test.apps.silver.devops.gov.bc.ca/';
    } else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-tools.apps.silver.devops.gov.bc.ca') {
      baseUrl = 'https://gdx-analytics-url-shortener-backend-c6d33e-tools.apps.silver.devops.gov.bc.ca/';
    }

    const response = await axios.post(`${baseUrl}shorten`, {
      targetUrl: targetUrl.value,
      description: description.value,
      expiryDate: expiryDate.value,
      createdTime: localTime.toISOString(),
    });

    shortenedUrl.value = response.data.shortenedUrl;
    customId.value = response.data.customId;
    error.value = '';
    createdTime.value = localTime.toISOString();
    formattedTime.value = formatTime(localTime);
    formSubmitted.value = true;
  } catch (err: any) {
    if (err.response) {
      error.value = err.response.data.message || 'Error occurred';
    } else {
      error.value = 'Error occurred';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const formatTime = (time: Date) => {
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const hour = String(time.getHours()).padStart(2, '0');
  const minute = String(time.getMinutes()).padStart(2, '0');
  const second = String(time.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}, ${hour}:${minute}:${second}`;
};

const reloadPage = () => {
  location.reload();
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isPastDate = (date: string) => {
  const currentDate = new Date();
  const selectedDate = new Date(date);
  return selectedDate < currentDate;
};

const copyToClipboard = (text: string) => {
  const input = document.createElement('textarea');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  copiedMessage.value = 'URL copied!';
  setTimeout(() => {
    copiedMessage.value = '';
  }, 5000); // Hide the message after 5 seconds
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
  color: blue;
  font-weight: bold;
}

.copy-btn {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url('../assets/copy.svg');
  background-size: cover;
  background-repeat: no-repeat;
  cursor: pointer;
  margin-left: 10px;
}

.copy-btn:hover {
  background-color: #0056b3;
}

.target-url-container {
  max-width: 80%;
}

.target-url {
  display: inline-block;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

</style>
