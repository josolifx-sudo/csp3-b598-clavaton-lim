import { defineStore } from "pinia";
import api from "../api/axios";

/**
 * DEFINITION: Cart Store
 * USE: Manages the user's shopping bag. It communicates with the backend
 * to sync items and calculates the detailed info needed for the UI.
 */
export const useCartStore = defineStore("cart", {
  state: () => ({
    cartDoc: null,        // The raw "document" from the database (IDs and totals)
    itemsDetailed: [],    // The "Enriched" list (Names, Prices, Images)
    loading: false,       // Used to show a spinner while fetching
    error: ""             // Stores error messages if the API fails
  }),

  getters: {
    // Returns the detailed items for the Navbar and Cart page
    items: (s) => s.itemsDetailed,
    // Returns the total price, defaulting to 0 if the cart is empty
    total: (s) => s.cartDoc?.totalPrice || 0
  },

  actions: {
    /**
     * DEFINITION: fetchCart (The Multi-Step Sync)
     * This is complex because the database usually only stores productId.
     * We need to fetch the full product info for every item in the cart.
     */
    async fetchCart() {
      this.loading = true;
      this.error = "";

      try {
        const res = await api.get("/cart/get-cart");
        const cartDoc = res.data?.cart || null;

        if (cartDoc && Array.isArray(cartDoc.cartItems)) {
          this.cartDoc = cartDoc;

          /**
           * DATA ENRICHMENT: Promise.all
           * Logic: For every item in the cart, fire off an API request to get
           * the product's name and price. We do this in parallel for speed.
           */
          const detailed = await Promise.all(
            cartDoc.cartItems.map(async (item) => {
              try {
                const pRes = await api.get(`/products/${item.productId}`);
                const p = pRes.data;

                return {
                  productId: item.productId,
                  name: p?.name || "Unknown product",
                  price: Number(p?.price || 0),
                  quantity: item.quantity,
                  subtotal: item.subtotal
                };
              } catch {
                // Fallback if a product was deleted from the store but is still in the cart
                return {
                  productId: item.productId,
                  name: "Unknown product",
                  price: 0,
                  quantity: item.quantity,
                  subtotal: item.subtotal
                };
              }
            })
          );

          this.itemsDetailed = detailed;
        } else {
          // Reset if cartDoc is empty or null
          this.cartDoc = { cartItems: [], totalPrice: 0 };
          this.itemsDetailed = [];
        }
      } catch (e) {
        // Handle 404 (New users often don't have a cart record yet)
        const msg = e?.response?.data?.message || "";
        if (e?.response?.status === 404 || msg.toLowerCase().includes("cart not found")) {
          this.cartDoc = { cartItems: [], totalPrice: 0 };
          this.itemsDetailed = [];
        } else {
          this.error = "Failed to load cart.";
        }
      } finally {
        this.loading = false;
      }
    },

    /**
     * DEFINITION: Mutator Actions
     * Every action below follows the same pattern:
     * 1. Tell the Server to change the cart.
     * 2. Call fetchCart() to refresh the data so the UI updates.
     */
    async addToCart(productId, quantity) {
      await api.post("/cart/add-to-cart", { productId, quantity });
      await this.fetchCart();
    },

    async updateQuantity(productId, newQuantity) {
      await api.patch("/cart/update-cart-quantity", { productId, newQuantity });
      await this.fetchCart();
    },

    async removeItem(productId) {
      await api.patch(`/cart/${productId}/remove-from-cart`);
      await this.fetchCart();
    },

    async clearCart() {
      await api.put("/cart/clear-cart");
      await this.fetchCart();
    }
  }
});