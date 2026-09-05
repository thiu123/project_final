<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-12 gap-4">
      <!-- Enhanced Sidebar -->
      <div class="col-span-12 mb-6 sm:col-span-3">
        <div class="rounded-xl border border-border bg-card shadow">
          <!-- Categories Section -->
          <div class="flex items-center p-6 pb-4">
            <List class="mr-3 h-6 w-6 text-primary" />
            <span class="text-lg font-bold">Categories</span>
          </div>

          <div class="pb-2">
            <template v-for="(category, index) in categories" :key="category.slug">
              <!-- Categories with subcategories -->
              <div v-if="category.subcategories.length" class="mb-2">
                <button
                  type="button"
                  class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                  :class="{ 'text-primary': isActiveSubject(category) }"
                  @click="toggleCategory(category.slug)"
                >
                  <BookIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span class="grow text-base font-medium">{{
                    category.name
                  }}</span>
                  <span class="shrink-0 text-xs text-muted-foreground">{{
                    category.count
                  }}</span>
                  <ChevronDown
                    class="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
                    :class="{ 'rotate-180': isOpen(category) }"
                  />
                </button>

                <template v-if="isOpen(category)">
                  <!-- Whole category: matches every subcategory below it -->
                  <button
                    type="button"
                    class="mx-2 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg px-3 py-2 pl-11 text-left text-sm font-medium transition-all hover:translate-x-1 hover:bg-primary/10"
                    :class="{
                      'bg-primary/10 text-primary': activeSlug === category.slug,
                    }"
                    @click="selectCategory(category)"
                  >
                    <span>All {{ category.name }}</span>
                    <span class="text-xs text-muted-foreground">{{
                      category.count
                    }}</span>
                  </button>

                  <template
                    v-for="(subcategory, subIndex) in category.subcategories"
                    :key="subcategory.slug"
                  >
                    <button
                      type="button"
                      class="mx-2 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg px-3 py-2 pl-11 text-left text-sm font-medium transition-all hover:translate-x-1 hover:bg-primary/10"
                      :class="{
                        'bg-primary/10 text-primary':
                          activeSlug === subcategory.slug,
                      }"
                      @click="selectCategory(subcategory)"
                    >
                      <span>{{ subcategory.name }}</span>
                      <span class="text-xs text-muted-foreground">{{
                        subcategory.count
                      }}</span>
                    </button>

                    <div
                      v-if="subIndex < category.subcategories.length - 1"
                      class="mx-4 h-px bg-border opacity-25"
                    />
                  </template>
                </template>
              </div>

              <!-- Categories without subcategories -->
              <button
                v-else
                type="button"
                class="mx-2 mb-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:translate-x-1 hover:bg-primary/10"
                :class="{
                  'bg-primary/10 text-primary': activeSlug === category.slug,
                }"
                @click="selectCategory(category)"
              >
                <BookIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
                <span class="grow text-base font-medium">{{
                  category.name
                }}</span>
                <span class="text-xs text-muted-foreground">{{
                  category.count
                }}</span>
              </button>

              <div
                v-if="index < categories.length - 1"
                class="mx-4 my-2 h-px bg-border opacity-25"
              />
            </template>
          </div>

          <div class="mx-4 my-4 h-px bg-border" />

          <!-- Price Section -->
          <div class="flex items-center p-6 pb-4">
            <DollarSign class="mr-3 h-6 w-6 text-primary" />
            <span class="text-lg font-bold">Price Range</span>
          </div>

          <div class="p-6 pt-0">
            <UiCheckbox
              v-for="range in priceRanges"
              :key="range.label"
              :label="range.label"
              class="mb-3"
              :model-value="selectedPrice === range.label"
              @update:model-value="
                selectedPrice = $event ? range.label : ''
              "
            />
          </div>
        </div>
      </div>

      <!-- Enhanced Books List -->
      <div class="col-span-12 sm:col-span-9">
        <div class="h-full rounded-xl border border-border bg-card shadow">
          <!-- Enhanced Header -->
          <div class="p-6 pb-4">
            <div class="flex w-full flex-wrap items-center justify-between gap-4">
              <div class="flex items-center">
                <Library class="mr-3 h-7 w-7 text-primary" />
                <span class="text-2xl font-bold">Our Collection</span>
                <UiBadge v-if="activeSlug" class="ml-4 text-sm font-medium">
                  {{ activeLabel }}
                </UiBadge>
                <span
                  v-if="pagination.total"
                  class="ml-3 text-sm text-muted-foreground"
                >
                  {{ pagination.total }} books
                </span>
              </div>

              <!-- Enhanced Sort Dropdown -->
              <div class="flex items-center">
                <span class="mr-3 text-base font-medium">Sort by</span>
                <UiSelect v-model="sortBy">
                  <UiSelectTrigger class="min-w-[170px] text-sm font-medium">
                    <UiSelectValue placeholder="Sort by" />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem
                      v-for="option in sortOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>
            </div>
          </div>

          <div class="p-6 pt-0">
            <!-- Enhanced Loading Indicator -->
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

            <!-- Enhanced Books Grid -->
            <div v-else class="grid grid-cols-12 gap-4">
              <div
                v-for="book in books"
                :key="book._id"
                class="col-span-12 mb-6 sm:col-span-6 md:col-span-4 lg:col-span-3"
              >
                <div
                  class="group flex h-full flex-col overflow-hidden rounded-xl border border-transparent bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
                >
                  <div
                    class="relative flex min-h-[320px] items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-5"
                  >
                    <div
                      class="relative aspect-[2/3] w-[70%] max-w-[200px] overflow-hidden shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-2xl"
                    >
                      <img
                        v-if="book?.cover_url"
                        class="block h-full w-full cursor-pointer object-cover"
                        :src="book.cover_url"
                        :alt="book.title"
                        @click="router.push(`/details/${book._id}`)"
                      />
                    </div>

                    <!-- Enhanced Wishlist Button -->
                    <button
                      type="button"
                      class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105 dark:bg-card"
                      :aria-label="
                        isFavorite(book._id)
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      "
                      @click.stop="toggleFavoriteBook(book._id)"
                    >
                      <Heart
                        class="h-6 w-6"
                        :class="
                          isFavorite(book._id)
                            ? 'fill-current text-red-500'
                            : 'text-muted-foreground'
                        "
                      />
                    </button>

                    <!-- Price Badge -->
                    <UiBadge class="absolute bottom-3 left-3 shadow">
                      ${{ book.price }}
                    </UiBadge>
                  </div>

                  <div class="grow p-4">
                    <!-- Enhanced Rating -->
                    <div class="mb-3 flex items-center">
                      <UiRating
                        :model-value="book.rating || 0"
                        :size="16"
                        readonly
                        class="mr-2"
                      />
                    </div>

                    <!-- Enhanced Title -->
                    <div
                      class="mb-2 cursor-pointer truncate text-base font-bold"
                      @click="router.push(`/details/${book._id}`)"
                    >
                      {{ book.title }}
                    </div>

                    <!-- Author -->
                    <div class="mb-3 text-sm text-muted-foreground">
                      by {{ book.authors[0] || "Unknown Author" }}
                    </div>

                    <!-- Sold Count -->
                    <UiBadge variant="success" class="mb-2 text-[10px]">
                      <Flame class="h-3 w-3" />
                      Sold {{ book.sold || 0 }}
                    </UiBadge>
                  </div>

                  <!-- Enhanced Card Actions -->
                  <div class="p-4 pt-0">
                    <UiButton
                      size="lg"
                      block
                      class="rounded-lg text-sm font-bold"
                    >
                      <ShoppingCart class="h-5 w-5" />
                      Add to Cart
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Books Message -->
            <div v-if="!loading && books.length === 0" class="py-16 text-center">
              <BookOpen
                class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40"
              />
              <h3 class="mb-3 text-2xl font-bold">No books found</h3>
              <p class="mb-6 text-base text-muted-foreground">
                We couldn't find any books matching these filters. Try another
                category or widen the price range.
              </p>
              <NuxtLink to="/">
                <UiButton size="lg" class="rounded-lg">
                  Browse All Books
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Pagination -->
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
            <UiPaginationEllipsis
              v-else
              :key="pageItem.type"
              :index="index"
            />
          </template>
          <UiPaginationNext />
        </UiPaginationContent>
      </UiPagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";
