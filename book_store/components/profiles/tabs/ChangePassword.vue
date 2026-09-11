<template>
  <div class="min-h-[80vh]">
    <ProfilesTabsSectionHeading :icon="Lock" title="Change Password" />

    <div
      class="overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow-md dark:from-card dark:to-card"
    >
      <div class="p-8">
        <form @submit.prevent="updatePassword">
          <UiInput
            v-model="form.current"
            label="Current Password"
            type="password"
            required
            :error-message="errors.current"
            wrapper-class="mb-6"
            @focus="errors.current = ''"
          />

          <UiInput
            v-model="form.new"
            label="New Password"
            type="password"
            required
            :error-message="errors.new"
            wrapper-class="mb-6"
            @focus="errors.new = ''"
          />

          <UiInput
            v-model="form.confirm"
            label="Confirm New Password"
            type="password"
            required
            :error-message="errors.confirm"
            wrapper-class="mb-6"
            @focus="errors.confirm = ''"
          />

          <UiButton
            type="submit"
            size="lg"
            :loading="saving"
            class="rounded-lg bg-waterblue font-bold text-white shadow hover:bg-waterblue/90"
          >
            <KeyRound class="mr-2 h-5 w-5" />
            Update Password
          </UiButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KeyRound, Lock } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import type { SnackbarPayload } from "@/types";

const MIN_PASSWORD_LENGTH = 6;

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
