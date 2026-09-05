<template>
  <FavoritesListItems
    v-if="favorites.length"
    :favorites="favorites"
    :toggle-favorites="favoriteStore.toggleFavorites"
  />
  <div v-else class="container mx-auto px-4 py-8">
    <UiCard class="p-12 text-center shadow">
      <Heart class="mx-auto mb-4 h-20 w-20 text-muted-foreground/40" />
      <h2 class="mb-2 text-2xl font-semibold">No favorites yet</h2>
      <p class="mb-4 text-base text-muted-foreground">
        Start adding books to your favorites to see them here
      </p>
      <UiButton size="lg" @click="router.push('/')">
        <BookOpen class="mr-1 h-5 w-5" />
        Browse Books
      </UiButton>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFavoriteStore } from "@/stores/favorite";
import { BookOpen, Heart } from "lucide-vue-next";

const router = useRouter();
const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);

onMounted(async () => {
  await favoriteStore.getFavoritesForEachUser();
});
</script>
