<template>
  <div>
    <ToastHost />
    <CenterToastHost />
    <AppNavbar />
    <main class="py-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from "./components/AppNavbar.vue";
import ToastHost from "./components/ToastHost.vue";
import CenterToastHost from "./components/CenterToastHost.vue";
</script>