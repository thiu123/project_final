import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.BASE_URL || "http://localhost:5000",
});

// Attach the logged-in user's token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.token = `Bearer ${accessToken}`;
  }
  return config;
});

// Clear a stale/invalid token so the app doesn't keep sending it
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
 