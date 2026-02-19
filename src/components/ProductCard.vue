<script setup>
/**
 * IMPORT: Accessing the Global Store
 * We need the Auth Store to know the current user's role/permission level.
 */
import { useAuthStore } from "../stores/auth";

/**
 * DEFINITION: defineProps
 * Data Input: This is how the parent component "hands over" the product data to this card.
 */
defineProps({
  product: { type: Object, required: true }
});

/**
 * DEFINITION: defineEmits
 * Data Output: This card notifies the parent when the user wants to add an item.
 * The card itself doesn't talk to the database; it just "emits" the event.
 */
defineEmits(["add"]);

const auth = useAuthStore();

/**
 * UTILITY: formatPrice
 * Ensures numbers look professional (e.g., 50 becomes 50.00).
 */
function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value; // Return as-is if not a number
  return n.toFixed(2);
}
</script>

<template>
  <div class="card card-premium h-100 overflow-hidden product-card">

    <div class="thumb">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="thumb-img"
        loading="lazy"
      />
      <div v-else class="thumb-placeholder">
        <div class="placeholder-text">Atelier</div>
      </div>
    </div>

    <div class="p-3">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="badge-soft text-capitalize">
          {{ product.category || "Signature" }}
        </span>
        <div class="fw-semibold">₱ {{ formatPrice(product.price) }}</div>
      </div>

      <h5 class="mb-2">{{ product.name }}</h5>

      <p class="mb-3 text-white-50 clamp">
        {{ product.description }}
      </p>

      <div class="d-grid gap-2">
        <router-link class="btn btn-ghost w-100" :to="`/products/${product._id}`">
          Details
        </router-link>

        <button
          v-if="auth.isLoggedIn && !auth.isAdmin"
          class="btn btn-accent w-100"
          type="button"
          @click="$emit('add', product)"
        >
          Add to Cart
        </button>

        <div
          v-else-if="auth.isAdmin"
          class="text-white-50 text-center"
          style="font-size: 13px"
        >
          Admin cannot add to cart
        </div>
      </div>
    </div>

  </div>
</template>


<style scoped>
/* Scoped ensures these styles only affect this component */

.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Hover effect: Lift the card and add a soft shadow */
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 50px rgba(36,27,24,0.14);
}

.thumb {
  height: 180px;
  overflow: hidden;
  border-bottom: 1px solid rgba(36,27,24,0.08);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures image fills space without stretching */
  transform: scale(1.02); /* Slight zoom for cleaner edges */
  transition: transform 0.35s ease;
}

/* Internal Hover: Zoom the image slightly when the card is hovered */
.product-card:hover .thumb-img {
  transform: scale(1.08);
}

/* Styled background for missing images using gradients */
.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(180px 120px at 30% 35%, rgba(255,79,135,0.20), transparent 60%),
    radial-gradient(220px 140px at 70% 55%, rgba(255,184,74,0.18), transparent 62%),
    linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.9));
}

.placeholder-text {
  font-weight: 850;
  letter-spacing: 1px;
  opacity: 0.7;
}

/* Text Clamping: Truncates text with '...' after exactly 3 lines */
.clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 60px; /* Keeps card heights consistent even with short text */
}
</style>