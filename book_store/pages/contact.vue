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
            Get in Touch
          </h1>
          <p class="text-h6 text-medium-emphasis mb-8">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Contact Form Section -->
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" lg="10">
          <v-card class="contact-card pa-8" elevation="12" rounded="xl">
            <v-row>
              <!-- Contact Form -->
              <v-col cols="12" md="7" class="pr-md-8">
                <h2 class="text-h4 font-weight-bold text-customblack mb-6">
                  Send us a Message
                </h2>

                <v-form ref="contactForm" v-model="formValid">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.firstName"
                        label="First Name"
                        variant="outlined"
                        :rules="nameRules"
                        required
                        prepend-inner-icon="mdi-account"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.lastName"
                        label="Last Name"
                        variant="outlined"
                        :rules="nameRules"
                        required
                        prepend-inner-icon="mdi-account"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model="formData.email"
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    :rules="emailRules"
                    required
                    prepend-inner-icon="mdi-email"
                  ></v-text-field>

                  <v-text-field
                    v-model="formData.phone"
                    label="Phone Number (Optional)"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                  ></v-text-field>

                  <v-select
                    v-model="formData.subject"
                    label="Subject"
                    variant="outlined"
                    :items="subjectOptions"
                    :rules="subjectRules"
                    required
                    prepend-inner-icon="mdi-tag"
                  ></v-select>

                  <v-textarea
                    v-model="formData.message"
                    label="Message"
                    variant="outlined"
                    rows="6"
                    :rules="messageRules"
                    required
                    prepend-inner-icon="mdi-message-text"
                  ></v-textarea>

                  <div class="d-flex align-center mb-6">
                    <v-checkbox
                      v-model="formData.newsletter"
                      color="waterblue"
                      hide-details
                    ></v-checkbox>
                    <span class="text-body-2 text-medium-emphasis ml-2">
                      Subscribe to our newsletter for updates and special offers
                    </span>
                  </div>

                  <v-btn
                    color="waterblue"
                    size="large"
                    variant="elevated"
                    block
                    :loading="loading"
                    :disabled="!formValid"
                    @click="submitForm"
                    class="font-weight-bold"
                  >
                    <v-icon start>mdi-send</v-icon>
                    Send Message
                  </v-btn>
                </v-form>
              </v-col>

              <!-- Contact Information -->
              <v-col cols="12" md="5">
                <div class="contact-info-section">
                  <h3 class="text-h5 font-weight-bold text-customblack mb-6">
                    Contact Information
                  </h3>

                  <!-- Address -->
                  <div class="contact-item mb-6">
                    <div class="d-flex align-start">
                      <v-avatar color="waterblue" size="48" class="mr-4">
                        <v-icon color="white" size="24">mdi-map-marker</v-icon>
                      </v-avatar>
                      <div>
                        <h4
                          class="text-subtitle-1 font-weight-bold text-customblack mb-1"
                        >
                          Visit Us
                        </h4>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          1234 Bookstore Drive & 4th Ave<br />
                          Ho Chi Minh City, Vietnam
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Phone -->
                  <div class="contact-item mb-6">
                    <div class="d-flex align-start">
                      <v-avatar color="waterblue" size="48" class="mr-4">
                        <v-icon color="white" size="24">mdi-phone</v-icon>
                      </v-avatar>
                      <div>
                        <h4
                          class="text-subtitle-1 font-weight-bold text-customblack mb-1"
                        >
                          Call Us
                        </h4>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          +84 971 450 800<br />
                          Mon - Fri: 8:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="contact-item mb-6">
                    <div class="d-flex align-start">
                      <v-avatar color="waterblue" size="48" class="mr-4">
                        <v-icon color="white" size="24">mdi-email</v-icon>
                      </v-avatar>
                      <div>
                        <h4
                          class="text-subtitle-1 font-weight-bold text-customblack mb-1"
                        >
                          Email Us
                        </h4>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          nhokhieukute2004@gmail.com<br />
                          We'll respond within 24 hours
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Social Media -->
                  <div class="contact-item">
                    <h4
                      class="text-subtitle-1 font-weight-bold text-customblack mb-3"
                    >
                      Follow Us
                    </h4>
                    <div class="d-flex ga-3">
                      <v-btn
                        icon
                        variant="outlined"
                        color="waterblue"
                        size="large"
                        class="social-btn"
                      >
                        <v-icon>mdi-facebook</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="outlined"
                        color="waterblue"
                        size="large"
                        class="social-btn"
                      >
                        <v-icon>mdi-twitter</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="outlined"
                        color="waterblue"
                        size="large"
                        class="social-btn"
                      >
                        <v-icon>mdi-instagram</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
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
              Frequently Asked Questions
            </h2>
            <p class="text-subtitle-1 text-medium-emphasis">
              Find quick answers to common questions
            </p>
          </div>

          <v-expansion-panels variant="accordion" class="faq-panels">
            <v-expansion-panel
              v-for="(faq, index) in faqs"
              :key="index"
              class="mb-2"
            >
              <v-expansion-panel-title class="text-subtitle-1 font-weight-bold">
                {{ faq.question }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
                {{ faq.answer }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
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
      formData: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        newsletter: false,
      },
      nameRules: [
        (v) => !!v || "Name is required",
        (v) => v.length >= 2 || "Name must be at least 2 characters",
      ],
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "Email must be valid",
      ],
      subjectRules: [(v) => !!v || "Subject is required"],
      messageRules: [
        (v) => !!v || "Message is required",
        (v) => v.length >= 10 || "Message must be at least 10 characters",
      ],
      subjectOptions: [
        "General Inquiry",
        "Book Availability",
        "Order Status",
        "Technical Support",
        "Partnership",
        "Other",
      ],
      faqs: [
        {
          question: "How can I track my order?",
          answer:
            'You can track your order by logging into your account and visiting the "My Orders" section. You\'ll receive email updates as your order progresses.',
        },
        {
          question: "What is your return policy?",
          answer:
            "We accept returns within 30 days of purchase for books in their original condition. Please contact us for return authorization.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Currently, we ship within Vietnam. International shipping options are being evaluated for future expansion.",
        },
        {
          question: "How can I become a member?",
          answer:
            'You can create an account by clicking "Sign Up" in the top navigation. Membership is free and gives you access to exclusive offers and faster checkout.',
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept major credit cards, debit cards, and digital wallets including VNPay. All transactions are secure and encrypted.",
        },
      ],
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  methods: {
    async submitForm() {
      if (!this.$refs.contactForm.validate()) {
        return;
      }

      this.loading = true;

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Show success message
        this.showSnackbar(
          "Thank you! Your message has been sent successfully. We'll get back to you soon.",
          "success"
        );

        // Reset form
        this.$refs.contactForm.reset();
        this.formData = {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          newsletter: false,
        };
      } catch (error) {
        this.showSnackbar(
          "Sorry, there was an error sending your message. Please try again.",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.contact-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #dee2e6;
}

.contact-info-section {
  background: rgba(82, 149, 208, 0.05);
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #5295d0;
  height: fit-content;
}

.contact-item {
  transition: transform 0.2s ease;
}

.contact-item:hover {
  transform: translateX(4px);
}

.social-btn {
  transition: all 0.3s ease;
}

.social-btn:hover {
  background-color: #5295d0 !important;
  color: white !important;
  transform: translateY(-2px);
}

.faq-panels {
  border-radius: 12px;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .contact-info-section {
    margin-top: 24px;
  }
}
</style>
