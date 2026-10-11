<template>
  <AuthShell
    :embedded="embedded"
    title="Welcome back"
    subtitle="Sign in to your THBookStore account."
    caption="Your saved books, orders and ebooks in one place."
  >
    <AuthFormMessage v-if="notice" class="mb-5">{{ notice }}</AuthFormMessage>

    <AuthGoogleButton />

    <div class="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span class="h-px flex-1 bg-border" />
      or
      <span class="h-px flex-1 bg-border" />
    </div>

    <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
      <UiInput
        id="login-username"
        v-model="username"
        label="Username"
        autocomplete="username"
        class="h-10"
        :error-message="usernameError"
        @input="usernameError = ''"
      />

      <div>
        <div class="mb-1.5 flex items-center justify-between gap-3">
          <UiLabel for="login-password">Password</UiLabel>
          <AuthTextLink class="text-xs" @click="$emit('toggle-forgot-password')">
            Forgot password?
          </AuthTextLink>
        </div>
        <UiInput
          id="login-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          class="h-10"
          :error-message="passwordError"
          @input="passwordError = ''"
        >
          <template #append>
            <button
              type="button"
              class="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </template>
        </UiInput>
      </div>

      <Transition
        enter-active-class="motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="motion-safe:transition motion-safe:duration-150"
        leave-to-class="opacity-0"
      >
        <AuthFormMessage v-if="errorMessage" tone="error">
          {{ errorMessage }}
        </AuthFormMessage>
      </Transition>

      <UiButton type="submit" variant="ink" size="lg" block :loading="submitting" class="mt-1">
        Sign in
      </UiButton>
    </form>

    <template #footer>
      New to THBookStore?
      <AuthTextLink @click="$emit('toggle-sign-up')">Sign up</AuthTextLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import type { User } from "@/types";

withDefaults(
  defineProps<{
    notice?: string;
    embedded?: boolean;
  }>(),
  { notice: "", embedded: false }
);

const emit = defineEmits<{
  (e: "signed-in", user: User): void;
  (e: "toggle-sign-up"): void;
  (e: "toggle-forgot-password"): void;
}>();

const authStore = useAuthStore();
const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const submitting = ref(false);

const usernameError = ref("");
const passwordError = ref("");
const errorMessage = ref("");

function validate(): boolean {
  usernameError.value = username.value.trim() ? "" : "Enter your username";
  passwordError.value = password.value ? "" : "Enter your password";
  return !usernameError.value && !passwordError.value;
}

async function onSubmit() {
  errorMessage.value = "";
  if (!validate()) return;

  submitting.value = true;
  try {
    const user = await authStore.login({
      username: username.value.trim(),
      password: password.value,
    });

    // Both lists belong to the account that just signed in, so force a refresh
    // rather than reusing whatever the previous session left cached.
    await Promise.all([
      cartStore.fetchCart(),
      favoriteStore.getFavoritesForEachUser({ force: true }),
    ]);

    emit("signed-in", user);
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      "Could not sign in. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>
