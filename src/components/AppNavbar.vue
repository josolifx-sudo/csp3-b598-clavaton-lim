<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useCartStore } from "../stores/cart";

/**
 * 1. INITIALIZING REFS
 * We start with null and populate them when the component is ready.
 */
const authStore = ref(null);
const cartStore = ref(null);
const router = useRouter();

/**
 * 2. LIFECYCLE HOOK: onMounted
 * This is the "safe zone" where we know Pinia is active.
 */
onMounted(async () => {
  authStore.value = useAuthStore();
  cartStore.value = useCartStore();

  // Only fetch cart for non-admin users
  if (authStore.value.isLoggedIn && !authStore.value.isAdmin) {
    await cartStore.value.fetchCart();
  }
});

/**
 * 3. COMPUTED PROPERTIES
 * We use optional chaining (?.) to prevent crashes while the store is null.
 */
const cartCount = computed(() => {
  if (!cartStore.value) return 0;
  return cartStore.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

// Helper for cleaner template syntax
const auth = computed(() => authStore.value);

// Convenience booleans for template readability
const isLoggedIn = computed(() => !!auth.value?.isLoggedIn);
const isAdmin = computed(() => !!auth.value?.isAdmin);

/**
 * 4. METHOD: logout
 */
function logout() {
  if (authStore.value) {
    authStore.value.logout();
    router.push("/login");
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg py-3">
    <div class="container container-narrow">
      <router-link class="navbar-brand fw-semibold" to="/">
        Atelier Patisserie
      </router-link>

      <div class="ms-auto d-flex align-items-center gap-2">
        <router-link class="btn btn-ghost" to="/products">Products</router-link>

        <!-- ===== USER LINKS (NON-ADMIN) ===== -->
        <router-link
          v-if="isLoggedIn && !isAdmin"
          class="btn btn-ghost position-relative"
          to="/cart"
        >
          Cart
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>

        <router-link
          v-if="isLoggedIn && !isAdmin"
          class="btn btn-ghost"
          to="/settings/payments"
        >
          Wallet
        </router-link>

        <router-link
          v-if="isLoggedIn && !isAdmin"
          class="btn btn-ghost"
          to="/orders"
        >
          Orders
        </router-link>

        <!-- ===== ADMIN LINKS ===== -->
        <router-link
          v-if="isLoggedIn && isAdmin"
          class="btn btn-ghost"
          to="/admin/products"
        >
          Admin Products
        </router-link>

        <router-link
          v-if="isLoggedIn && isAdmin"
          class="btn btn-ghost admin-pill"
          to="/admin/payments"
        >
          Admin Payments
        </router-link>

        <!-- ===== AUTH LINKS ===== -->
        <router-link v-if="!isLoggedIn" class="btn btn-ghost" to="/login">Login</router-link>
        <router-link v-if="!isLoggedIn" class="btn btn-accent" to="/register">Register</router-link>

        <button v-if="isLoggedIn" class="btn btn-accent" type="button" @click="logout">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/**
 * The .cart-badge uses absolute positioning to sit on top of the Cart button.
 */
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), #ff2d6f);
  color: white;
  font-weight: 800;
  font-size: 12px;
  display: grid;
  place-items: center;
  box-shadow: 0 12px 22px rgba(255, 79, 135, 0.28);
  animation: badgePop 160ms ease-out;
}

@keyframes badgePop {
  from { transform: scale(0.9); opacity: 0.7; }
  to { transform: scale(1); opacity: 1; }
}

/* Optional: make Admin Payments stand out slightly */
.admin-pill {
  border: 1px dashed rgba(255, 141, 173, 0.9);
  background: rgba(255, 245, 248, 0.9);
}
</style>
