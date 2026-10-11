<template>
  <div class="w-full max-w-[1040px] sm:border sm:border-border">
    <AuthShell
      eyebrow="Password reset"
      title="Choose a new password"
      :subtitle="done ? 'Your password has been changed.' : 'Enter a new password for your account.'"
      panel-label="Almost there"
      caption="Pick something memorable. Once it changes, other devices are signed out."
    >
      <template #panel>Turn to a <span class="italic">new</span> page.</template>

      <AuthFormMessage v-if="!token" tone="error">
        This reset link is incomplete. Request a new one from the sign-in page.
      </AuthFormMessage>

      <div v-else-if="done" class="grid gap-6">
        <AuthFormMessage tone="success">
          You can sign in with your new password. Other devices have been signed out.
        </AuthFormMessage>
        <UiButton variant="ink" size="cta" block class="shadow-none" @click="router.push('/login')">
          Sign in
        </UiButton>
      </div>

      <form v-else class="grid gap-7" novalidate @submit.prevent="handleSubmit">
        <div>
          <label for="reset-password" class="eyebrow mb-1 block">New password</label>
          <UiInput
            id="reset-password"
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :class="[FIELD_CLASS, 'pr-9']"
            hint="At least 6 characters."
            :error-message="newPasswordError"
            @input="newPasswordError = ''"
          >
            <template #append>
              <button
                type="button"
                class="-mr-3 flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-4" :stroke-width="1.5" />
                <Eye v-else class="size-4" :stroke-width="1.5" />
              </button>
            </template>
          </UiInput>
        </div>

        <div>
          <label for="reset-confirm" class="eyebrow mb-1 block">Confirm new password</label>
          <UiInput
            id="reset-confirm"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :class="FIELD_CLASS"
            :error-message="confirmPasswordError"
            @input="confirmPasswordError = ''"
          />
        </div>

        <AuthFormMessage v-if="errorMessage" tone="error">
          {{ errorMessage }}
        </AuthFormMessage>

        <UiButton type="submit" variant="ink" size="cta" block :loading="loading" class="mt-1 shadow-none">
          Save new password
        </UiButton>
      </form>

      <template v-if="!done" #footer>
        <AuthTextLink to="/login" back class="text-[12px] uppercase tracking-[0.14em]">
          Back to sign in
        </AuthTextLink>
      </template>
    </AuthShell>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { Eye, EyeOff } from "lucide-vue-next";
import { resetPassword } from "~/api/authApi";

const FIELD_CLASS =
  "h-12 rounded-none border-0 border-b bg-transparent px-0 text-[15px] shadow-none focus-visible:border-foreground focus-visible:ring-0";

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
