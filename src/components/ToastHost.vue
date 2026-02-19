<script setup>
import { onMounted, ref } from "vue";
import { useUiStore } from "../stores/ui";

// 1. Initialize the variable as null
const ui = ref(null);

onMounted(() => {
  // 2. ONLY call the store after the component has mounted. 
  // This guarantees Pinia is active.
  ui.value = useUiStore();
});

function remove(id) {
  if (ui.value) {
    ui.value.removeToast(id);
  }
}
</script>

<template>
  <div v-if="ui" class="toast-stack">
    <div
      v-for="t in ui.toasts"
      :key="t.id"
      class="toast-card"
      :class="t.type"
    >
      <div class="toast-dot"></div>
      <div class="toast-msg">{{ t.message }}</div>

      <button 
        class="btn-close-toast" 
        type="button" 
        @click="remove(t.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ... (Previous styles for .toast-stack, .toast-card, and animations remain the same) ... */

.toast-stack {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 99999;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 36px));
}

.toast-card {
  display: flex;
  align-items: center;
  gap: 12px; /* Increased gap for better spacing */
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(36,27,24,0.10);
  box-shadow: 0 16px 40px rgba(36,27,24,0.14);
  animation: toastIn 160ms ease-out;
}

/* 2. CLOSE BUTTON STYLING */
.btn-close-toast {
  margin-left: auto; /* Pushes the 'X' to the far right */
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: var(--text);
  opacity: 0.3;
  cursor: pointer;
  padding: 4px;
  transition: opacity 0.2s ease;
}

.btn-close-toast:hover {
  opacity: 1; /* Highlights the button when user intends to click */
}

/* Existing dot and message logic... */
@keyframes toastIn {
  from { transform: translateY(-6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.toast-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(255,79,135,0.16);
  flex-shrink: 0; /* Prevents the dot from squishing if text is long */
}

.toast-card.success .toast-dot { background: var(--accent); }
.toast-card.error .toast-dot {
  background: #ff3b3b;
  box-shadow: 0 0 0 4px rgba(255,59,59,0.16);
}

.toast-msg {
  font-weight: 650;
  color: var(--text);
  font-size: 14px;
}
</style>