<template>
  <div class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <div class="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
      <section class="hero-rise lg:col-span-5">
        <p class="eyebrow">Contact</p>
        <h1 class="mt-5 font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl">
          We read every <span class="italic">letter.</span>
        </h1>
        <p class="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-muted-foreground">
          Questions about an order, a book you cannot find, or an idea for the shop. Send us a note and
          we will get back to you.
        </p>

        <dl class="mt-12 border-t border-border md:mt-16">
          <div
            v-for="detail in CONTACT_DETAILS"
            :key="detail.label"
            class="grid grid-cols-1 gap-2 border-b border-border py-5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6"
          >
            <dt class="eyebrow pt-1">{{ detail.label }}</dt>
            <dd class="min-w-0">
              <p class="break-words font-serif text-xl leading-snug">{{ detail.value }}</p>
              <p class="mt-1 text-[14px] text-muted-foreground">{{ detail.note }}</p>
            </dd>
          </div>
        </dl>
      </section>

      <section class="hero-rise lg:col-span-6 lg:col-start-7" style="--rise-delay: 120ms">
        <div class="border-t border-foreground pt-6 lg:mt-[3.25rem]">
          <p class="eyebrow">Send a message</p>
          <h2 class="mt-4 font-serif text-[2rem] font-normal leading-[1.05] tracking-[-0.02em] md:text-[2.5rem]">
            Write to us
          </h2>
          <p v-if="isLoggedIn" class="mt-3 text-[14px] text-muted-foreground">
            Sending as <span class="text-foreground">{{ currentUser?.username }}</span>
            <template v-if="currentUser?.email">
              <span class="mx-1.5 text-border">/</span>{{ currentUser?.email }}
            </template>
          </p>
        </div>

        <div
          v-if="!isLoggedIn"
          class="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-muted px-5 py-4"
        >
          <p class="flex items-center gap-3 text-[14px]">
            <span class="size-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
            Please sign in to send feedback.
          </p>
          <NuxtLink
            to="/login?redirect=/contact"
            class="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
          >
            <span class="ed-link">Sign in</span>
            <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" :stroke-width="1.5" />
          </NuxtLink>
        </div>

        <form class="mt-10" @submit.prevent="submitForm">
          <label class="eyebrow mb-2 block" for="contact-message">Your message</label>
          <UiTextarea
            id="contact-message"
            v-model="message"
            :rows="7"
            placeholder="Write your question, feedback, issue report, or anything you want to share..."
            :disabled="!isLoggedIn"
            :error-message="messageError"
            class="min-h-[220px] resize-y rounded-none bg-transparent px-5 py-4 text-[15px] leading-relaxed shadow-none placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:ring-0"
            @blur="validateMessage"
          />

          <div class="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-[12px] text-muted-foreground">At least 10 characters.</p>
            <UiButton
              type="submit"
              variant="ink"
              size="cta"
              class="w-full shadow-none sm:w-auto"
              :loading="loading"
              :disabled="!formValid || !isLoggedIn"
            >
              Send message
              <ArrowRight class="size-4" :stroke-width="1.5" />
            </UiButton>
          </div>
        </form>

        <div v-if="isLoggedIn && userContacts.length > 0" class="mt-20">
          <div class="flex items-baseline justify-between gap-4 border-b border-border pb-4">
            <h3 class="font-serif text-xl font-normal leading-snug md:text-2xl">Your message history</h3>
            <span class="eyebrow tabular-nums">{{ userContacts.length }}</span>
          </div>

          <ul class="divide-y divide-border">
            <li v-for="contact in userContacts" :key="contact._id" class="py-6">
              <p class="eyebrow tabular-nums">{{ formatDate(contact.createdAt) }}</p>
              <p class="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
                {{ contact.message }}
              </p>
            </li>
          </ul>
        </div>
      </section>
    </div>

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
import { ArrowRight } from "lucide-vue-next";

const CONTACT_DETAILS = [
  { label: "Visit", value: "1234 Bookstore Drive", note: "Ho Chi Minh City, Vietnam" },
  { label: "Call", value: "+84 971 450 800", note: "Monday to Friday, 8 am to 6 pm" },
  { label: "Email", value: "nhokhieukute2004@gmail.com", note: "We reply within 24 hours" },
];

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
