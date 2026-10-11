<template>
  <FavoritesListItems
    v-if="favorites.length"
    :favorites="favorites"
    :toggle-favorites="favoriteStore.toggleFavorites"
  />
  <div v-else class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <nav aria-label="Breadcrumb" class="hero-rise text-[13px] text-muted-foreground">
      <ol class="flex flex-wrap items-center gap-x-2">
        <li>
          <NuxtLink to="/" class="transition-colors hover:text-foreground">Home</NuxtLink>
        </li>
        <li class="text-border" aria-hidden="true">/</li>
        <li class="text-foreground" aria-current="page">Favorites</li>
      </ol>
    </nav>

    <header class="mt-8 md:mt-12">
      <p class="eyebrow hero-rise" style="--rise-delay: 60ms">Your shelf</p>
      <h1
        class="hero-rise mt-5 font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl"
        style="--rise-delay: 120ms"
      >
        Saved for <span class="italic">later</span>
      </h1>
    </header>

    <div class="mt-10 grid gap-8 border-t border-border py-16 md:mt-14 md:grid-cols-12 md:gap-12 md:py-24">
      <p
        class="font-serif text-3xl font-normal leading-[1.1] tracking-[-0.02em] md:col-span-7 md:text-[2.75rem]"
      >
        No favorites <span class="italic">yet</span>
      </p>
      <div class="md:col-span-5">
        <p class="max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground">
          Start adding books to your favorites and they will wait for you here.
        </p>
        <UiButton variant="ink" size="cta" class="mt-8 shadow-none" @click="router.push('/')">
          Browse books
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFavoriteStore } from "@/stores/favorite";

const router = useRouter();
const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);

onMounted(async () => {
  await favoriteStore.getFavoritesForEachUser();
});
</script>
