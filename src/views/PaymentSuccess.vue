<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";
import { useOrdersStore } from "../stores/orders";

const route = useRoute();
const router = useRouter();
const orders = useOrdersStore();

const loading = ref(true);
const success = ref(false);
const mode = ref(""); // "setup" or "payment"

onMounted(async () => {
  const sessionId = route.query.session_id;

  if (!sessionId) {
    loading.value = false;
    success.value = false;
    return;
  }

  try {
    // ✅ verify-link should return { message, mode, payment? }
    const { data } = await api.post("/payments/verify-link", { sessionId });

    mode.value = data?.mode || "";
    success.value = true;

    // ✅ refresh orders so status/paymentId updates immediately
    await orders.fetchMyOrders();

    // ✅ redirect based on what happened:
    // setup = linking card -> wallet
    // payment = actual checkout -> orders (so they can download receipt)
    setTimeout(() => {
      if (mode.value === "setup") {
        router.replace("/settings/payments");
      } else {
        router.replace("/orders");
      }
    }, 800);
  } catch (err) {
    console.error(
      "Payment verification error:",
      err?.response?.data || err?.message || err
    );
    success.value = false;

    // fallback redirect
    setTimeout(() => router.replace("/orders"), 1200);
  } finally {
    loading.value = false;
  }
});
</script>


<template>
  <div class="success-view">
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <div class="container d-flex justify-content-center align-items-center min-vh-100">
      <div class="glass-card p-5 text-center animate-in">

        <!-- LOADING -->
        <div v-if="loading">
          <div class="spinner-border text-pink mb-4"></div>
          <h2 class="fw-bold text-dark">Linking your card…</h2>
          <p class="text-muted">Please wait while we secure your payment method.</p>
        </div>

        <!-- SUCCESS -->
        <div v-else-if="success">
          <div class="checkmark-circle mb-4 mx-auto">
            <span class="checkmark">✓</span>
          </div>
          <h1 class="fw-bold mb-3 text-dark">Card Linked Successfully!</h1>
          <p class="text-muted px-md-5">
            Your card is now saved securely. You can enjoy
            <b>one-tap checkout</b> on your next purchase.
          </p>

          <div class="mt-4">
            <span class="text-pink fw-semibold">
              Redirecting back to Wallet…
            </span>
          </div>
        </div>

        <!-- FALLBACK -->
        <div v-else>
          <div class="error-icon mb-4">✕</div>
          <h2 class="fw-bold text-danger">Verification Pending</h2>
          <p class="text-muted">
            We couldn’t confirm the setup instantly, but your card
            may still appear in your Wallet shortly.
          </p>

          <router-link
            to="/settings/payments"
            class="btn-atelier-secondary mt-3 d-inline-block"
          >
            Back to Wallet
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.success-view {
  background: #fdf2f5;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Quicksand', sans-serif;
}

/* Background Blobs */
.blob-1 {
  position: absolute;
  top: -10%; left: -5%;
  width: 500px; height: 500px;
  background: radial-gradient(circle, #ffcbdc 0%, transparent 70%);
  filter: blur(60px);
}
.blob-2 {
  position: absolute;
  bottom: -10%; right: -5%;
  width: 600px; height: 600px;
  background: radial-gradient(circle, #ffe3d5 0%, transparent 70%);
  filter: blur(80px);
}

.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 40px;
  border: 1px solid white;
  box-shadow: 0 40px 100px rgba(255, 182, 193, 0.2);
  width: 100%;
  max-width: 600px;
  z-index: 1;
}

/* Success Checkmark */
.checkmark-circle {
  width: 80px;
  height: 80px;
  background: #ffcbdc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkmark {
  color: #ff4f87;
  font-size: 2.5rem;
  font-weight: bold;
}

.error-icon {
  font-size: 3rem;
  color: #dc3545;
}

/* Buttons */
.btn-atelier-primary {
  background: #ff8dad;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 15px;
  font-weight: 800;
  text-decoration: none;
  transition: 0.3s;
  box-shadow: 0 10px 20px rgba(255, 141, 173, 0.3);
}
.btn-atelier-primary:hover {
  background: #ff7ba8;
  transform: translateY(-2px);
}

.btn-atelier-secondary {
  background: white;
  border: 2px solid #ff8dad;
  color: #ff8dad;
  padding: 10px 30px;
  border-radius: 15px;
  font-weight: 700;
  text-decoration: none;
}

.text-pink { color: #ff8dad; }

/* Animation */
.animate-in {
  animation: fadeInUp 0.6s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
