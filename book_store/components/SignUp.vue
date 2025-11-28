<template>
  <v-container class="h-screen position-relative" fluid>
    <v-row class="h-100 d-flex justify-center align-center">
      <v-col cols="12" sm="10" md="8" lg="7" xl="6">
        <v-card class="elevation-12 rounded-lg overflow-hidden">
          <v-row class="h-100">
            <!-- Image section - hidden on xs screens -->
            <v-col cols="12" md="6" class="pa-0 d-none d-md-block">
              <div class="h-100 position-relative login-image-container">
                <v-img
                  src="assets/bg.jpg"
                  class="h-100"
                  cover
                  gradient="to top, rgba(0,0,0,.7), rgba(0,0,0,.1)"
                >
                  <div
                    class="d-flex flex-column justify-center align-center h-100 px-6"
                  >
                    <v-avatar color="primary" size="64" class="mb-4">
                      <v-icon size="36" color="white"
                        >mdi-book-open-page-variant</v-icon
                      >
                    </v-avatar>
                    <h2 class="text-h4 font-weight-bold text-white mb-2">
                      BookStore
                    </h2>
                    <p class="text-subtitle-1 text-white text-center">
                      Join thousands of book lovers today
                    </p>
                  </div>
                </v-img>
              </div>
            </v-col>

            <!-- Form section -->
            <v-col cols="12" md="6" class="pa-8">
              <div class="d-flex flex-column justify-center h-100">
                <!-- Header with theme toggle -->
                <div class="d-flex align-center justify-space-between mb-6">
                  <!-- Logo for mobile view -->
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="42" class="me-3 d-md-none">
                      <v-icon size="24" color="white"
                        >mdi-book-open-page-variant</v-icon
                      >
                    </v-avatar>
                    <div>
                      <h2 class="text-h5 font-weight-bold d-md-none">
                        BookStore
                      </h2>
                      <h3 class="text-h5 font-weight-bold mb-1">
                        Create Account
                      </h3>
                      <p class="text-subtitle-2 text-medium-emphasis">
                        Start your reading journey today
                      </p>
                    </div>
                  </div>
                  <!-- <v-btn
                    icon
                    variant="text"
                    @click="toggleTheme"
                    class="ms-2"
                    size="small"
                  >
                    <v-icon>{{
                      isDarkMode ? "mdi-weather-sunny" : "mdi-weather-night"
                    }}</v-icon>
                  </v-btn> -->
                </div>

                <v-form
                  @submit.prevent="onSubmit"
                  ref="form"
                  v-model="isFormValid"
                  lazy-validation
                  class="login-form"
                >
                  <v-text-field
                    v-model="email"
                    label="Email Address"
                    :rules="emailRules"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface"
                    prepend-inner-icon="mdi-email"
                    required
                    autocomplete="email"
                    type="email"
                    :error-messages="emailError"
                    @focus="emailError = ''"
                  ></v-text-field>

                  <v-text-field
                    v-model="username"
                    label="Username"
                    :rules="usernameRules"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface"
                    prepend-inner-icon="mdi-account"
                    required
                    autocomplete="username"
                    :error-messages="usernameError"
                    @focus="usernameError = ''"
                  ></v-text-field>

                  <v-text-field
                    v-model="password"
                    label="Password"
                    :rules="passwordRules"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="
                      showPassword ? 'mdi-eye-off' : 'mdi-eye'
                    "
                    :type="showPassword ? 'text' : 'password'"
                    required
                    autocomplete="new-password"
                    :error-messages="passwordError"
                    @focus="passwordError = ''"
                    @click:append-inner="showPassword = !showPassword"
                  ></v-text-field>

                  <v-text-field
                    v-model="confirmPassword"
                    label="Confirm Password"
                    :rules="confirmPasswordRules"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface"
                    prepend-inner-icon="mdi-lock-check"
                    :append-inner-icon="
                      showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
                    "
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="mb-3"
                    required
                    autocomplete="new-password"
                    :error-messages="confirmPasswordError"
                    @focus="confirmPasswordError = ''"
                    @click:append-inner="
                      showConfirmPassword = !showConfirmPassword
                    "
                  ></v-text-field>

                  <div class="d-flex justify-space-between align-center mb-6">
                    <v-checkbox
                      v-model="agreeToTerms"
                      color="primary"
                      density="compact"
                      :rules="termsRules"
                    >
                      <template v-slot:label>
                        <span class="text-caption">
                          I agree to the
                          <a href="#" class="text-primary text-decoration-none"
                            >Terms of Use</a
                          >
                        </span>
                      </template>
                    </v-checkbox>
                  </div>

                  <v-btn
                    color="primary"
                    type="submit"
                    block
                    size="large"
                    class="mb-6"
                    elevation="2"
                    :ripple="true"
                    :disabled="!isFormValid || !agreeToTerms"
                  >
                    <v-icon start class="me-1">mdi-account-plus</v-icon>
                    Create Account
                  </v-btn>

                  <v-expand-transition>
                    <v-alert
                      v-if="errorMessage"
                      type="error"
                      variant="tonal"
                      closable
                      class="mb-6"
                      density="compact"
                      @click:close="errorMessage = ''"
                    >
                      {{ errorMessage }}
                    </v-alert>
                  </v-expand-transition>

                  <v-expand-transition>
                    <v-alert
                      v-if="successMessage"
                      type="success"
                      variant="tonal"
                      closable
                      class="mb-6"
                      density="compact"
                      @click:close="successMessage = ''"
                    >
                      {{ successMessage }}
                    </v-alert>
                  </v-expand-transition>

                  <v-divider class="mb-3"></v-divider>

                  <div class="text-center mb-1">
                    <span class="text-body-2 text-medium-emphasis"
                      >Already have an account?
                    </span>
                    <v-btn
                      variant="text"
                      color="primary"
                      class="text-decoration-none font-weight-medium"
                      @click="$emit('toggleLinkSignIn', 'sign-in')"
                    >
                      Sign In
                    </v-btn>
                  </div>

                  <!-- Social login options -->
                  <div>
                    <p
                      class="text-center text-body-2 text-medium-emphasis mb-4"
                    >
                      Or continue with
                    </p>
                    <div class="d-flex justify-center ga-3">
                      <v-btn
                        variant="elevated"
                        rounded="lg"
                        color="surface-variant"
                        class="social-btn"
                        @click="socialSignup('google')"
                      >
                        <v-icon color="#DB4437" class="me-2">mdi-google</v-icon>
                        Google
                      </v-btn>
                      <!-- <v-btn
                        variant="elevated"
                        rounded="lg"
                        color="surface-variant"
                        class="social-btn"
                        @click="socialSignup('facebook')"
                      >
                        <v-icon color="#4267B2" class="me-2"
                          >mdi-facebook</v-icon
                        >
                        Facebook
                      </v-btn> -->
                    </div>
                  </div>
                </v-form>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "Signup",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      isSignUp: false,
      showPassword: false,
      showConfirmPassword: false,
      isFormValid: false,
      agreeToTerms: false,
      emailError: "",
      usernameError: "",
      passwordError: "",
      confirmPasswordError: "",
      errorMessage: "",
      successMessage: "",
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /^\S+@\S+\.\S+$/.test(v) || "Email is invalid",
      ],
      usernameRules: [
        (v) => !!v || "Username is required",
        (v) => v.length >= 3 || "Username must be at least 3 characters",
        (v) =>
          /^[a-zA-Z0-9_]+$/.test(v) ||
          "Username can only contain letters, numbers, and underscores",
      ],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v.length >= 6 || "Password must be at least 6 characters",
        (v) =>
          /[A-Z]/.test(v) ||
          "Password must contain at least 1 uppercase letter",
        (v) => /[0-9]/.test(v) || "Password must contain at least 1 number",
      ],
      confirmPasswordRules: [
        (v) => !!v || "Please confirm your password",
        (v) => v === this.password || "Passwords don't match",
      ],
      // Terms of use validation rules
      termsRules: [
        (v) => v || "You must agree to the terms of use to continue",
      ],
    };
  },
  methods: {
    ...mapActions("auth", ["register"]),
    async onSubmit() {
      // Validate form before submitting
      const { valid } = await this.$refs.form.validate();

      if (!valid) {
        this.errorMessage =
          "Please fill in all required fields and fix the errors";
        return;
      }

      if (!this.agreeToTerms) {
        this.errorMessage = "You must agree to the terms of use to continue";
        return;
      }

      // Reset error messages
      this.errorMessage = "";
      this.emailError = "";
      this.usernameError = "";
      this.passwordError = "";
      this.confirmPasswordError = "";

      try {
        const data = await this.register({
          username: this.username,
          email: this.email,
          password: this.password,
        });

        // Registration successful
        this.successMessage =
          "Account registration successful! You can now log in.";
        this.$emit("checkIsSignUp", true);

        // Reset form after successful registration
        this.$refs.form.reset();
        return data;
      } catch (error) {
        console.error("Registration failed:", error);

        // Handle API errors
        if (error.response) {
          const { data } = error.response;

          // Handle specific server errors
          if (data.message) {
            this.errorMessage = data.message;
          } else if (data.error) {
            this.errorMessage = data.error;
          } else {
            this.errorMessage = "Registration failed. Please try again later.";
          }

          // Handle errors for specific fields
          if (data.errors) {
            if (data.errors.email) {
              this.emailError = data.errors.email;
            }
            if (data.errors.username) {
              this.usernameError = data.errors.username;
            }
            if (data.errors.password) {
              this.passwordError = data.errors.password;
            }
          }
        } else {
          this.errorMessage = "Connection error. Please try again later.";
        }
      }
    },
    async socialSignup(provider) {
      if (provider === "google") {
        try {
          // Redirect to Google OAuth (same endpoint for login/signup)
          window.location.href = "http://localhost:5000/api/auth/google";
        } catch (error) {
          console.error("Google signup error:", error);
        }
      }
    },
  },
};
</script>
