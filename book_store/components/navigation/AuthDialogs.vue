<template>
  <div>
    <UiDialog :open="dialog === 'sign-in'" @update:open="onOpenChange">
      <UiDialogContent :class="DIALOG_CLASS">
        <UiDialogTitle class="sr-only">Sign in</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Sign in to your THBookStore account
        </UiDialogDescription>

        <Login
          embedded
          :notice="prompt"
          @signed-in="onSignedIn"
          @toggle-sign-up="authDialog.open('sign-up')"
          @toggle-forgot-password="authDialog.open('forgot-password')"
        />
      </UiDialogContent>
    </UiDialog>

    <UiDialog :open="dialog === 'sign-up'" @update:open="onOpenChange">
      <UiDialogContent :class="DIALOG_CLASS">
        <UiDialogTitle class="sr-only">Sign up</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Create a new THBookStore account
        </UiDialogDescription>

        <SignUp
          embedded
          @signed-up="authDialog.openSignIn('Your account is ready. Sign in to continue.')"
          @toggle-sign-in="authDialog.open('sign-in')"
        />
      </UiDialogContent>
    </UiDialog>

    <UiDialog :open="dialog === 'forgot-password'" @update:open="onOpenChange">
      <UiDialogContent :class="DIALOG_CLASS">
        <UiDialogTitle class="sr-only">Reset your password</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Get a password reset link by email
        </UiDialogDescription>

        <ForgotPassword embedded @back-to-login="authDialog.open('sign-in')" />
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthDialogStore } from "@/stores/authDialog";
import type { SnackbarPayload, User } from "@/types";

const DIALOG_CLASS =
  "max-w-[980px] gap-0 overflow-y-auto overflow-x-hidden border-0 p-0 shadow-none max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)] sm:rounded-none";

const emit = defineEmits<{
  "show-snackbar": [payload: SnackbarPayload];
}>();

const authDialog = useAuthDialogStore();
const { dialog, prompt } = storeToRefs(authDialog);

function onOpenChange(isOpen: boolean) {
  if (!isOpen) authDialog.dismiss();
}

function onSignedIn(user: User) {
  const resumed = authDialog.completeSignIn();
  if (!resumed) {
    emit("show-snackbar", {
      message: `Welcome back, ${user.username || "reader"}!`,
      color: "success",
    });
  }
}
</script>
