import { createRouter, createWebHistory } from 'vue-router';
import { initializeKeycloak } from '@/services/keycloak';
import ShortUrl from '../components/ShortUrl.vue';
import UrlSummary from '../views/UrlSummary.vue'; // Import UrlSummary component
import UrlTable from '../components/UrlTable.vue';

const routes = [
  {
    path: '/shorten',
    name: 'shorten',
    component: ShortUrl,
    meta: {
      requiresAuth: true, // Protected route
    },
  },
  {
    path: '/url-summary/:customId', // Define the route for UrlSummary with a dynamic parameter
    name: 'url-summary',
    component: UrlSummary,
    meta: {
      requiresAuth: true, // Protected route
    },
  },
  {
    path: '/urls',
    name: 'url-table',
    component: UrlTable,
    meta: {
      requiresAuth: true, // Protected route
    },
  },
  {
    path: '/', // Define a default route
    redirect: '/shorten', // Redirect to the default component
    meta: {
      requiresAuth: true, // Protected route
    },
  },
  {
    path: '/:pathMatch(.*)*', // Catch-all route for undefined paths
    redirect: '/shorten', // Redirect to the default component
    meta: {
      requiresAuth: true, // Protected route
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


// Add navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
  try {
    const keycloak = await initializeKeycloak();

    if (keycloak && to.meta.requiresAuth && !keycloak.authenticated) {
      // If route requires authentication and user is not authenticated, redirect to login
      keycloak.login();
    } else {
      // If authenticated or route doesn't require auth, allow navigation
      next();
    }
  } catch (error) {
    console.error('Error during route navigation:', error);
    next(false); // Optionally block navigation if Keycloak initialization fails
  }
});

export default router;
