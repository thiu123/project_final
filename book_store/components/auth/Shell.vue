<template>
  <div
    :class="[
      'grid w-full bg-card text-card-foreground',
      caption && 'md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]',
    ]"
  >
    <aside
      v-if="caption"
      class="relative hidden min-h-[560px] overflow-hidden bg-[#CDFFDF] text-darkgreen dark:brightness-[0.82] md:block"
    >
      <img
        :src="illustration"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 h-full w-full object-contain px-10 py-24"
      />
      <div class="relative flex h-full flex-col justify-between p-8">
        <AuthBrandMark v-if="embedded" />
        <p class="mt-auto max-w-[22ch] text-xl font-semibold leading-snug tracking-tight">
          {{ caption }}
        </p>
      </div>
    </aside>

    <section class="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-10">
      <AuthBrandMark v-if="embedded" class="mb-8 md:hidden" />

      <header class="mb-6">
        <component
          :is="embedded ? 'h2' : 'h1'"
          class="text-2xl font-semibold tracking-tight text-foreground"
        >
          {{ title }}
        </component>
        <p class="mt-1.5 text-sm text-muted-foreground">{{ subtitle }}</p>
      </header>

      <slot />

      <footer
        v-if="$slots.footer"
        class="mt-6 text-center text-sm text-muted-foreground"
      >
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import illustration from "~/assets/bg.jpg";

withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    caption?: string;
    embedded?: boolean;
  }>(),
  { caption: "", embedded: false }
);
</script>
