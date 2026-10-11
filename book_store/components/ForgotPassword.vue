<template>
  <AuthShell
    :embedded="embedded"
    eyebrow="Password reset"
    title="Reset your password"
    :subtitle="
      sent
        ? 'Check your inbox for the reset link.'
        : 'Enter the email on your account and we will send you a reset link.'
    "
    panel-label="Locked out"
    caption="It takes a minute. We will email you a link, and your shelf will be waiting."
  >
    <template #panel>It happens to <span class="italic">every</span> reader.</template>

    <form v-if="!sent" class="grid gap-7" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="forgot-email" class="eyebrow mb-1 block">Email</label>
        <UiInput
          id="forgot-email"
          v-model="email"
          type="email"
          autocomplete="email"
          :class="FIELD_CLASS"
          :error-message="emailError"
          @input="emailError = ''"
        />
      </div>

      <AuthFormMessage v-if="errorMessage" tone="error">
        {{ errorMessage }}
      </AuthFormMessage>

      <UiButton type="submit" variant="ink" size="cta" block :loading="submitting" class="mt-1 shadow-none">
        Send reset link
      </UiButton>
    </form>

    <div v-else class="grid gap-6">
      <AuthFormMessage tone="success">
        If an account exists for <strong class="font-semibold">{{ email }}</strong>,
        a reset link is on its way. It expires in 10 minutes.
      </AuthFormMessage>
      <UiButton type="button" variant="outline" size="cta" block class="rounded-none shadow-none" @click="sent = false">
        Use a different email
      </UiButton>
    </div>

    <template #footer>
      <AuthTextLink back class="text-[12px] uppercase tracking-[0.14em]" @click="$emit('back-to-login')">
        Back to sign in
      </AuthTextLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { forgotPassword } from "~/api/authApi";

const FIELD_CLASS =
  "h-12 rounded-none border-0 border-b bg-transparent px-0 text-[15px] shadow-none focus-visible:border-foreground focus-visible:ring-0";

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
