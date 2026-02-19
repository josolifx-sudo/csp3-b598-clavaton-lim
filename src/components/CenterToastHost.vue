<script setup>
import { onMounted, ref } from "vue";
import { useUiStore } from "../stores/ui";

// same safety pattern as ToastHost.vue
const ui = ref(null);

onMounted(() => {
  ui.value = useUiStore();
});

function close() {
  if (ui.value) ui.value.clearCenterToast();
}
</script>

<template>
  <transition name="center-toast-fade">
    <div
      v-if="ui && ui.centerToast"
      class="center-toast-overlay"
      @click.self="close"
    >
      <div class="center-toast-card">
        <div class="center-toast-msg">
          {{ ui.centerToast.message }}
        </div>

        <button class="center-toast-close" type="button" @click="close">
          &times;
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.center-toast-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100000;
  padding: 16px;
}

.center-toast-card {
  width: min(92vw, 460px);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(36, 27, 24, 0.12);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
  padding: 16px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.center-toast-msg {
  flex: 1;
  font-weight: 800;
  color: var(--text);
  font-size: clamp(14px, 1.1vw, 16px);
  line-height: 1.35;
  text-align: center;
}

.center-toast-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: var(--text);
  opacity: 0.35;
  cursor: pointer;
  padding: 4px 8px;
  transition: opacity 0.2s ease;
}

.center-toast-close:hover {
  opacity: 1;
}

.center-toast-fade-enter-active,
.center-toast-fade-leave-active {
  transition: all 180ms ease;
}

.center-toast-fade-enter-from,
.center-toast-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>