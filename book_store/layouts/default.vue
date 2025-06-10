<template>
  <v-app
    min-height="100vh"
    style="background: linear-gradient(115deg, #ffffff, #d4dfed)"
  >
    <v-main min-height="100vh">
      <base-navigation class="w-100" style="z-index: 9" />
      <slot />
      <Footer />
    </v-main>
  </v-app>
</template>
