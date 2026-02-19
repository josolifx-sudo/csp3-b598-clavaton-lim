<template>
  <div>
    <ToastHost />
    <AppNavbar />
    <main class="py-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from "./components/AppNavbar.vue";
import ToastHost from "./components/ToastHost.vue";
</script>