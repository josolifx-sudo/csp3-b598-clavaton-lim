import { defineStore } from "pinia";
import api from "../api/axios"; // Your pre-configured Axios instance for API calls

/**
 * DEFINITION: Auth Store
 * USE: This manages the user's "Session." It stores the security token 
 * and user profile details so they are accessible by any component.
 */
export const useAuthStore = defineStore("auth", {
  /**
   * STATE: The raw data stored in memory.
   * We initialize these by checking 'localStorage' so the user 
   * stays logged in even if they close the browser tab.
   */
  state: () => ({
    // Retrieves the saved JWT string or defaults to empty
    token: localStorage.getItem("token") || "",
    // Parses the saved user JSON string back into a JavaScript Object
    user: JSON.parse(localStorage.getItem("user") || "null")
  }),

  /**
   * GETTERS: Computed properties for the store.
   * Use these to quickly check the user's status.
   */
  getters: {
  isLoggedIn: (s) => !!s.token,
  // Checks for both string "Admin" and a possible boolean "isAdmin"
  isAdmin: (s) => {
    return s.user?.role === "Admin" || s.user?.role === "admin" || s.user?.isAdmin === true;
  }
},

  /**
   * ACTIONS: Functions that handle logic and API communication.
   */
  actions: {
    /**
     * REGISTER: Sends user data to the backend to create a new account.
     */
    async register(payload) {
      return api.post("/users/register", payload);
    },

    /**
     * LOGIN: A multi-step process:
     * 1. Send credentials to the server.
     * 2. Save the security token (JWT).
     * 3. Fetch the full user profile details.
     */
    async login(payload) {
  const res = await api.post("/users/login", payload);

  // 1. Extract and save the token
  const token = res.data?.access || res.data?.token || res.data?.accessToken;
  if (!token) throw new Error("Token not found in login response.");

  this.token = token;
  localStorage.setItem("token", token);

  // 2. PASTE THE NEW LOGIC HERE:
  // This fetches the full profile (name, role, payment methods) from AWS
  const details = await api.get("/users/details");
  console.log("User Profile Loaded:", details.data.user); // Good for debugging your "invisible" checkout!
  
  const userObj = details.data?.user ?? details.data;

  // 3. Save the full user object
  this.user = userObj;
  localStorage.setItem("user", JSON.stringify(userObj));
},

    /**
     * LOGOUT: The "Cleanup" function.
     * Wipes all data from memory and local storage to secure the account.
     */
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
});