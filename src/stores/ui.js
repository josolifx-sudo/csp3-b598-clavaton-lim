import { defineStore } from "pinia";

/**
 * DEFINITION: UI Store
 * USE: A central "manager" for interface-wide elements. Instead of having 
 * every page create its own notifications, they all send messages here.
 */
export const useUiStore = defineStore("ui", {
  // state: The data being watched (the list of active messages)
  state: () => ({
    toasts: []
  }),

  actions: {
    /**
     * DEFINITION: toast()
     * USE: The main function to trigger a popup.
     * 1. Generates a unique ID (using modern crypto or a fallback).
     * 2. Pushes the message into the stack.
     * 3. Sets a timer to auto-delete the message after 2.4 seconds.
     */
    toast(message, type = "success") {
      // Creates a unique fingerprint for each message so Vue can track it
      const id = crypto?.randomUUID?.() || String(Date.now() + Math.random());
      
      this.toasts.push({ id, message, type });

      // Logic: Wait 2400ms, then run the filter to remove the specific ID
      setTimeout(() => {
        this.removeToast(id);
      }, 2400);
    },

    /**
     * DEFINITION: removeToast()
     * USE: Deletes a message immediately. 
     * We separated this so it can be called by the timer OR the 'X' button.
     */
    removeToast(id) {
      // .filter creates a new list excluding the one with the matching ID
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
});