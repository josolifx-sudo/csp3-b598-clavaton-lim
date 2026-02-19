<script setup>
import { onMounted } from "vue";
import { useOrdersStore } from "../stores/orders";
import { useCartStore } from "../stores/cart";
import api from "../api/axios";

const orders = useOrdersStore();
const cartStore = useCartStore();

onMounted(async () => {
  // Clear cart safely (avoid readonly warning)
  try {
    if (typeof cartStore.clearCart === "function") {
      await cartStore.clearCart();
    }
  } catch (err) {
    console.warn("Local cart clear notice:", err?.message || err);
  }

  await orders.fetchMyOrders();
});

function formatPrice(v) {
  const n = Number(v);
  return Number.isNaN(n) ? v : n.toFixed(2);
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

/**
 * paymentId can be:
 * - "6995...." (string)
 * - { _id: "6995....", ... } (object)
 */
function getPaymentId(order) {
  const p = order?.paymentId;
  if (!p) return "";
  return typeof p === "string" ? p : p?._id || "";
}

/**
 * ✅ Open Stripe hosted receipt URL
 * Backend should return: { receiptUrl: "https://pay.stripe.com/receipts/..." }
 */
async function openReceipt(order) {
  const paymentId = getPaymentId(order);

  if (!paymentId) {
    alert("No payment record attached to this order yet.");
    return;
  }

  try {
    const { data } = await api.get(`/payments/${paymentId}/receipt`);

    if (data?.receiptUrl) {
      window.open(data.receiptUrl, "_blank", "noopener,noreferrer");
      return;
    }

    alert(data?.message || "Receipt not available yet.");
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Could not load receipt.";
    alert(msg);
  }
}
</script>

<template>
  <div class="container container-narrow">
    <div class="glass p-4 mb-4">
      <h2 class="mb-1">Order History</h2>
      <div class="text-white-50">Your past checkouts and totals.</div>
    </div>

    <div v-if="orders.loading" class="glass p-4 text-white-50">
      Loading orders...
    </div>

    <div v-else-if="orders.error" class="alert alert-danger">
      {{ orders.error }}
    </div>

    <div v-else-if="orders.mine.length === 0" class="glass p-4 text-white-50">
      No orders yet.
    </div>

    <div v-else class="glass p-4">
      <div
        v-for="o in orders.mine"
        :key="o._id"
        class="py-3"
        style="border-bottom: 1px solid rgba(36,27,24,0.10)"
      >
        <div class="d-flex justify-content-between align-items-center">
          <div class="fw-semibold">Order ID: {{ o._id }}</div>

          <div class="d-flex align-items-center gap-2">
            <div class="fw-semibold">₱ {{ formatPrice(o.totalPrice) }}</div>

            <span
              class="badge"
              :class="{
                'bg-success': o.status === 'paid',
                'bg-warning text-dark': o.status === 'pending',
                'bg-danger': o.status === 'failed'
              }"
            >
              {{ o.status }}
            </span>
          </div>
        </div>

        <div
          class="text-white-50 d-flex justify-content-between align-items-center flex-wrap gap-2"
          style="font-size: 13px"
        >
          <div>{{ formatDate(o.orderedOn || o.createdOn || o.createdAt) }}</div>

          <div class="d-flex gap-2">
            <button
              v-if="o.status === 'paid' && getPaymentId(o)"
              class="btn btn-sm btn-light"
              @click="openReceipt(o)"
            >
              Download Receipt
            </button>

            <span v-else class="small text-muted">—</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
