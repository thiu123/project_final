<template>
  <div class="container mx-auto max-w-[1500px] px-4 py-12">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="mb-2 text-3xl font-bold text-foreground">
        Weekly Best Sellers
      </h2>
    </div>

    <!-- Tabs -->
    <div
      class="mb-6 flex overflow-x-auto border-b border-border"
      role="tablist"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'marketing'"
        class="-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-colors"
        :class="
          activeTab === 'marketing'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        "
        @click="activeTab = 'marketing'"
      >
        <BookOpen class="h-5 w-5" />
        Marketing
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'kids'"
        class="-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-colors"
        :class="
          activeTab === 'kids'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        "
        @click="activeTab = 'kids'"
      >
        <GraduationCap class="h-5 w-5" />
        Kids Education
      </button>
    </div>

    <!-- Tab Content -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Left Column - List of Books -->
      <div class="col-span-12 md:col-span-6">
        <div
          v-for="(book, index) in currentBooks"
          :key="book._id"
          class="mb-4 cursor-pointer rounded-xl border-2 bg-card p-4 shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          :class="
            selectedBook?._id === book._id
              ? 'border-primary bg-primary/5'
              : 'border-transparent'
          "
          @click="selectBook(book)"
        >
          <div class="flex">
            <!-- Ranking Number -->
            <div class="mr-4 flex min-w-[60px] flex-col items-center">
              <UiBadge
                :variant="getRankingVariant(index)"
                class="px-3 py-1 text-sm font-bold"
              >
                {{ String(index + 1).padStart(2, "0") }}
              </UiBadge>
              <ArrowUp
                v-if="index < 3"
                class="mt-1 h-4 w-4"
                :class="getRankingIconClass(index)"
              />
            </div>

            <!-- Book Cover -->
            <div
              class="mr-4 h-[120px] w-20 shrink-0 overflow-hidden rounded bg-muted shadow"
            >
              <img
                :src="
                  book.cover_url ||
                  'https://via.placeholder.com/80x120/e0e0e0/757575?text=No+Image'
                "
                :alt="book.title"
                class="block h-full w-full object-cover"
                @error="onSmallCoverError"
              />
            </div>

            <!-- Book Info -->
            <div class="grow">
              <h3 class="mb-1 line-clamp-2 text-lg font-bold text-foreground">
                {{ book.title }}
              </h3>
              <p class="mb-2 text-sm text-muted-foreground">
                {{ book.authors?.join(", ") || "Unknown Author" }}
              </p>
              <div class="mb-2 flex items-center">
                <UiRating
                  :model-value="book.rating || 4.5"
                  :size="16"
                  readonly
                />
                <span class="ml-2 text-xs text-muted-foreground">
                  {{ book.rating || "4.5" }}
                </span>
              </div>
              <p class="mb-2 text-xs text-muted-foreground">
                {{ book.sold }} sold
              </p>
            </div>
          </div>
        </div>

        <!-- View More Button -->
        <UiButton
          block
          variant="outline"
          size="lg"
          class="mt-4 border-primary text-primary hover:bg-primary/10 hover:text-primary"
          @click="loadMore(activeTab === 'marketing' ? 'marketing' : 'education')"
        >
          View More
        </UiButton>
      </div>

      <!-- Right Column - Selected Book Details -->
      <div class="col-span-12 md:col-span-6">
        <div
          v-if="selectedBook"
          class="sticky top-5 flex h-full flex-col rounded-xl border border-border bg-card shadow-md"
        >
          <!-- Book Cover with proper aspect ratio -->
          <div class="flex justify-center p-5">
            <img
              :src="
                selectedBook.cover_url ||
                'https://via.placeholder.com/300x450/e0e0e0/757575?text=No+Image'
              "
              :alt="selectedBook.title"
              class="h-auto w-full max-w-[250px] rounded-lg bg-muted object-cover shadow-lg"
              @error="onLargeCoverError"
            />
          </div>

          <h3 class="mt-3 px-4 text-lg font-bold text-foreground">
            {{ selectedBook.title }}
          </h3>

          <p class="mb-2 px-4 text-sm text-muted-foreground">
            Author:
            {{ selectedBook.authors?.join(", ") || "Unknown Author" }}
            <br />
            Publisher:
            {{ selectedBookPublisher }}
          </p>

          <div class="flex flex-1 flex-col p-4">
            <!-- Price -->
            <div class="mb-3">
              <div class="mb-2 flex items-center">
                <span class="mr-3 text-2xl font-bold text-destructive">
                  ${{ selectedBook.price?.toFixed(2) || "0.00" }}
                </span>
                <UiBadge variant="destructive" class="font-bold">
                  -10%
                </UiBadge>
              </div>
            </div>

            <!-- Description Title (kids tab only, as in the original) -->
            <h4
              v-if="activeTab === 'kids'"
              class="mb-2 text-base font-bold text-foreground"
            >
              {{ selectedBook.title }}
            </h4>

            <!-- Description -->
            <p
              class="mb-3 line-clamp-6 text-muted-foreground"
              :class="activeTab === 'marketing' ? 'text-base' : 'text-sm'"
            >
              {{ selectedBook.description || "No description available" }}
            </p>

            <!-- Action Buttons -->
            <div class="mt-auto flex gap-3">
              <UiButton
                block
                size="lg"
                class="font-bold"
                @click="addToCart(selectedBook._id)"
              >
                <ShoppingCart class="mr-1 h-5 w-5" />
                Add to Cart
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Placeholder when no book selected -->
        <div
          v-else
          class="sticky top-5 h-full rounded-xl border border-border bg-card shadow-md"
        >
          <div class="px-4 py-12 text-center">
            <BookOpen class="mx-auto h-20 w-20 text-muted-foreground/40" />
            <p class="mt-4 text-lg text-muted-foreground">
              Select a book to view details
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import {
  ArrowUp,
  BookOpen,
  GraduationCap,
  ShoppingCart,
} from "lucide-vue-next";
import type { Book } from "@/types";

