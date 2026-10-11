<template>
  <div class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
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
      <p
        class="hero-rise mt-5 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground"
        style="--rise-delay: 180ms"
      >
        The books you have kept for another day, ready when you are.
      </p>
    </header>

    <template v-if="loading">
      <div class="mt-10 flex h-16 items-center justify-between border-y border-border md:mt-14">
        <UiSkeleton class="h-3 w-24 rounded-none bg-muted" />
        <UiSkeleton class="h-3 w-32 rounded-none bg-muted" />
      </div>

      <div
        v-if="viewMode === 'grid'"
        class="grid grid-cols-2 gap-x-4 gap-y-12 pt-10 sm:gap-x-6 md:grid-cols-3 md:gap-y-14 lg:grid-cols-4 xl:grid-cols-5"
      >
        <div v-for="n in 5" :key="n">
          <UiSkeleton class="aspect-[4/5] w-full rounded-none bg-muted" />
          <UiSkeleton class="mt-4 h-3 w-1/3 rounded-none bg-muted" />
          <UiSkeleton class="mt-3 h-5 w-4/5 rounded-none bg-muted" />
          <UiSkeleton class="mt-4 h-4 w-1/4 rounded-none bg-muted" />
        </div>
      </div>

      <div v-else>
        <div
          v-for="n in 4"
          :key="n"
          class="grid grid-cols-[5rem_1fr] gap-x-5 border-b border-border py-8 sm:grid-cols-[6rem_1fr] md:gap-x-8"
        >
          <UiSkeleton class="aspect-[2/3] w-full rounded-none bg-muted" />
          <div>
            <UiSkeleton class="h-3 w-24 rounded-none bg-muted" />
            <UiSkeleton class="mt-4 h-6 w-1/2 rounded-none bg-muted" />
            <UiSkeleton class="mt-4 h-4 w-1/3 rounded-none bg-muted" />
          </div>
        </div>
      </div>
    </template>

    <div
      v-else-if="!validFavorites.length"
      class="mt-10 grid gap-8 border-t border-border py-16 md:mt-14 md:grid-cols-12 md:gap-12 md:py-24"
    >
      <p
        class="font-serif text-3xl font-normal leading-[1.1] tracking-[-0.02em] md:col-span-7 md:text-[2.75rem]"
      >
        No favorites <span class="italic">yet</span>
      </p>
      <div class="md:col-span-5">
        <p class="max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground">
          Tap the heart on any book to keep it here.
        </p>
        <UiButton as-child variant="ink" size="cta" class="mt-8 shadow-none">
          <NuxtLink to="/">Browse books</NuxtLink>
        </UiButton>
      </div>
    </div>

    <template v-else>
      <div class="mt-10 flex h-16 items-center justify-between gap-4 border-y border-border md:mt-14">
        <p class="text-[12px] font-medium uppercase tracking-[0.14em] tabular-nums text-muted-foreground">
          {{ titleCount }}
        </p>

        <div class="flex items-center gap-6" role="group" aria-label="View mode">
          <button
            v-for="mode in VIEW_MODES"
            :key="mode.value"
            type="button"
            class="inline-flex h-10 items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors"
            :class="viewMode === mode.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
            :aria-label="mode.label"
            :aria-pressed="viewMode === mode.value"
            @click="viewMode = mode.value"
          >
            <component :is="mode.icon" class="size-4" :stroke-width="1.5" />
            <span
              class="border-b pb-px transition-colors"
              :class="viewMode === mode.value ? 'border-foreground' : 'border-transparent'"
            >
              {{ mode.short }}
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="viewMode === 'grid'"
        class="grid grid-cols-2 gap-x-4 gap-y-12 pt-10 sm:gap-x-6 md:grid-cols-3 md:gap-y-14 lg:grid-cols-4 xl:grid-cols-5"
      >
        <BookGridCard
          v-for="(favorite, index) in validFavorites"
          :key="favorite._id"
          v-reveal="(index % 5) * 60"
          :book="favorite.bookId"
          favorite
          @add-to-cart="handleAddToCart"
          @toggle-favorite="askToRemove(favorite)"
        />
      </div>

      <ul v-else>
        <li
          v-for="(favorite, index) in validFavorites"
          :key="favorite._id"
          v-reveal="Math.min(index, 4) * 60"
          class="grid grid-cols-[5rem_1fr] gap-x-5 gap-y-6 border-b border-border py-8 sm:grid-cols-[6rem_1fr_auto] md:gap-x-10"
        >
          <NuxtLink
            :to="`/details/${favorite.bookId._id}`"
            class="group block self-start"
            :aria-label="favorite.bookId.title"
          >
            <div
              class="ed-cover aspect-[2/3] w-full overflow-hidden bg-muted transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1"
            >
              <img
                v-if="favorite.bookId.cover_url"
                :src="favorite.bookId.cover_url"
                :alt="favorite.bookId.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </NuxtLink>

          <div class="min-w-0">
            <p class="eyebrow truncate leading-normal">
              {{ favorite.bookId.authors?.join(", ") || "Unknown author" }}
            </p>
            <NuxtLink
              :to="`/details/${favorite.bookId._id}`"
              class="mt-2 block font-serif text-xl leading-snug text-foreground transition-colors hover:text-primary md:text-2xl"
            >
              {{ favorite.bookId.title }}
            </NuxtLink>
            <p
              v-if="favorite.bookId.subjects?.length"
              class="mt-3 line-clamp-2 text-[13px] capitalize leading-relaxed text-muted-foreground"
            >
              {{ favorite.bookId.subjects.join(" · ") }}
            </p>
            <div
              class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] tabular-nums text-muted-foreground"
            >
              <span v-if="favorite.bookId.rating" class="inline-flex items-center gap-1">
                <Star class="size-3 fill-current" />
                {{ favorite.bookId.rating.toFixed(1) }}
              </span>
              <span v-if="favorite.bookId.first_publish_year">
                First published {{ favorite.bookId.first_publish_year }}
              </span>
            </div>
          </div>

          <div
            class="col-span-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-start"
          >
            <span class="font-serif text-2xl tabular-nums leading-none">
              {{ formatUsd(favorite.bookId.price) }}
            </span>

            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-auto sm:justify-end">
              <button
                type="button"
                class="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                @click="askToRemove(favorite)"
              >
                <span class="ed-link">Remove</span>
              </button>
              <NuxtLink
                :to="`/details/${favorite.bookId._id}`"
                class="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
              >
                <span class="ed-link">View details</span>
                <ArrowRight class="size-3.5 transition-transform group-hover:translate-x-1" />
              </NuxtLink>
              <span
                v-if="isSoldOut(favorite)"
                class="inline-flex h-11 items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                <span class="size-1.5 rounded-full bg-muted-foreground" />
                Sold out
              </span>
              <UiButton
                v-else
                variant="ink"
                size="cta"
                class="h-11 px-6 shadow-none"
                @click="handleAddToCart(favorite.bookId._id)"
              >
                Add to cart
              </UiButton>
            </div>
          </div>
        </li>
      </ul>
    </template>

    <UiDialog v-model:open="removeDialog.show">
      <UiDialogContent
        hide-close
        class="max-w-[calc(100%-2rem)] gap-0 rounded-none border-border p-0 shadow-none sm:max-w-md sm:rounded-none"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <div class="p-7 md:p-8">
          <UiDialogHeader class="gap-y-0 text-left sm:text-left">
            <p class="eyebrow">Remove from favorites</p>
            <UiDialogTitle class="mt-4 font-serif text-2xl font-normal leading-snug tracking-[-0.01em]">
              Remove <span class="italic">{{ removeDialog.bookTitle }}</span>?
            </UiDialogTitle>
          </UiDialogHeader>
          <UiDialogDescription class="mt-3 text-[15px] leading-relaxed">
            It will leave your shelf. You can add it back later from the heart on the book.
          </UiDialogDescription>
        </div>

        <UiDialogFooter class="flex flex-row items-center justify-end gap-3 border-t border-border px-7 py-5 sm:gap-x-3 md:px-8">
          <UiButton
            variant="ghost"
            class="h-11 px-5 text-[12px] font-medium uppercase tracking-[0.14em]"
            @click="removeDialog.show = false"
          >
            Cancel
          </UiButton>
          <UiButton
            variant="ink"
            size="cta"
            class="h-11 px-6 shadow-none"
            :loading="removeDialog.loading"
            @click="confirmRemove"
          >
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
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { ArrowRight, LayoutGrid, List, Star } from "lucide-vue-next";
import { useAuthDialogStore } from "@/stores/authDialog";
import { useCartStore } from "@/stores/cart";
import { useSnackbar } from "@/composables/useSnackbar";
import { populatedFavorites, type PopulatedFavorite } from "@/utils/favorites";
import { formatUsd } from "@/utils/pricing";
import type { Favorite } from "@/types";

