import { defineStore } from "pinia";
import api from "../api/axios";
import { useUiStore } from "./ui";

/**
 * DEFINITION: Auth Store
 * USE: This manages the user's session.
 */
export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user") || "null")
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => {
      return s.user?.role === "Admin" || s.user?.role === "admin" || s.user?.isAdmin === true;
    }
  },

  actions: {
    async register(payload) {
      return api.post("/users/register", payload);
    },

    async login(payload) {
      const res = await api.post("/users/login", payload);

      const token = res.data?.access || res.data?.token || res.data?.accessToken;
      if (!token) throw new Error("Token not found in login response.");

      this.token = token;
      localStorage.setItem("token", token);

      
      const details = await api.get("/users/details");
      const userObj = details.data?.user ?? details.data;

      this.user = userObj;
      localStorage.setItem("user", JSON.stringify(userObj));

      
      const ui = useUiStore();
      ui.centerToastNotify("Successfully logged in");
    },

    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      
      const ui = useUiStore();
      ui.centerToastNotify("Successfully logged out");
    }
  }
});