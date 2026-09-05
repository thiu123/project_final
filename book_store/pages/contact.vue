<template>
  <div class="bg-whitesmoke dark:bg-background">
    <!-- Hero Section -->
    <section
      class="relative overflow-hidden bg-gradient-to-b from-white to-whitesmoke dark:from-card dark:to-background"
    >
      <div
        class="pointer-events-none absolute -left-20 -top-[120px] h-80 w-80 rounded-full bg-customyellow opacity-35 blur-[60px]"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-[100px] right-[5%] h-[260px] w-[260px] rounded-full bg-waterblue opacity-25 blur-[60px]"
      ></div>
      <div class="container relative z-[1] mx-auto px-4 pb-12 pt-16">
        <div class="mx-auto max-w-3xl text-center">
          <span
            class="mb-3 inline-block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-waterblue"
          >
            We read every message
          </span>
          <h1
            class="mb-4 text-[clamp(2.2rem,4vw,3rem)] font-bold tracking-tight text-foreground"
          >
            Contact &amp; feedback
          </h1>
          <p class="mx-auto max-w-[42ch] text-lg text-foreground/65">
            Questions, issues, or ideas — send us a message and we'll get back
            to you.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact & Info Section -->
    <div class="container mx-auto px-4 pb-16 pt-8">
      <div class="grid grid-cols-12 gap-6">
        <!-- Form -->
        <div class="col-span-12 lg:col-span-7">
          <div
            class="form-card rounded-xl border border-border bg-card p-6 md:p-8"
          >
            <h2 class="mb-6 text-2xl font-bold text-foreground">
              Send a message
            </h2>

            <UiAlert v-if="!isLoggedIn" variant="warning" class="mb-6 rounded-lg">
              Please login to send feedback
            </UiAlert>

            <form @submit.prevent="submitForm">
              <label
                class="mb-1.5 block text-sm font-medium text-foreground"
                for="contact-message"
              >
                Your feedback
              </label>
              <div class="relative">
                <MessageSquare
                  class="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
                />
                <UiTextarea
                  id="contact-message"
                  v-model="message"
                  :rows="7"
                  placeholder="Write your question, feedback, issue report, or anything you want to share..."
                  :disabled="!isLoggedIn"
                  :error-message="messageError"
                  class="rounded-lg pl-10"
                  @blur="validateMessage"
                />
              </div>

              <UiButton
                type="submit"
                size="lg"
                block
                class="send-btn mt-4 rounded-lg font-bold"
                :loading="loading"
                :disabled="!formValid || !isLoggedIn"
              >
                <Send class="mr-1 h-5 w-5" />
                Send message
              </UiButton>
            </form>

            <!-- User's Previous Messages -->
            <div v-if="isLoggedIn && userContacts.length > 0" class="mt-8">
              <UiSeparator class="mb-5" />
              <h3 class="mb-4 text-[1.05rem] font-bold text-foreground">
                Your message history
              </h3>

              <div
                v-for="contact in userContacts"
                :key="contact._id"
                class="mb-3 rounded-r-[10px] border-l-[3px] border-waterblue bg-waterblue/5 px-4 py-3.5 transition-all hover:translate-x-0.5 hover:bg-waterblue/10"
              >
                <div class="mb-2 flex items-center justify-between">
                  <UiBadge class="bg-waterblue/15 text-waterblue">
                    <MessageSquare class="h-3 w-3" />
                    Message
                  </UiBadge>
                  <span class="text-xs text-muted-foreground">
                    {{ formatDate(contact.createdAt) }}
                  </span>
                </div>
                <p class="mb-0 text-sm">{{ contact.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="col-span-12 lg:col-span-5">
          <div
            class="relative overflow-hidden rounded-xl bg-customblack p-6 text-white md:p-8"
          >
            <div
              class="pointer-events-none absolute -bottom-20 -right-[60px] h-[220px] w-[220px] rounded-full bg-customyellow opacity-[0.12]"
            ></div>
            <h2 class="mb-2 text-[1.4rem] font-bold text-white">Get in touch</h2>
            <p class="mb-6 text-[0.95rem] text-white/65">
              Reach us directly through any of these channels.
            </p>

            <ul class="relative z-[1] m-0 list-none p-0">
              <li
                class="flex items-start gap-3.5 pb-4 transition-transform hover:translate-x-1"
              >
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]"
                >
                  <MapPin class="h-[22px] w-[22px] text-customyellow" />
                </span>
                <div>
                  <h4 class="mb-0.5 text-[0.95rem] font-semibold text-white">
                    Visit us
                  </h4>
                  <p class="m-0 text-[0.85rem] leading-normal text-white/65">
                    1234 Bookstore Drive<br />
                    Ho Chi Minh City, Vietnam
                  </p>
                </div>
              </li>

              <li
                class="flex items-start gap-3.5 border-t border-white/10 py-4 transition-transform hover:translate-x-1"
              >
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]"
                >
                  <Phone class="h-[22px] w-[22px] text-customyellow" />
                </span>
                <div>
                  <h4 class="mb-0.5 text-[0.95rem] font-semibold text-white">
                    Call us
                  </h4>
                  <p class="m-0 text-[0.85rem] leading-normal text-white/65">
                    +84 971 450 800<br />
                    Mon - Fri: 8AM - 6PM
                  </p>
                </div>
              </li>

              <li
                class="flex items-start gap-3.5 border-t border-white/10 py-4 transition-transform hover:translate-x-1"
              >
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]"
                >
                  <Mail class="h-[22px] w-[22px] text-customyellow" />
                </span>
                <div>
                  <h4 class="mb-0.5 text-[0.95rem] font-semibold text-white">
                    Email us
                  </h4>
                  <p class="m-0 text-[0.85rem] leading-normal text-white/65">
                    nhokhieukute2004@gmail.com<br />
                    We reply within 24 hours
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useContactStore } from "@/stores/contact";
import { Mail, MapPin, MessageSquare, Phone, Send } from "lucide-vue-next";

