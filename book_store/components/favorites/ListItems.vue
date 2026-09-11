<template>
  <main class="container mx-auto px-4 py-8">
    <div class="mb-8 text-center">
      <h1 class="mb-2 text-4xl font-bold text-primary">My Favorite Books</h1>
      <p class="text-lg font-semibold text-muted-foreground">
        Your personal collection of beloved reads
      </p>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <UiCard class="mb-6 p-4">
        <div class="flex items-center justify-between">
          <UiSkeleton class="h-8 w-[120px] rounded-full" />
          <UiSkeleton class="h-10 w-20" />
        </div>
      </UiCard>

      <div v-if="viewMode === 'grid'" class="grid grid-cols-12 gap-4">
        <div
          v-for="n in 8"
          :key="n"
          class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3"
        >
          <UiCard class="overflow-hidden shadow-md">
            <UiSkeleton class="h-[300px] w-full rounded-none" />
            <div class="space-y-2 p-4">
              <UiSkeleton class="h-6 w-3/4" />
              <UiSkeleton class="h-4 w-full" />
              <UiSkeleton class="h-9 w-full" />
            </div>
          </UiCard>
        </div>
      </div>

      <UiCard v-for="n in 4" v-else :key="n" class="mb-4 overflow-hidden shadow">
        <div class="grid grid-cols-12">
          <div class="col-span-3 sm:col-span-2">
            <UiSkeleton class="h-[150px] w-full rounded-none" />
          </div>
          <div class="col-span-9 space-y-2 p-4 sm:col-span-10">
            <UiSkeleton class="h-6 w-1/2" />
            <UiSkeleton class="h-4 w-1/3" />
            <UiSkeleton class="h-9 w-[120px]" />
          </div>
        </div>
      </UiCard>
    </template>

    <!-- Empty -->
    <UiCard v-else-if="!validFavorites.length" class="p-12 text-center">
      <HeartCrack class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40" />
      <h2 class="mb-3 text-2xl font-bold">No favorites yet</h2>
      <p class="mx-auto mb-6 max-w-[400px] text-muted-foreground">
        Tap the heart on any book to keep it here.
      </p>
      <NuxtLink to="/">
        <UiButton size="lg">Browse Books</UiButton>
      </NuxtLink>
    </UiCard>

    <!-- List -->
    <UiTooltipProvider v-else :delay-duration="200">
      <UiCard class="mb-6 p-4">
        <div class="flex items-center justify-between">
          <UiBadge class="px-3 py-1.5 text-sm shadow">
            <Heart class="h-4 w-4 fill-current" />
            {{ validFavorites.length }}
            {{ validFavorites.length === 1 ? "Book" : "Books" }}
          </UiBadge>
          <div class="inline-flex overflow-hidden rounded-md border border-input">
            <button
              v-for="mode in VIEW_MODES"
              :key="mode.value"
              type="button"
              class="flex h-9 w-10 items-center justify-center transition-colors"
              :class="[
                viewMode === mode.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted',
                mode.value === 'list' && 'border-l border-input',
              ]"
              :aria-label="mode.label"
              :aria-pressed="viewMode === mode.value"
              @click="viewMode = mode.value"
            >
              <component :is="mode.icon" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </UiCard>

      <!-- Grid view -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-12 gap-4">
        <div
          v-for="favorite in validFavorites"
          :key="favorite._id"
          class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3"
        >
          <UiCard class="book-card h-full overflow-hidden shadow-md">
            <div class="book-cover-container">
              <div class="book-cover-wrapper bg-muted">
                <img
                  :src="favorite.bookId.cover_url"
                  :alt="favorite.bookId.title"
                  class="book-cover-image"
                  loading="lazy"
                />
              </div>

              <UiTooltip>
                <UiTooltipTrigger as-child>
                  <button
                    type="button"
                    class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive shadow dark:bg-card/90"
                    aria-label="Remove from favorites"
                    @click="askToRemove(favorite)"
                  >
                    <Heart class="h-5 w-5 fill-current" />
                  </button>
                </UiTooltipTrigger>
                <UiTooltipContent>Remove from favorites</UiTooltipContent>
              </UiTooltip>

              <UiBadge
                v-if="favorite.bookId.rating"
                variant="warning"
                class="absolute left-2 top-2"
              >
                <Star class="h-3 w-3 fill-current" />
                {{ favorite.bookId.rating }}
              </UiBadge>
            </div>

            <div class="px-4 pb-2 pt-2">
              <h3 class="mb-1 truncate text-lg font-bold">
                {{ favorite.bookId.title }}
              </h3>
              <p class="mb-2 text-sm text-muted-foreground">
                by {{ favorite.bookId.authors?.join(", ") || "Unknown Author" }}
              </p>
              <p class="mb-2 truncate text-sm">
                {{ favorite.bookId.subjects?.join(", ") }}
              </p>
              <div class="flex items-center">
                <span class="text-lg font-bold text-primary">
                  {{ formatUsd(favorite.bookId.price) }}
                </span>
                <UiBadge class="ml-auto bg-success/15 text-success">
                  {{ favorite.bookId.first_publish_year }}
                </UiBadge>
              </div>
            </div>

            <div class="p-2">
              <UiButton
                tag="NuxtLink"
                :to="`/details/${favorite.bookId._id}`"
                variant="outline"
                block
                class="border-primary/40 text-primary"
              >
                <Eye class="mr-1 h-4 w-4" />
                View Details
              </UiButton>
            </div>
          </UiCard>
        </div>
      </div>

      <!-- List view -->
      <div v-else>
        <UiCard
          v-for="favorite in validFavorites"
          :key="favorite._id"
          class="mb-4 overflow-hidden shadow"
        >
          <div class="grid grid-cols-12">
            <div class="col-span-3 bg-muted sm:col-span-2">
              <img
                :src="favorite.bookId.cover_url"
                :alt="favorite.bookId.title"
                class="h-[150px] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="col-span-9 p-4 sm:col-span-10">
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-bold">{{ favorite.bookId.title }}</h3>
                  <p class="text-sm text-muted-foreground">
                    by {{ favorite.bookId.authors?.join(", ") || "Unknown Author" }}
                  </p>
                </div>
                <UiTooltip>
                  <UiTooltipTrigger as-child>
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-full text-destructive transition-colors hover:bg-muted"
                      aria-label="Remove from favorites"
                      @click="askToRemove(favorite)"
                    >
                      <Heart class="h-5 w-5 fill-current" />
                    </button>
                  </UiTooltipTrigger>
                  <UiTooltipContent>Remove from favorites</UiTooltipContent>
                </UiTooltip>
              </div>

              <div class="mb-3 flex flex-wrap gap-2">
                <UiBadge
                  v-for="subject in favorite.bookId.subjects"
                  :key="subject"
                  variant="outline"
                >
                  {{ subject }}
                </UiBadge>
                <UiBadge v-if="favorite.bookId.rating" variant="warning">
                  <Star class="h-3 w-3 fill-current" />
                  {{ favorite.bookId.rating }}
                </UiBadge>
                <UiBadge class="bg-info/15 text-info">
                  {{ favorite.bookId.first_publish_year }}
                </UiBadge>
              </div>

              <div class="flex items-center">
                <span class="text-lg font-bold text-primary">
                  {{ formatUsd(favorite.bookId.price) }}
                </span>
                <UiButton
                  tag="NuxtLink"
                  :to="`/details/${favorite.bookId._id}`"
                  variant="outline"
                  class="ml-auto border-primary/40 text-primary"
                >
                  <Eye class="mr-1 h-4 w-4" />
                  View Details
                </UiButton>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
    </UiTooltipProvider>

    <!-- Remove confirmation -->
    <UiDialog v-model:open="removeDialog.show">
      <UiDialogContent
        hide-close
        class="gap-0 overflow-hidden rounded-xl p-0 sm:max-w-md"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <UiDialogHeader
          class="bg-destructive p-6 pb-4 text-center text-white sm:text-center"
        >
          <UiDialogTitle
            class="flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <HeartCrack class="h-5 w-5" />
            Remove from Favorites
          </UiDialogTitle>
        </UiDialogHeader>

        <div class="p-6 text-center">
          <AlertCircle class="mx-auto mb-4 h-9 w-9 text-destructive" />
          <UiDialogDescription class="mb-2 text-base text-foreground">
            Are you sure you want to remove
            <strong>"{{ removeDialog.bookTitle }}"</strong> from your favorites?
          </UiDialogDescription>
          <div class="text-xs text-muted-foreground">
            You can always add it back later by clicking the heart icon on the
            book.
          </div>
        </div>

        <UiDialogFooter class="flex flex-row justify-end p-6 pt-0 sm:gap-x-0">
          <UiButton variant="ghost" class="mr-3" @click="removeDialog.show = false">
            Cancel
          </UiButton>
          <UiButton
            variant="destructive"
            :loading="removeDialog.loading"
            @click="confirmRemove"
          >
            <Trash2 class="mr-1 h-4 w-4" />
            Remove
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </main>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import {
  AlertCircle,
  Eye,
  Heart,
  HeartCrack,
  LayoutGrid,
  List,
  Star,
  Trash2,
} from "lucide-vue-next";
import { useSnackbar } from "@/composables/useSnackbar";
import { populatedFavorites, type PopulatedFavorite } from "@/utils/favorites";
import { formatUsd } from "@/utils/pricing";
import type { Favorite } from "@/types";

