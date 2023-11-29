<template>
    <div>
      <h1>URL Table</h1>
      <table>
        <thead>
          <tr>
            <th>Custom ID</th>
            <th>Shortened URL</th>
            <th>Target URL</th>
            <th>Notes</th>
            <th>Expiry Date</th>
            <th>Tags</th>
            <th>Created By</th>
            <th>Created Time</th>
          </tr>
        </thead>
        <tbody>
          <!-- Use v-for to iterate over the list of URLs -->
          <tr v-for="url in urlTable" :key="url.customId">
            <td>
              <router-link
                :to="{ name: 'url-summary', params: { customId: url.customId } }"
              >
                {{ url.customId }}
              </router-link>
            </td>
            <td>{{ url.shortenedUrlString }}</td>
            <td>{{ url.targetUrl }}</td>
            <td>{{ url.description }}</td>
            <td>{{ formatExpiryDate(url.expiryDate) }}</td>
            <td>{{ url.tags }}</td>
            <td>{{ url.createdBy }}</td>
            <td>{{ url.createdTime }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  const urlTable = ref([]);
  
  onMounted(async () => {
    try {
      // Retrieve the list of URLs from the backend using the new endpoint name
      const response = await axios.get('http://localhost:3000/url-table');
      urlTable.value = response.data;
    } catch (error) {
      console.error('Error retrieving URL table:', error);
      // Handle the error gracefully, e.g., show a user-friendly message
    }
  });
  
  // Helper function to format the expiry date
  const formatExpiryDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  </script>
  