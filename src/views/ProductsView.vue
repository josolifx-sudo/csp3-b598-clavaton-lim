<template>
  <div class="container container-narrow">
    <div class="glass p-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <h2 class="mb-1">Curated Pastries</h2>
          <div class="text-white-50">
            Fresh baked cookies and silky cheesecakes, curated to feel indulgent yet refined.
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <select class="form-select input-dark" v-model="filter" style="min-width: 190px">
            <option value="all">All</option>
            <option value="cookie">Cookies</option>
            <option value="cheesecake">Cheesecakes</option>
          </select>

          <input
            class="form-control input-dark"
            v-model.trim="q"
            placeholder="Search by name or description"
            style="min-width: 260px"
          />
        </div>
      </div>
    </div>

    <div v-if="products.loading" class="glass p-4 text-white-50">
      Loading products...
    </div>

    <div v-else-if="products.error" class="alert alert-danger">
      {{ products.error }}
    </div>

    <div v-else>
      <div v-if="filtered.length === 0" class="glass p-4 text-white-50">
        No products found.
      </div>

      <div v-else class="row g-3">
        <div v-for="p in filtered" :key="p._id" class="col-12 col-sm-6 col-lg-4">
          <ProductCard :product="p" @add="openAddModal" />
        </div>
      </div>
    </div>

    <AddToCartModal
      :open="addOpen"
      :product="selectedProduct"
      @close="closeAddModal"
      @confirm="confirmAdd"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useUiStore } from "../stores/ui";
import { useProductsStore } from "../stores/products";
import { useCartStore } from "../stores/cart";
import ProductCard from "../components/ProductCard.vue";
import AddToCartModal from "../components/AddToCartModal.vue";

const products = useProductsStore();
const cart = useCartStore();
const ui = useUiStore();

const filter = ref("all");
const q = ref("");

const addOpen = ref(false);
const selectedProduct = ref(null);

onMounted(async () => {
  await products.fetchActive();
});

const filtered = computed(() => {
  const query = q.value.toLowerCase();

  return products.active
    .filter((p) => {
      if (filter.value === "all") return true;
      return (p.category || "").toLowerCase() === filter.value;
    })
    .filter((p) => {
      if (!query) return true;
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
});

function openAddModal(product) {
  selectedProduct.value = product;
  addOpen.value = true;
}

function closeAddModal() {
  addOpen.value = false;
  selectedProduct.value = null;
}

async function confirmAdd({ productId, quantity }) {
  await cart.addToCart(productId, quantity);
  closeAddModal();
  ui.toast("Added to cart.");
}
</script>