<template>
  <v-container class="navbar" fluid>
    <v-row align="center" no-gutters>
      <v-col cols="2">
        <NuxtLink to="/" custom v-slot="{ navigate }">
          <v-btn
            variant="text"
            @click="navigate"
            class="text-h4 font-weight-bold"
          >
            THMOVIE
          </v-btn>
        </NuxtLink>
      </v-col>

      <v-col cols="4">
        <v-text-field
          v-model="search"
          placeholder="Search movies..."
          variant="solo"
          hide-details
          density="compact"
          prepend-inner-icon="mdi-magnify"
        ></v-text-field>
      </v-col>

      <v-col cols="4" class="text-center">
        <v-btn variant="text" to="/">Home</v-btn>
        <v-btn variant="text" to="/anime">Anime</v-btn>
        <v-btn variant="text" to="/tv-series">TV series</v-btn>
        <v-btn variant="text" to="/movies">Movie</v-btn>
        <v-btn variant="text" to="/genres">Genres</v-btn>
      </v-col>

      <v-col cols="2">
        <v-btn v-if="!currentUser" variant="text" to="/login">Sign In</v-btn>
        <span v-else>Hi {{ currentUser.username }}</span>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
definePageMeta({
  layout: "default",
});
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
};
</script>
