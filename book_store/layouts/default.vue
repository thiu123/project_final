<template>
  <v-app min-height="100vh">
    <v-main class="bg-customblack" min-height="100vh">
      <base-navigation class="position-fixed w-100" style="z-index:9; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" />
      <slot />
    </v-main>
  </v-app>
</template>
