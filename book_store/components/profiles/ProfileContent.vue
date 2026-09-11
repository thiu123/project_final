<template>
  <div
    class="min-h-screen bg-gradient-to-br from-white to-[#d4dfed] pt-16 dark:from-background dark:to-card md:pt-0"
  >
    <!-- Mobile header -->
    <header
      class="flex items-center gap-2 border-b border-border bg-card px-4 py-2 shadow-sm md:hidden"
    >
      <UiButton
        variant="ghost"
        size="icon"
        aria-label="Toggle navigation"
        @click="emit('toggle-drawer')"
      >
        <Menu class="h-5 w-5" />
      </UiButton>
      <h1 class="text-lg font-bold text-foreground">My Profile</h1>
    </header>

    <div class="container mx-auto p-6">
      <ProfilesTabsPersonalInfo
        v-if="activeTab === 'personal'"
        @show-snackbar="forwardSnackbar"
      />

      <ProfilesTabsOrders
        v-else-if="activeTab === 'orders'"
        :loading="loadingOrders"
      />

      <ProfilesTabsFavorites
        v-else-if="activeTab === 'favorites'"
        :loading="loadingFavorites"
      />

      <ProfilesTabsReviews
        v-else-if="activeTab === 'reviews'"
        :loading="loadingReviews"
      />

      <ProfilesTabsChangePassword
        v-else-if="activeTab === 'password'"
        @show-snackbar="forwardSnackbar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu } from "lucide-vue-next";
import type { SnackbarPayload } from "@/types";

withDefaults(
  defineProps<{
    activeTab?: string;
    loadingOrders?: boolean;
    loadingFavorites?: boolean;
    loadingReviews?: boolean;
  }>(),
  {
    activeTab: "personal",
    loadingOrders: false,
    loadingFavorites: false,
    loadingReviews: false,
  }
);

const emit = defineEmits<{
  "toggle-drawer": [];
  "show-snackbar": [payload: SnackbarPayload];
}>();

const forwardSnackbar = (payload: SnackbarPayload) =>
  emit("show-snackbar", payload);
</script>
