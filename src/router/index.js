import { createRouter, createWebHistory } from "vue-router";
import { pinia } from "../pinia";
import { useAuthStore } from "../stores/auth";

// IMPORT: Page Components
import HomeView from "../views/HomeView.vue";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import ProductsView from "../views/ProductsView.vue";
import ProductDetailsView from "../views/ProductDetailsView.vue";
import CartView from "../views/CartView.vue";
import AdminProductsView from "../views/AdminProductsView.vue";
import OrdersView from "../views/OrdersView.vue";
import PaymentView from "../views/PaymentView.vue";
import PaymentSuccess from "../views/PaymentSuccess.vue";
import SetUpSuccess from "../views/SetUpSuccess.vue";
import AdminPayments from "../views/AdminPayment.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/register", component: RegisterView, meta: { guestOnly: true } },
  { path: "/login", component: LoginView, meta: { guestOnly: true } },
  { path: "/products", component: ProductsView },
  { path: "/products/:id", component: ProductDetailsView },
  { path: "/orders", component: OrdersView, meta: { requiresAuth: true } },
  { path: "/cart", component: CartView, meta: { requiresAuth: true } },
  { 
    path: "/payment", 
    name: "payment", 
    component: PaymentView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: "/payment-success", 
    name: "payment-success", 
    component: PaymentSuccess, 
    meta: { requiresAuth: true } 
  },
  {
    path: "/settings/payments",
    name: "PaymentSettings",
    component: () => import("../views/PaymentSettings.vue"),
    meta: { 
      requiresAuth: true, 
      userOnly: true 
    }
  },
  {
  path: "/setup-success",
  component: () => import("../views/SetupSuccess.vue"),
  meta: { requiresAuth: true }
  },
  {
  path: "/admin/payments",
  component: () => import("../views/AdminPayment.vue"),
  meta: { requiresAuth: true, requiresAdmin: true }
  },

  { 
    path: "/admin/products", 
    component: AdminProductsView, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth = useAuthStore(pinia); // ✅ pass pinia explicitly

  if (to.meta.requiresAuth && !auth.isLoggedIn) return "/login";
  if (to.meta.guestOnly && auth.isLoggedIn) return "/products";
  if (to.meta.requiresAdmin && !auth.isAdmin) return "/products";
  if (to.meta.userOnly && auth.isAdmin) return "/products";

  return true;
});

export default router;