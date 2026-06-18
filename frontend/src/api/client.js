import axios from "axios";

const baseURL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (
    !baseURL.endsWith("/api") &&
    config.url &&
    !config.url.startsWith("/api/")
  ) {
    config.url = `/api${config.url.startsWith("/") ? "" : "/"}${config.url}`;
  }
  const token = localStorage.getItem("fitconnection_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
