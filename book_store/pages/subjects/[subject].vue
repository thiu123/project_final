<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-12 gap-4">
      <!-- Sidebar -->
      <div class="col-span-12 mb-6 sm:col-span-3">
        <BookCatalogueFilters
          v-model:selected-price="selectedPrice"
          :categories="categories"
          :active-slug="activeSlug"
          @select="selectCategory"
        />
      </div>

      <!-- Books -->
      <div class="col-span-12 sm:col-span-9">
        <div class="h-full rounded-xl border border-border bg-card shadow">
          <div class="p-6 pb-4">
            <div class="flex w-full flex-wrap items-center justify-between gap-4">
              <div class="flex items-center">
                <Library class="mr-3 h-7 w-7 text-primary" />
                <span class="text-2xl font-bold">Our Collection</span>
                <UiBadge v-if="activeLabel" class="ml-4 text-sm font-medium">
                  {{ activeLabel }}
                </UiBadge>
                <span
                  v-if="pagination.total"
                  class="ml-3 text-sm text-muted-foreground"
                >
                  {{ pagination.total }} books
                </span>
              </div>

              <div class="flex items-center">
                <span class="mr-3 text-base font-medium">Sort by</span>
                <UiSelect v-model="sortBy">
                  <UiSelectTrigger class="min-w-[170px] text-sm font-medium">
                    <UiSelectValue placeholder="Sort by" />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem
                      v-for="option in SORT_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>
            </div>

            <!-- Active search term, when arriving from the home page search box -->
            <div v-if="searchTerm" class="mt-3 flex items-center gap-2 text-sm">
              <span class="text-muted-foreground">Searching for</span>
              <UiBadge variant="outline">{{ searchTerm }}</UiBadge>
              <UiButton variant="ghost" size="sm" @click="clearSearch">
                <X class="h-4 w-4" />
                Clear
              </UiButton>
            </div>
          </div>

          <div class="p-6 pt-0">
            <!-- Loading -->
            <div v-if="loading" class="flex justify-center py-16">
              <div class="text-center">
                <UiSpinner size="xl" class="mx-auto mb-6 text-primary" />
                <div class="text-lg font-medium text-muted-foreground">
                  Loading books...
                </div>
                <div class="mt-2 text-sm text-muted-foreground">
                  Please wait while we fetch your collection
                </div>
              </div>
            </div>

            <!-- Grid -->
            <div v-else-if="books.length" class="grid grid-cols-12 gap-4">
              <div
                v-for="book in books"
                :key="book._id"
                class="col-span-12 mb-6 sm:col-span-6 md:col-span-4 lg:col-span-3"
              >
                <BookGridCard
                  :book="book"
                  :favorite="isFavoriteBook(favorites, book._id)"
                  @add-to-cart="handleAddToCart"
                  @toggle-favorite="toggleFavoriteBook"
                />
              </div>
            </div>

            <!-- Empty -->
            <div v-else class="py-16 text-center">
              <BookOpen class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40" />
              <h3 class="mb-3 text-2xl font-bold">No books found</h3>
              <p class="mb-6 text-base text-muted-foreground">
                We couldn't find any books matching these filters. Try another
                category or widen the price range.
              </p>
              <NuxtLink to="/">
                <UiButton size="lg" class="rounded-lg">Browse All Books</UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="mt-8 flex items-center justify-center"
    >
      <UiPagination
        v-slot="{ page: currentPage }"
        v-model:page="page"
        :total="pagination.total"
        :items-per-page="pagination.limit"
        :sibling-count="1"
        show-edges
      >
        <UiPaginationContent v-slot="{ items: pageItems }">
          <UiPaginationPrevious />
          <template v-for="(pageItem, index) in pageItems">
            <UiPaginationItem
              v-if="pageItem.type === 'page'"
              :key="index"
              :value="pageItem.value"
              :is-active="pageItem.value === currentPage"
            >
              {{ pageItem.value }}
            </UiPaginationItem>
            <UiPaginationEllipsis v-else :key="pageItem.type" :index="index" />
          </template>
          <UiPaginationNext />
        </UiPaginationContent>
      </UiPagination>
    </div>

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { BookOpen, Library, X } from "lucide-vue-next";
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

const route = useRoute();
const router = useRouter();

const bookStore = useBookStore();
const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();

const { books, pagination, categories, loading } = storeToRefs(bookStore);
const { favorites } = storeToRefs(favoriteStore);
const { snackbar, notify, notifyError } = useSnackbar();

const page = ref(1);
const sortBy = ref<BookSort>("newest");
const selectedPrice = ref("");

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
  try {
    await cartStore.addToCart({ bookId, quantity: 1, productType: "hardbook" });
    notify("Added to cart!");
  } catch (error) {
    console.error("Error adding to cart:", error);
    notifyError("Failed to add to cart.");
  }
}

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
