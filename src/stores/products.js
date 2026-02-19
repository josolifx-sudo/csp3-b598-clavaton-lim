import { defineStore } from "pinia";
import api from "../api/axios";

/**
 * DEFINITION: Products Store
 * USE: Manages the catalog of treats. It handles displaying products to
 * customers and provides the administrative tools to create or hide items.
 */
export const useProductsStore = defineStore("products", {
  /**
   * STATE: The data containers for your catalog.
   */
  state: () => ({
    active: [],    // Products currently for sale (visible to customers)
    all: [],       // Every product in the database (visible to admins)
    selected: null,// Data for a single product (used for the Details page)
    loading: false,// UI state to show spinners during catalog loads
    error: ""      // Stores feedback if the shop fails to load
  }),

  /**
   * ACTIONS: The business logic for inventory management.
   */
  actions: {
    /**
     * DEFINITION: fetchActive()
     * USE: Gets the list of pastries that are currently "Live" on the site.
     * Customers use this to browse the shop.
     */
    async fetchActive() {
      this.loading = true;
      this.error = "";
      try {
        const res = await api.get("/products/active");
        // Ensures we always store an array, even if the backend is empty
        this.active = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        // Advanced error grabbing: checks multiple spots for a server message
        this.error =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to load products.";
      } finally {
        this.loading = false;
      }
    },

    /**
     * DEFINITION: fetchOne(id)
     * USE: Gets full details for a single pastry (description, ingredients, etc.).
     * This powers the "Product Details" view.
     */
    async fetchOne(id) {
      this.error = "";
      const res = await api.get(`/products/${id}`);
      this.selected = res.data;
      return this.selected;
    },

    /**
     * DEFINITION: fetchAllAdmin()
     * USE: Retrieves the master list for the Admin Dashboard. 
     * Includes out-of-stock or hidden items.
     */
    async fetchAllAdmin() {
      const res = await api.get("/products/all");
      this.all = Array.isArray(res.data) ? res.data : [];
    },

    /**
     * ADMIN ACTIONS:
     * These functions allow management of the catalog. 
     * They return the API response directly so the component can 
     * show a success message or redirect the user.
     */
    async addProduct(payload) {
      return api.post("/products", payload);
    },

    async updateProduct(id, payload) {
      return api.patch(`/products/${id}/update`, payload);
    },

    /**
     * ARCHIVE/ACTIVATE:
     * Instead of deleting products (which breaks old order records), 
     * we "archive" them to hide them from customers.
     */
    async archiveProduct(id) {
      return api.patch(`/products/${id}/archive`);
    },

    async activateProduct(id) {
      return api.patch(`/products/${id}/activate`);
    }
  }
});