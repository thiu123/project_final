<template>
  <section>
    <ProfilesTabsSectionHeading
      eyebrow="Security"
      title="Change password"
      :description="`Enter your current password, then choose a new one of at least ${MIN_PASSWORD_LENGTH} characters.`"
    />

    <form class="grid max-w-md gap-7" @submit.prevent="updatePassword">
      <div>
        <label for="profile-current-password" class="eyebrow mb-1 block">Current password</label>
        <UiInput
          id="profile-current-password"
          v-model="form.current"
          type="password"
          autocomplete="current-password"
          required
          :class="FIELD_CLASS"
          :error-message="errors.current"
          @focus="errors.current = ''"
        />
      </div>

      <div>
        <label for="profile-new-password" class="eyebrow mb-1 block">New password</label>
        <UiInput
          id="profile-new-password"
          v-model="form.new"
          type="password"
          autocomplete="new-password"
          required
          :class="FIELD_CLASS"
          :error-message="errors.new"
          @focus="errors.new = ''"
        />
      </div>

      <div>
        <label for="profile-confirm-password" class="eyebrow mb-1 block">Confirm new password</label>
        <UiInput
          id="profile-confirm-password"
          v-model="form.confirm"
          type="password"
          autocomplete="new-password"
          required
          :class="FIELD_CLASS"
          :error-message="errors.confirm"
          @focus="errors.confirm = ''"
        />
      </div>

      <div class="pt-1">
        <UiButton type="submit" variant="ink" size="cta" :loading="saving" class="w-full shadow-none sm:w-auto">
          Update password
        </UiButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import type { SnackbarPayload } from "@/types";

const MIN_PASSWORD_LENGTH = 6;

const FIELD_CLASS =
  "h-12 rounded-none border-0 border-b bg-transparent px-0 text-[15px] shadow-none focus-visible:border-foreground focus-visible:ring-0";

const emit = defineEmits<{
  "show-snackbar": [payload: SnackbarPayload];
}>();

const authStore = useAuthStore();

const form = reactive({ current: "", new: "", confirm: "" });
const errors = reactive({ current: "", new: "", confirm: "" });
const saving = ref(false);

function validate(): boolean {
  errors.current = form.current ? "" : "Current password is required";

  errors.new = !form.new
    ? "New password is required"
    : form.new.length < MIN_PASSWORD_LENGTH
      ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      : "";

  errors.confirm = !form.confirm
    ? "Please confirm your password"
    : form.confirm !== form.new
      ? "Passwords do not match"
      : "";

  return !errors.current && !errors.new && !errors.confirm;
}

function reset() {
  form.current = "";
  form.new = "";
  form.confirm = "";
  errors.current = "";
  errors.new = "";
  errors.confirm = "";
}

async function updatePassword() {
  if (!validate()) return;

  saving.value = true;
  try {
    await authStore.changePassword({
      currentPassword: form.current,
      newPassword: form.new,
    });

    emit("show-snackbar", {
      message: "Password updated successfully!",
      color: "success",
    });
    reset();
  } catch (error: any) {
    console.error("Error changing password:", error);
    emit("show-snackbar", {
      message:
        error.message ||
        error.msg ||
        "Failed to update password. Please try again.",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}
</script>
