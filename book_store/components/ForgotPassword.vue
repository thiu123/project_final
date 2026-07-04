<template>
  <v-card elevation="0" class="forgot-password-card">
    <v-card-text class="pa-8">
      <!-- Header -->
      <div class="text-center mb-6">
        <v-avatar color="primary" size="64" class="mb-4">
          <v-icon size="32" color="white">mdi-lock-reset</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-2">Forgot Password</h2>
        <p class="text-body-2 text-grey">
          {{ getCurrentStepDescription() }}
        </p>
      </div>

      <!-- Step 1: Enter Email -->
      <div v-if="step === 1">
        <v-form ref="emailForm" @submit.prevent="handleSendResetToken">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email"
            :rules="emailRules"
            required
            density="comfortable"
            class="mb-4"
          ></v-text-field>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            elevation="2"
          >
            Send Reset Token
          </v-btn>
        </v-form>
      </div>

      <!-- Step 2: Show Reset Token -->
      <div v-if="step === 2">
        <v-alert type="success" variant="tonal" class="mb-4">
          <div class="text-subtitle-2 font-weight-bold mb-1">
            Reset Token Generated!
          </div>
          <div class="text-caption">
            Copy the token below to reset your password
          </div>
        </v-alert>

        <v-text-field
          v-model="resetToken"
          label="Reset Token"
          variant="outlined"
          readonly
          density="comfortable"
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copyToken"
          class="mb-4"
        ></v-text-field>

        <v-btn
          color="primary"
          block
          size="large"
          elevation="2"
          @click="step = 3"
        >
          Continue to Reset Password
        </v-btn>
      </div>

      <!-- Step 3: Enter Token & New Password -->
      <div v-if="step === 3">
        <v-form ref="resetForm" @submit.prevent="handleResetPassword">
          <v-text-field
            v-model="enteredToken"
            label="Reset Token"
            variant="outlined"
            prepend-inner-icon="mdi-key"
            :rules="[(v) => !!v || 'Token is required']"
            required
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="newPassword"
            label="New Password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="passwordRules"
            required
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            label="Confirm Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            variant="outlined"
            prepend-inner-icon="mdi-lock-check"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            :rules="confirmPasswordRules"
            required
            density="comfortable"
            class="mb-4"
          ></v-text-field>

          <v-btn
            type="submit"
            color="success"
            block
            size="large"
            :loading="loading"
            elevation="2"
          >
            Reset Password
          </v-btn>
        </v-form>
      </div>

      <!-- Back to Login -->
      <div class="text-center mt-6">
        <v-btn
          variant="text"
          color="primary"
          @click="$emit('back-to-login')"
          prepend-icon="mdi-arrow-left"
        >
          Back to Login
        </v-btn>
      </div>
    </v-card-text>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top">
      {{ snackbar.message }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { forgotPassword, resetPassword } from "~/api/authApi";

export default {
  name: "ForgotPassword",
  emits: ["back-to-login"],
  data() {
    return {
      step: 1,
      email: "",
      resetToken: "",
      enteredToken: "",
      newPassword: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "Email must be valid",
      ],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v.length >= 6 || "Password must be at least 6 characters",
      ],
      confirmPasswordRules: [
        (v) => !!v || "Please confirm your password",
        (v) => v === this.newPassword || "Passwords do not match",
      ],
    };
  },
  methods: {
    getCurrentStepDescription() {
      switch (this.step) {
        case 1:
          return "Enter your email to receive a reset token";
        case 2:
          return "Copy your reset token";
        case 3:
          return "Enter token and new password";
        default:
          return "";
      }
    },

    async handleSendResetToken() {
      const { valid } = await this.$refs.emailForm.validate();
      if (!valid) return;

      this.loading = true;
      try {
        const response = await forgotPassword(this.email);
        this.resetToken = response.data.resetToken;
        this.step = 2;
        this.showSnackbar("Reset token generated successfully!", "success");
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.msg || "Failed to generate reset token",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    async handleResetPassword() {
      const { valid } = await this.$refs.resetForm.validate();
      if (!valid) return;

      this.loading = true;
      try {
        await resetPassword(this.enteredToken, this.newPassword);
        this.showSnackbar("Password reset successfully!", "success");
        setTimeout(() => {
          this.$emit("back-to-login");
        }, 1500);
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.msg || "Failed to reset password",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    copyToken() {
      navigator.clipboard.writeText(this.resetToken);
      this.showSnackbar("Token copied to clipboard!", "info");
    },

    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.forgot-password-card {
  background: white;
  min-height: 500px;
}
</style>
