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
            <template v-for="(category, index) in bookSubjects" :key="index">
              <!-- Categories with subcategories -->
              <div v-if="category.subcategories" class="mb-2">
                <button
                  type="button"
                  class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                  @click="toggleCategory(index)"
                >
                  <BookIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span class="grow text-base font-medium">{{
                    category.category
                  }}</span>
                  <ChevronDown
                    class="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
                    :class="{ 'rotate-180': openedCategories[index] }"
                  />
                </button>

                <template v-if="openedCategories[index]">
                  <template
                    v-for="(subcategory, subIndex) in category.subcategories"
                    :key="subIndex"
                  >
                    <button
                      type="button"
                      class="mx-2 flex w-[calc(100%-1rem)] items-center rounded-lg px-3 py-2 pl-11 text-left text-sm font-medium transition-all hover:translate-x-1 hover:bg-primary/10"
                      :class="{
                        'bg-primary/10 text-primary':
                          route.params.subject === subcategory.toLowerCase(),
                      }"
                      @click="
                        router.push(
                          `/subjects/${encodeURIComponent(
                            subcategory.toLowerCase()
                          )}`
                        )
                      "
                    >
                      {{ subcategory }}
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
                  'bg-primary/10 text-primary':
                    route.params.subject === category.category.toLowerCase(),
                }"
                @click="
                  router.push(
                    `/subjects/${encodeURIComponent(
                      category.category.toLowerCase()
                    )}`
                  )
                "
              >
                <BookIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
                <span class="text-base font-medium">{{
                  category.category
                }}</span>
              </button>

              <div
                v-if="index < bookSubjects.length - 1"
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
              v-for="(price, i) in prices"
              :key="i"
              :label="price"
              class="mb-3"
              :model-value="selectedPrice === price"
              @update:model-value="selectedPrice = $event ? price : ''"
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
                <UiBadge
                  v-if="route.params.subject"
                  class="ml-4 text-sm font-medium"
                >
                  {{ formattedSubject }}
                </UiBadge>
              </div>

              <!-- Enhanced Sort Dropdown -->
              <div class="flex items-center">
                <span class="mr-3 text-base font-medium">Sort by</span>
                <UiSelect v-model="sortBy">
                  <UiSelectTrigger class="min-w-[150px] text-sm font-medium">
                    <UiSelectValue placeholder="Sort by" />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem v-for="item in items" :key="item" :value="item">
                      {{ item }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>
            </div>
          </div>

          <div class="p-6 pt-0">
            <!-- Enhanced Loading Indicator -->
            <div
              v-if="isLoading && paginatedBooks.length === 0"
              class="flex justify-center py-16"
            >
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
                v-for="(book, i) in paginatedBooks"
                :key="i"
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
            <div
              v-if="!isLoading && paginatedBooks.length === 0"
              class="py-16 text-center"
            >
              <BookOpen
                class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40"
              />
              <h3 class="mb-3 text-2xl font-bold">No books found</h3>
              <p class="mb-6 text-base text-muted-foreground">
                We couldn't find any books in this category. Try selecting a
                different category or check back later.
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
    <div class="mt-8 flex items-center justify-center">
      <UiPagination
        v-slot="{ page: currentPage }"
        v-model:page="page"
        :total="filteredSubject.length"
        :items-per-page="itemsPerPage"
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
import { bookSubjects } from "@/constants/bookSubjects";

const route = useRoute();
const router = useRouter();

const bookStore = useBookStore();
const favoriteStore = useFavoriteStore();

const { books } = storeToRefs(bookStore);
const { favorites } = storeToRefs(favoriteStore);

const isLoading = ref(false);
const items = ["Newest", "From A to Z", "From Z to A"];
const prices = ["Under $10", "$10 - $20", "$20 - $30", "Above $50"];
const selectedPrice = ref("");
const page = ref(1);
const itemsPerPage = 12;
const sortBy = ref("Newest");
const openedCategories = ref<Record<number, boolean>>({});

function toggleCategory(index: number) {
  openedCategories.value[index] = !openedCategories.value[index];
}

const filteredSubject = computed(() => {
  let filtered = [...books.value];

  if (sortBy.value === "Newest") {
    filtered.sort(
      (a, b) =>
        new Date((b as any).publishedDate).getTime() -
        new Date((a as any).publishedDate).getTime()
    );
  } else if (sortBy.value === "From A to Z") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === "From Z to A") {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  }

  if (selectedPrice.value) {
    filtered = filtered.filter((book) => {
      const price = book.price;
      switch (selectedPrice.value) {
        case "Under $10":
          return price < 10;
        case "$10 - $20":
          return price >= 10 && price <= 20;
        case "$20 - $30":
          return price >= 20 && price <= 30;
        case "Above $50":
          return price > 50;
        default:
          return true;
      }
    });
  }
  return filtered;
});

const paginatedBooks = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredSubject.value.slice(start, end);
});

const formattedSubject = computed(() => {
  const subject = route.params.subject as string | undefined;
  if (!subject) return "";
  return subject.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
});

async function fetchBooks() {
  isLoading.value = true;
  try {
    const subject = route.params.subject as string;
    if (subject) {
      await bookStore.getAllBooks({ subject });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {
    isLoading.value = false;
  }
}

async function fetchFavorites() {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      await favoriteStore.getFavoritesForEachUser();
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
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
    // Handle case where bookId is populated (contains full book object)
    const favoriteBookId = favorite.bookId?._id || favorite.bookId;
    return favoriteBookId === bookId;
  });
}

onMounted(async () => {
  await fetchBooks();
  await fetchFavorites();
});

watch(
  () => route.params.subject,
  () => {
    page.value = 1;
    fetchBooks();
  },
  { immediate: true }
);
</script>
