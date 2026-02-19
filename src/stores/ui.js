import { defineStore } from "pinia";

/**
 * DEFINITION: UI Store
 * USE: A central "manager" for interface-wide elements.
 */
export const useUiStore = defineStore("ui", {
  state: () => ({
    // existing toast stack (top right)
    toasts: [],

    // new: single centered toast (one at a time)
    centerToast: null
  }),

  actions: {
    /**
     * Existing: top right stacked toast
     */
    toast(message, type = "success") {
      const id = crypto?.randomUUID?.() || String(Date.now() + Math.random());

      this.toasts.push({ id, message, type });

      setTimeout(() => {
        this.removeToast(id);
      }, 2400);
    },

    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },

    /**
     * New: centered single toast
     * Always replaces the previous one, so you only ever see ONE at a time.
     */
    centerToastNotify(message, timeout = 2200) {
      this.centerToast = { message };

      setTimeout(() => {
        this.clearCenterToast();
      }, timeout);
    },

    clearCenterToast() {
      this.centerToast = null;
    }
  }
});