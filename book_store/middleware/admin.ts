import { useAuthStore } from "@/stores/auth";
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.client) {
    const authStore = useAuthStore();
    authStore.restoreSession();

    const user = authStore.currentUser;
    const accessToken = authStore.accessToken;

    if (!user || !accessToken) {
      return navigateTo("/");
    }

    if (!user.admin) {
      return navigateTo("/");
    }
  }
});
