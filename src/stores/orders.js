import { defineStore } from "pinia";
import api from "../api/axios";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    mine: [],
    loading: false,
    error: "",
  }),

  actions: {
    /**
     * INITIAL CHECKOUT: Creates the Order record in the database.
     */
    async checkout() {
      this.error = "";
      this.loading = true;
      try {
        const res = await api.post("/orders/checkout");
        return res.data; // { order }
      } catch (e) {
        this.error = "Checkout failed.";
        throw e;
      } finally {
        this.loading = false;
      }
    },

    /**
     * STRIPE FLOW (UPDATED to match backend)
     */
    async createStripeSession({ orderId, amount, methodType = "card", saveCard = true }) {
      try {
        const res = await api.post("/payments/stripe", {
          orderId,
          amount,
          methodType,
          saveCard,
        });

        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          throw new Error("Stripe session URL missing.");
        }
      } catch (e) {
        this.error = "Stripe initiation failed.";
        throw e;
      }
    },

    /**
     * MANUAL FLOW: GCash / Bank
     */
    async submitManualPayment(payload) {
      this.loading = true;
      this.error = "";
      try {
        const endpoint =
          payload.method === "gcash"
            ? "/payments/gcash"
            : "/payments/bank";

        const res = await api.post(endpoint, payload);
        return res.data;
      } catch (e) {
        this.error = "Failed to submit payment reference.";
        throw e;
      } finally {
        this.loading = false;
      }
    },
    /**
 * ✅ Download PDF receipt from backend
 * Backend route: GET /payments/:id/receipt
 */
async downloadReceipt(paymentId) {
  try {
    const res = await api.get(`/payments/${paymentId}/receipt`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${paymentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Could not download receipt.";
    throw new Error(msg);
  }
},


    /**
     * FETCH ORDER HISTORY (includes paymentId)
     */
    async fetchMyOrders() {
      this.error = "";
      this.loading = true;
      try {
        const res = await api.get(`/orders/my-orders?t=${Date.now()}`);

        if (res.data && Array.isArray(res.data.orders)) {
          this.mine = res.data.orders;
        } else {
          this.mine = [];
        }
      } catch (e) {
        this.error = "Unable to retrieve your order history.";
        this.mine = [];
      } finally {
        this.loading = false;
      }
    },

    resetOrders() {
      this.mine = [];
      this.error = "";
    },
  },
});
