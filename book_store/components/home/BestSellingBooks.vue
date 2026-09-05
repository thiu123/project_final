<template>
  <div class="container mx-auto mt-4 max-w-[1440px] px-3 md:mt-8 md:px-4">
    <div
      class="rounded-xl border border-border bg-gradient-to-br from-card to-muted/60 p-4 shadow-lg md:p-8"
    >
      <!-- Enhanced Header -->
      <div
        class="mb-4 flex flex-col items-start justify-between border-b border-border pb-4 md:mb-8 md:flex-row md:items-center"
      >
        <div class="mb-4 flex items-center md:mb-0">
          <div>
            <h2
              class="mb-2 text-2xl font-bold text-foreground md:text-4xl"
            >
              Trending Best Sellers
            </h2>
            <p class="m-0 text-xs text-muted-foreground md:text-base">
              Discover our most popular titles across all categories
            </p>
          </div>
        </div>
      </div>

      <!-- Enhanced Tabs Card -->
      <div class="overflow-hidden rounded-lg border border-border bg-card">
        <!-- Tabs Navigation -->
        <div
          class="flex overflow-x-auto border-b border-border bg-muted/50"
          role="tablist"
        >
          <button
            v-for="(subject, i) in bestSellerSubjects"
            :key="i"
            type="button"
            role="tab"
            :aria-selected="tab === subject"
            class="shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-bold capitalize transition-colors md:px-6 md:py-5 md:text-base"
            :class="
              tab === subject
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            "
            @click="tab = subject"
          >
            {{ subject }}
          </button>
        </div>

        <!-- Tabs Content -->
        <div class="p-3 md:p-6">
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div
              v-for="(book, i) in bestSellersStories.slice(0, 8)"
              :key="i"
              class="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              @click="router.push(`/details/${book._id}`)"
            >
              <!-- Bestseller Badge -->
              <UiBadge
                variant="destructive"
                class="absolute left-2 top-2 z-[2] shadow md:left-3 md:top-3"
              >
                <Flame class="h-3 w-3" />
                #{{ i + 1 }}
              </UiBadge>

              <!-- Enhanced Book Cover -->
              <div
                class="relative flex h-[200px] items-center justify-center bg-muted/40 md:h-[280px] lg:h-[340px]"
              >
                <img
                  :src="book?.cover_url"
                  :alt="book.title"
                  class="h-full max-h-[180px] w-auto object-cover transition-transform duration-300 group-hover:scale-105 md:max-h-[260px] lg:max-h-[320px]"
                />
              </div>

              <!-- Enhanced Card Content -->
              <div class="flex flex-1 flex-col p-2 md:p-4">
                <!-- Rating Section -->
                <div class="mb-2 flex items-center md:mb-3">
                  <UiRating
                    :model-value="book?.rating ?? 0"
                    :size="16"
                    readonly
                  />
                </div>

                <!-- Book Title -->
                <div
                  class="mb-1 truncate text-xs font-bold text-foreground md:mb-2 md:text-base"
                  :title="book.title"
                >
                  {{ book.title }}
                </div>

                <!-- Author -->
                <div
                  v-for="(author, index) in book.authors?.slice(0, 1)"
                  :key="index"
                  class="mb-2 text-xs text-muted-foreground md:mb-3"
                >
                  <span class="block truncate">{{ author }}</span>
                </div>

                <!-- Genre Tag & Sold Count -->
                <div
                  class="mb-2 flex flex-col gap-1 md:mb-3 md:flex-row md:gap-2"
                >
                  <UiBadge
                    variant="outline"
                    class="self-start border-primary/50 capitalize text-primary"
                  >
                    {{ tab }}
                  </UiBadge>
                  <UiBadge variant="success" class="self-start capitalize">
                    <Flame class="h-3 w-3" />
                    Sold {{ book.sold || 0 }}
                  </UiBadge>
                </div>

                <!-- Price Section -->
                <div
                  class="mb-2 mt-auto flex items-center justify-between md:mb-3"
                >
                  <div class="flex items-center">
                    <span
                      class="text-sm font-bold text-foreground md:text-lg"
                    >
                      ${{ book.price }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Enhanced Card Actions -->
              <div class="p-2 pt-0 md:p-4 md:pt-0">
                <UiButton
                  block
                  variant="secondary"
                  class="h-8 rounded-xl text-xs font-bold shadow transition-transform hover:-translate-y-0.5 md:h-11 md:text-base"
                  @click.stop="handleAddToCart(book._id, 1)"
                >
                  <ShoppingCart class="h-3 w-3 md:h-4 md:w-4" />
                  <span class="hidden sm:inline">Add to Cart</span>
                  <span class="inline sm:hidden">Add</span>
                </UiButton>
              </div>
            </div>
          </div>

          <!-- Load More Section -->
          <div class="mt-6 text-center md:mt-8">
            <UiButton
              variant="outline"
              size="lg"
              class="rounded-full border-primary font-bold text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Plus class="h-4 w-4" />
              Load More Books
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";
import { Flame, Plus, ShoppingCart } from "lucide-vue-next";
import type { Book, Favorite } from "@/types";

const props = withDefaults(
  defineProps<{
    favorites?: Favorite[];
  }>(),
  {
    favorites: () => [],
  }
);

const emit = defineEmits<{
  "add-to-cart": [bookId: string, quantity: number];
  "toggle-favorites": [bookId: string];
}>();

const router = useRouter();

const bookStore = useBookStore();
const { homeSubjects } = storeToRefs(bookStore);

const tab = ref("historical fiction");
const bestSellerSubjects = ["historical fiction", "manga", "cooking"];

const bestSellersStories = computed<Book[]>(
  () => homeSubjects.value[tab.value] || []
);

function handleAddToCart(bookId: string, quantity: number) {
  // Emit event to parent component
  emit("add-to-cart", bookId, quantity);
}

function handleToggleFavorites(bookId: string) {
  // Emit event to parent component
  emit("toggle-favorites", bookId);
}

function isFavorite(bookId: string): boolean {
  return props.favorites.some((favorite) => {
    const favoriteBookId = (favorite.bookId as Book)?._id || favorite.bookId;
    return favoriteBookId === bookId;
  });
}
</script>
