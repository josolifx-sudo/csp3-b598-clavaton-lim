<script setup>
import { onMounted, ref } from "vue";
import api from "../api/axios";

const payments = ref([]);
const loading = ref(true);
const error = ref("");

const statusFilter = ref("");
const methodFilter = ref("");
const searchQ = ref("");

// Track row action state (so only 1 row button disables at a time)
const actionLoadingId = ref(null);
const actionType = ref(""); // "approve" | "reject"

const fetchPayments = async () => {
  loading.value = true;
  error.value = "";
  try {
    const params = {};
    if (statusFilter.value) params.status = statusFilter.value;
    if (methodFilter.value) params.method = methodFilter.value;
    if (searchQ.value) params.q = searchQ.value;

    const { data } = await api.get("/payments", { params });
    payments.value = data.payments || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to load payments.";
  } finally {
    loading.value = false;
  }
};

const isManualPending = (p) =>
  p?.status === "pending" && (p?.method === "gcash" || p?.method === "bank");

const approve = async (paymentId) => {
  if (!confirm("Approve this payment? This will mark the order as PAID.")) return;

  actionLoadingId.value = paymentId;
  actionType.value = "approve";

  try {
    await api.patch(`/payments/${paymentId}/approve`);

    // Optimistic update (no need to refetch)
    payments.value = payments.value.map((p) =>
      p._id === paymentId ? { ...p, status: "paid" } : p
    );
  } catch (e) {
    alert(e?.response?.data?.message || "Approve failed.");
  } finally {
    actionLoadingId.value = null;
    actionType.value = "";
  }
};

// ✅ Requires backend route: PATCH /payments/:id/reject
const reject = async (paymentId) => {
  if (!confirm("Reject this payment? It will be marked as FAILED.")) return;

  actionLoadingId.value = paymentId;
  actionType.value = "reject";

  try {
    await api.patch(`/payments/${paymentId}/reject`);

    // Optimistic update
    payments.value = payments.value.map((p) =>
      p._id === paymentId ? { ...p, status: "failed" } : p
    );
  } catch (e) {
    alert(e?.response?.data?.message || "Reject failed.");
  } finally {
    actionLoadingId.value = null;
    actionType.value = "";
  }
};

const formatMoney = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return n;
  return `₱ ${v.toFixed(2)}`;
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : "");

onMounted(fetchPayments);
</script>

<template>
  <div class="admin-view">
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <div class="container d-flex justify-content-center align-items-start min-vh-100 py-5">
      <div class="glass-card p-4 p-md-5 w-100">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h2 class="fw-bold mb-1 text-dark">Admin • Payments</h2>
            <div class="text-muted">Approve or reject manual payments and track transactions.</div>
          </div>

          <button class="btn-atelier-secondary mt-3 mt-md-0" @click="fetchPayments" :disabled="loading">
            {{ loading ? "Refreshing..." : "Refresh" }}
          </button>
        </div>

        <!-- Filters -->
        <div class="filters p-3 mb-4">
          <div class="row g-2 align-items-end">
            <div class="col-md-5">
              <label class="form-label text-muted">Search (reference / transaction)</label>
              <input
                v-model="searchQ"
                class="form-control"
                placeholder="e.g. REF123 or pi_..."
                @keyup.enter="fetchPayments"
              />
            </div>

            <div class="col-md-3">
              <label class="form-label text-muted">Status</label>
              <select v-model="statusFilter" class="form-select">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label text-muted">Method</label>
              <select v-model="methodFilter" class="form-select">
                <option value="">All</option>
                <option value="stripe">Stripe</option>
                <option value="card">Card</option>
                <option value="saved_card">Saved Card</option>
                <option value="gcash">GCash</option>
                <option value="bank">Bank</option>
              </select>
            </div>

            <div class="col-md-1 d-grid">
              <button class="btn-atelier-primary" @click="fetchPayments" :disabled="loading">
                Go
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger mb-4">{{ error }}</div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-pink mb-3"></div>
          <div class="text-muted">Loading payments…</div>
        </div>

        <!-- Table -->
        <div v-else class="table-wrap">
          <div v-if="payments.length === 0" class="text-center text-muted py-5">
            No payments found.
          </div>

          <div v-else class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Reference / Txn</th>
                  <th class="text-end">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="p in payments" :key="p._id">
                  <td class="small text-muted">{{ formatDate(p.createdAt) }}</td>

                  <td>
                    <div class="fw-semibold text-dark">
                      {{ p.userId?.firstName }} {{ p.userId?.lastName }}
                    </div>
                    <div class="small text-muted">{{ p.userId?.email }}</div>
                  </td>

                  <td class="text-uppercase fw-semibold">{{ p.method }}</td>

                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-warning text-dark': p.status === 'pending',
                        'bg-success': p.status === 'paid',
                        'bg-danger': p.status === 'failed'
                      }"
                    >
                      {{ p.status }}
                    </span>
                  </td>

                  <td class="fw-bold text-dark">{{ formatMoney(p.amount) }}</td>

                  <td>
                    <div v-if="p.referenceNumber" class="small text-muted">
                      Ref: {{ p.referenceNumber }}
                    </div>
                    <div v-if="p.transactionId" class="small text-muted">
                      Txn: {{ p.transactionId }}
                    </div>
                    <div v-if="!p.referenceNumber && !p.transactionId" class="small text-muted">—</div>
                  </td>

                  <td class="text-end">
                    <template v-if="isManualPending(p)">
                      <button
                        class="btn-atelier-primary btn-sm me-2"
                        @click="approve(p._id)"
                        :disabled="actionLoadingId === p._id"
                      >
                        <span v-if="actionLoadingId === p._id && actionType === 'approve'">Approving…</span>
                        <span v-else>Approve</span>
                      </button>

                      <button
                        class="btn-atelier-secondary btn-sm"
                        @click="reject(p._id)"
                        :disabled="actionLoadingId === p._id"
                      >
                        <span v-if="actionLoadingId === p._id && actionType === 'reject'">Rejecting…</span>
                        <span v-else>Reject</span>
                      </button>
                    </template>

                    <span v-else class="small text-muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="small text-muted mt-3">
            Showing {{ payments.length }} record(s)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
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
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 1px solid white;
  box-shadow: 0 40px 100px rgba(255, 182, 193, 0.18);
  max-width: 1100px;
  z-index: 1;
}

.filters {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 18px;
}

.text-pink { color: #ff8dad; }

.btn-atelier-primary {
  background: #ff8dad;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 14px;
  font-weight: 800;
  text-decoration: none;
  transition: 0.3s;
  box-shadow: 0 10px 20px rgba(255, 141, 173, 0.25);
}
.btn-atelier-primary:hover {
  background: #ff7ba8;
  transform: translateY(-1px);
}

.btn-atelier-secondary {
  background: white;
  border: 2px solid #ff8dad;
  color: #ff8dad;
  padding: 10px 16px;
  border-radius: 14px;
  font-weight: 800;
  transition: 0.3s;
}
.btn-atelier-secondary:hover {
  background: #fff5f8;
}

.table-wrap {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  overflow: hidden;
}

.table thead th {
  background: rgba(255, 141, 173, 0.12);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  color: #3a2a2a;
  font-weight: 900;
}
.table td, .table th {
  padding: 14px 14px;
}
</style>
