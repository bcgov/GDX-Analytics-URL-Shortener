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
// Import the dayjs library for date manipulation.
// Day.js is a minimalist JavaScript library that parses, validates, manipulates, and displays dates and times for modern browsers. Source - https://day.js.org/
import dayjs from 'dayjs';

// Import the UTC plugin to handle UTC times
import utc from 'dayjs/plugin/utc';

// Import the timezone plugin to handle timezone conversions
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with the UTC plugin for working with UTC dates
dayjs.extend(utc);

// Extend dayjs with the timezone plugin to allow timezone conversions
dayjs.extend(timezone);


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

    // Check if 'createdTime' property exists in the 'data' object
    if ('createdTime' in data) {
    
    // Convert 'createdTime' from UTC to local time using the convertToLocalTime function
    // This function adjusts for the user's timezone and handles Daylight Savings Time (DST)
      data.createdTime = convertToLocalTime(data.createdTime);
    // Update the 'createdTime' reactive value to reflect the converted local time
      createdTime.value = data.createdTime;
    }

  } catch (error) {
    console.error('Error retrieving URL details:', error);
    // Handle the error gracefully, e.g., show a user-friendly message
  }
});

// Define a function that converts a given UTC date/time to local time
// This conversion is aware of the user's local timezone and considers Daylight Savings Time (DST)
// The function uses the 'dayjs' library along with the 'timezone' plugin

const convertToLocalTime = (utcDate) => {
  
  // The 'tz.guess()' function automatically detects the user's current timezone
  // The 'tz()' method then converts the given UTC date/time to the detected timezone
  // The 'format()' method ensures the date is returned in a readable format: 'YYYY-MM-DD HH:mm:ss'
  
  return dayjs(utcDate)  // Takes the UTC date/time passed to the function
    .tz(dayjs.tz.guess())  // Converts it to the user's local timezone (with DST adjustments)
    .format('YYYY-MM-DD HH:mm:ss');  // Formats the result in 'YYYY-MM-DD HH:mm:ss' format
};

</script>
