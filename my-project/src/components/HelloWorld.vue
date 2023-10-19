<template>
  <div class="url-shortener">
    <h1>Create a short URL</h1>
    <div class="input-group">
      <div class="input-container">
        <label for="targetURL">Target URL: </label>
        <input v-model="targetURL" id="targetURL" placeholder="Enter your target URL" />
      </div>
      <div class="input-container">
        <label for="notes">Notes: </label>
        <input v-model="notes" id="notes" placeholder="Enter notes (optional)" />
      </div>
      <div class="input-container">
        <label for="tags">Tags: </label>
        <input v-model="tags" id="tags" placeholder="Enter tags, separated by commas (optional)" />
      </div>
      <button @click="shortenURL">Shorten</button>
    </div>
    <p v-if="shortenedURL">Shortened URL: <a :href="shortenedURL">{{ shortenedURL }}</a></p>
  </div>
</template>


<script>
export default {
  name: 'URLShortener',
  data() {
    return {
      targetURL: '',
      notes: '',
      tags: '',
      shortenedURL: null,
    };
  },
  methods: {
    shortenURL() {
      // URL shortening logic here.
      

      // For demonstration, let's pretend we shortened the URL and got a result.
      this.shortenedURL = 'https://short.url/abcd';
    },
  },
};
</script>
<style scoped>
.url-shortener {
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-container {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.input-container label {
  font-weight: bold;
  color: #000; /* Black text color */
  display: inline-block;
  width: 30%;
  margin-right: 10px;
}

h1 {
  margin-bottom: 10px; /* Add some space between the heading and the form */
}

input, textarea {
  border: 1px solid #000; /* Black border */
  padding: 5px;
  color: #000; /* Black text color */
  width: 100%;
}

button {
  background-color: #003366; /* Black button background */
  color: #fff; /* White button text */
  border: none;
  padding: 10px;
  cursor: pointer;
  width: 100%;
}



</style>




