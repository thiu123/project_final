import axiosInstance from "@/utils/axiosInstance";

// Point the shared axios instance at the configured backend origin.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  axiosInstance.defaults.baseURL = config.public.apiBase;
});
