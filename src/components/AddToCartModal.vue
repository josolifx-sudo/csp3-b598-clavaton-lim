<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  open: { type: Boolean, required: true },
  product: { type: Object, default: null }
});

const emit = defineEmits(["close", "confirm"]);

const qty = ref(1);
const loading = ref(false);
const error = ref("");

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      qty.value = 1;
      loading.value = false;
      error.value = "";
    }
  }
);

function close() {
  emit("close");
}

function increase() {
  qty.value++;
}

function decrease() {
  if (qty.value > 1) qty.value--;
}

function formatPrice(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toFixed(2);
}

async function confirm() {
  if (!props.product?._id) return;

  loading.value = true;
  error.value = "";

  try {
    emit("confirm", { productId: props.product._id, quantity: qty.value });
  } catch (e) {
    error.value = "Failed to add to cart.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="open" class="modal-backdrop-custom" @click.self="close">
    <div class="modal-card glass">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div class="text-white-50" style="font-size: 13px">Add to cart</div>
          <h5 class="mb-1">{{ product?.name }}</h5>
          <div class="text-white-50 text-capitalize">{{ product?.category || "Signature" }}</div>
        </div>

        <button class="btn btn-ghost btn-sm" type="button" @click="close">✕</button>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <div class="text-white-50">Quantity</div>

        <div class="qty">
          <button class="qty-btn" type="button" @click="decrease" :disabled="qty <= 1">−</button>
          <div class="qty-value">{{ qty }}</div>
          <button class="qty-btn" type="button" @click="increase">+</button>
        </div>
      </div>

      <div
        class="d-flex justify-content-between align-items-center mt-4 pt-3"
        style="border-top: 1px solid rgba(36,27,24,0.10)"
      >
        <div>
          <div class="text-white-50" style="font-size: 13px">Estimated total</div>
          <div class="fw-semibold">₱ {{ formatPrice((product?.price || 0) * qty) }}</div>
        </div>

        <button class="btn btn-accent" type="button" @click="confirm" :disabled="loading || !product?._id">
          {{ loading ? "Adding..." : "Add" }}
        </button>
      </div>

      <div v-if="error" class="alert alert-danger py-2 mt-3 mb-0">
        {{ error }}
      </div>
    </div>
  </div>
</template>



<style scoped>
.modal-backdrop-custom{
  position: fixed;
  inset: 0;
  background: rgba(14, 10, 9, 0.35);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card{
  width: min(520px, 100%);
  border-radius: 22px;
  padding: 18px 18px 16px;
  box-shadow: 0 30px 80px rgba(36,27,24,0.18);
  animation: popIn 140ms ease-out;
}

@keyframes popIn {
  from { transform: translateY(8px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.qty{
  display: flex;
  align-items: center;
  border: 1px solid rgba(36,27,24,0.12);
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,0.75);
  box-shadow: 0 10px 18px rgba(36,27,24,0.06);
}

.qty-btn{
  width: 44px;
  height: 38px;
  border: none;
  background: transparent;
  font-weight: 800;
  color: var(--text);
}

.qty-btn:disabled{
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-value{
  width: 56px;
  text-align: center;
  font-weight: 750;
}
</style>