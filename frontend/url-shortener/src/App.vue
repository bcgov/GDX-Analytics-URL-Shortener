<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import Navigation from '@/components/navigation.vue';
import Footer from '@/components/Footer.vue';
</script>

<template>
  <div>
    <header>
      <div class="banner">
        <a href="https://gov.bc.ca">
          <img src="./assets/logo-banner.png" alt="Go to the Government of British Columbia website" />
        </a>
        <h1>URL Shortener and Redirection Service</h1>
      </div>
      <div class="other">
        <a class="nav-btn">
          <i class="fas fa-bars" id="menu"></i>
        </a>
      </div>
    </header>

    <!-- Navigation component is outside the header -->
    <Navigation />

    <div class="content">
      <!-- RouterView is now inside a separate container -->
      <RouterView />
    </div>
    <Footer />
  </div>
</template>


