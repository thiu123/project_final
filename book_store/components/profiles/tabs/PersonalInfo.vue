<template>
  <section>
    <ProfilesTabsSectionHeading
      eyebrow="Profile"
      title="Personal information"
      description="The details on your THBookStore account."
    />

    <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      <UserAvatar
        :src="currentUser?.avatar_url"
        :name="currentUser?.username"
        class="size-24 shrink-0 bg-muted font-serif text-4xl text-foreground md:size-28"
      />

      <div class="min-w-0">
        <p class="truncate font-serif text-2xl leading-tight md:text-[1.75rem]">
          {{ currentUser?.username || "User" }}
        </p>
        <p class="mt-1 truncate text-[14px] text-muted-foreground">
          {{ currentUser?.email || "" }}
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
          <button
            type="button"
            class="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-foreground disabled:pointer-events-none disabled:opacity-50"
            :disabled="uploading"
            @click="avatarInput?.click()"
          >
            <Loader2 v-if="uploading" class="size-4 animate-spin" :stroke-width="1.5" />
            <Camera v-else class="size-4" :stroke-width="1.5" />
            <span class="ed-link">{{ uploading ? "Uploading" : "Change photo" }}</span>
          </button>

          <button
            v-if="currentUser?.avatar_url"
            type="button"
            class="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-destructive"
            @click="removeAvatar"
          >
            <span class="ed-link">Remove</span>
          </button>
        </div>
        <p class="mt-3 text-[12px] text-muted-foreground">Any image file, up to 5 MB.</p>

        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarUpload"
        />
      </div>
    </div>

    <dl class="mt-12 border-t border-border md:mt-14">
      <div
        v-for="field in fields"
        :key="field.label"
        class="grid grid-cols-1 gap-2 border-b border-border py-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-baseline sm:gap-8"
      >
        <dt class="eyebrow">{{ field.label }}</dt>
        <dd class="break-words text-[15px] text-foreground">{{ field.value || "Not set" }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Camera, Loader2 } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { uploadAvatar } from "@/api/userApi";
import type { SnackbarPayload, User as UserType } from "@/types";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const emit = defineEmits<{
  "show-snackbar": [payload: SnackbarPayload];
}>();

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);

const uploading = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);

const fields = computed(() => [
  { label: "Username", value: currentUser.value?.username ?? "" },
  { label: "Email", value: currentUser.value?.email ?? "" },
  {
    label: "Role",
    // The User model's field is `admin`; the original template read a
    // non-existent `isAdmin`, so every account showed as a standard user.
    value: currentUser.value?.admin ? "Administrator" : "Standard User",
  },
]);

async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    if (!file.type.startsWith("image/")) {
      emit("show-snackbar", {
        message: "Please select a valid image file",
        color: "error",
      });
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      emit("show-snackbar", {
        message: "File size must be less than 5MB",
        color: "error",
      });
      return;
    }

    uploading.value = true;
    const response = await uploadAvatar(file);
    const updatedUser = response.data.data;

    if (updatedUser?.avatar_url) {
      authStore.loginSuccess({
        ...(currentUser.value as UserType),
        avatar_url: updatedUser.avatar_url,
      });
      emit("show-snackbar", {
        message: "Avatar updated successfully!",
        color: "success",
      });
    }
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    emit("show-snackbar", {
      message: error.response?.data?.msg || "Failed to upload avatar",
      color: "error",
    });
  } finally {
    uploading.value = false;
    input.value = ""; // let the same file be picked again
  }
}

function removeAvatar() {
  if (!confirm("Are you sure you want to remove your avatar?")) return;

  authStore.loginSuccess({
    ...(currentUser.value as UserType),
    avatar_url: null,
  });

  emit("show-snackbar", {
    message: "Avatar removed successfully!",
    color: "success",
  });
}
</script>
