<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const success = ref(false);

onMounted(async () => {
  const sessionId = route.query.session_id;

  try {
    if (sessionId) {
      await api.post("/payments/verify-link", { sessionId });
      success.value = true;
    }
  } catch (e) {
    console.error("Setup verify error:", e?.response?.data || e?.message || e);
    success.value = false;
  } finally {
    loading.value = false;

    // Send back to wallet page after a short moment
    setTimeout(() => router.replace("/settings/payments"), 800);
  }
});
</script>

<template>
  <div class="container mt-5 text-center">
    <div v-if="loading">
      <h2>Linking your card...</h2>
      <p>Please wait.</p>
    </div>

    <div v-else-if="success">
      <h2>Card linked successfully ✅</h2>
      <p>Redirecting back to Wallet…</p>
    </div>

    <div v-else>
      <h2>Card linking pending</h2>
      <p>Please check your Wallet again in a moment.</p>
    </div>
  </div>
</template>
