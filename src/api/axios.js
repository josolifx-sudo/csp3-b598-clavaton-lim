import axios from "axios";//bridge  from frontend to backend

const api = axios.create({
  baseURL: "https://oky7mroeud.execute-api.us-east-2.amazonaws.com/production",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;