import { useStore } from "vuex";

export default defineNuxtRouteMiddleware(async (to) => {
  const store = useStore();
  const isClient = import.meta.client;

  if (isClient) {
    await store.dispatch("auth/restoreSession");

    const user = store.state.auth.currentUser;
    const accessToken = store.state.auth.accessToken;

    // console.log("🔍 Admin Middleware Debug (Client only):");
    // console.log("User:", user);
    // console.log("AccessToken:", accessToken);

    if (!user || !accessToken) {
      // console.log("❌ No user or token - redirecting to login");
      return navigateTo("/");
    }

    if (!user.admin) {
      // console.log("❌ User is not admin:", user.admin);
      return navigateTo("/");
    }

    // console.log("✅ Admin access granted");
  }
});
