<template>
  <div>
    <UiDialog :open="dialog === 'sign-in'" @update:open="onOpenChange">
      <UiDialogContent class="overflow-hidden p-0 sm:max-w-5xl">
        <UiDialogTitle class="sr-only">Sign In</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Sign in to your THBookStore account
        </UiDialogDescription>

        <Login
          @toggle-sign-up="open('sign-up')"
          @toggle-forgot-password="open('forgot-password')"
          @show-snackbar="onSignInSnackbar"
        />
      </UiDialogContent>
    </UiDialog>

    <UiDialog :open="dialog === 'sign-up'" @update:open="onOpenChange">
      <UiDialogContent class="overflow-hidden p-0 sm:max-w-5xl">
        <UiDialogTitle class="sr-only">Sign Up</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Create a new THBookStore account
        </UiDialogDescription>

        <SignUp
          @signed-up="dialog = 'sign-in'"
          @toggle-sign-in="open('sign-in')"
        />
      </UiDialogContent>
    </UiDialog>

    <UiDialog :open="dialog === 'forgot-password'" @update:open="onOpenChange">
      <UiDialogContent class="p-0 sm:max-w-lg">
        <UiDialogTitle class="sr-only">Forgot Password</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Reset your THBookStore account password
        </UiDialogDescription>

        <ForgotPassword @back-to-login="open('sign-in')" />
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import type { SnackbarPayload } from "@/types";

export type AuthDialog = "sign-in" | "sign-up" | "forgot-password" | null;

/**
 * One value rather than three booleans: the three dialogs are mutually
 * exclusive, and the old trio needed a `nextTick` dance to avoid two being open
 * at once while switching between them.
 */
const dialog = defineModel<AuthDialog>({ default: null });

const emit = defineEmits<{
  "show-snackbar": [payload: SnackbarPayload];
}>();

function open(next: AuthDialog) {
  dialog.value = next;
}

function onOpenChange(isOpen: boolean) {
  if (!isOpen) dialog.value = null;
}

function onSignInSnackbar(payload: SnackbarPayload) {
  emit("show-snackbar", payload);
  // A successful sign-in has nothing left to show in the dialog.
  if (payload.color === "success") dialog.value = null;
}
</script>
