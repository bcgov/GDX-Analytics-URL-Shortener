import { createRouter, createWebHistory } from 'vue-router';
import ShortUrl from '../components/ShortUrl.vue';
import UrlSummary from '../views/UrlSummary.vue'; // Import UrlSummary component
import UrlTable from '../components/UrlTable.vue';

const routes = [
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
    path: '/urls',
    name: 'url-table',
    component: UrlTable,
  },
  {
    path: '/', // Define a default route
    redirect: '/shorten', // Redirect to the default component
  },
  {
    path: '/:pathMatch(.*)*', // Catch-all route for undefined paths
    redirect: '/shorten', // Redirect to the default component
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
