<template>
    <FavoritesListItems v-if="favorites.length" :favorites="favorites" />
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
    computed: {
        ...mapState("favorite", ["favorites"]),
    },
    methods: {
        ...mapActions("favorite", ["getFavoritesForEachUser", "toggleFavorites"]),
    },
    async mounted() {
        await this.getFavoritesForEachUser();
    }
}
</script>