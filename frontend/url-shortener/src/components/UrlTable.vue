<template>
  <div>
    <h1>URL Table</h1>
    <div class="filter-section">
      <label for="searchField">Search Field:</label>
      <select id="searchField" v-model="selectedSearchField">
        <option value="customId">Link #</option>
        <option value="shortenedUrlString">Short URL</option>
        <option value="targetUrl">Target URL</option>
        <!-- Add other fields as needed -->
      </select>

      <label for="filterText">Search:</label>
      <input type="text" id="filterText" v-model="filterText" placeholder="Enter search term">

      <button @click="applyFilter">Apply Filter</button>
    </div>

    <table>
      <thead>
        <tr>
          <th @click="sort('customId')" :class="{ 'sortable': true, 'asc': sortField === 'customId' }">
            Link # {{ getSortIcon('customId') }}
          </th>
          <th @click="sort('shortenedUrlString')" :class="{ 'sortable': true, 'asc': sortField === 'shortenedUrlString' }">
            Short URL {{ getSortIcon('shortenedUrlString') }}
          </th>
          <th @click="sort('targetUrl')" :class="{ 'sortable': true, 'asc': sortField === 'targetUrl' }">
            Target URL {{ getSortIcon('targetUrl') }}
          </th>
          
          <th @click="sort('expiryDate')" :class="{ 'sortable': true, 'asc': sortField === 'expiryDate' }">
            Expiry Date {{ getSortIcon('expiryDate') }}
          </th>
          
          <th @click="sort('createdBy')" :class="{ 'sortable': true, 'asc': sortField === 'createdBy' }">
            Created By {{ getSortIcon('createdBy') }}
          </th>
          <th @click="sort('createdTime')" :class="{ 'sortable': true, 'asc': sortField === 'createdTime' }">
            Created On {{ getSortIcon('createdTime') }}
          </th>
          <!--<th>Tags</th>-->
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <!-- Use v-for to iterate over the URLs on the current page -->
        <tr v-for="url in currentPageUrls" :key="url.customId">
          <td>
            <router-link :to="{ name: 'url-summary', params: { customId: url.customId } }">
              {{ url.customId }}
            </router-link>
          </td>
          <td class="shorturl-cell">
              <a :href="url.shortenedUrlString" target="_blank">
                {{ url.shortenedUrlString.replace(/^https?:\/\//, '') }}
              </a>
              <button class="copy-btn" @click="copyToClipboard(url.shortenedUrlString)">
                <img src="../assets/copy.svg" alt="Copy icon">
              </button>
          </td>
          <td class="targeturl-cell" :class="{ expanded: url.expanded }" @click="toggleExpand(url)">{{ url.targetUrl }}
          </td>
          
          <td>{{ formatExpiryDate(url.expiryDate) }}</td>
          
          <td>{{ url.createdBy }}</td>
          <td>{{ url.createdTime }}</td>
          <!--<td>{{ url.tags }}</td>-->
          <td class="description-cell" :class="{ expanded: url.expanded }" @click="toggleExpand(url)">{{ url.description }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Information about total items and range -->
    <div class="pagination-info">
      <p v-if="currentPageUrls.length === 0">
        No items found based on the current search.
      </p>
      <p v-else>
        Showing {{ currentPageUrls.length }} items
        ({{ (currentPage - 1) * itemsPerPage + 1 }} - {{ currentPage * itemsPerPage }}
        of {{ urlTable.length }})
      </p>
    </div>

    <!-- Add pagination controls -->
    <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const filterText = ref('');
const urlTable = ref([]);
const itemsPerPage = 10;
const currentPage = ref(1);
const totalPages = ref(1);
const sortField = ref('createdTime');
const sortOrder = ref('desc');
const selectedSearchField = ref('customId');
const copiedMessage = ref('');
const frontend = window.location.origin;
let backendURL = 'http://localhost:3000';

if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-dev.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-dev.apps.silver.devops.gov.bc.ca';
} else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-test.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-test.apps.silver.devops.gov.bc.ca';
} else if (frontendURL === 'https://gdx-analytics-url-shortener-frontend-c6d33e-tools.apps.silver.devops.gov.bc.ca') {
  backendURL = 'https://gdx-analytics-url-shortener-backend-c6d33e-tools.apps.silver.devops.gov.bc.ca';
}

console.log(backendURL); // Check the backendURL value




console.log('frontend:', window.location.origin);

onMounted(async () => {
  try {
    // Retrieve the list of URLs from the backend using the new endpoint name
    const response = await axios.get(`${backendURL}/urls`);
    urlTable.value = response.data || [];

    // Recalculate totalPages after fetching data
    totalPages.value = Math.ceil(urlTable.value.length / itemsPerPage);

    // Compute the URLs to display on the current page after fetching data
    const startIndex = (currentPage.value - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    currentPageUrls.value = urlTable.value.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error retrieving URL table:', error);
    // Handle the error gracefully, e.g., show a user-friendly message
  }
});

// Helper function to format the expiry date as "yyyy-mm-dd"
const formatExpiryDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Compute the URLs to display on the current page
const currentPageUrls = ref([]);
watch(currentPage, () => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  currentPageUrls.value = urlTable.value.slice(startIndex, endIndex);
});

// Function to navigate to the previous page
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Function to navigate to the next page
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Function to sort the table based on a given field
const sort = (field) => {
  // Toggle the sort order if the same field is clicked again
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }

  // Use a dynamic comparator function based on the sort order
  const comparator = (a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    // Check if the values are of type string before using localeCompare
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      // If not a string, use simple comparison
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
    }
  };

  // Update the URL table with the sorted data
  urlTable.value = [...urlTable.value].sort(comparator);

  // Compute the URLs to display on the current page after sorting data
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  currentPageUrls.value = urlTable.value.slice(startIndex, endIndex);
};

// Function to get the sort icon based on the current sort order and field
const getSortIcon = (field) => {
  if (sortField.value === field) {
    return sortOrder.value === 'asc' ? ' ▲' : ' ▼';
  } else {
    return ' ↕';
  }
};

// Function to apply the filter based on the selected search field
const applyFilter = () => {
  const searchTerm = filterText.value.toLowerCase();
  currentPageUrls.value = urlTable.value.filter((url) => {
    // Use String() to convert the property to a string
    return String(url[selectedSearchField.value]).toLowerCase().includes(searchTerm);
  });
};

// Function to copy URL to clipboard
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

// Expand the target URL
function toggleExpand(url) {
  url.expanded = !url.expanded;
}

</script>

<style scoped>

.copy-btn {
  display: inline-block;
  width: 14px;
  height: 14px;
  padding: 0;
  background-image: url('../assets/copy.svg');
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
  cursor: pointer;
  margin-left: 10px;
  border: none;
  outline: none;
}

.copy-btn:focus {
  outline: none;
}

.copy-btn:hover {
  background-color: #0056b3;
}

.shorturl-cell {
  white-space: nowrap;
  overflow: hidden;
  min-width: 100px;
}

.targeturl-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  cursor: pointer;
}

.targeturl-cell.expanded {
  white-space: normal;
  word-wrap: break-word;
  max-height: none;
  overflow-y: auto;
}

.description-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  cursor: pointer;
}

.description-cell.expanded {
  white-space: normal;
  word-wrap: break-word;
  max-height: none;
  overflow-y: auto;
}

</style>