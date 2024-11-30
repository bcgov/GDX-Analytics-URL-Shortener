<template>
  <div class="url-summary-container">
    <!-- Edit Button -->
    <button class="bcgov-edit-button" @click="toggleEditMode">
      {{ editButtonText }}
    </button>


    <div class="url-details">
      <h2>
        <strong>Short URL:</strong>
        <a :href="shortenedUrl || '#'" target="_blank" class="short-url">{{ shortenedUrl || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(shortenedUrl || '')">
          <img src="../assets/copy.svg" alt="Copy icon" />
        </button>
      </h2>
      <br />
      <h3 style="font-weight: bold;">Details</h3>
      <br />
      <p v-if="shortenedUrl">
        <strong>Full Short URL:</strong>
        <a :href="shortenedUrl || '#'" target="_blank" class="short-url">{{ shortenedUrl || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(shortenedUrl || '')">
          <img src="../assets/copy.svg" alt="Copy icon" />
        </button>
      </p>
      <p v-if="targetUrl">
        <strong>Target URL:</strong>
        <a :href="targetUrl || '#'" target="_blank" class="short-url">{{ targetUrl || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(targetUrl || '')">
          <img src="../assets/copy.svg" alt="Copy icon" />
        </button>
      </p>
      <p v-if="customId">
        <strong>Internal Link:</strong>
        <a :href="`${frontendURL}/url-summary/${customId}`" target="_blank">{{ `${frontendURL}/url-summary/${customId}` || 'N/A' }}</a>
        <button class="copy-btn" @click="copyToClipboard(`${frontendURL}/url-summary/${customId}`)">
          <img src="../assets/copy.svg" alt="Copy icon" />
        </button>
      </p>
      <br />
      <p><strong>Expiry Date:</strong> {{ formatExpiryDate(expiryDate) || 'No expiry date' }}</p>
      <br />
      <p><strong>Created By:</strong> {{ createdBy || 'Unknown' }}</p>
      <p><strong>Created Date/Time:</strong> {{ createdTime || 'N/A' }}</p>
      <p><strong>Edited Date/Time:</strong> {{ updatedAt || 'No edits' }}</p>
      <p><strong>Edited By:</strong> {{ editedBy || 'No edits' }}</p>
      <br />
      <p><strong>Notes:</strong></p>
      <p> &nbsp;{{ description || 'No description provided' }}</p>
        <!-- Feedback message -->
        <p v-if="copiedMessage" style="color: green;">{{ copiedMessage }}</p>
    </div>
    <!-- Edit Form -->
    <div v-if="isEditing" class="edit-form">
    
      <h3 style="font-weight: bold;">Edit</h3>
      <br />
      <div class="edit-form-container">
      <form @submit.prevent="submitEdit">
        <label for="targetUrl">Target URL:</label>
        <input
          id="targetUrl"
          type="text"
          v-model="editedTargetUrl"
          pattern="https?://.*(:[0-9]+)?(/.*)?"
          :disabled="fieldsDisabled"
          required
        />
        <label for="expiryDate">Expiry Date (Optional):</label>
        <input
          id="expiryDate"
          type="date"
          v-model="editedExpiryDate"
          :disabled="fieldsDisabled"
          :min="getTodayDate()"
        />
        <label for="description">Notes (Optional):</label>
        <textarea
          id="description"
          v-model="editedDescription"
          :disabled="fieldsDisabled"
          rows="3"
          placeholder="Enter description (optional)"
        ></textarea>
        <button
          type="submit"
          class="bcgov-submit-button"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Changes saved successfully!" : "Submit" }}
        </button>

      </form>
      </div>
    </div>
          <!-- History Table -->
  <div class="history-table">
  <h3>Edit History</h3>
  <table v-if="formattedHistory.length">
    <thead>
      <tr>
        <th>Field Edited</th>
        <th>Old Value</th>
        <th>New Value</th>
        <th>Edited By</th>
        <th>Edited At</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(history, index) in formattedHistory" :key="index">
        <td>{{ history.fieldEdited }}</td>
        <td>{{ history.oldValue || 'N/A' }}</td>
        <td>{{ history.newValue || 'N/A' }}</td>
        <td>{{ history.editedBy || 'Unknown' }}</td>
        <td>{{ convertToLocalTime(history.updatedAt) }}</td>
      </tr>
    </tbody>
  </table>
  <p v-else>No history available.</p>
</div>


    <div class="action-container">
      <router-link :to="{ name: 'create' }" class="create-url">Create new Short URL</router-link>
      <br />
      <router-link :to="{ name: 'url-table' }" class="url-list-link">View all Existing URLs</router-link>
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
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
dayjs.extend(utc);
dayjs.extend(timezone);

const route = useRoute();
const customId = ref(route.params.customId || '');
const shortenedUrl = ref('');
const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const createdTime = ref('');
const createdBy = ref('');
const updatedAt = ref('');
const editedBy = ref('');
const backendURL = import.meta.env.VITE_BACKEND_URL;
const frontendURL = import.meta.env.VITE_FRONTEND_URL;
const copiedMessage = ref('');

const isEditing = ref(false);
const isSubmitting = ref(false);
const fieldsDisabled = ref(false);

const editedTargetUrl = ref('');
const editedExpiryDate = ref('');
const editedDescription = ref('');
const editButtonText = ref('Edit'); // Tracks button text
const historyData = ref([]);

const toggleEditMode = () => {
  isEditing.value = !isEditing.value;

  if (isEditing.value) {
    // Entering edit mode
    isSubmitting.value = false; // Re-enable the submit button
    fieldsDisabled.value = false; // Re-enable fields
    editedTargetUrl.value = targetUrl.value || '';
    editedExpiryDate.value = expiryDate.value ? formatExpiryDate(expiryDate.value) : '';
    editedDescription.value = description.value || '';
    editButtonText.value = 'Cancel'; // Change button text to "Cancel"
  } else {
    // Exiting edit mode
    fieldsDisabled.value = true;
    editButtonText.value = 'Edit'; // Change button text to "Edit"
  }
};


const submitEdit = async () => {
  const userStore = useUserStore();
  isSubmitting.value = true;
  fieldsDisabled.value = true;

  try {
    const payload = {
      targetUrl: editedTargetUrl.value,
      expiryDate: editedExpiryDate.value
        ? dayjs(editedExpiryDate.value).endOf("day").utc().toISOString()
        : null,
      description: editedDescription.value,
    };

    await axios.put(`${backendURL}/update-url/${customId.value}`, payload, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    });

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait briefly for DB update
    await fetchUrlSummary(); // Refresh main document
    await fetchHistory(); // Refresh history

    isSubmitting.value = false;
    fieldsDisabled.value = false;
    editButtonText.value = "Edit";

    console.log("Edit submitted successfully and history reloaded.");
  } catch (error) {
    console.error("Error updating URL:", error);
    isSubmitting.value = false;
    fieldsDisabled.value = false;
  }
};

// Function: Fetch the main document (URL summary)
const fetchUrlSummary = async () => {
  const userStore = useUserStore();

  try {
    const response = await axios.get(`${backendURL}/url-summary/${customId.value}`, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    });

    const data = response.data;

    shortenedUrl.value = data.shortenedUrl || 'N/A';
    targetUrl.value = data.targetUrl || 'N/A';
    description.value = data.description || 'No description provided';
    expiryDate.value = data.expiryDate ? formatExpiryDate(data.expiryDate) : 'No expiry date';
    createdTime.value = convertToLocalTime(data.createdTime);
    updatedAt.value = data.updatedAt ? convertToLocalTime(data.updatedAt) : 'No edits';
    createdBy.value = data.createdBy || 'Unknown';
    editedBy.value = data.editedBy || 'No edits';

    console.log("Fetched updated URL summary:", data);
  } catch (error) {
    console.error("Error fetching URL summary:", error);
  }
};

const fetchHistory = async () => {
  const userStore = useUserStore();

  try {
    const response = await axios.get(`${backendURL}/url-history/${customId.value}`, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    });

    historyData.value = response.data.versions || [];
    console.log("Fetched history data:", historyData.value); // Debug log
  } catch (error) {
    console.error("Error fetching history:", error);
  }
};


const formattedHistory = computed(() => {
  const result = [];

  // Start with the main document (latest values)
  const mainEntry = {
    targetUrl: targetUrl.value,
    expiryDate: expiryDate.value,
    description: description.value,
    updatedAt: updatedAt.value,
    editedBy: editedBy.value,
  };

  // Combine versions array (oldest to newest) followed by the main document
  const combinedHistory = [...historyData.value.map(entry => entry._doc || entry), mainEntry];

  // Traverse history from newest to oldest to ensure correct chronology
  for (let i = combinedHistory.length - 1; i > 0; i--) {
    const currentEntry = combinedHistory[i];
    const prevEntry = combinedHistory[i - 1];

    // Process field changes and track specific `updatedAt` and `editedBy`
    const changes = [
      {
        fieldEdited: 'Target URL',
        oldValue: prevEntry.targetUrl || 'N/A',
        newValue: currentEntry.targetUrl || 'N/A',
        changed: currentEntry.targetUrl !== prevEntry.targetUrl,
        updatedAt: prevEntry.updatedAt || currentEntry.updatedAt, // Use the entry where the change occurred
        editedBy: prevEntry.editedBy || currentEntry.editedBy, // Use the editor responsible for the change
      },
      {
        fieldEdited: 'Expiry Date',
        oldValue: prevEntry.expiryDate
          ? dayjs(prevEntry.expiryDate).tz(dayjs.tz.guess()).format('YYYY-MM-DD')
          : 'N/A',
        newValue: currentEntry.expiryDate
          ? dayjs(currentEntry.expiryDate).tz(dayjs.tz.guess()).format('YYYY-MM-DD')
          : 'N/A',
        changed: String(currentEntry.expiryDate) !== String(prevEntry.expiryDate),
        updatedAt: prevEntry.updatedAt || currentEntry.updatedAt,
        editedBy: prevEntry.editedBy || currentEntry.editedBy,
      },
      {
        fieldEdited: 'Description',
        oldValue: prevEntry.description || 'N/A',
        newValue: currentEntry.description || 'N/A',
        changed: currentEntry.description !== prevEntry.description,
        updatedAt: prevEntry.updatedAt || currentEntry.updatedAt,
        editedBy: prevEntry.editedBy || currentEntry.editedBy,
      },
    ];

    // Add only changed fields to the result
    changes.forEach(change => {
      if (change.changed) {
        result.push({
          fieldEdited: change.fieldEdited,
          oldValue: change.oldValue,
          newValue: change.newValue,
          editedBy: change.editedBy || 'Unknown',
          updatedAt: convertToLocalTime(change.updatedAt || 'N/A'),
        });
      }
    });
  }

  return result;
});



onMounted(async () => {
  const userStore = useUserStore();

  try {
    const response = await axios.get(`${backendURL}/url-summary/${customId.value}`, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    });

    const data = response.data;

    shortenedUrl.value = data.shortenedUrl || 'N/A';
    targetUrl.value = data.targetUrl || 'N/A';
    description.value = data.description || 'No description provided';
    expiryDate.value = data.expiryDate ? formatExpiryDate(data.expiryDate) : 'No expiry date';
    createdTime.value = convertToLocalTime(data.createdTime);
    updatedAt.value = data.updatedAt ? convertToLocalTime(data.updatedAt) : 'No edits';
    createdBy.value = data.createdBy || 'Unknown'; // Fix for `createdBy`
    editedBy.value = data.editedBy || 'No edits';

    // Fetch the main document (URL summary)
    await fetchUrlSummary();
    // Fetch history data
    await fetchHistory();
  } catch (error) {
    console.error('Error retrieving URL details:', error);
  }
});


const convertToLocalTime = (utcDate) => {
  if (!utcDate) return 'N/A';
  return dayjs(utcDate).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss');
};



const formatExpiryDate = (utcDate) => {
  if (!utcDate) return 'No expiry date';
  return dayjs(utcDate).tz(dayjs.tz.guess()).format('YYYY-MM-DD');
};

const getTodayDate = () => {
  return dayjs().tz(dayjs.tz.guess()).format('YYYY-MM-DD');
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
  position: relative;
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

/* Style for the "Create a new Short URL" link */
.create-url {
  display: inline-block; /* Makes it a block for better padding */
  margin-top: 20px; /* Adds spacing from surrounding elements */
  margin-bottom: 20px; /* Adds spacing from surrounding elements */
  font-weight: bold; /* Makes the text bold */
}


/* Active state for when the link is clicked */
.create-url:active {
  transform: translateY(0); /* Returns to normal position */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2); /* Slightly reduced shadow */
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


.bcgov-edit-button {
  position: absolute; /* Position relative to container */
  top: 15px; /* Adjust top margin */
  right: 20px; /* Adjust right margin */
  padding: 7px 10px; /* Smaller padding for compact size */
  font-size: 18px; /* Smaller font size */
  background-color: var(--surface-color-primary-button-default); /* Primary button color */
  color: var(--typography-color-primary-invert); /* Inverted text color */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: auto; /* Ensure the button only takes as much space as its content */
  display: inline-block; /* Prevent it from expanding */
  text-align: center; /* Center text alignment */
}

.bcgov-edit-button:hover {
  background-color: var(--surface-color-primary-button-hover);
}

.bcgov-edit-button:focus {
  outline: 2px solid #2684FF;
  outline-offset: 2px;
}

.bcgov-submit-button {
  background-color: var(--surface-color-primary-button-default);
  color: var(--typography-color-primary-invert);
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.bcgov-submit-button:disabled {
  background-color: #d3d3d3; /* Grey out the button */
  color: #9c9c9c; /* Change text color */
  cursor: not-allowed; /* Show not-allowed cursor */
  opacity: 0.7; /* Slightly transparent */
  border: 1px solid #bfbfbf; /* Optional: Add a border to show it's disabled */
}
.edit-form-container {
  width: 50%;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional styling */
  border: 1px solid #ccc; /* Optional styling */
  border-radius: 8px; /* Optional styling */
}


input:disabled,
textarea:disabled {
  background-color: var(--surface-color-disabled);
  color: var(--typography-color-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}


</style>