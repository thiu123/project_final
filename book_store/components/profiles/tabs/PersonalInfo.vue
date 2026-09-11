<template>
  <div class="min-h-[80vh]">
    <ProfilesTabsSectionHeading :icon="CircleUser" title="Personal Information" />

    <div
      class="overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow-md dark:from-card dark:to-card"
    >
      <div class="p-8">
        <!-- Avatar -->
        <div class="mb-8 flex items-center">
          <UserAvatar
            :src="currentUser?.avatar_url"
            :name="currentUser?.username"
            class="mr-6 h-[120px] w-[120px] text-4xl shadow-md"
          >
            <User class="h-10 w-10 text-muted-foreground" />
          </UserAvatar>

          <div>
            <h3 class="mb-2 text-2xl font-semibold">
              {{ currentUser?.username || "User" }}
            </h3>
            <p class="mb-4 text-sm text-muted-foreground">
              {{ currentUser?.email || "" }}
            </p>

            <UiButton
              class="mr-3 bg-waterblue text-white hover:bg-waterblue/90"
              :loading="uploading"
              @click="avatarInput?.click()"
            >
              <Camera class="mr-1 h-4 w-4" />
              Change Avatar
            </UiButton>

            <UiButton
              v-if="currentUser?.avatar_url"
              variant="outline"
              class="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              @click="removeAvatar"
            >
              <Trash2 class="mr-1 h-4 w-4" />
              Remove
            </UiButton>

            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarUpload"
            />
          </div>
        </div>

        <UiSeparator class="mb-8" />

        <div class="grid grid-cols-12 gap-x-4">
          <div
            v-for="field in fields"
            :key="field.label"
            class="col-span-12 md:col-span-6"
          >
            <UiInput
              :model-value="field.value"
              :label="field.label"
              readonly
              wrapper-class="mb-4"
            >
              <template #prepend>
                <component :is="field.icon" class="h-4 w-4" />
              </template>
            </UiInput>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import {
  Camera,
  CircleUser,
  Mail,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-vue-next";
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
  { label: "Username", value: currentUser.value?.username ?? "", icon: User },
  { label: "Email", value: currentUser.value?.email ?? "", icon: Mail },
  {
    label: "Role",
    // The User model's field is `admin`; the original template read a
    // non-existent `isAdmin`, so every account showed as a standard user.
    value: currentUser.value?.admin ? "Administrator" : "Standard User",
    icon: ShieldCheck,
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
