<template>
  <div class="container container-narrow">
    <div class="row justify-content-center">
      <div class="col-12 col-md-7 col-lg-6">
        <div class="glass p-4 p-md-5">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="mb-1">Create account</h3>
              <div class="text-white-50">An elevated pastry experience, delivered.</div>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger py-2 mb-3">
            {{ error }}
          </div>

          <form @submit.prevent="submit">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label text-white-50">First name</label>
                <input v-model.trim="firstName" class="form-control input-dark" type="text" required />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label text-white-50">Last name</label>
                <input v-model.trim="lastName" class="form-control input-dark" type="text" required />
              </div>

              <div class="col-12">
                <label class="form-label text-white-50">Email</label>
                <input v-model.trim="email" class="form-control input-dark" type="email" required />
              </div>

              <div class="col-12">
                <label class="form-label text-white-50">Mobile number</label>
                <input
                  v-model.trim="mobileNo"
                  class="form-control input-dark"
                  type="tel"
                  inputmode="numeric"
                  placeholder="e.g. 09171234567"
                  required
                />
              </div>

              <div class="col-12">
                <label class="form-label text-white-50">Password</label>
                <input v-model="password" class="form-control input-dark" type="password" minlength="6" required />
              </div>

              <div class="col-12">
                <label class="form-label text-white-50">Confirm password</label>
                <input v-model="confirmPassword" class="form-control input-dark" type="password" minlength="6" required />
              </div>

              <div class="col-12 d-grid mt-2">
                <button class="btn btn-gold" type="submit" :disabled="loading">
                  {{ loading ? "Creating..." : "Register" }}
                </button>
              </div>

              <div class="col-12 text-center text-white-50">
                Already have an account?
                <router-link to="/login" class="ms-1" style="color: var(--accent)">Login</router-link>
              </div>
            </div>
          </form>
        </div>

        <div class="text-center mt-3 text-white-50" style="font-size: 13px">
          By continuing, you agree to a refined experience.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const mobileNo = ref("");
const password = ref("");
const confirmPassword = ref("");

const error = ref("");
const loading = ref(false);

function normalizeMobile(value) {
  return value.replace(/\s+/g, "");
}

async function submit() {
  error.value = "";

  if (!firstName.value || !lastName.value || !email.value || !mobileNo.value || !password.value || !confirmPassword.value) {
    error.value = "Please fill out all fields.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  try {
    await auth.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      mobileNo: normalizeMobile(mobileNo.value),
      password: password.value
    });

    router.push("/login");
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>