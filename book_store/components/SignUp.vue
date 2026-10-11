<template>
  <AuthShell
    :embedded="embedded"
    title="Create your account"
    subtitle="Join THBookStore to save books and track your orders."
    caption="Save favorites, track orders and read ebooks online."
  >
    <AuthGoogleButton />

    <div class="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span class="h-px flex-1 bg-border" />
      or
      <span class="h-px flex-1 bg-border" />
    </div>

    <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
      <UiInput
        id="signup-email"
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        class="h-10"
        :error-message="errors.email"
        @input="errors.email = ''"
      />

      <UiInput
        id="signup-username"
        v-model="username"
        label="Username"
        autocomplete="username"
        class="h-10"
        hint="Letters, numbers and underscores."
        :error-message="errors.username"
        @input="errors.username = ''"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput
          id="signup-password"
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          class="h-10"
          :error-message="errors.password"
          @input="errors.password = ''"
        >
          <template #append>
            <button
              type="button"
              class="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </template>
        </UiInput>

        <UiInput
          id="signup-confirm"
          v-model="confirmPassword"
          label="Confirm password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          class="h-10"
          :error-message="errors.confirmPassword"
          @input="errors.confirmPassword = ''"
        />
      </div>
      <p
        v-if="!errors.password && !errors.confirmPassword"
        class="-mt-2 text-xs text-muted-foreground"
      >
        At least 6 characters, with one uppercase letter and one number.
      </p>

      <div>
        <UiCheckbox v-model="agreeToTerms" @update:model-value="errors.terms = ''">
          I agree to the Terms of Use
        </UiCheckbox>
        <p v-if="errors.terms" class="mt-1 text-xs text-destructive">
          {{ errors.terms }}
        </p>
      </div>

      <Transition
        enter-active-class="motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="motion-safe:transition motion-safe:duration-150"
        leave-to-class="opacity-0"
      >
        <AuthFormMessage v-if="errorMessage" tone="error">
          {{ errorMessage }}
        </AuthFormMessage>
      </Transition>

      <UiButton type="submit" variant="ink" size="lg" block :loading="submitting" class="mt-1">
        Create account
      </UiButton>
    </form>

    <template #footer>
      Already have an account?
      <AuthTextLink @click="$emit('toggle-sign-in')">Sign in</AuthTextLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";

withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false });

const emit = defineEmits<{
  (e: "signed-up"): void;
  (e: "toggle-sign-in"): void;
}>();

const authStore = useAuthStore();

const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const agreeToTerms = ref(false);
const submitting = ref(false);
const errorMessage = ref("");

type Field = "email" | "username" | "password" | "confirmPassword" | "terms";

const errors = reactive<Record<Field, string>>({
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  terms: "",
});

type Rule = (value: string) => true | string;

const RULES: Record<Exclude<Field, "terms">, Rule[]> = {
  email: [
    (v) => !!v || "Enter your email",
    (v) => /^\S+@\S+\.\S+$/.test(v) || "Enter a valid email address",
  ],
  username: [
    (v) => !!v || "Choose a username",
    (v) => v.length >= 3 || "Use at least 3 characters",
    (v) => /^\w+$/.test(v) || "Use only letters, numbers and underscores",
  ],
  password: [
    (v) => v.length >= 6 || "Use at least 6 characters",
    (v) => /[A-Z]/.test(v) || "Add an uppercase letter",
    (v) => /\d/.test(v) || "Add a number",
  ],
  confirmPassword: [
    (v) => !!v || "Repeat your password",
    (v) => v === password.value || "Passwords do not match",
  ],
};

function firstError(rules: Rule[], value: string): string {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return "";
}

function validate(): boolean {
  errors.email = firstError(RULES.email, email.value.trim());
  errors.username = firstError(RULES.username, username.value.trim());
  errors.password = firstError(RULES.password, password.value);
  errors.confirmPassword = firstError(RULES.confirmPassword, confirmPassword.value);
  errors.terms = agreeToTerms.value ? "" : "Accept the Terms of Use to continue";
  return Object.values(errors).every((message) => !message);
}

async function onSubmit() {
  errorMessage.value = "";
  if (!validate()) return;

  submitting.value = true;
  try {
    await authStore.register({
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value,
    });
    emit("signed-up");
  } catch (error: any) {
    const data = error?.response?.data ?? error;
    const message: string =
      data?.msg || data?.message || "Could not create your account. Please try again.";
    if (data?.field === "email" || data?.field === "username") {
      errors[data.field as "email" | "username"] = message;
    } else {
      errorMessage.value = message;
    }
  } finally {
    submitting.value = false;
  }
}
</script>
