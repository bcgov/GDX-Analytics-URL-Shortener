<template>
  <div>
    <div class="url-shortener">
      <h1 class="form-heading">Short URL Form</h1>
      <form @submit.prevent="submitForm">
        <div class="input-group">
          <!-- Target URL Input -->
          <div class="input-container">
            <label for="targetURL">Target URL:</label>
            <input v-model="targetUrl" placeholder="Enter URL to shorten" :disabled="formSubmitted"/>
            <span class="error" v-if="!isValidUrl(targetUrl) && targetUrl">
              Please enter a valid URL (e.g., http://example.com)
            </span>
          </div>
          <!-- Expiry Date Input -->
          <div class="input-container">
            <label for="expiryDate">Expiry Date (Optional):</label>
            <input type="date" v-model="expiryDate" placeholder="Choose Expiry Date" :disabled="formSubmitted"/>
            <span class="error" v-if="isPastDate(expiryDate) && expiryDate">
              Please select a future expiry date
            </span>
          </div>
          <!-- Notes Input -->
          <div class="input-container">
            <label for="description">Notes (Optional):</label>
            <textarea v-model="description" placeholder="Enter Notes" :disabled="formSubmitted"></textarea>
          </div>
          <!-- Submit Button -->
          <button type="submit" :disabled="isSubmitting || formSubmitted">
            {{ isSubmitting || formSubmitted ? 'Form submitted successfully' : 'Shorten URL' }}
          </button>
          <!-- Reload Form -->
          <div v-if="formSubmitted">
            <p style="text-align: right">
              <router-link to="/shorten" @click="reloadPage">Click to create a new Short URL</router-link>
            </p>
          </div>
        </div>
      </form>

      <!-- Error Message -->
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
import { useUserStore } from '@/stores/userStore';

const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const customId = ref('');
const shortenedUrl = ref('');
const error = ref('');
const isSubmitting = ref(false);
const formSubmitted = ref(false);

const frontendURL = import.meta.env.VITE_FRONTEND_URL;
const backendURL = import.meta.env.VITE_BACKEND_URL;

const userStore = useUserStore();
const router = useRouter();

// Form submission logic
const submitForm = async () => {
  isSubmitting.value = true;

  try {
    const currentTime = new Date();
    const localTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));

    const response = await axios.post(
      `${backendURL}/shorten`,
      {
        targetUrl: targetUrl.value,
        description: description.value,
        expiryDate: expiryDate.value,
        createdTime: localTime.toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`, // Pass the token here
        },
      }
    );

    shortenedUrl.value = response.data.shortenedUrl;
    customId.value = response.data.customId;
    error.value = '';
    formSubmitted.value = true;
  } catch (err: any) {
    error.value = err.response?.data.message || 'Error occurred';
  } finally {
    isSubmitting.value = false;
  }
};

// Reload page logic
const reloadPage = () => {
  location.reload();
};

// URL validation
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation
const isPastDate = (date: string) => {
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

button:disabled {
  background-color: lightgray;
  color: gray;
  cursor: not-allowed;
}
</style>
