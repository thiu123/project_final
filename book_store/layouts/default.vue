<template>
  <div class="flex min-h-screen flex-col bg-background">
    <BaseNavigation />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
    <!-- Chatbot Widget -->
    <ChatbotWidget />
  </div>
</template>

<script setup lang="ts"></script>