type ViewMode = "grid" | "list";

const VIEW_MODES: { value: ViewMode; label: string; icon: Component }[] = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

const props = withDefaults(
  defineProps<{
    favorites: Favorite[];
    loading?: boolean;
    toggleFavorites: (bookId: string) => Promise<void> | void;
  }>(),
  { loading: false }
);

const { snackbar, notify, notifyError } = useSnackbar();

const viewMode = ref<ViewMode>("grid");

const removeDialog = reactive({
  show: false,
  loading: false,
  bookId: "",
  bookTitle: "",
});

const validFavorites = computed(() => populatedFavorites(props.favorites));

function askToRemove(favorite: PopulatedFavorite) {
  removeDialog.bookId = favorite.bookId._id;
  removeDialog.bookTitle = favorite.bookId.title;
  removeDialog.show = true;
}

async function confirmRemove() {
  removeDialog.loading = true;
  try {
    // The toggle returns the user's new list and the store replaces it, so the
    // row disappears on its own — the old code also spliced the prop array,
    // mutating state it does not own.
    await props.toggleFavorites(removeDialog.bookId);
    notify(`"${removeDialog.bookTitle}" removed from favorites`, "info");
  } catch (error) {
    console.error("Error confirming remove:", error);
    notifyError("Failed to remove book from favorites. Please try again.");
  } finally {
    removeDialog.show = false;
    removeDialog.loading = false;
  }
}
</script>

<style scoped>
.book-card {
  transition: transform 0.2s ease-in-out;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-cover-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 220px;
  position: relative;
}

.book-cover-wrapper {
  width: 70%;
  max-width: 180px;
  aspect-ratio: 2/3;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover-wrapper {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}
</style>
