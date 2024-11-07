// Import necessary functions from Vue Router
import { createRouter, createWebHistory } from 'vue-router';
// Import the Keycloak initialization function for authentication checks
import { initializeKeycloak } from '@/services/keycloak';
// Import components and views used in the routes
import ShortUrl from '../components/ShortUrl.vue';
import UrlSummary from '../views/UrlSummary.vue'; // Import UrlSummary component
import UrlTable from '../components/UrlTable.vue';

// Define the routes for the application
const routes = [
  {
    path: '/shorten', // Path for the URL shortening page
    name: 'shorten', // Name of the route
    component: ShortUrl, // Component to render for this route
    meta: {
      requiresAuth: true, // Indicates that this route requires authentication
    },
  },
  {
    path: '/url-summary/:customId', // Dynamic route for URL summary with a custom ID
    name: 'url-summary', // Name of the route
    component: UrlSummary, // Component to render for this route
    meta: {
      requiresAuth: true, // Indicates that this route requires authentication
    },
  },
  {
    path: '/urls', // Path for the URL table page
    name: 'url-table', // Name of the route
    component: UrlTable, // Component to render for this route
    meta: {
      requiresAuth: true, // Indicates that this route requires authentication
    },
  },
  {
    path: '/', // Default route path
    redirect: '/shorten', // Redirect to the shortening page by default
    meta: {
      requiresAuth: true, // Indicates that this route requires authentication
    },
  },
  {
    path: '/:pathMatch(.*)*', // Catch-all route for undefined paths
    redirect: '/shorten', // Redirect to the shortening page for any unmatched routes
    meta: {
      requiresAuth: true, // Indicates that this route requires authentication
    },
  },
];

// Create the router instance with the specified routes and history mode
const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode
  routes, // Assign the defined routes
});

// Add a navigation guard to protect routes that require authentication
router.beforeEach(async (to, from, next) => {
  try {
    const keycloak = await initializeKeycloak(); // Initialize Keycloak for authentication checks

    // Check if the route requires authentication and if the user is authenticated
    if (keycloak && to.meta.requiresAuth && !keycloak.authenticated) {
      // If the user is not authenticated, redirect to the login page
      keycloak.login();
    } else {
      // If the user is authenticated or the route doesn't require auth, allow navigation
      next();
    }
  } catch (error) {
    console.error('Error during route navigation:', error); // Log any errors during navigation
    next(false); // Optionally block navigation if Keycloak initialization fails
  }
});

// Export the router instance for use in the application
export default router;
