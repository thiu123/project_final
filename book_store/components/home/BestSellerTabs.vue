<template>
  <div class="container mx-auto max-w-[1500px] px-4 py-12">
    <div class="mb-8">
      <h2 class="mb-2 text-3xl font-bold text-foreground">
        Weekly Best Sellers
      </h2>
    </div>

    <!-- Tabs -->
    <div class="mb-6 flex overflow-x-auto border-b border-border" role="tablist">
      <button
        v-for="tab in TABS"
        :key="tab.subject"
        type="button"
        role="tab"
        :aria-selected="activeSubject === tab.subject"
        class="-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-colors"
        :class="
          activeSubject === tab.subject
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        "
        @click="activeSubject = tab.subject"
      >
        <component :is="tab.icon" class="h-5 w-5" />
        {{ tab.label }}
      </button>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- Ranked list -->
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
          @click="selectedBook = book"
        >
          <div class="flex">
            <div class="mr-4 flex min-w-[60px] flex-col items-center">
              <UiBadge
                :variant="RANK_STYLES[index]?.variant ?? 'muted'"
                class="px-3 py-1 text-sm font-bold"
              >
                {{ String(index + 1).padStart(2, "0") }}
              </UiBadge>
              <ArrowUp
                v-if="RANK_STYLES[index]"
                class="mt-1 h-4 w-4"
                :class="RANK_STYLES[index].iconClass"
              />
            </div>

            <div
              class="mr-4 h-[120px] w-20 shrink-0 overflow-hidden rounded bg-muted shadow"
            >
              <img
                v-if="book.cover_url"
                :src="book.cover_url"
                :alt="book.title"
                class="block h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div class="grow">
              <h3 class="mb-1 line-clamp-2 text-lg font-bold text-foreground">
                {{ book.title }}
              </h3>
              <p class="mb-2 text-sm text-muted-foreground">
                {{ book.authors?.join(", ") || "Unknown Author" }}
              </p>
              <div class="mb-2 flex items-center">
                <UiRating :model-value="book.rating ?? 0" :size="16" readonly />
                <span class="ml-2 text-xs text-muted-foreground">
                  {{ book.rating ?? "—" }}
                </span>
              </div>
              <p class="mb-2 text-xs text-muted-foreground">
                {{ book.sold }} sold
              </p>
            </div>
          </div>
        </div>

        <UiButton
          block
          variant="outline"
          size="lg"
          class="mt-4 border-primary text-primary hover:bg-primary/10 hover:text-primary"
          @click="router.push(`/subjects/${encodeURIComponent(activeSubject)}`)"
        >
          View More
        </UiButton>
      </div>

      <!-- Selected book -->
      <div class="col-span-12 md:col-span-6">
        <div
          v-if="selectedBook"
          class="sticky top-5 flex h-full flex-col rounded-xl border border-border bg-card shadow-md"
        >
          <div class="flex justify-center p-5">
            <img
              v-if="selectedBook.cover_url"
              :src="selectedBook.cover_url"
              :alt="selectedBook.title"
              class="h-auto w-full max-w-[250px] rounded-lg bg-muted object-cover shadow-lg"
            />
          </div>

          <h3 class="mt-3 px-4 text-lg font-bold text-foreground">
            {{ selectedBook.title }}
          </h3>

          <p class="mb-2 px-4 text-sm text-muted-foreground">
            Author: {{ selectedBook.authors?.join(", ") || "Unknown Author" }}
          </p>

          <div class="flex flex-1 flex-col p-4">
            <div class="mb-3 flex items-center">
              <span class="mr-3 text-2xl font-bold text-destructive">
                {{ formatUsd(selectedBook.price ?? 0) }}
              </span>
            </div>

            <p class="mb-3 line-clamp-6 text-base text-muted-foreground">
              {{ selectedBook.description || "No description available" }}
            </p>

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
import type { Component } from "vue";
import {
  ArrowUp,
  BookOpen,
  GraduationCap,
  ShoppingCart,
} from "lucide-vue-next";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import { formatUsd } from "@/utils/pricing";
import type { Book, SnackbarPayload } from "@/types";

const emit = defineEmits<{
  "show-snackbar": [payload: SnackbarPayload];
}>();

const TABS: { subject: string; label: string; icon: Component }[] = [
  { subject: "marketing", label: "Marketing", icon: BookOpen },
  { subject: "kids education", label: "Kids Education", icon: GraduationCap },
];

/** Medal colours for the top three; everything below shares the default. */
const RANK_STYLES = [
  { variant: "destructive", iconClass: "text-destructive" },
  { variant: "warning", iconClass: "text-warning" },
  { variant: "success", iconClass: "text-success" },
] as const;

const LIST_SIZE = 5;

const router = useRouter();

const bookStore = useBookStore();
const { homeSubjects } = storeToRefs(bookStore);
const cartStore = useCartStore();

const activeSubject = ref(TABS[0].subject);
const selectedBook = ref<Book | null>(null);

const currentBooks = computed<Book[]>(() =>
  (homeSubjects.value[activeSubject.value] ?? []).slice(0, LIST_SIZE)
);

// Keep a book in the detail pane: the first of the active tab, re-picked when
// the tab changes or when the list arrives from the API.
watch(
  currentBooks,
  (books) => {
    if (!books.some((book) => book._id === selectedBook.value?._id)) {
      selectedBook.value = books[0] ?? null;
    }
  },
  { immediate: true }
);

async function addToCart(bookId: string) {
  try {
    await cartStore.addToCart({
      bookId,
      quantity: 1,
      productType: "hardbook",
    });
    emit("show-snackbar", { message: "Added to cart!", color: "success" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    emit("show-snackbar", { message: "Failed to add to cart", color: "error" });
  }
}
</script>
