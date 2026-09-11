<template>
  <div class="min-h-[80vh]">
    <ProfilesTabsSectionHeading :icon="Heart" title="My Favorites" />

    <ProfilesTabsLoadingState v-if="loading" label="Loading favorites..." />

    <div v-else-if="validFavorites.length" class="grid grid-cols-12 gap-4">
      <div
        v-for="favorite in validFavorites"
        :key="favorite._id"
        class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3"
      >
        <div
          class="group flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow transition-all duration-300 hover:shadow-lg dark:from-card dark:to-card"
        >
          <div class="relative flex min-h-[280px] items-center justify-center p-5">
            <div
              class="relative aspect-[2/3] w-[70%] max-w-[180px] overflow-hidden shadow-lg transition-all [transition-duration:400ms] group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-2xl"
            >
              <img
                :src="favorite.bookId.cover_url"
                :alt="favorite.bookId.title"
                class="block h-full w-full bg-muted object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div class="p-6">
            <h4 class="mb-2 truncate text-base font-bold text-foreground">
              {{ favorite.bookId.title }}
            </h4>
            <p class="mb-3 text-sm text-muted-foreground">
              by {{ favorite.bookId.authors?.join(", ") || "Unknown Author" }}
            </p>
            <p class="mb-4 text-lg font-bold text-waterblue">
              {{ formatUsd(favorite.bookId.price) }}
            </p>
          </div>

          <div class="mt-auto flex flex-col items-center p-6 pt-0">
            <UiButton
              tag="NuxtLink"
              :to="`/details/${favorite.bookId._id}`"
              block
              size="lg"
              class="mb-3 rounded-lg bg-waterblue font-bold text-white hover:bg-waterblue/90"
            >
              <Eye class="mr-2 h-5 w-5" />
              View Details
            </UiButton>
            <UiButton
              variant="ghost"
              size="icon"
              class="text-destructive transition-all duration-300 hover:scale-110 hover:text-destructive"
              aria-label="Remove from favorites"
              @click="favoriteStore.toggleFavorites(favorite.bookId._id)"
            >
              <Heart class="h-5 w-5 fill-current" />
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <ProfilesTabsEmptyState
      v-else
      :icon="Heart"
      title="No favorites yet"
      :action-icon="Search"
      action-label="Browse Books"
    >
      You haven't added any books to your favorite yet. Start exploring to find
      your favorite books!
    </ProfilesTabsEmptyState>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Eye, Heart, Search } from "lucide-vue-next";
import { useFavoriteStore } from "@/stores/favorite";
import { populatedFavorites } from "@/utils/favorites";
import { formatUsd } from "@/utils/pricing";

defineProps<{ loading: boolean }>();

const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);

const validFavorites = computed(() => populatedFavorites(favorites.value));
</script>
