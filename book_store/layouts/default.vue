<template>
  <v-app
    min-height="100vh"
    style="background: #F9FAFB"
  >
    <v-main min-height="100vh">
      <base-navigation class="w-100" style="z-index: 9" />
      <slot />
      <Footer />
      <!-- Chatbot Widget -->
      <ChatbotWidget />
    </v-main>
  </v-app>
</template>
