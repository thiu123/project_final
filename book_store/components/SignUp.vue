<template>
  <AuthShell
    :embedded="embedded"
    eyebrow="Create account"
    title="Join THBookStore"
    subtitle="Save the books you love and follow every order."
    panel-label="New readers"
    caption="Keep favorites, track deliveries and read your ebooks right in the browser."
  >
    <template #panel>A shelf of your <span class="italic">own.</span></template>

    <form class="grid gap-6" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="signup-email" class="eyebrow mb-1 block">Email</label>
        <UiInput
          id="signup-email"
          v-model="email"
          type="email"
          autocomplete="email"
          :class="FIELD_CLASS"
          :error-message="errors.email"
          @input="errors.email = ''"
        />
      </div>

      <div>
        <label for="signup-username" class="eyebrow mb-1 block">Username</label>
        <UiInput
          id="signup-username"
          v-model="username"
          autocomplete="username"
          :class="FIELD_CLASS"
          hint="Letters, numbers and underscores."
          :error-message="errors.username"
          @input="errors.username = ''"
        />
      </div>

      <div class="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div>
          <label for="signup-password" class="eyebrow mb-1 block">Password</label>
          <UiInput
            id="signup-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :class="[FIELD_CLASS, 'pr-9']"
            :error-message="errors.password"
            @input="errors.password = ''"
          >
            <template #append>
              <button
                type="button"
                class="-mr-3 flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-4" :stroke-width="1.5" />
                <Eye v-else class="size-4" :stroke-width="1.5" />
              </button>
            </template>
          </UiInput>
        </div>

        <div>
          <label for="signup-confirm" class="eyebrow mb-1 block">Confirm password</label>
          <UiInput
            id="signup-confirm"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :class="FIELD_CLASS"
            :error-message="errors.confirmPassword"
            @input="errors.confirmPassword = ''"
          />
        </div>
      </div>
      <p
        v-if="!errors.password && !errors.confirmPassword"
        class="-mt-3 text-xs text-muted-foreground"
      >
        At least 6 characters, with one uppercase letter and one number.
      </p>

      <div>
        <UiCheckbox
          v-model="agreeToTerms"
          class="rounded-none border-foreground/50 shadow-none data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background"
          @update:model-value="errors.terms = ''"
        >
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

      <UiButton type="submit" variant="ink" size="cta" block :loading="submitting" class="mt-1 shadow-none">
        Create account
      </UiButton>
    </form>

    <div class="my-7 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
      <span class="h-px flex-1 bg-border" />
      or
      <span class="h-px flex-1 bg-border" />
    </div>

    <AuthGoogleButton />

    <template #footer>
      Already have an account?
      <AuthTextLink class="text-[12px] uppercase tracking-[0.14em]" @click="$emit('toggle-sign-in')">
        Sign in
      </AuthTextLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";

const FIELD_CLASS =
  "h-12 rounded-none border-0 border-b bg-transparent px-0 text-[15px] shadow-none focus-visible:border-foreground focus-visible:ring-0";

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
