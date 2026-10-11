<template>
  <div
    :class="[
      'grid w-full bg-background text-foreground',
      $slots.panel && 'md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]',
    ]"
  >
    <aside
      v-if="$slots.panel"
      class="relative hidden min-h-[600px] flex-col bg-foreground p-10 text-background dark:bg-muted dark:text-foreground md:flex lg:p-12"
    >
      <AuthBrandMark v-if="embedded" class="!text-background dark:!text-foreground" />

      <div class="mt-auto pt-16">
        <p class="text-[11px] font-medium uppercase tracking-[0.22em] opacity-60">{{ panelLabel }}</p>
        <p class="mt-6 max-w-[12ch] font-serif text-[2.6rem] font-normal leading-[1.04] tracking-[-0.025em] lg:text-[3.1rem]">
          <slot name="panel" />
        </p>
        <p v-if="caption" class="mt-6 max-w-[34ch] text-[15px] leading-relaxed opacity-70">
          {{ caption }}
        </p>
      </div>

      <div
        class="mt-12 flex items-center justify-between gap-4 border-t pt-5 text-[10.5px] font-medium uppercase tracking-[0.2em] [border-color:hsl(var(--background)/0.18)] dark:[border-color:hsl(var(--border))]"
      >
        <span class="whitespace-nowrap opacity-60">Hardbacks delivered</span>
        <span class="whitespace-nowrap opacity-60">Ebooks instantly</span>
      </div>
    </aside>

    <section
      class="flex min-w-0 flex-col justify-center py-10 sm:px-12 sm:py-14 lg:px-16"
      :class="embedded ? 'px-6' : 'px-0'"
    >
      <AuthBrandMark v-if="embedded" size="sm" class="mb-10 md:hidden" />

      <header class="mb-9">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <component
          :is="embedded ? 'h2' : 'h1'"
          class="mt-4 font-serif text-[2.25rem] font-normal leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[2.6rem]"
        >
          {{ title }}
        </component>
        <p v-if="subtitle" class="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-muted-foreground">
          {{ subtitle }}
        </p>
      </header>

      <slot />

      <footer
        v-if="$slots.footer"
        class="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-6 text-[14px] text-muted-foreground"
      >
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    eyebrow?: string;
    caption?: string;
    panelLabel?: string;
    embedded?: boolean;
  }>(),
  { subtitle: "", eyebrow: "", caption: "", panelLabel: "THBookStore", embedded: false }
);
</script>
