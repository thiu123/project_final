import { useAuthStore } from "@/stores/auth";
import axiosInstance, { setSessionHandlers } from "@/utils/axiosInstance";

// Point the shared axios instance at the configured backend origin.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  axiosInstance.defaults.baseURL = config.public.apiBase;

  if (import.meta.client) {
    setSessionHandlers({
      onRefreshed: (accessToken) => useAuthStore().setAccessToken(accessToken),
      onExpired: () => useAuthStore().logout(),
    });
  }
});
