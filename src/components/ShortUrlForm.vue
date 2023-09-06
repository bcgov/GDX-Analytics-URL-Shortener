<script setup>
  import { ref } from 'vue';

  const formData = ref({
    fullUrl: '',
    description: '',
    notes: '', 
    tags: '', 
  });

  const formSubmitted = ref(false);

  const submitForm = () => {
    
    
    // Log the form data to the console
    console.log('Form Data:', formData.value);

    // Set formSubmitted to true to display the "Thanks" message
    formSubmitted.value = true;
  };
</script>


<template>
    <form @submit.prevent="submitForm">
    <label for="full-url">Full URL:</label>
    <input type="text" id="full-url" v-model="formData.fullUrl" required>

    <label for="description">Description:</label>
    <input type="text" id="description" v-model="formData.description">

    <!-- New fields -->
    <label for="notes">Notes:</label>
    <textarea id="notes" v-model="formData.notes"></textarea>

    <label for="tags">Tags:</label>
    <input type="text" id="tags" v-model="formData.tags">
  
      <button type="submit">Shorten me</button>
    </form>
    <p v-if="formSubmitted">Thanks for using the URL Shortener</p>
  </template>