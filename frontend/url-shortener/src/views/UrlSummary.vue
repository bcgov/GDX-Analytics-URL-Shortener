<template>
  <div class="url-summary-container">
    <div class="url-details">
      <h2>
        <strong>Short URL:</strong>
        <a :href="shortenedUrl" target="_blank" class="short-url">{{ shortenedUrl.replace('https://', '') }}</a>
        <button class="copy-btn" @click="copyToClipboard(shortenedUrl)">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </h2>
      <br>
      <h3 style="font-weight: bold;">Details</h3>
      <br>
      <p>
        <!-- This is full short url which means it will contails https:// in it -->
        <strong>Full Short URL:</strong>
        <a :href="shortenedUrl" target="_blank" class="short-url">{{ shortenedUrl }}</a>
        <button class="copy-btn" @click="copyToClipboard(shortenedUrl)">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </p>
      <p>
        <!-- This is target url which means when public click on the short url, they will go to this url -->
        <strong>Target URL:</strong>
        <a :href="targetUrl" target="_blank" class="short-url">{{ targetUrl }}</a>
        <button class="copy-btn" @click="copyToClipboard(targetUrl)">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </p>
      <p>
        <!-- This is internal url which means when app users click on the url, they will go to summary page which list all details about this url -->
        <strong>Internal Link:</strong>
        <a :href="`${frontendURL}/url-summary/${customId}`" target="_blank">{{ `${frontendURL}/url-summary/${customId}` }}</a>
        <button class="copy-btn" @click="copyToClipboard(`${frontendURL}/url-summary/${customId}`)">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </p>
      <br>
            <!-- Expiry date is in UTC for now -->
      <p><strong>Expiry Date:</strong> {{ formatExpiryDate(expiryDate) }}</p>
      <br>
      <!-- created by does not have a value for now-->
      <p><strong>Created By:</strong> {{ createdBy }}</p>
      <!-- created date/time is in users timezone-->
      <p><strong>Created Date/Time:</strong> {{ createdTime }}</p>
      <p><strong>Edited Date/Time:</strong></p>
      <br>
      <p><strong>Notes:</strong> {{ description }}</p>
      <p style="color: green;">{{ copiedMessage }}</p>
    </div>

    <div class="action-container">
      <router-link :to="{ name: 'url-table' }" class="url-list-link">Check all URLs</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const route = useRoute();
const customId = ref('');
const shortenedUrl = ref('');
const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const createdTime = ref('');
const createdBy = ref('');
const backendURL = import.meta.env.VITE_BACKEND_URL;
const frontendURL = import.meta.env.VITE_FRONTEND_URL;
const copiedMessage = ref('');

onMounted(async () => {
  customId.value = route.params.customId;

  try {
    const response = await axios.get(`${backendURL}/url-summary/${customId.value}`);
    const data = response.data;

    shortenedUrl.value = data.shortenedUrl;
    targetUrl.value = data.targetUrl;
    description.value = data.description;
    expiryDate.value = data.expiryDate;
    customId.value = data.customId;

    if ('createdTime' in data) {
      createdTime.value = convertToLocalTime(data.createdTime);
    }

  } catch (error) {
    console.error('Error retrieving URL details:', error);
  }
});
/**
 * Formats the given date string to display only the date in 'YYYY-MM-DD' format.
 * If no date is provided, it returns a default message.
 * 
 * @param dateString - The date string to format (should be in ISO format)
 * @returns A formatted date string in 'YYYY-MM-DD' format or a default message if no date is provided
 */
 const formatExpiryDate = (dateString) => {
  if (!dateString) return 'No expiry date';

  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const convertToLocalTime = (utcDate) => {
  return dayjs(utcDate)
    .tz(dayjs.tz.guess())
    .format('YYYY-MM-DD HH:mm:ss');
};

const copyToClipboard = (text) => {
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
.url-summary-container {
  margin: 0 auto;
  padding: 20px;
}

.url-details p {
  margin: 5px 0;
}

/* Ensure copy button stays next to the text without overlap */
.copy-btn {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url('../assets/copy.svg');
  background-size: cover;
  background-repeat: no-repeat;
  cursor: pointer;
  margin-left: 10px;
  border: none;
  background-color: transparent;
  padding: 0;
  vertical-align: middle;
}

.copy-btn img {
  display: block;
}

.copy-btn:hover {
  background-color: transparent;
}

.target-url-container {
  word-break: break-word;
  overflow-wrap: break-word;
}

.action-container {
  margin-top: 20px;
  
}

a:hover {
  color: #003f88;
}

a {
  color: rgb(0, 0, 0); /* Set all links to black */
  text-decoration: underline;
}
</style>