const emit = defineEmits<{
  "show-snackbar": [payload: { text: string; color: string }];
}>();

const router = useRouter();

const bookStore = useBookStore();
const { homeSubjects } = storeToRefs(bookStore);
const cartStore = useCartStore();

const activeTab = ref<"marketing" | "kids">("marketing");
const selectedBook = ref<Book | null>(null);

const marketingBooks = computed<Book[]>(() =>
  (homeSubjects.value["marketing"] || []).slice(0, 5)
);

const kidsBooks = computed<Book[]>(() =>
  (homeSubjects.value["kids education"] || []).slice(0, 5)
);

const currentBooks = computed<Book[]>(() =>
  activeTab.value === "marketing" ? marketingBooks.value : kidsBooks.value
);

// `publisher` is not part of the Book model; the original template read it anyway,
// falling back to a default label when absent.
const selectedBookPublisher = computed<string>(
  () =>
    (selectedBook.value as (Book & { publisher?: string }) | null)?.publisher ||
    "People's Army Publishing House"
);

watch(marketingBooks, (books) => {
  if (!selectedBook.value && books.length) selectedBook.value = books[0];
});

watch(activeTab, (newTab) => {
  selectedBook.value =
    (newTab === "marketing" ? marketingBooks.value[0] : kidsBooks.value[0]) ??
    null;
});

function selectBook(book: Book) {
  selectedBook.value = book;
  console.log("Manually selected book:", book?.title);
}

type RankingVariant = "destructive" | "warning" | "success" | "muted";

function getRankingVariant(index: number): RankingVariant {
  if (index === 0) return "destructive";
  if (index === 1) return "warning";
  if (index === 2) return "success";
  return "muted";
}

function getRankingIconClass(index: number): string {
  if (index === 0) return "text-destructive";
  if (index === 1) return "text-warning";
  if (index === 2) return "text-success";
  return "text-muted-foreground";
}

async function addToCart(bookId: string) {
  try {
    await cartStore.addToCart({
      bookId,
      quantity: 1,
      productType: "hardbook", // default to hardbook
    });
    emit("show-snackbar", {
      text: "Added to cart!",
      color: "success",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    emit("show-snackbar", {
      text: "Failed to add to cart",
      color: "error",
    });
  }
}

function loadMore(subject: string) {
  // Navigate to full list page based on subject
  router.push(`/subjects/${subject}`);
}

function onSmallCoverError(e: Event) {
  (e.target as HTMLImageElement).src =
    "https://via.placeholder.com/80x120/e0e0e0/757575?text=No+Image";
}

function onLargeCoverError(e: Event) {
  (e.target as HTMLImageElement).src =
    "https://via.placeholder.com/300x450/e0e0e0/757575?text=No+Image";
}
</script>
