<template>
  <UiAvatar :class="props.class">
    <!--
      Mounted only when there is a URL. reka-ui reads an empty `src` as a failed
      load, and an empty `src` attribute makes the browser re-request the current
      page as an image.
    -->
    <UiAvatarImage
      v-if="src"
      :src="src"
      :alt="alt"
      referrer-policy="no-referrer"
    />
    <UiAvatarFallback>
      <slot>{{ initial }}</slot>
    </UiAvatarFallback>
  </UiAvatar>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";

/**
 * One avatar for every screen.
 *
 * Centralised for `referrer-policy`: Google serves profile photos from
 * `lh3.googleusercontent.com`, which throttles hot-linked requests that carry a
 * `Referer` header and answers 429. The image then fails to load and reka-ui
 * swaps in the fallback — intermittently, which made a network problem look
 * like a state one. `no-referrer` is what Google's CDN expects from a
 * third-party page.
 */
const props = withDefaults(
  defineProps<{
    src?: string | null;
    /** Drives the fallback initial and the image's alt text. */
    name?: string | null;
    class?: HTMLAttributes["class"];
  }>(),
  { src: null, name: null, class: undefined }
);

const alt = computed(() =>
  props.name ? `${props.name} avatar` : "User avatar"
);

const initial = computed(() => (props.name || "U").charAt(0).toUpperCase());
</script>
