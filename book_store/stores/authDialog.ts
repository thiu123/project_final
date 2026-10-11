import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

export type AuthDialog = "sign-in" | "sign-up" | "forgot-password" | null;

export const useAuthDialogStore = defineStore("authDialog", () => {
  const dialog = ref<AuthDialog>(null);
  const prompt = ref("");
  let pendingAction: (() => unknown) | null = null;

  const { currentUser } = storeToRefs(useAuthStore());

  function open(next: AuthDialog) {
    dialog.value = next;
  }

  function openSignIn(notice: string) {
    if (!pendingAction) prompt.value = notice;
    dialog.value = "sign-in";
  }

  function close() {
    dialog.value = null;
    prompt.value = "";
  }

  function dismiss() {
    close();
    pendingAction = null;
  }

  function ensureSignedIn(message: string, resume: () => unknown): boolean {
    if (currentUser.value) return true;
    prompt.value = message;
    pendingAction = resume;
    dialog.value = "sign-in";
    return false;
  }

  function completeSignIn(): boolean {
    const action = pendingAction;
    pendingAction = null;
    close();
    action?.();
    return action !== null;
  }

  return {
    dialog,
    prompt,
    open,
    openSignIn,
    close,
    dismiss,
    ensureSignedIn,
    completeSignIn,
  };
});
