<template>
  <FavoritesListItems
    v-if="favorites.length"
    :favorites="favorites"
    :toggle-favorites="toggleFavorites"
  />
  <v-container v-else class="py-8">
    <v-card class="text-center pa-12" elevation="2">
      <v-icon size="80" color="grey-lighten-1" class="mb-4"
        >mdi-heart-outline</v-icon
      >
      <h2 class="text-h5 mb-2">No favorites yet</h2>
      <p class="text-body-1 text-medium-emphasis mb-4">
        Start adding books to your favorites to see them here
      </p>
      <v-btn color="primary" size="large" @click="$router.push('/')">
        <v-icon start>mdi-book-search</v-icon>
        Browse Books
      </v-btn>
    </v-card>
  </v-container>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  computed: {
    ...mapState("favorite", ["favorites"]),
  },
  methods: {
    ...mapActions("favorite", ["getFavoritesForEachUser", "toggleFavorites"]),
  },
  async mounted() {
    await this.getFavoritesForEachUser();
  },
};
</script>
