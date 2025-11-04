<template>
  <div>
    <!-- Hero Section -->
    <v-container class="hero-section py-16">
      <v-row justify="center">
        <v-col cols="12" lg="8" class="text-center">
          <div class="d-flex justify-center mb-4">
            <v-avatar color="customyellow" size="80" class="mr-4">
              <v-icon color="darkgreen" size="48">mdi-message-text</v-icon>
            </v-avatar>
          </div>
          <h1 class="text-h3 font-weight-bold text-customblack mb-4">
            Contact Us
          </h1>
          <p class="text-h6 text-medium-emphasis mb-8">
            Share your feedback and help us improve
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Contact Form Section -->
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" lg="8">
          <v-card class="contact-card pa-8" elevation="12" rounded="xl">
            <h2
              class="text-h4 font-weight-bold text-customblack mb-6 text-center"
            >
              Send Your Feedback
            </h2>

            <v-alert
              v-if="!isLoggedIn"
              type="warning"
              variant="tonal"
              class="mb-6"
            >
              Please login to send feedback
            </v-alert>

            <v-form
              ref="contactForm"
              v-model="formValid"
              :disabled="!isLoggedIn"
            >
              <v-textarea
                v-model="message"
                label="Your Feedback"
                variant="outlined"
                rows="8"
                :rules="messageRules"
                required
                prepend-inner-icon="mdi-message-text"
                placeholder="Share your thoughts, suggestions, or report issues... (minimum 10 characters)"
              ></v-textarea>

              <v-btn
                color="waterblue"
                size="large"
                variant="elevated"
                block
                :loading="loading"
                :disabled="!formValid || !isLoggedIn"
                @click="submitForm"
                class="font-weight-bold"
              >
                <v-icon start>mdi-send</v-icon>
                Send Feedback
              </v-btn>
            </v-form>

            <!-- User's Previous Messages -->
            <div v-if="isLoggedIn && userContacts.length > 0" class="mt-8">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 font-weight-bold mb-4">
                Your Feedback History
              </h3>

              <v-card
                v-for="contact in userContacts"
                :key="contact._id"
                class="mb-3"
                variant="outlined"
              >
                <v-card-text>
                  <div class="d-flex justify-space-between align-center mb-2">
                    <v-chip color="primary" size="small" variant="tonal">
                      <v-icon start size="small">mdi-message</v-icon>
                      Feedback
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatDate(contact.createdAt) }}
                    </span>
                  </div>
                  <p class="text-body-2 mb-2">{{ contact.message }}</p>
                </v-card-text>
              </v-card>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- FAQ Section -->
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" lg="8">
          <div class="text-center mb-8">
            <h2 class="text-h4 font-weight-bold text-customblack mb-4">
              Contact Information
            </h2>
          </div>

          <v-row>
            <!-- Address -->
            <v-col cols="12" md="4">
              <v-card class="pa-4 text-center" elevation="2" height="100%">
                <v-avatar color="waterblue" size="60" class="mb-3">
                  <v-icon color="white" size="30">mdi-map-marker</v-icon>
                </v-avatar>
                <h4 class="text-subtitle-1 font-weight-bold mb-2">Visit Us</h4>
                <p class="text-body-2 text-medium-emphasis">
                  1234 Bookstore Drive<br />
                  Ho Chi Minh City, Vietnam
                </p>
              </v-card>
            </v-col>

            <!-- Phone -->
            <v-col cols="12" md="4">
              <v-card class="pa-4 text-center" elevation="2" height="100%">
                <v-avatar color="waterblue" size="60" class="mb-3">
                  <v-icon color="white" size="30">mdi-phone</v-icon>
                </v-avatar>
                <h4 class="text-subtitle-1 font-weight-bold mb-2">Call Us</h4>
                <p class="text-body-2 text-medium-emphasis">
                  +84 971 450 800<br />
                  Mon - Fri: 8AM - 6PM
                </p>
              </v-card>
            </v-col>

            <!-- Email -->
            <v-col cols="12" md="4">
              <v-card class="pa-4 text-center" elevation="2" height="100%">
                <v-avatar color="waterblue" size="60" class="mb-3">
                  <v-icon color="white" size="30">mdi-email</v-icon>
                </v-avatar>
                <h4 class="text-subtitle-1 font-weight-bold mb-2">Email Us</h4>
                <p class="text-body-2 text-medium-emphasis">
                  nhokhieukute2004@gmail.com<br />
                  We reply within 24 hours
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar for notifications -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import SnackbarAlert from "../components/SnackbarAlert.vue";

export default {
  name: "ContactPage",
  components: {
    SnackbarAlert,
  },
  data() {
    return {
      formValid: false,
      loading: false,
      message: "",
      messageRules: [
        (v) => !!v || "Message is required",
        (v) =>
          (v && v.length >= 10) || "Message must be at least 10 characters",
      ],
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("contact", ["userContacts"]),
    isLoggedIn() {
      return !!this.currentUser;
    },
  },
  methods: {
    ...mapActions("contact", ["createContact", "fetchUserContacts"]),
    async submitForm() {
      if (!this.$refs.contactForm.validate()) {
        return;
      }

      this.loading = true;

      try {
        await this.createContact(this.message);

        this.showSnackbar(
          "Thank you! Your feedback has been sent successfully.",
          "success"
        );

        // Reset form
        this.message = "";
        this.$refs.contactForm.resetValidation();

        // Reload user contacts
        await this.fetchUserContacts();
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message ||
            "Failed to send feedback. Please try again.",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  mounted() {
    if (this.isLoggedIn) {
      this.fetchUserContacts();
    }
  },
};
</script>

<style scoped></style>
