import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../components/HelloWorld.vue';
import ShortUrl from '../components/ShortUrl.vue';
import UrlSummary from '../views/UrlSummary.vue'; // Import UrlSummary component

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
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
  ],
});

export default router;
