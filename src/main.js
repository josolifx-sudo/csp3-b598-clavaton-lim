import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./pinia";

import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

createApp(App).use(pinia).use(router).mount("#app");
