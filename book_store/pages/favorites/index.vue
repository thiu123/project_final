<template>
  <FavoritesListItems
    v-if="favorites.length"
    :favorites="favorites"
    :toggle-favorites="toggleFavorites"
  />
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
