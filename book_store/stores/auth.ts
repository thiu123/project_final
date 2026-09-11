import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  loginUser,
  registerUser,
  changePassword as changePasswordApi,
  type LoginPayload,
  type RegisterPayload,
  type ChangePasswordPayload,
} from "@/api/authApi";
import type { User } from "@/types";

export const useAuthStore = defineStore("auth", () => {
  const currentUser = ref<User | null>(
    import.meta.client
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null
  );
  const accessToken = ref<string>(
    import.meta.client ? localStorage.getItem("accessToken") || "" : ""
  );
  const isFetching = ref(false);
  const error = ref(false);

  function loginSuccess(user: User) {
    currentUser.value = user;
    accessToken.value = user.accessToken || "";
    localStorage.setItem("accessToken", accessToken.value);
    localStorage.setItem("currentUser", JSON.stringify(user));
    isFetching.value = false;
    error.value = false;
  }

  async function login(user: LoginPayload) {
    try {
      isFetching.value = true;
      error.value = false;
      const res = await loginUser(user);
      loginSuccess(res.data);
      return res.data;
    } catch (err: any) {
      isFetching.value = false;
      error.value = true;
      console.error(
        "Login error:",
        err.response ? err.response.data : err.message
      );
      throw err;
    }
  }

  function logout() {
    currentUser.value = null;
    accessToken.value = "";
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");

    const cartStore = useCartStore();
    const favoriteStore = useFavoriteStore();
    cartStore.clearCart();
    favoriteStore.clearFavorites();
  }

  async function register(user: RegisterPayload) {
    try {
      const res = await registerUser(user);
      return res.data;
    } catch (err: any) {
      throw err.response?.data || err.message;
    }
  }

  async function changePassword(passwordData: ChangePasswordPayload) {
    try {
      const res = await changePasswordApi(passwordData);
      return res.data;
    } catch (err: any) {
      throw err.response?.data || err.message;
    }
  }

  function restoreSession() {
    if (!import.meta.client) return;
    currentUser.value = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    accessToken.value = localStorage.getItem("accessToken") || "";
  }

  return {
    currentUser,
    accessToken,
    isFetching,
    error,
    login,
    logout,
    register,
    changePassword,
    restoreSession,
    loginSuccess,
  };
});
