<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const originalUrl = ref('');
const shortenedUrl = ref('');
const error = ref('');

const shortenURL = async () => {
  try {
    const response = await axios.post('http://localhost:3000/shorten', { originalUrl: originalUrl.value });

    shortenedUrl.value = response.data.shortenedUrl;
    error.value = ''; // Reset error on successful response
  } catch (err: any) {
    if (err.response) {
      error.value = err.response.data.message || 'Error occurred';
    } else {
      error.value = 'Error occurred';
    }
  }
};
</script>