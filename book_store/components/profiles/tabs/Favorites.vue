<template>
  <section>
    <ProfilesTabsSectionHeading
      :eyebrow="loading ? 'Favorites' : `${validFavorites.length} saved`"
      title="My favorites"
      description="Books you have set aside for later."
    />

    <ProfilesTabsLoadingState v-if="loading" variant="grid" label="Loading favorites..." />

    <div
      v-else-if="validFavorites.length"
      class="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 xl:grid-cols-4"
    >
      <article
        v-for="favorite in validFavorites"
        :key="favorite._id"
        class="group flex flex-col"
      >
        <div class="relative bg-muted transition-colors duration-500 group-hover:bg-accent">
          <NuxtLink
            :to="`/details/${favorite.bookId._id}`"
            class="flex aspect-[4/5] items-center justify-center"
            :aria-label="favorite.bookId.title"
          >
            <div
              class="ed-cover aspect-[2/3] w-[60%] overflow-hidden bg-card transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5"
            >
              <img
                v-if="favorite.bookId.cover_url"
                :src="favorite.bookId.cover_url"
                :alt="favorite.bookId.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-full items-center justify-center p-3 text-center font-serif text-sm text-muted-foreground"
              >
                {{ favorite.bookId.title }}
              </div>
            </div>
          </NuxtLink>

          <button
            type="button"
            class="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground transition-opacity hover:opacity-80"
            aria-label="Remove from favorites"
            @click="favoriteStore.toggleFavorites(favorite.bookId._id)"
          >
            <Heart class="size-4 fill-primary text-primary" :stroke-width="1.5" />
          </button>
        </div>

        <div class="flex grow flex-col pt-4">
          <p class="eyebrow truncate leading-normal">
            {{ favorite.bookId.authors?.join(", ") || "Unknown author" }}
          </p>
          <NuxtLink
            :to="`/details/${favorite.bookId._id}`"
            class="mt-2 line-clamp-2 font-serif text-[1.2rem] leading-snug text-foreground transition-colors hover:text-primary"
            :title="favorite.bookId.title"
          >
            {{ favorite.bookId.title }}
          </NuxtLink>
          <div class="mt-auto flex items-baseline justify-between gap-3 pt-3">
            <span class="text-sm tabular-nums">{{ formatUsd(favorite.bookId.price) }}</span>
            <NuxtLink
              :to="`/details/${favorite.bookId._id}`"
              class="group/link inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span class="ed-link">Details</span>
              <ArrowRight class="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" :stroke-width="1.5" />
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <ProfilesTabsEmptyState
      v-else
      title="Nothing saved yet."
      action-label="Browse books"
    >
      You haven't added any books to your favorites yet. Tap the heart on any
      book to keep it here.
    </ProfilesTabsEmptyState>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ArrowRight, Heart } from "lucide-vue-next";
import { useFavoriteStore } from "@/stores/favorite";
import { populatedFavorites } from "@/utils/favorites";
import { formatUsd } from "@/utils/pricing";

defineProps<{ loading: boolean }>();

const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);

const validFavorites = computed(() => populatedFavorites(favorites.value));
</script>
