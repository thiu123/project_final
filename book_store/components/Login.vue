<template>
  <AuthShell
    :embedded="embedded"
    eyebrow="Sign in"
    title="Welcome back"
    subtitle="Sign in to your THBookStore account."
    panel-label="Members"
    caption="Your orders, saved books and ebooks, kept on one shelf."
  >
    <template #panel>Pick up <span class="italic">where</span> you left off.</template>

    <AuthFormMessage v-if="notice" class="mb-8">{{ notice }}</AuthFormMessage>

    <form class="grid gap-7" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="login-username" class="eyebrow mb-1 block">Username</label>
        <UiInput
          id="login-username"
          v-model="username"
          autocomplete="username"
          :class="FIELD_CLASS"
          :error-message="usernameError"
          @input="usernameError = ''"
        />
      </div>

      <div>
        <div class="mb-1 flex items-center justify-between gap-3">
          <label for="login-password" class="eyebrow">Password</label>
          <AuthTextLink
            tone="muted"
            class="text-[12px]"
            @click="$emit('toggle-forgot-password')"
          >
            Forgot password?
          </AuthTextLink>
        </div>
        <UiInput
          id="login-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          :class="[FIELD_CLASS, 'pr-9']"
          :error-message="passwordError"
          @input="passwordError = ''"
        >
          <template #append>
            <button
              type="button"
              class="-mr-3 flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="size-4" :stroke-width="1.5" />
              <Eye v-else class="size-4" :stroke-width="1.5" />
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

      <UiButton type="submit" variant="ink" size="cta" block :loading="submitting" class="mt-1 shadow-none">
        Sign in
      </UiButton>
    </form>

    <div class="my-7 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
      <span class="h-px flex-1 bg-border" />
      or
      <span class="h-px flex-1 bg-border" />
    </div>

    <AuthGoogleButton />

    <template #footer>
      New to THBookStore?
      <AuthTextLink class="text-[12px] uppercase tracking-[0.14em]" @click="$emit('toggle-sign-up')">
        Create an account
      </AuthTextLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import type { User } from "@/types";

const FIELD_CLASS =
  "h-12 rounded-none border-0 border-b bg-transparent px-0 text-[15px] shadow-none focus-visible:border-foreground focus-visible:ring-0";

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
