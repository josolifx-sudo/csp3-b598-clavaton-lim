<template>
  <div class="container container-narrow">
    <div class="glass p-4 mb-4">
      <h2 class="mb-1">Your Cart</h2>
      <div class="text-white-50">
        Review your selection before checkout.
      </div>
    </div>

    <div v-if="cart.loading" class="glass p-4 text-white-50">
      Loading cart...
    </div>

    <div v-else-if="cart.error" class="alert alert-danger">
      {{ cart.error }}
    </div>

    <div v-else-if="items.length === 0" class="glass p-4 text-white-50">
      Your cart is empty.
    </div>

    <div v-else class="glass p-4">
      <div
        v-for="item in items"
        :key="item.productId"
        class="d-flex justify-content-between align-items-center py-3"
        style="border-bottom: 1px solid rgba(36,27,24,0.10)"
      >
        <div style="min-width: 240px">
          <div class="fw-semibold">{{ item.name }}</div>
          <div class="text-white-50">₱ {{ formatPrice(item.price) }}</div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            class="btn btn-ghost btn-sm"
            type="button"
            @click="update(item.productId, item.quantity - 1)"
          >
            -
          </button>

          <div style="min-width:44px; text-align:center; font-weight:700">
            {{ item.quantity }}
          </div>

          <button
            class="btn btn-ghost btn-sm"
            type="button"
            @click="update(item.productId, item.quantity + 1)"
          >
            +
          </button>
        </div>

        <div style="min-width: 120px; text-align:right">
          ₱ {{ formatPrice(item.subtotal) }}
        </div>

        <button
          class="btn btn-ghost btn-sm"
          type="button"
          @click="remove(item.productId)"
        >
          Remove
        </button>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <button class="btn btn-ghost" @click="clear">
          Clear Cart
        </button>

        <div class="text-end">
          <div class="text-white-50">Total</div>
          <h4 class="mb-2">₱ {{ formatPrice(total) }}</h4>

          <button
            class="btn btn-warm"
            :disabled="checkingOut"
            @click="checkout"
          >
            {{ checkingOut ? "Processing..." : "Checkout" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth"; 
import { useOrdersStore } from "../stores/orders";
import { useUiStore } from "../stores/ui";

// INITIALIZATION
const router = useRouter();
const cart = useCartStore();
const auth = useAuthStore(); 
const orders = useOrdersStore();
const ui = useUiStore();

const checkingOut = ref(false);

/**
 * LIFECYCLE: Sync cart data with the server as soon as the page loads.
 */
onMounted(async () => {
  await cart.fetchCart();
});

/**
 * COMPUTED: Shortcuts to the Pinia store data.
 */
const items = computed(() => cart.items);
const total = computed(() => cart.total);

/**
 * FORMATTER: Price formatting.
 */
function formatPrice(v) {
  const n = Number(v);
  return Number.isNaN(n) ? v : n.toFixed(2);
}

/**
 * ACTIONS
 */
async function update(productId, qty) {
  if (qty < 1) return;
  await cart.updateQuantity(productId, qty);
}

async function remove(productId) {
  await cart.removeItem(productId);
}

async function clear() {
  await cart.clearCart();
  ui.toast("Cart cleared.", "success");
}

/**
 * NAVIGATION: Moves user to payment or login.
 */
async function checkout() {
  checkingOut.value = true;
  
  if (!auth.isLoggedIn) {
    ui.toast("Please log in to continue to checkout.", "warning");
    router.push("/login");
    checkingOut.value = false;
    return;
  }
  
  router.push("/payment");
  checkingOut.value = false;
}
</script>