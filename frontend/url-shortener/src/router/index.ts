import { createRouter, createWebHistory } from 'vue-router';
import ShortUrl from '../components/ShortUrl.vue';
import UrlSummary from '../views/UrlSummary.vue'; // Import UrlSummary component
import UrlTable from '../components/UrlTable.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_FRONTEND_BASE_URL),
  routes: [
    {
      path: '/shorten',
      name: 'shorten',
      component: ShortUrl,
    },
    {
      path: '/url-summary/:customId', // Define the route for UrlSummary with a dynamic parameter
      name: 'url-summary',
      component: UrlSummary,
    },
    {
      path: '/url-table',
      name: 'url-table', // Add a name for the route
      component: UrlTable, // Add the route for UrlList
    },
  ],
});

export default router;
