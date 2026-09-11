<template>
  <UiAvatar>
    <UiAvatarImage
      v-if="user?.avatar_url"
      :src="user.avatar_url"
      :alt="`${user.username} avatar`"
    />
    <UiAvatarFallback>{{ initial }}</UiAvatarFallback>
  </UiAvatar>
</template>

<script setup lang="ts">
import type { User } from "@/types";

/**
 * The nav used to fall back to a hard-coded Vuetify demo portrait
 * (`cdn.vuetifyjs.com/images/john.jpg`) for accounts without an avatar. The
 * fallback slot already handles that, with the user's own initial.
 */
const props = defineProps<{ user: User | null }>();

const initial = computed(() =>
  (props.user?.username || "U").charAt(0).toUpperCase()
);
</script>
