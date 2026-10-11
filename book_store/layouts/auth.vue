<template>
  <div class="flex min-h-[100dvh] flex-col bg-background">
    <header class="border-b border-border">
      <div class="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:h-[76px]">
        <NuxtLink
          to="/"
          class="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="THBookStore home"
        >
          <AuthBrandMark />
        </NuxtLink>

        <div class="flex items-center gap-5">
          <NuxtLink
            to="/"
            class="group hidden items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] text-foreground sm:inline-flex"
          >
            <ArrowLeft class="size-4 transition-transform duration-300 group-hover:-translate-x-1" :stroke-width="1.5" />
            <span class="ed-link">Back to the shop</span>
          </NuxtLink>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <main class="flex flex-1 items-start justify-center px-4 py-8 sm:py-12 md:items-center md:py-16">
      <slot />
    </main>

    <footer class="border-t border-border">
      <div
        class="container mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <span>&copy; 2025 THBookStore. All rights reserved.</span>
        <NuxtLink to="/contact" class="ed-link self-start sm:self-auto">Need help? Contact us</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

useHead({ bodyAttrs: { class: "storefront" } });
</script>
