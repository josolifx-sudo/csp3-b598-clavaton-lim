<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useOrdersStore } from "../stores/orders";
import api from "../api/axios";

const router = useRouter();
const cartStore = useCartStore();
const orders = useOrdersStore();

const isProcessing = ref(false);
const paymentMethod = ref("card");

// ✅ For manual GCash flow
const gcashReference = ref("");

// Helpers
const total = computed(() => Number(cartStore.total || 0));
const isGCash = computed(() => paymentMethod.value === "gcash");

async function handleCheckout() {
  // 1) Validate cart state before proceeding
  if (!total.value || total.value <= 0) {
    alert("Your cart is empty.");
    return;
  }

  // 2) If GCash, require a reference number (manual verification)
  if (isGCash.value) {
    const refNo = (gcashReference.value || "").trim();
    if (!refNo) {
      alert("Please enter your GCash reference number.");
      return;
    }
    if (refNo.length < 6) {
      alert("Reference number looks too short. Please double-check.");
      return;
    }
  }

  isProcessing.value = true;
  console.log("🚀 Starting Checkout Process...");

  try {
    // 3) Create the order record in your database
    const orderData = await orders.checkout();
    const orderId = orderData.order?._id;

    if (!orderId) {
      throw new Error("Order creation failed - No ID returned from server.");
    }
    console.log("✅ Order Created:", orderId);

    // ✅ 4A) MANUAL FLOW: GCash (no Stripe)
    if (isGCash.value) {
      await api.post("/payments/gcash", {
        orderId,
        amount: total.value,
        referenceNumber: gcashReference.value.trim(),
      });

      alert("GCash submitted! Your payment is pending admin verification.");
      // Usually you'd send them to Orders so they can see status
      router.push("/orders");
      return;
    }

    // ✅ 4B) STRIPE FLOW: Card / Maya
    const { data } = await api.post("/payments/stripe", {
      orderId,
      amount: total.value,
      methodType: paymentMethod.value, // "card" | "paymaya"
      saveCard: paymentMethod.value === "card", // only makes sense for cards
    });

    // 5) Redirect to Stripe
    if (data.url) {
      console.log("💳 Redirecting to Stripe Secure Page...");
      window.location.href = data.url;
    } else {
      throw new Error("Stripe session URL not found in server response.");
    }
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Checkout failed. Please try again.";

    console.error("❌ Checkout Flow Error:", msg);
    alert(msg);
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <div class="payment-view">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="container d-flex justify-content-center align-items-center min-vh-100">
      <div class="glass-panel p-5 d-flex flex-column flex-md-row gap-5">
        <div class="card-visual">
          <div class="credit-card shadow-lg">
            <div class="card-chip"></div>
            <div class="card-number">•••• •••• •••• ••••</div>
            <div class="card-bottom">
              <span>Secure Payment</span>
              <div class="card-logo"></div>
            </div>
          </div>
        </div>

        <div class="payment-form">
          <h3 class="fw-bold mb-1">Checkout</h3>
          <p class="text-muted small mb-4">Select your payment method</p>

          <div class="methods-list d-flex flex-column gap-3 mb-4">
            <label class="method-item" :class="{ active: paymentMethod === 'card' }">
              <input type="radio" v-model="paymentMethod" value="card" hidden />
              <span class="dot"></span>
              <span class="method-name">Credit or Debit Card</span>
              <span class="ms-auto">💳</span>
            </label>

            <label class="method-item" :class="{ active: paymentMethod === 'gcash' }">
              <input type="radio" v-model="paymentMethod" value="gcash" hidden />
              <span class="dot"></span>
              <span class="method-name">GCash Wallet (Manual Verification)</span>
              <span class="ms-auto">💎</span>
            </label>

            <label class="method-item" :class="{ active: paymentMethod === 'paymaya' }">
              <input type="radio" v-model="paymentMethod" value="paymaya" hidden />
              <span class="dot"></span>
              <span class="method-name">Maya</span>
              <span class="ms-auto">✨</span>
            </label>
          </div>

          <!-- ✅ Manual GCash input -->
          <div v-if="paymentMethod === 'gcash'" class="mb-4">
            <label class="form-label text-muted">
              GCash Reference Number
            </label>
            <input
              v-model="gcashReference"
              class="form-control"
              placeholder="e.g. 1234567890"
              :disabled="isProcessing"
            />
            <div class="small text-muted mt-2">
              Your payment will be marked <b>Pending</b> until an admin approves it.
            </div>
          </div>

          <div class="total-box mb-4">
            <span class="text-muted">Total Amount</span>
            <span class="total-amount">₱{{ total }}</span>
          </div>

          <button
            class="btn-pay w-100"
            @click="handleCheckout"
            :disabled="isProcessing || total <= 0"
          >
            {{ isProcessing ? "CONNECTING..." : "PAY NOW" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Keeping your existing styles for consistent UI */
.payment-view {
  position: relative;
  background: #f4f7f9;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}
.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: #ffcbdc;
  filter: blur(80px);
  border-radius: 50%;
  z-index: 0;
}
.blob-1 { top: -100px; left: -100px; opacity: 0.6; }
.blob-2 { bottom: -100px; right: -100px; background: #ffe3d5; opacity: 0.6; }
.glass-panel {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border-radius: 40px;
  border: 1px solid white;
  box-shadow: 0 40px 80px rgba(0,0,0,0.05);
  max-width: 900px;
  width: 100%;
}
.credit-card {
  width: 320px;
  height: 200px;
  background: linear-gradient(135deg, #ff7ba8, #ff9b9b);
  border-radius: 20px;
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: rotate(-2deg);
}
.card-chip {
  width: 40px;
  height: 30px;
  background: rgba(255,255,255,0.3);
  border-radius: 6px;
}
.card-number {
  font-size: 1.4rem;
  letter-spacing: 2px;
  font-weight: 500;
}
.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  text-transform: uppercase;
}
.method-item {
  display: flex;
  align-items: center;
  padding: 18px;
  background: white;
  border-radius: 15px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}
.method-item.active {
  border-color: #ff7ba8;
  background: #fff5f8;
}
.dot {
  width: 12px;
  height: 12px;
  border: 2px solid #ccc;
  border-radius: 50%;
  margin-right: 15px;
}
.active .dot {
  background: #ff7ba8;
  border-color: #ff7ba8;
}
.method-name { font-weight: 600; color: #444; }
.total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;
}
.total-amount { font-size: 1.8rem; font-weight: 800; color: #ff7ba8; }
.btn-pay {
  background: linear-gradient(to right, #ff7ba8, #ff9b9b);
  border: none;
  border-radius: 15px;
  color: white;
  padding: 18px;
  font-weight: 800;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(255, 123, 168, 0.3);
  transition: transform 0.2s;
}
.btn-pay:hover { transform: translateY(-3px); }
.btn-pay:disabled { opacity: 0.7; transform: none; }
</style>
