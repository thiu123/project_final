<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="contact-hero">
      <div class="hero-blob hero-blob--one"></div>
      <div class="hero-blob hero-blob--two"></div>
      <v-container class="hero-content pt-16 pb-12">
        <v-row justify="center">
          <v-col cols="12" lg="7" class="text-center">
            <span class="hero-eyebrow">We read every message</span>
            <h1 class="hero-title mb-4">Contact &amp; feedback</h1>
            <p class="hero-subtitle">
              Questions, issues, or ideas — send us a message and we'll get
              back to you.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Contact & Info Section -->
    <v-container class="pt-8 pb-16">
      <v-row justify="center">
        <!-- Form -->
        <v-col cols="12" lg="7">
          <v-card class="form-card pa-6 pa-md-8" elevation="0" rounded="xl">
            <h2 class="section-title mb-6">Send a message</h2>

            <v-alert
              v-if="!isLoggedIn"
              type="warning"
              variant="tonal"
              rounded="lg"
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
                label="Your feedback"
                variant="outlined"
                rows="7"
                :rules="messageRules"
                required
                prepend-inner-icon="mdi-message-text"
                placeholder="Write your question, feedback, issue report, or anything you want to share..."
                rounded="lg"
              ></v-textarea>

              <v-btn
                color="waterblue"
                size="large"
                variant="elevated"
                block
                rounded="lg"
                :loading="loading"
                :disabled="!formValid || !isLoggedIn"
                @click="submitForm"
                class="send-btn font-weight-bold"
              >
                <v-icon start>mdi-send</v-icon>
                Send message
              </v-btn>
            </v-form>

            <!-- User's Previous Messages -->
            <div v-if="isLoggedIn && userContacts.length > 0" class="mt-8">
              <v-divider class="mb-5"></v-divider>
              <h3 class="history-title mb-4">Your message history</h3>

              <div
                v-for="contact in userContacts"
                :key="contact._id"
                class="history-item mb-3"
              >
                <div class="d-flex justify-space-between align-center mb-2">
                  <v-chip color="waterblue" size="small" variant="tonal">
                    <v-icon start size="small">mdi-message-outline</v-icon>
                    Message
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatDate(contact.createdAt) }}
                  </span>
                </div>
                <p class="text-body-2 mb-0">{{ contact.message }}</p>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Contact Info -->
        <v-col cols="12" lg="5">
          <v-card class="info-panel pa-6 pa-md-8" elevation="0" rounded="xl">
            <h2 class="info-panel-title mb-2">Get in touch</h2>
            <p class="info-panel-subtitle mb-6">
              Reach us directly through any of these channels.
            </p>

            <ul class="info-list">
              <li class="info-item">
                <span class="info-icon">
                  <v-icon color="customyellow" size="22"
                    >mdi-map-marker</v-icon
                  >
                </span>
                <div>
                  <h4 class="info-label">Visit us</h4>
                  <p class="info-text">
                    1234 Bookstore Drive<br />
                    Ho Chi Minh City, Vietnam
                  </p>
                </div>
              </li>

              <li class="info-item">
                <span class="info-icon">
                  <v-icon color="customyellow" size="22">mdi-phone</v-icon>
                </span>
                <div>
                  <h4 class="info-label">Call us</h4>
                  <p class="info-text">
                    +84 971 450 800<br />
                    Mon - Fri: 8AM - 6PM
                  </p>
                </div>
              </li>

              <li class="info-item">
                <span class="info-icon">
                  <v-icon color="customyellow" size="22">mdi-email</v-icon>
                </span>
                <div>
                  <h4 class="info-label">Email us</h4>
                  <p class="info-text">
                    nhokhieukute2004@gmail.com<br />
                    We reply within 24 hours
                  </p>
                </div>
              </li>
            </ul>
          </v-card>
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

<style scoped>
.contact-page {
  --cp-ink: #191b24;
  --cp-blue: #5295d0;
  --cp-lime: #dcf763;
  --cp-canvas: #f1f2ee;
  background: var(--cp-canvas);
}

/* Hero */
.contact-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, var(--cp-canvas) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.hero-blob--one {
  width: 320px;
  height: 320px;
  background: var(--cp-lime);
  opacity: 0.35;
  top: -120px;
  left: -80px;
}

.hero-blob--two {
  width: 260px;
  height: 260px;
  background: var(--cp-blue);
  opacity: 0.25;
  bottom: -100px;
  right: 5%;
}

.hero-eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cp-blue);
  margin-bottom: 12px;
}

.hero-title {
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cp-ink);
}

.hero-subtitle {
  max-width: 42ch;
  margin: 0 auto;
  font-size: 1.1rem;
  color: rgba(25, 27, 36, 0.65);
}

/* Form card */
.form-card {
  background: #ffffff;
  border: 1px solid rgba(25, 27, 36, 0.06);
  box-shadow: 0 20px 40px -24px rgba(82, 149, 208, 0.35);
  transition: box-shadow 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 24px 48px -20px rgba(82, 149, 208, 0.42);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cp-ink);
}

.send-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px rgba(82, 149, 208, 0.55);
}

.send-btn:active {
  transform: translateY(0) scale(0.98);
}

/* History */
.history-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--cp-ink);
}

.history-item {
  padding: 14px 16px;
  border-left: 3px solid var(--cp-blue);
  background: rgba(82, 149, 208, 0.05);
  border-radius: 0 10px 10px 0;
  transition: background 0.2s ease, transform 0.2s ease;
}

.history-item:hover {
  background: rgba(82, 149, 208, 0.1);
  transform: translateX(2px);
}

/* Info panel */
.info-panel {
  background: var(--cp-ink);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.info-panel::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: var(--cp-lime);
  opacity: 0.12;
  bottom: -80px;
  right: -60px;
}

.info-panel-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
}

.info-panel-subtitle {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.95rem;
}

.info-list {
  position: relative;
  z-index: 1;
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;
}

.info-item:first-child {
  border-top: none;
  padding-top: 0;
}

.info-item:hover {
  transform: translateX(4px);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
}

.info-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.info-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
}
</style>