const authStore = useAuthStore();
const contactStore = useContactStore();
const { currentUser } = storeToRefs(authStore);
const { userContacts } = storeToRefs(contactStore);

const loading = ref(false);
const message = ref("");
const messageError = ref("");

const messageRules: Array<(v: string) => boolean | string> = [
  (v) => !!v || "Message is required",
  (v) => (!!v && v.length >= 10) || "Message must be at least 10 characters",
];

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

const isLoggedIn = computed(() => !!currentUser.value);
const formValid = computed(() =>
  messageRules.every((rule) => rule(message.value) === true)
);

function validateMessage(): boolean {
  for (const rule of messageRules) {
    const result = rule(message.value);
    if (result !== true) {
      messageError.value = result as string;
      return false;
    }
  }
  messageError.value = "";
  return true;
}

watch(message, () => {
  if (messageError.value) validateMessage();
});

async function submitForm() {
  if (!validateMessage()) {
    return;
  }

  loading.value = true;

  try {
    await contactStore.createContact(message.value);

    showSnackbar(
      "Thank you! Your feedback has been sent successfully.",
      "success"
    );

    // Reset form
    message.value = "";
    messageError.value = "";

    // Reload user contacts
    await contactStore.fetchUserContacts();
  } catch (error: any) {
    showSnackbar(
      error.response?.data?.message ||
        "Failed to send feedback. Please try again.",
      "error"
    );
  } finally {
    loading.value = false;
  }
}

function formatDate(date?: string | Date) {
  return new Date(date as string).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showSnackbar(msg: string, color = "success") {
  snackbar.message = msg;
  snackbar.color = color;
  snackbar.show = true;
}

onMounted(() => {
  if (isLoggedIn.value) {
    contactStore.fetchUserContacts();
  }
});
</script>

<style scoped>
.form-card {
  box-shadow: 0 20px 40px -24px rgba(82, 149, 208, 0.35);
  transition: box-shadow 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 24px 48px -20px rgba(82, 149, 208, 0.42);
}

.send-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px rgba(82, 149, 208, 0.55);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}
</style>
