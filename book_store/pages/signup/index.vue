<template>
  <div
    class="w-full max-w-[920px] overflow-hidden rounded-xl border border-border shadow-[0_24px_60px_-28px_hsl(var(--foreground)/0.25)] dark:shadow-none"
  >
    <SignUp
      @signed-up="router.push({ path: '/login', query: { registered: '1' } })"
      @toggle-sign-in="router.push('/login')"
    />
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  layout: "auth",
});

const router = useRouter();
</script>
