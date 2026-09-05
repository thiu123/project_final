<template>
  <div class="min-h-[500px] rounded-lg bg-card text-card-foreground">
    <div class="p-8">
      <!-- Header -->
      <div class="mb-6 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary"
        >
          <KeyRound class="h-8 w-8 text-white" />
        </div>
        <h2 class="mb-2 text-2xl font-bold">Forgot Password</h2>
        <p class="text-sm text-muted-foreground">
          {{ currentStepDescription }}
        </p>
      </div>

      <!-- Step 1: Enter Email -->
      <div v-if="step === 1">
        <form @submit.prevent="handleSendResetToken">
          <UiInput
            v-model="email"
            label="Email"
            type="email"
            required
            :error-message="emailError"
            wrapper-class="mb-4"
            @focus="emailError = ''"
          >
            <template #prepend>
              <Mail class="h-4 w-4" />
            </template>
          </UiInput>

          <UiButton type="submit" block size="lg" :loading="loading" class="shadow">
            Send Reset Token
          </UiButton>
        </form>
      </div>

      <!-- Step 2: Show Reset Token -->
      <div v-if="step === 2">
        <UiAlert variant="success" title="Reset Token Generated!" class="mb-4">
          <div class="text-xs">Copy the token below to reset your password</div>
        </UiAlert>

        <UiInput
          v-model="resetToken"
          label="Reset Token"
          readonly
          wrapper-class="mb-4"
        >
          <template #append>
            <button
              type="button"
              class="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Copy token"
              @click="copyToken"
            >
              <Copy class="h-4 w-4" />
            </button>
          </template>
        </UiInput>

        <UiButton block size="lg" class="shadow" @click="step = 3">
          Continue to Reset Password
        </UiButton>
      </div>

      <!-- Step 3: Enter Token & New Password -->
      <div v-if="step === 3">
        <form @submit.prevent="handleResetPassword">
          <UiInput
            v-model="enteredToken"
            label="Reset Token"
            required
            :error-message="tokenError"
            wrapper-class="mb-3"
            @focus="tokenError = ''"
          >
            <template #prepend>
              <Key class="h-4 w-4" />
            </template>
          </UiInput>

          <UiInput
            v-model="newPassword"
            label="New Password"
            :type="showPassword ? 'text' : 'password'"
            required
            :error-message="newPasswordError"
            wrapper-class="mb-3"
            @focus="newPasswordError = ''"
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
            required
            :error-message="confirmPasswordError"
            wrapper-class="mb-4"
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

          <UiButton
            type="submit"
            variant="success"
            block
            size="lg"
            :loading="loading"
            class="shadow"
          >
            Reset Password
          </UiButton>
        </form>
      </div>

      <!-- Back to Login -->
      <div class="mt-6 text-center">
        <UiButton type="button" variant="link" @click="$emit('back-to-login')">
          <ArrowLeft class="mr-1 h-4 w-4" />
          Back to Login
        </UiButton>
      </div>
    </div>

    <!-- Snackbar -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Key,
  KeyRound,
  Lock,
  LockKeyhole,
  Mail,
} from "lucide-vue-next";
import { forgotPassword, resetPassword } from "~/api/authApi";

const emit = defineEmits<{
  (e: "back-to-login"): void;
}>();

const step = ref(1);
const email = ref("");
const resetToken = ref("");
const enteredToken = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);

const emailError = ref("");
const tokenError = ref("");
const newPasswordError = ref("");
const confirmPasswordError = ref("");

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

type Rule = (v: string) => true | string;

const emailRules: Rule[] = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];
const passwordRules: Rule[] = [
  (v) => !!v || "Password is required",
  (v) => v.length >= 6 || "Password must be at least 6 characters",
];
const confirmPasswordRules: Rule[] = [
  (v) => !!v || "Please confirm your password",
  (v) => v === newPassword.value || "Passwords do not match",
];

function runRules(rules: Rule[], value: string): string {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return "";
}

const currentStepDescription = computed(() => {
  switch (step.value) {
    case 1:
      return "Enter your email to receive a reset token";
    case 2:
      return "Copy your reset token";
    case 3:
      return "Enter token and new password";
    default:
      return "";
  }
});

async function handleSendResetToken() {
  emailError.value = runRules(emailRules, email.value);
  if (emailError.value) return;

  loading.value = true;
  try {
    const response = await forgotPassword(email.value);
    resetToken.value = response.data.resetToken;
    step.value = 2;
    showSnackbar("Reset token generated successfully!", "success");
  } catch (error: any) {
    showSnackbar(
      error.response?.data?.msg || "Failed to generate reset token",
      "error"
    );
  } finally {
    loading.value = false;
  }
}

async function handleResetPassword() {
  tokenError.value = enteredToken.value ? "" : "Token is required";
  newPasswordError.value = runRules(passwordRules, newPassword.value);
  confirmPasswordError.value = runRules(
    confirmPasswordRules,
    confirmPassword.value
  );
  if (tokenError.value || newPasswordError.value || confirmPasswordError.value) {
    return;
  }

  loading.value = true;
  try {
    await resetPassword(enteredToken.value, newPassword.value);
    showSnackbar("Password reset successfully!", "success");
    setTimeout(() => {
      emit("back-to-login");
    }, 1500);
  } catch (error: any) {
    showSnackbar(error.response?.data?.msg || "Failed to reset password", "error");
  } finally {
    loading.value = false;
  }
}

function copyToken() {
  navigator.clipboard.writeText(resetToken.value);
  showSnackbar("Token copied to clipboard!", "info");
}

function showSnackbar(message: string, color: string) {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
}
</script>
