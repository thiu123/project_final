<template>
  <div class="w-full max-w-[1040px] sm:border sm:border-border">
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
