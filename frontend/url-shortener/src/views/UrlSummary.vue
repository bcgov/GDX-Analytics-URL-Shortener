<template>
  <div>
    <h1>URL Summary</h1>
    <p>Custom ID: {{ customId }}</p>
    <p>Shortened URL: {{ shortenedUrl }}</p>
    <p>Target URL: {{ targetUrl }}</p>
    <p>Notes: {{ description }}</p>
    <p>Expiry Date: {{ expiryDate }}</p>        
    <p>Tags: {{ tags }}</p>
    <p>Created By: {{ createdBy }}</p>
    <p>Created Time: {{ createdTime }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const customId = ref('');
const shortenedUrl = ref('');
const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const tags = ref('');
const createdBy = ref('');
const createdTime = ref('');

onMounted(async () => {
  // Assign the customId value from the route parameters
  customId.value = $route.params.customId;

  // Retrieve data from the backend using customId
  const response = await axios.get(`http://localhost:3000/url-summary/${customId.value}`);
  const data = response.data;

  // Update other data properties based on the retrieved data
  shortenedUrl.value = data.shortenedUrl;
  targetUrl.value = data.targetUrl;
  description.value = data.description;
  expiryDate.value = data.expiryDate;
  tags.value = data.tags;
  createdBy.value = data.createdBy;
  createdTime.value = data.createdTime;
});
</script>