type ViewMode = "grid" | "list";

const VIEW_MODES: { value: ViewMode; label: string; short: string; icon: Component }[] = [
  { value: "grid", label: "Grid view", short: "Grid", icon: LayoutGrid },
  { value: "list", label: "List view", short: "List", icon: List },
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
const cartStore = useCartStore();
const authDialog = useAuthDialogStore();

const viewMode = ref<ViewMode>("grid");

const removeDialog = reactive({
  show: false,
  loading: false,
  bookId: "",
  bookTitle: "",
});

const validFavorites = computed(() => populatedFavorites(props.favorites));

const titleCount = computed(() => {
  const total = validFavorites.value.length;
  return `${total} ${total === 1 ? "title" : "titles"}`;
});

function isSoldOut(favorite: PopulatedFavorite) {
  return (favorite.bookId.stock ?? 0) <= 0;
}

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

async function handleAddToCart(bookId: string) {
  const signedIn = authDialog.ensureSignedIn(
    "Sign in to add books to your cart.",
    () => handleAddToCart(bookId)
  );
  if (!signedIn) return;

  try {
    await cartStore.addToCart({ bookId, quantity: 1, productType: "hardbook" });
    notify("Added to cart!");
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    notifyError(error.response?.data?.msg || "Failed to add to cart.");
  }
}
</script>
