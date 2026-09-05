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
                  Join thousands of book lovers today
                </p>
              </div>
            </div>

            <!-- Form section -->
            <div class="col-span-12 p-8 md:col-span-6">
              <div class="flex h-full flex-col justify-center">
                <!-- Header -->
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
                      <h3 class="mb-1 text-2xl font-bold">Create Account</h3>
                      <p class="text-sm font-medium text-muted-foreground">
                        Start your reading journey today
                      </p>
                    </div>
                  </div>
                </div>

                <form @submit.prevent="onSubmit">
                  <UiInput
                    v-model="email"
                    label="Email Address"
                    type="email"
                    autocomplete="email"
                    required
                    :error-message="emailError"
                    wrapper-class="mb-4"
                    @focus="emailError = ''"
                  >
                    <template #prepend>
                      <Mail class="h-4 w-4" />
                    </template>
                  </UiInput>

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
                    autocomplete="new-password"
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

                  <UiInput
                    v-model="confirmPassword"
                    label="Confirm Password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    :error-message="confirmPasswordError"
                    wrapper-class="mb-3"
                    @focus="confirmPasswordError = ''"
                  >
                    <template #prepend>
                      <LockKeyhole class="h-4 w-4" />
                    </template>
                    <template #append>
                      <button
                        type="button"
                        class="text-muted-foreground transition-colors hover:text-foreground"
                        :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                        @click="showConfirmPassword = !showConfirmPassword"
                      >
                        <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                    </template>
                  </UiInput>

                  <div class="mb-6">
                    <UiCheckbox
                      v-model="agreeToTerms"
                      @update:model-value="termsError = ''"
                    >
                      <span class="text-xs" v-html="termsLabelHtml"></span>
                    </UiCheckbox>
                    <p v-if="termsError" class="mt-1 text-xs text-destructive">
                      {{ termsError }}
                    </p>
                  </div>

                  <UiButton
                    type="submit"
                    block
                    size="lg"
                    :disabled="!agreeToTerms"
                    class="mb-6 shadow"
                  >
                    <UserPlus class="mr-1 h-5 w-5" />
                    Create Account
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
                      class="mb-6"
                      @close="errorMessage = ''"
                    >
                      {{ errorMessage }}
                    </UiAlert>
                  </Transition>

                  <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="-translate-y-1 opacity-0"
                    enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <UiAlert
                      v-if="successMessage"
                      variant="success"
                      closable
                      class="mb-6"
                      @close="successMessage = ''"
                    >
                      {{ successMessage }}
                    </UiAlert>
                  </Transition>

                  <UiSeparator class="mb-3" />

                  <div class="mb-1 text-center">
                    <span class="text-sm text-muted-foreground"
                      >Already have an account?
                    </span>
                    <UiButton
                      type="button"
                      variant="link"
                      class="px-1 font-medium"
                      @click="$emit('toggleLinkSignIn', 'sign-in')"
                    >
                      Sign In
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
                        @click="socialSignup('google')"
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
import { useAuthStore } from "@/stores/auth";
import {
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  Mail,
  User,
  UserPlus,
} from "lucide-vue-next";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const emit = defineEmits<{
  (e: "checkIsSignUp", value: boolean): void;
  (e: "toggleLinkSignIn", tab: string): void;
}>();

const runtimeConfig = useRuntimeConfig();
const authStore = useAuthStore();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeToTerms = ref(false);

const emailError = ref("");
const usernameError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const termsError = ref("");
const errorMessage = ref("");
const successMessage = ref("");

const termsLabelHtml =
  'I agree to the <span class="text-blue-500 underline">Term Of Use</span>';

type Rule = (v: string) => true | string;

const emailRules: Rule[] = [
  (v) => !!v || "Email is required",
  (v) => /^\S+@\S+\.\S+$/.test(v) || "Email is invalid",
];
const usernameRules: Rule[] = [
  (v) => !!v || "Username is required",
  (v) => v.length >= 3 || "Username must be at least 3 characters",
  (v) =>
    /^[a-zA-Z0-9_]+$/.test(v) ||
    "Username can only contain letters, numbers, and underscores",
];
const passwordRules: Rule[] = [
  (v) => !!v || "Password is required",
  (v) => v.length >= 6 || "Password must be at least 6 characters",
  (v) => /[A-Z]/.test(v) || "Password must contain at least 1 uppercase letter",
  (v) => /[0-9]/.test(v) || "Password must contain at least 1 number",
];
const confirmPasswordRules: Rule[] = [
  (v) => !!v || "Please confirm your password",
  (v) => v === password.value || "Passwords don't match",
];

function runRules(rules: Rule[], value: string): string {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return "";
}

function validateForm(): boolean {
  emailError.value = runRules(emailRules, email.value);
  usernameError.value = runRules(usernameRules, username.value);
  passwordError.value = runRules(passwordRules, password.value);
  confirmPasswordError.value = runRules(confirmPasswordRules, confirmPassword.value);
  // Terms of use validation (message preserved from the original rules)
  termsError.value = agreeToTerms.value
    ? ""
    : "You must agree to the terms of use to continue";

  return (
    !emailError.value &&
    !usernameError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
}

function resetForm() {
  username.value = "";
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  agreeToTerms.value = false;
  emailError.value = "";
  usernameError.value = "";
  passwordError.value = "";
  confirmPasswordError.value = "";
  termsError.value = "";
}

async function onSubmit() {
  // Validate form before submitting
  const valid = validateForm();

  if (!valid) {
    errorMessage.value = "Please fill in all required fields and fix the errors";
    return;
  }

  if (!agreeToTerms.value) {
    errorMessage.value = "You must agree to the terms of use to continue";
    return;
  }

  // Reset error messages
  errorMessage.value = "";
  emailError.value = "";
  usernameError.value = "";
  passwordError.value = "";
  confirmPasswordError.value = "";

  try {
    const data = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    successMessage.value =
      "Account registration successful! You can now log in.";
    emit("checkIsSignUp", true);

    resetForm();
    return data;
  } catch (error: any) {
    console.error("Registration failed:", error);

    // The auth store rethrows `err.response?.data` (the server payload) or a
    // plain message string, so support both that shape and a raw axios error.
    const data =
      error?.response?.data ??
      (error && typeof error === "object" ? error : null);

    if (data) {
      if (data.message) {
        errorMessage.value = data.message;
      } else if (data.error) {
        errorMessage.value = data.error;
      } else {
        errorMessage.value = "Registration failed. Please try again later.";
      }

      if (data.errors) {
        if (data.errors.email) {
          emailError.value = data.errors.email;
        }
        if (data.errors.username) {
          usernameError.value = data.errors.username;
        }
        if (data.errors.password) {
          passwordError.value = data.errors.password;
        }
      }
    } else {
      errorMessage.value = "Connection error. Please try again later.";
    }
  }
}

function socialSignup(provider: string) {
  if (provider === "google") {
    try {
      // Redirect to Google OAuth (same endpoint for login/signup)
      const baseUrl = runtimeConfig.public.apiBase;
      window.location.href = `${baseUrl}${API_ENDPOINTS.AUTH}/google`;
    } catch (error: any) {
      console.error("Google signup error:", error);
    }
  }
}
</script>