import { useFavoriteStore } from "@/stores/favorite";
import {
  Book as BookIcon,
  BookOpen,
  ChevronDown,
  DollarSign,
  Flame,
  Heart,
  Library,
  List,
  ShoppingCart,
} from "lucide-vue-next";
import type { BookSort, CategoryNode } from "@/types";

const route = useRoute();
const router = useRouter();

const bookStore = useBookStore();
const favoriteStore = useFavoriteStore();

const { books, pagination, categories, loading } = storeToRefs(bookStore);
const { favorites } = storeToRefs(favoriteStore);

const ITEMS_PER_PAGE = 12;

const sortOptions: { label: string; value: BookSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "From A to Z", value: "title_asc" },
  { label: "From Z to A", value: "title_desc" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Top rated", value: "rating" },
  { label: "Best selling", value: "bestselling" },
];

/** Each range maps straight onto the API's minPrice / maxPrice filters. */
const priceRanges: { label: string; minPrice?: number; maxPrice?: number }[] = [
  { label: "Under $10", maxPrice: 10 },
  { label: "$10 - $20", minPrice: 10, maxPrice: 20 },
  { label: "$20 - $30", minPrice: 20, maxPrice: 30 },
  { label: "Above $50", minPrice: 50 },
];

const page = ref(1);
const sortBy = ref<BookSort>("newest");
const selectedPrice = ref("");
const openedCategories = ref<Record<string, boolean>>({});

