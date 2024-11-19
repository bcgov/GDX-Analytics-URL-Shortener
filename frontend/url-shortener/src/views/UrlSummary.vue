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
      <br>
      <p style="color: green;">{{ copiedMessage }}</p>
      <button @click="toggleEditMode">{{ isEditing ? 'Cancel' : 'Edit' }}</button>
    </div>

    <div class="action-container">
      <router-link :to="{ name: 'url-table' }" class="url-list-link">Check all URLs</router-link>
    </div>
    <!-- Edit Form -->
    <div v-if="isEditing" class="edit-form">
      <h3>Edit URL Details</h3>
      <form @submit.prevent="submitEdit">
        <label for="targetUrl">Target URL:</label>
        <input
          id="targetUrl"
          type="text"
          v-model="editedTargetUrl"
          required
        />
        <label for="expiryDate">Expiry Date:</label>
        <input
          id="expiryDate"
          type="date"
          v-model="editedExpiryDate"
        />
        <button type="submit">Submit</button>
      </form>
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
import { useUserStore } from '@/stores/userStore'; // Import the user store

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

// Edit Mode State
const isEditing = ref(false);
const editedTargetUrl = ref('');
const editedExpiryDate = ref('');

const toggleEditMode = () => {
  isEditing.value = !isEditing.value;

  // Populate the editable fields with current values when entering edit mode
  if (isEditing.value) {
    editedTargetUrl.value = targetUrl.value || '';
    editedExpiryDate.value = expiryDate.value
      ? formatExpiryDate(expiryDate.value)
      : '';
  }
};


const submitEdit = async () => {
  const userStore = useUserStore();
  try {
    const payload = {
      targetUrl: editedTargetUrl.value,
      expiryDate: editedExpiryDate.value,
    };

    await axios.put(`${backendURL}/update-url/${customId.value}`, payload, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    // Update displayed values with the edited values
    targetUrl.value = editedTargetUrl.value;
    expiryDate.value = editedExpiryDate.value;

    // Exit edit mode
    isEditing.value = false;
  } catch (error) {
    console.error('Error updating URL:', error);
  }
};

onMounted(async () => {
  // Assign the customId value from the route parameters using useRoute
  customId.value = route.params.customId;
  const userStore = useUserStore(); // Use the userStore to get the token

  try {
    // Retrieve data from the backend using customId
    const response = await axios.get(`${backendURL}/url-summary/${customId.value}`, {
      headers: {
        Authorization: `Bearer ${userStore.token}` // Add the authorization header here
      }
    });
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


.edit-form {
  margin-top: 20px;
}

.edit-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.edit-form input {
  margin-bottom: 15px;
  padding: 5px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-form button {
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-form button:hover {
  background-color: #0056b3;
}

</style>
