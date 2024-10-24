<template>
  <div class="url-summary-container">
    <div class="url-details">
      <p>
        <strong>Short URL:</strong>
        <a :href="shortenedUrl" target="_blank" class="short-url">{{ shortenedUrl }}</a>
        <a href="#" class="copy-btn" @click="copyToClipboard(shortenedUrl)">
            <img src="../assets/copy.svg" alt="Copy icon">
          </a>
          
      </p>
      <h3>Details</h3>
      <p>
        <strong>Full Short URL:</strong>
        <a :href="shortenedUrl" target="_blank" class="short-url">{{ shortenedUrl }}</a>
        <a href="#" class="copy-btn" @click="copyToClipboard(shortenedUrl)">
            <img src="../assets/copy.svg" alt="Copy icon">
          </a>
          
      </p>
      <p>
        <strong>Target URL:</strong>
        <a :href="targetUrl" target="_blank" class="short-url">{{ targetUrl }}</a>
        <a href="#" class="copy-btn" @click="copyToClipboard(targetUrl)">
            <img src="../assets/copy.svg" alt="Copy icon">
          </a>
          
      </p>
      <p>
        <strong>Internal Link:</strong> 
        <a :href="`${frontendURL}/url-summary/${customId}`" target="_blank">{{ `${frontendURL}/url-summary/${customId}` }}</a>
        <a href="#" class="copy-btn" @click="copyToClipboard(`${frontendURL}/url-summary/${customId}`)">
            <img src="../assets/copy.svg" alt="Copy icon">
          </a>
          
      </p>
      <p><strong>Expiry Date:</strong> {{ expiryDate }}</p>
      <p><strong>Created By:</strong> {{ createdBy }}</p>
      <p><strong>Created Date/Time:</strong> {{ createdTime }}</p>
      <p><strong>Edited Date/Time:</strong> </p>
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

.url-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  font-size: 1.1em;
  color: #333;
}

.url-details p {
  margin: 5px 0;
}

.short-url {
  color: #0056b3;
  font-weight: bold;
  word-break: break-word;
  text-decoration: underline;
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
  word-break: break-word;
  overflow-wrap: break-word;
}

.action-container {
  margin-top: 20px;
  text-align: center;
}

.url-list-link {
  color: #0056b3;
  text-decoration: underline;
}

.url-list-link:hover {
  color: #003f88;
}
</style>
