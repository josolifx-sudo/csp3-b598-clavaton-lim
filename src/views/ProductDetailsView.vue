<template>
  <div class="container container-narrow">

    <div v-if="loading" class="glass p-4 text-white-50">
      Loading product...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="product" class="glass p-4">

      <div v-if="product.imageUrl" class="mb-4">
        <img
          :src="product.imageUrl"
          :alt="product.name"
          style="width:100%; max-height:350px; object-fit:cover; border-radius:16px"
        />
      </div>

      <h2 class="mb-2">{{ product.name }}</h2>

      <div class="badge-soft mb-3 text-capitalize">
        {{ product.category || "Signature" }}
      </div>

      <p class="text-white-50 mb-4">
        {{ product.description }}
      </p>

      <h4 class="mb-4">₱ {{ formatPrice(product.price) }}</h4>

      <div v-if="!auth.isAdmin" class="d-flex align-items-center gap-3">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-ghost" type="button" @click="decrease">-</button>
          <div style="min-width:44px; text-align:center; font-weight:700">
            {{ quantity }}
          </div>
          <button class="btn btn-ghost" type="button" @click="increase">+</button>
        </div>

        <button class="btn btn-accent" type="button" @click="addToCart">
          Add to Cart
        </button>
      </div>

      <div v-else class="text-white-50">
        Admin accounts cannot add items to cart.
      </div>

    </div>

    <div v-else class="glass p-4 text-white-50">
      Product not found.
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUiStore } from "../stores/ui";
import { useRoute } from "vue-router";
import { useProductsStore } from "../stores/products";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

const ui = useUiStore();
const route = useRoute();
const products = useProductsStore();
const cart = useCartStore();
const auth = useAuthStore();

const product = ref(null);
const quantity = ref(1);
const loading = ref(false);
const error = ref("");

function formatPrice(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toFixed(2);
}

function increase() {
  quantity.value++;
}

function decrease() {
  if (quantity.value > 1) quantity.value--;
}

async function addToCart() {
  await cart.addToCart(product.value._id, quantity.value);
  ui.toast("Added to cart.");
}

onMounted(async () => {
  loading.value = true;
  error.value = "";

  try {
    const result = await products.fetchOne(route.params.id);
    product.value = result;
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      "Failed to load product.";
  } finally {
    loading.value = false;
  }
});
</script>