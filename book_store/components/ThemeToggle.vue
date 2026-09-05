<template>
  <button
    type="button"
    class="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <Sun class="h-5 w-5 scale-100 transition-transform duration-200 dark:scale-0" />
    <Moon
      class="absolute h-5 w-5 scale-0 transition-transform duration-200 dark:scale-100"
    />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import { Moon, Sun } from "lucide-vue-next";

const { isDark, toggleTheme } = useTheme();
</script>
