<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";

const savedMethods = ref([]);
const isLoading = ref(true);

/**
 * Fetch linked payment methods
 */
const fetchMethods = async () => {
  try {
    const { data } = await api.get("/payments/methods");
    savedMethods.value = data.methods || [];
  } catch (err) {
    console.error("Error loading methods", err);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Unlink a saved method
 */
const handleUnlink = async (methodId) => {
  if (!confirm("Are you sure you want to unlink?")) return;

  try {
    await api.delete(`/payments/methods/${methodId}`);
    savedMethods.value = savedMethods.value.filter((m) => m.methodId !== methodId);
    alert("Method unlinked successfully.");
  } catch (err) {
    alert("Failed to unlink method.");
  }
};

/**
 * Link new card (Stripe setup session)
 * ✅ FIX: use the correct backend route: /payments/link-method
 */
const handleLinkNewCard = async () => {
  try {
    const { data } = await api.post("/payments/link-method");
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    alert("Setup session did not return a URL. Please try again.");
  } catch (err) {
    console.error("Setup session error:", err?.response?.data || err?.message || err);
    alert("Could not initialize setup. Please try again.");
  }
};

onMounted(fetchMethods);
</script>

<template>
  <div class="settings-container p-4">
    <h2 class="fw-bold mb-4">Wallet & Payments</h2>

    <div v-if="isLoading" class="text-center p-5">
      <div class="spinner-border text-pink"></div>
    </div>

    <div v-else class="methods-grid">
      <div v-if="savedMethods.length === 0" class="empty-state p-4 border rounded text-center">
        <p class="text-muted mb-0">No payment methods linked yet.</p>
      </div>

      <div
        v-for="method in savedMethods"
        :key="method.methodId"
        class="method-card d-flex align-items-center p-3 mb-3 shadow-sm"
      >
        <div class="card-icon me-3">💳</div>
        <div class="flex-grow-1">
          <span class="d-block fw-bold text-uppercase">{{ method.brand }}</span>
          <span class="text-muted small">•••• {{ method.last4 }}</span>
        </div>
        <button @click="handleUnlink(method.methodId)" class="btn-unlink">
          UNLINK
        </button>
      </div>

      <button @click="handleLinkNewCard" class="btn btn-link-new w-100 mt-3">
        + Add New Payment Method
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 600px;
  margin: 0 auto;
}

.method-card {
  background: white;
  border-radius: 15px;
  border: 1px solid #eee;
  transition: transform 0.2s ease;
}

.method-card:hover {
  transform: translateY(-2px);
}

.btn-unlink {
  background: transparent;
  border: 1px solid #ff7ba8;
  color: #ff7ba8;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  transition: 0.3s;
}

.btn-unlink:hover {
  background: #ff7ba8;
  color: white;
}

.btn-link-new {
  background: #fff5f8;
  border: 2px dashed #ff7ba8;
  color: #ff7ba8;
  font-weight: 600;
  padding: 12px;
  border-radius: 15px;
  transition: 0.3s;
}

.btn-link-new:hover {
  background: #ff7ba8;
  color: white;
}

.text-pink {
  color: #ff7ba8;
}

.empty-state {
  background: rgba(0, 0, 0, 0.02);
  border-style: dashed !important;
}
</style>
