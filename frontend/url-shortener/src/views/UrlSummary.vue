<template>
  <div>
    <h1>URL Summary</h1>
    <p>Link #: {{ customId }}</p>
    <p>Short URL: {{ shortenedUrlString }}</p>
    <p>Target URL: {{ targetUrl }}</p>
    <p>Notes: {{ description }}</p>
    <p>Expiry Date: {{ expiryDate }}</p>
    <!-- Add the following lines for tags, created by, and created time 
    <p>Tags: {{ tags }}</p>-->
    <p>Created By: {{ createdBy }}</p>
    <p>Created On: {{ createdTime }}</p>
    <!-- Add a router-link to navigate to the URL List page -->
    <router-link :to="{ name: 'url-table' }">Check all URLs</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute
import axios from 'axios';

const route = useRoute(); // Use useRoute to get access to $route
const customId = ref('');
const shortenedUrlString = ref('');
const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
// const tags = ref('');
const createdBy = ref('');
const createdTime = ref('');
const frontendURL = import.meta.env.VITE_FRONTEND_URL;
const backendURL = import.meta.env.VITE_BACKEND_URL;
/*
if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-dev.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-dev.apps.silver.devops.gov.bc.ca/';
} else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-test.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-test.apps.silver.devops.gov.bc.ca/';
} else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-tools.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-tools.apps.silver.devops.gov.bc.ca/';
}
*/

onMounted(async () => {
  // Assign the customId value from the route parameters using useRoute
  customId.value = route.params.customId;

  try {
    // Retrieve data from the backend using customId
    const response = await axios.get(`${backendURL}/url-summary/${customId.value}`);

    const data = response.data;

    // Update data properties based on the retrieved data
    shortenedUrlString.value = data.shortenedUrlString;
    targetUrl.value = data.targetUrl;
    description.value = data.description;
    expiryDate.value = data.expiryDate;

    // Check if these properties exist in the response before updating
    // if ('tags' in data) {
    //   tags.value = data.tags;
    // }

    if ('createdBy' in data) {
      createdBy.value = data.createdBy;
    }

    if ('createdTime' in data) {
      createdTime.value = data.createdTime;
    }
  } catch (error) {
    console.error('Error retrieving URL details:', error);
    // Handle the error gracefully, e.g., show a user-friendly message
  }
});
</script>
