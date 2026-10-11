<template>
  <div class="min-w-0">
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
</template>

<script setup lang="ts">
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
  "show-snackbar": [payload: SnackbarPayload];
}>();

const forwardSnackbar = (payload: SnackbarPayload) =>
  emit("show-snackbar", payload);
</script>
