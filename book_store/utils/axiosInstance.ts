import axios from "axios";

const axiosInstance = axios.create({
  // Overridden at startup by plugins/api.ts with runtimeConfig.public.apiBase
  baseURL: "http://localhost:5000",
});

// Attach the logged-in user's token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  if (import.meta.client) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.token = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Clear a stale/invalid token so the app doesn't keep sending it
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.client && error.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
