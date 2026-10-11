<template>
  <div class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <nav aria-label="Breadcrumb" class="hero-rise text-[13px] text-muted-foreground">
      <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <NuxtLink to="/" class="transition-colors hover:text-foreground">Home</NuxtLink>
        </li>
        <template v-for="crumb in breadcrumbs" :key="crumb.label">
          <li class="text-border" aria-hidden="true">/</li>
          <li>
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="transition-colors hover:text-foreground">
              {{ crumb.label }}
            </NuxtLink>
            <span v-else class="text-foreground" aria-current="page">{{ crumb.label }}</span>
          </li>
        </template>
      </ol>
    </nav>

    <header class="mt-8 md:mt-12">
      <p class="eyebrow hero-rise" style="--rise-delay: 60ms">
        {{ searchTerm ? "Search results" : "The catalogue" }}
      </p>
      <h1
        class="hero-rise mt-5 max-w-5xl break-words font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl"
        style="--rise-delay: 120ms"
      >
        <template v-if="searchTerm">&ldquo;<span class="italic">{{ searchTerm }}</span>&rdquo;</template>
        <template v-else-if="activeLabel">{{ activeLabel }}</template>
        <template v-else>All <span class="italic">books</span></template>
      </h1>
      <div
        class="hero-rise mt-5 flex min-h-6 flex-wrap items-center gap-x-6 gap-y-2"
        style="--rise-delay: 180ms"
      >
        <p v-if="settled" class="text-[15px] tabular-nums text-muted-foreground">
          {{ titleCount }}<template v-if="searchTerm && activeLabel"> in {{ activeLabel }}</template>
        </p>
        <button
          v-if="searchTerm"
          type="button"
          class="group inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-foreground"
          @click="clearSearch"
        >
          <X class="size-3.5" :stroke-width="1.5" />
          <span class="ed-link">Clear search</span>
        </button>
      </div>
    </header>

    <div class="mt-10 border-y border-border md:mt-14">
      <div class="flex min-h-16 items-center justify-between gap-4 py-2 lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div class="flex items-center lg:col-span-3">
          <UiButton
            variant="outline"
            size="cta"
            class="gap-2.5 px-5 shadow-none lg:hidden"
            :aria-expanded="filtersOpen"
            @click="filtersOpen = true"
          >
            <SlidersHorizontal class="size-4" :stroke-width="1.5" />
            Filters
            <span v-if="activeFilterCount" class="tabular-nums text-muted-foreground">
              {{ activeFilterCount }}
            </span>
          </UiButton>
          <p class="eyebrow hidden lg:block">Refine</p>
        </div>

        <div class="flex items-center justify-end gap-6 lg:col-span-9 lg:justify-between">
          <p
            class="hidden text-[12px] font-medium uppercase tracking-[0.14em] tabular-nums text-muted-foreground sm:block"
          >
            {{ rangeLabel }}
          </p>

          <div class="flex items-center gap-3">
            <span class="eyebrow">Sort</span>
            <UiSelect v-model="sortBy">
              <UiSelectTrigger
                aria-label="Sort by"
                class="h-10 w-auto gap-2 border-0 bg-transparent px-0 text-[13px] font-medium shadow-none focus:ring-0 focus-visible:ring-1"
              >
                <UiSelectValue placeholder="Sort by" />
              </UiSelectTrigger>
              <UiSelectContent align="end" class="rounded-none border-border shadow-none">
                <UiSelectItem
                  v-for="option in SORT_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                  class="rounded-none py-2 text-[13px]"
                >
                  {{ option.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:grid lg:grid-cols-12 lg:gap-x-12">
      <aside class="hidden pt-9 lg:col-span-3 lg:block" aria-label="Filters">
        <BookCatalogueFilters
          v-model:selected-price="selectedPrice"
          :categories="categories"
          :active-slug="activeSlug"
          @select="selectCategory"
        />
      </aside>

      <section class="pt-10 lg:col-span-9" aria-label="Books">
        <div
          v-if="showSkeleton"
          class="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 md:gap-y-14 xl:grid-cols-4"
        >
          <div v-for="n in CATALOGUE_PAGE_SIZE" :key="n">
            <UiSkeleton class="aspect-[4/5] w-full rounded-none bg-muted" />
            <UiSkeleton class="mt-4 h-3 w-1/3 rounded-none bg-muted" />
            <UiSkeleton class="mt-3 h-5 w-4/5 rounded-none bg-muted" />
            <UiSkeleton class="mt-4 h-4 w-1/4 rounded-none bg-muted" />
          </div>
        </div>

        <div
          v-else-if="books.length"
          class="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 md:gap-y-14 xl:grid-cols-4"
        >
          <BookGridCard
            v-for="(book, index) in books"
            :key="book._id"
            v-reveal="(index % 4) * 60"
            :book="book"
            :favorite="isFavoriteBook(favorites, book._id)"
            @add-to-cart="handleAddToCart"
            @toggle-favorite="toggleFavoriteBook"
          />
        </div>

        <div v-else class="max-w-2xl py-12 md:py-20">
          <p class="font-serif text-3xl font-normal leading-[1.1] tracking-[-0.02em] md:text-[2.75rem]">
            <template v-if="searchTerm">
              No titles match <span class="italic">&ldquo;{{ searchTerm }}&rdquo;</span>
            </template>
            <template v-else>Nothing on <span class="italic">this shelf</span> yet</template>
          </p>
          <p class="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
            <template v-if="searchTerm">
              Check the spelling, try an author's name, or clear the search to see every title.
            </template>
            <template v-else>
              We couldn't find any books matching these filters. Try another category or widen the price range.
            </template>
          </p>
          <UiButton as-child variant="ink" size="cta" class="mt-9 shadow-none">
            <NuxtLink to="/">Continue browsing</NuxtLink>
          </UiButton>
        </div>

        <div v-if="pagination.totalPages > 1" class="mt-20 border-t border-border pt-6 md:mt-24">
          <UiPagination
            v-slot="{ page: currentPage }"
            v-model:page="page"
            :total="pagination.total"
            :items-per-page="pagination.limit"
            :sibling-count="1"
            show-edges
          >
            <UiPaginationContent v-slot="{ items: pageItems }" class="w-full justify-between gap-2">
              <UiPaginationPrevious :class="PAGER_EDGE_CLASS">
                <ArrowLeft class="size-4" :stroke-width="1.5" />
                <span class="ed-link hidden sm:inline">Previous</span>
              </UiPaginationPrevious>

              <div class="flex items-center">
                <template v-for="(pageItem, index) in pageItems">
                  <UiPaginationItem
                    v-if="pageItem.type === 'page'"
                    :key="index"
                    :value="pageItem.value"
                    :is-active="pageItem.value === currentPage"
                    :class="[PAGER_ITEM_CLASS, pageItem.value === currentPage ? PAGER_ACTIVE_CLASS : PAGER_IDLE_CLASS]"
                  >
                    {{ pageItem.value }}
                  </UiPaginationItem>
                  <UiPaginationEllipsis
                    v-else
                    :key="pageItem.type"
                    :index="index"
                    class="size-9 text-muted-foreground sm:size-10"
                  />
                </template>
              </div>

              <UiPaginationNext :class="PAGER_EDGE_CLASS">
                <span class="ed-link hidden sm:inline">Next</span>
                <ArrowRight class="size-4" :stroke-width="1.5" />
              </UiPaginationNext>
            </UiPaginationContent>
          </UiPagination>
        </div>
      </section>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="filtersOpen"
        class="fixed inset-0 z-[1001] bg-foreground/40 backdrop-blur-[2px] lg:hidden"
        aria-hidden="true"
        @click="filtersOpen = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="filtersOpen"
        class="fixed inset-y-0 left-0 z-[1002] flex w-[min(88vw,380px)] flex-col bg-background lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        <div class="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <p class="text-[12px] font-medium uppercase tracking-[0.16em]">Filters</p>
          <button
            type="button"
            class="-mr-2 inline-flex size-10 items-center justify-center transition-opacity hover:opacity-60"
            aria-label="Close filters"
            @click="filtersOpen = false"
          >
            <X class="size-5" :stroke-width="1.5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-8">
          <BookCatalogueFilters
            v-model:selected-price="selectedPrice"
            :categories="categories"
            :active-slug="activeSlug"
            @select="selectCategory"
          />
        </div>

        <div class="shrink-0 border-t border-border p-5">
          <UiButton variant="ink" size="cta" block class="shadow-none" @click="filtersOpen = false">
            {{ settled ? `Show ${titleCount}` : "Show results" }}
          </UiButton>
        </div>
      </div>
    </Transition>

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onKeyStroke } from "@vueuse/core";
import { ArrowLeft, ArrowRight, SlidersHorizontal, X } from "lucide-vue-next";
import { useAuthDialogStore } from "@/stores/authDialog";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { useSnackbar } from "@/composables/useSnackbar";
import { isFavoriteBook } from "@/utils/favorites";
import {
  ALL_SUBJECTS_SLUG,
  CATALOGUE_PAGE_SIZE,
  PRICE_RANGES,
  SORT_OPTIONS,
} from "@/constants/catalogue";
import type { BookSort, CategoryNode } from "@/types";

const PAGER_EDGE_CLASS =
  "h-10 gap-2 rounded-none px-0 text-[12px] font-medium uppercase tracking-[0.14em] shadow-none hover:bg-transparent hover:text-foreground disabled:opacity-30 sm:pr-0";

const PAGER_ITEM_CLASS =
  "relative h-9 w-9 rounded-none border-0 bg-transparent text-[13px] font-medium tabular-nums shadow-none hover:bg-transparent sm:h-10 sm:w-10";

const PAGER_ACTIVE_CLASS =
  "text-foreground after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:bg-foreground after:content-['']";

const PAGER_IDLE_CLASS = "text-muted-foreground hover:text-foreground";

const route = useRoute();
const router = useRouter();

const bookStore = useBookStore();
const cartStore = useCartStore();
const authDialog = useAuthDialogStore();
const favoriteStore = useFavoriteStore();

const { books, pagination, categories, loading } = storeToRefs(bookStore);
const { favorites } = storeToRefs(favoriteStore);
const { snackbar, notify, notifyError } = useSnackbar();

const page = ref(1);
const sortBy = ref<BookSort>("newest");
const selectedPrice = ref("");
const filtersOpen = ref(false);
const settled = ref(false);

const activeSlug = computed(() => (route.params.subject as string) || "");

/** `/subjects/all` is the unfiltered catalogue, used by the home search box. */
const subjectFilter = computed(() =>
  !activeSlug.value || activeSlug.value === ALL_SUBJECTS_SLUG
    ? undefined
    : activeSlug.value
);

const searchTerm = computed(() => (route.query.search as string) || "");

/** Flat lookup so the active slug can be labelled without re-walking the tree. */
const nodesBySlug = computed(() => {
  const map = new Map<string, CategoryNode>();
  for (const category of categories.value) {
    map.set(category.slug, category);
    for (const sub of category.subcategories) map.set(sub.slug, sub);
  }
  return map;
});

const activeLabel = computed(() => {
  if (!subjectFilter.value) return "";
  const node = nodesBySlug.value.get(activeSlug.value);
  if (node) return node.name;
  return activeSlug.value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
});

const parentCategory = computed(() =>
  categories.value.find((category) =>
    category.subcategories.some((sub) => sub.slug === activeSlug.value)
  )
);

const breadcrumbs = computed(() => {
  const crumbs: { label: string; to?: string }[] = [];
  if (subjectFilter.value) {
    if (parentCategory.value) {
      crumbs.push({
        label: parentCategory.value.name,
        to: `/subjects/${parentCategory.value.slug}`,
      });
    }
    crumbs.push({
      label: activeLabel.value,
      to: searchTerm.value ? route.path : undefined,
    });
  } else {
    crumbs.push({
      label: "All books",
      to: searchTerm.value ? route.path : undefined,
    });
  }
  if (searchTerm.value) crumbs.push({ label: "Search" });
  return crumbs;
});

const showSkeleton = computed(() => loading.value || !settled.value);

const titleCount = computed(() => {
  const total = pagination.value.total;
  return `${total.toLocaleString("en-US")} ${total === 1 ? "title" : "titles"}`;
});

const rangeLabel = computed(() => {
  const { total, limit } = pagination.value;
  if (!total) return "";
  const start = (page.value - 1) * limit + 1;
  const end = Math.min(page.value * limit, total);
  return `Showing ${start}–${end} of ${total.toLocaleString("en-US")}`;
});

const activeFilterCount = computed(
  () => (subjectFilter.value ? 1 : 0) + (selectedPrice.value ? 1 : 0)
);

function selectCategory(slug: string) {
  router.push(`/subjects/${slug}`);
}

function clearSearch() {
  router.push({ path: route.path });
}

/** Single source of truth for the request; every filter change flows through here. */
async function fetchBooks() {
  const range = PRICE_RANGES.find((item) => item.label === selectedPrice.value);
  try {
    await bookStore.fetchBooks({
      subject: subjectFilter.value,
      search: searchTerm.value || undefined,
      page: page.value,
      limit: CATALOGUE_PAGE_SIZE,
      sort: sortBy.value,
      minPrice: range?.minPrice,
      maxPrice: range?.maxPrice,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

async function toggleFavoriteBook(bookId: string) {
  try {
    await favoriteStore.toggleFavorites(bookId);
  } catch (error) {
    console.error("Error toggling favorite:", error);
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

watch(loading, (isLoading) => {
  if (!isLoading) settled.value = true;
});

onKeyStroke("Escape", () => {
  filtersOpen.value = false;
});

// Changing the page only refetches; the sidebar and filters stay put.
watch(page, fetchBooks);

// Any filter change resets to page 1 and refetches.
watch([activeSlug, searchTerm, sortBy, selectedPrice], () => {
  if (page.value === 1) {
    fetchBooks();
  } else {
    page.value = 1; // the `page` watcher issues the request
  }
});

onMounted(async () => {
  await Promise.all([
    bookStore.fetchCategories(),
    fetchBooks(),
    favoriteStore.getFavoritesForEachUser(),
  ]);
});
</script>
