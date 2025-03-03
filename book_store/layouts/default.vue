<template>
  <v-app min-height="100vh">
    <v-main min-height="100vh">
      <base-navigation class="position-fixed w-100" style="z-index:9;" />
      <slot />
      <Footer />
    </v-main>
  </v-app>
</template>
