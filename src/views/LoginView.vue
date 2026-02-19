<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

// HOOKS
const router = useRouter(); // For navigation
const auth = useAuthStore(); // For API communication and state

// REACTIVE STATE
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

/**
 * SUBMIT LOGIC: Handles the login lifecycle.
 */
async function submit() {
  error.value = "";

  // Basic validation before hitting the API
  if (!email.value || !password.value) {
    error.value = "Please enter your email and password.";
    return;
  }

  loading.value = true;
  try {
    // 1. Attempt login via Pinia store (which likely stores the JWT/Token)
    await auth.login({ email: email.value, password: password.value });

    // 2. ROLE-BASED REDIRECTION
    // If the store identifies the user as an admin, send them to the dashboard
    if (auth.isAdmin) {
        router.push("/admin/products");
    } else {
        router.push("/products");
    }
  } catch (e) {
    // 3. ERROR HANDLING
    // Pulls error message from server response or provides a fallback
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Login failed. Please check your credentials.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container container-narrow">
    <div class="row justify-content-center">
      <div class="col-12 col-md-7 col-lg-6">
        <div class="glass p-4 p-md-5">
          <h3 class="mb-1">Welcome back</h3>
          <div class="text-white-50 mb-4">Sign in to continue.</div>

          <div v-if="error" class="alert alert-danger py-2 mb-3">
            {{ error }}
          </div>

          <form @submit.prevent="submit">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label text-white-50">Email</label>
                <input v-model.trim="email" class="form-control input-dark" type="email" required />
              </div>

              <div class="col-12">
                <label class="form-label text-white-50">Password</label>
                <input v-model="password" class="form-control input-dark" type="password" required />
              </div>

              <div class="col-12 d-grid mt-2">
                <button class="btn btn-gold" type="submit" :disabled="loading">
                  {{ loading ? "Signing in..." : "Login" }}
                </button>
              </div>

              <div class="col-12 text-center text-white-50">
                New here?
                <router-link to="/register" class="ms-1" style="color: var(--accent)">Create an account</router-link>
              </div>
            </div>
          </form>
        </div>

        <div class="text-center mt-3 text-white-50" style="font-size: 13px">
          For admin access, use your admin credentials.
        </div>
      </div>
    </div>
  </div>
</template>