const activeSlug = computed(() => (route.params.subject as string) || "");

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
  const node = nodesBySlug.value.get(activeSlug.value);
  if (node) return node.name;
  return activeSlug.value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
});

function isActiveSubject(category: CategoryNode) {
  return (
    activeSlug.value === category.slug ||
    category.subcategories.some((sub) => sub.slug === activeSlug.value)
  );
}

/** A category is expanded when toggled, or automatically when it holds the active slug. */
function isOpen(category: CategoryNode) {
  return openedCategories.value[category.slug] ?? isActiveSubject(category);
}

function toggleCategory(slug: string) {
  const category = nodesBySlug.value.get(slug);
  const current = category ? isOpen(category) : false;
  openedCategories.value[slug] = !current;
}

function selectCategory(node: CategoryNode) {
  router.push(`/subjects/${node.slug}`);
}

/** Single source of truth for the request; every filter change flows through here. */
async function fetchBooks() {
  const range = priceRanges.find((item) => item.label === selectedPrice.value);
  try {
    await bookStore.fetchBooks({
      subject: activeSlug.value || undefined,
      page: page.value,
      limit: ITEMS_PER_PAGE,
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

function isFavorite(bookId: string) {
  return favorites.value.some((favorite: any) => {
    const favoriteBookId = favorite.bookId?._id || favorite.bookId;
    return favoriteBookId === bookId;
  });
}

// Changing the page only refetches; the sidebar and filters stay put.
watch(page, fetchBooks);

// Any filter change resets to page 1 and refetches.
watch([activeSlug, sortBy, selectedPrice], () => {
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
    fetchFavorites(),
  ]);
});

async function fetchFavorites() {
  try {
    if (localStorage.getItem("accessToken")) {
      await favoriteStore.getFavoritesForEachUser();
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
}
</script>
