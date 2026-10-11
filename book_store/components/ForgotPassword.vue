<template>
  <AuthShell
    :embedded="embedded"
    title="Reset your password"
    :subtitle="
      sent
        ? 'Check your inbox for the reset link.'
        : 'Enter the email on your account and we will send you a reset link.'
    "
  >
    <form v-if="!sent" class="grid gap-4" novalidate @submit.prevent="onSubmit">
      <UiInput
        id="forgot-email"
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        class="h-10"
        :error-message="emailError"
        @input="emailError = ''"
      />

      <AuthFormMessage v-if="errorMessage" tone="error">
        {{ errorMessage }}
      </AuthFormMessage>

      <UiButton type="submit" variant="ink" size="lg" block :loading="submitting">
        Send reset link
      </UiButton>
    </form>

    <div v-else class="grid gap-4">
      <AuthFormMessage tone="success">
        If an account exists for <strong class="font-semibold">{{ email }}</strong>,
        a reset link is on its way. It expires in 10 minutes.
      </AuthFormMessage>
      <UiButton type="button" variant="outline" size="lg" block @click="sent = false">
        Use a different email
      </UiButton>
    </div>

    <template #footer>
      <AuthTextLink @click="$emit('back-to-login')">
        <ArrowLeft class="h-4 w-4" />
        Back to sign in
      </AuthTextLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { forgotPassword } from "~/api/authApi";

withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false });

defineEmits<{
  (e: "back-to-login"): void;
}>();

const email = ref("");
const emailError = ref("");
const errorMessage = ref("");
const sent = ref(false);
const submitting = ref(false);

async function onSubmit() {
  errorMessage.value = "";
  const value = email.value.trim();
  emailError.value = !value
    ? "Enter your email"
    : /^\S+@\S+\.\S+$/.test(value)
      ? ""
      : "Enter a valid email address";
  if (emailError.value) return;

  submitting.value = true;
  try {
    await forgotPassword(value);
    sent.value = true;
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.msg || "Could not send the reset link. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>
