<template>
  <div class="relative h-screen w-full p-4">
    <div class="flex h-full items-center justify-center">
      <div class="w-full sm:w-10/12 md:w-8/12 lg:w-7/12 xl:w-6/12">
        <UiCard class="overflow-hidden rounded-lg shadow-2xl">
          <div class="grid grid-cols-12">
            <!-- Image section - hidden on xs screens -->
            <div class="relative col-span-12 hidden bg-muted md:col-span-6 md:block">
              <img
                src="~/assets/bg.jpg"
                alt="BookStore background"
                class="absolute inset-0 h-full w-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
              <div
                class="relative flex h-full min-h-[540px] flex-col items-center justify-center px-6"
              >
                <div
                  class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary"
                >
                  <BookOpen class="h-9 w-9 text-white" />
                </div>
                <h2 class="mb-2 text-3xl font-bold text-white">BookStore</h2>
                <p class="text-center text-base font-medium text-white">
                  Your gateway to endless stories and knowledge
                </p>
              </div>
            </div>

            <!-- Form section -->
            <div class="col-span-12 p-8 md:col-span-6">
              <div class="flex h-full flex-col justify-center">
                <!-- Header with theme toggle -->
                <div class="mb-6 flex items-center justify-between">
                  <!-- Logo for mobile view -->
                  <div class="flex items-center">
                    <div
                      class="mr-3 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-primary md:hidden"
                    >
                      <BookOpen class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 class="text-2xl font-bold md:hidden">BookStore</h2>
                      <h3 class="mb-1 text-2xl font-bold">Welcome back</h3>
                      <p class="text-sm font-medium text-muted-foreground">
                        Sign in to your account to continue
                      </p>
                    </div>
                  </div>
                  <ThemeToggle class="ml-2" />
                </div>

                <form @submit.prevent="onSubmit">
                  <UiInput
                    v-model="username"
                    label="Username"
                    autocomplete="username"
                    required
                    :error-message="usernameError"
                    wrapper-class="mb-4"
                    @focus="usernameError = ''"
                  >
                    <template #prepend>
                      <User class="h-4 w-4" />
                    </template>
                  </UiInput>

                  <UiInput
                    v-model="password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    required
                    :error-message="passwordError"
                    wrapper-class="mb-4"
                    @focus="passwordError = ''"
                  >
                    <template #prepend>
                      <Lock class="h-4 w-4" />
                    </template>
                    <template #append>
                      <button
                        type="button"
                        class="text-muted-foreground transition-colors hover:text-foreground"
                        :aria-label="showPassword ? 'Hide password' : 'Show password'"
                        @click="showPassword = !showPassword"
                      >
                        <EyeOff v-if="showPassword" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                    </template>
                  </UiInput>

                  <div class="mb-4 flex items-center justify-between">
                    <UiCheckbox v-model="rememberMe" label="Remember me" />
                    <UiButton
                      type="button"
                      variant="link"
                      size="sm"
                      class="text-xs"
                      @click="$emit('toggleLinkForgotPassword')"
                    >
                      Forgot password?
                    </UiButton>
                  </div>

                  <UiButton
                    type="submit"
                    block
                    size="lg"
                    :loading="isFetching"
                    class="mb-4 shadow"
                  >
                    <LogIn class="mr-1 h-5 w-5" />
                    Sign In
                  </UiButton>

                  <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="-translate-y-1 opacity-0"
                    enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <UiAlert
                      v-if="errorMessage"
                      variant="error"
                      closable
                      class="mb-4"
                      @close="errorMessage = ''"
                    >
                      {{ errorMessage }}
                    </UiAlert>
                  </Transition>

                  <UiSeparator class="mb-4" />

                  <div class="mb-2 text-center">
                    <span class="text-sm text-muted-foreground"
                      >Don't have an account?
                    </span>
                    <UiButton
                      type="button"
                      variant="link"
                      class="px-1 font-medium"
                      @click="$emit('toggleLinkSignUp', 'sign-up')"
                    >
                      Sign Up
                    </UiButton>
                  </div>

                  <!-- Social login options -->
                  <div>
                    <p class="mb-4 text-center text-sm text-muted-foreground">
                      Or continue with
                    </p>
                    <div class="flex justify-center gap-3">
                      <UiButton
                        type="button"
                        variant="outline"
                        class="rounded-lg shadow"
                        @click="socialLogin('google')"
                      >
                        <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="#4285F4"
                            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                          />
                        </svg>
                        Google
                      </UiButton>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { BookOpen, Eye, EyeOff, Lock, LogIn, User } from "lucide-vue-next";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { SnackbarPayload } from "@/types";

const emit = defineEmits<{
  (e: "show-snackbar", payload: SnackbarPayload): void;
  (e: "toggleLinkSignUp", tab: string): void;
  (e: "toggleLinkForgotPassword"): void;
}>();

const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const authStore = useAuthStore();
const cartStore = useCartStore();
const { currentUser, isFetching } = storeToRefs(authStore);

const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);

const usernameError = ref("");
const passwordError = ref("");
const errorMessage = ref("");

function validate(): boolean {
  usernameError.value = username.value ? "" : "Username is required";
  passwordError.value = password.value ? "" : "Password is required";
  return !usernameError.value && !passwordError.value;
}

async function onSubmit() {
  if (!validate()) return;

  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });

    await cartStore.fetchCart();
    errorMessage.value = "";

    emit("show-snackbar", {
      message: `Welcome back, ${currentUser.value?.username || "User"}!`,
      color: "success",
    });

    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (error: any) {
    console.error("Login failed:", error);

    const message =
      error.response?.data?.message ||
      error.message ||
      "Login failed. Please check your credentials.";
    errorMessage.value = message;
    emit("show-snackbar", {
      message,
      color: "error",
    });
  }
}

function socialLogin(provider: string) {
  if (provider === "google") {
    try {
      // Redirect to Google OAuth
      const baseUrl = runtimeConfig.public.apiBase;
      window.location.href = `${baseUrl}${API_ENDPOINTS.AUTH}/google`;
    } catch (error: any) {
      console.error("Google login error:", error);
      emit("show-snackbar", {
        message: "Google login failed. Please try again.",
        color: "error",
      });
    }
  }
}
</script>
