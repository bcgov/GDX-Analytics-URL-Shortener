<template>
  <div class="url-summary-container">
    <div class="url-details">
      <h2>
        <strong>Short URL:</strong>
        <a :href="shortenedUrl || '#'" target="_blank" class="short-url">{{ shortenedUrl || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(shortenedUrl || '')">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </h2>
      <br>
      <h3 style="font-weight: bold;">Details</h3>
      <br>
      <p v-if="shortenedUrl">
        <strong>Full Short URL:</strong>
        <a :href="shortenedUrl || '#'" target="_blank" class="short-url">{{ shortenedUrl || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(shortenedUrl || '')">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </p>
      <p v-if="targetUrl">
        <strong>Target URL:</strong>
        <a :href="targetUrl || '#'" target="_blank" class="short-url">{{ targetUrl || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(targetUrl || '')">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </p>
      <p v-if="customId">
        <strong>Internal Link:</strong>
        <a :href="`${frontendURL}/url-summary/${customId}`" target="_blank">{{ `${frontendURL}/url-summary/${customId}` || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(`${frontendURL}/url-summary/${customId}`)">
          <img src="../assets/copy.svg" alt="Copy icon">
        </button>
      </p>
      <br>
      <p><strong>Expiry Date:</strong> {{ formatExpiryDate(expiryDate) || 'No expiry date' }}</p>
      <br>
      <p><strong>Created By:</strong> {{ createdBy || 'Unknown' }}</p>
      <p><strong>Created Date/Time:</strong> {{ createdTime || 'N/A' }}</p>
      <p><strong>Edited Date/Time:</strong></p>
      <br>
      <p><strong>Notes:</strong> {{ description || 'No description provided' }}</p>
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
const customId = ref(route.params.customId || '');  // Use fallback
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
  try {
    const response = await axios.get(`${backendURL}/url-summary/${customId.value}`);
    const data = response.data;

    shortenedUrl.value = data.shortenedUrl || 'N/A';
    targetUrl.value = data.targetUrl || 'N/A';
    description.value = data.description || 'No description provided';
    expiryDate.value = data.expiryDate || '';
    
    // Only reassign customId if it exists in the response
    if (data.customId) {
      customId.value = data.customId;
    }

    if ('createdTime' in data) {
      createdTime.value = convertToLocalTime(data.createdTime);
    }

  } catch (error) {
    console.error('Error retrieving URL details:', error);
  }
});

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
  }, 5000);
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
  color: rgb(0, 0, 0);
  text-decoration: underline;
}
</style>
