<template>
  <div>
    <div class="url-shortener">
      <h1 class="form-heading">Short URL Form</h1>
      <form @submit.prevent="shortenURL">
        <div class="input-group">
          <div class="input-container">
            <label for="targetURL">Target URL: </label>
            <input v-model="targetUrl" placeholder="Enter URL to shorten" />
          </div>
          <div class="input-container">
            <label for="expiryDate">Expiry Date: </label>
            <input type="date" v-model="expiryDate" placeholder="Choose Expiry Date" />
          </div>
          <div class="input-container">
            <label for="description">Notes: </label>
            <textarea v-model="description" placeholder="Enter Notes"></textarea>
          </div>
<!-- 
          <div class="input-container">
            <label for="tags">Tags: </label>
            <input v-model="tags" placeholder="Enter Tags" />
          </div>
--> 
          <button type="submit">Shorten URL</button>
        </div>
      </form>
      <div v-if="shortenedUrl">
  <p>
    Custom ID: 
    <router-link 
      :to="{ name: 'url-summary', params: { customId: customId } }"
    >
      {{ customId }}
    </router-link>
  </p>
        <p>Shortened URL: {{ shortenedUrl }}</p>
        <p>Target URL: {{ targetUrl }}</p>
        <p>Notes: {{ description }}</p>
        <p>Expiry Date: {{ expiryDate }}</p>        
        <!--<p>Tags: {{ tags }}</p>-->
        <p>Created By: Veenu Veenu</p>
        <p>Created Time: {{ createdTime }}</p>
      </div>
      <div v-if="error">
        <p>Error: {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const targetUrl = ref('');
const description = ref('');
const expiryDate = ref('');
const customId = ref('');
//const tags = ref('');
const shortenedUrl = ref('');
const error = ref('');

const shortenURL = async () => {
  console.log('Values before sending:', targetUrl.value, description.value, expiryDate.value, customId.value);

  try {
    console.log('Attempting URL Shortening...');
    const response = await axios.post('http://localhost:3000/shorten', {
      targetUrl: targetUrl.value,
      description: description.value,
      expiryDate: expiryDate.value,

      createdTime: new Date().toLocaleString(), // Returns local time
    });
    console.log('Response:', response.data); // Log the response data
    shortenedUrl.value = response.data.shortenedUrl;
    customId.value = response.data.customId;
    error.value = ''; // Reset error on successful response
  } catch (err: any) {
    console.error('Error:', error.message);
    console.error('Response Data:', error.response.data);
    if (err.response) {
      error.value = err.response.data.message || 'Error occurred';
    } else {
      error.value = 'Error occurred';
    }

    if (!(err instanceof Error)) {
      console.error('Unexpected Error:', err);
      error.value = 'Unexpected Error occurred';
    }
  }
};

const createdTime = new Date().toLocaleString(); // Initialize createdTime when component is created

</script>

