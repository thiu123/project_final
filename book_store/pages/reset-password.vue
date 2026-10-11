<template>
  <div
    class="w-full max-w-md overflow-hidden rounded-xl border border-border shadow-[0_24px_60px_-28px_hsl(var(--foreground)/0.25)] dark:shadow-none"
  >
    <AuthShell
      title="Choose a new password"
      :subtitle="done ? 'Your password has been changed.' : 'Enter a new password for your account.'"
    >
      <AuthFormMessage v-if="!token" tone="error">
        This reset link is incomplete. Request a new one from the sign-in page.
      </AuthFormMessage>

      <div v-else-if="done" class="grid gap-4">
        <AuthFormMessage tone="success">
          You can sign in with your new password. Other devices have been signed out.
        </AuthFormMessage>
        <UiButton variant="ink" size="lg" block @click="router.push('/login')">
          Sign in
        </UiButton>
      </div>

      <form v-else class="grid gap-4" novalidate @submit.prevent="handleSubmit">
        <UiInput
          id="reset-password"
          v-model="newPassword"
          label="New password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          class="h-10"
          hint="At least 6 characters."
          :error-message="newPasswordError"
          @input="newPasswordError = ''"
        >
          <template #append>
            <button
              type="button"
              class="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </template>
        </UiInput>

        <UiInput
          id="reset-confirm"
          v-model="confirmPassword"
          label="Confirm new password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          class="h-10"
          :error-message="confirmPasswordError"
          @input="confirmPasswordError = ''"
        />

        <AuthFormMessage v-if="errorMessage" tone="error">
          {{ errorMessage }}
        </AuthFormMessage>

        <UiButton type="submit" variant="ink" size="lg" block :loading="loading" class="mt-1">
          Save new password
        </UiButton>
      </form>

      <template v-if="!done" #footer>
        <AuthTextLink to="/login">
          <ArrowLeft class="h-4 w-4" />
          Back to sign in
        </AuthTextLink>
      </template>
    </AuthShell>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { ArrowLeft, Eye, EyeOff } from "lucide-vue-next";
import { resetPassword } from "~/api/authApi";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const router = useRouter();

const token = computed(() =>
  typeof route.query.token === "string" ? route.query.token : ""
);

const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const newPasswordError = ref("");
const confirmPasswordError = ref("");
const errorMessage = ref("");
const loading = ref(false);
const done = ref(false);

function validate(): boolean {
  newPasswordError.value =
    newPassword.value.length >= 6 ? "" : "Use at least 6 characters";
  confirmPasswordError.value = !confirmPassword.value
    ? "Repeat your new password"
    : confirmPassword.value !== newPassword.value
      ? "Passwords do not match"
      : "";
  return !newPasswordError.value && !confirmPasswordError.value;
}

async function handleSubmit() {
  errorMessage.value = "";
  if (!validate()) return;

  loading.value = true;
  try {
    await resetPassword(token.value, newPassword.value);
    done.value = true;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.msg || "Could not reset your password.";
  } finally {
    loading.value = false;
  }
}
</script>
