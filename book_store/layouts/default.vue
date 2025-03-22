<template>
  <v-app min-height="100vh">
    <v-main class="bg-whitesmoke" min-height="100vh">
      <base-navigation class="w-100" style="z-index:9;" />
      <slot />
      <Footer />
    </v-main>
  </v-app>
</template>
