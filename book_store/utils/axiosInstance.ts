import axios, { type AxiosError } from "axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    authRetried?: boolean;
  }
}

interface SessionHandlers {
  onRefreshed: (accessToken: string) => void;
  onExpired: () => void;
}

const axiosInstance = axios.create({
  // Overridden at startup by plugins/api.ts with runtimeConfig.public.apiBase
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

let sessionHandlers: SessionHandlers | null = null;
let pendingRefresh: Promise<string> | null = null;

export function setSessionHandlers(handlers: SessionHandlers) {
  sessionHandlers = handlers;
}

function refreshAccessToken(): Promise<string> {
  pendingRefresh ??= axiosInstance
    .post<{ accessToken: string }>(`${API_ENDPOINTS.AUTH}/refresh`, null, {
      skipAuthRefresh: true,
    })
    .then(({ data }) => {
      localStorage.setItem("accessToken", data.accessToken);
      sessionHandlers?.onRefreshed(data.accessToken);
      return data.accessToken;
    })
    .catch((error) => {
      localStorage.removeItem("accessToken");
      sessionHandlers?.onExpired();
      throw error;
    })
    .finally(() => {
      pendingRefresh = null;
    });

  return pendingRefresh;
}

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    const shouldRefresh =
      import.meta.client &&
      error.response?.status === 401 &&
      original &&
      !original.skipAuthRefresh &&
      !original.authRetried &&
      Boolean(original.headers?.token);

    if (!shouldRefresh) return Promise.reject(error);

    original.authRetried = true;
    try {
      const accessToken = await refreshAccessToken();
      original.headers.token = `Bearer ${accessToken}`;
      return axiosInstance(original);
    } catch {
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
