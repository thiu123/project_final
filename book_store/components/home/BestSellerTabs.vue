<template>
  <section class="container mx-auto max-w-7xl px-4">
    <StoreSectionHeader
      :number="number"
      eyebrow="This week"
      description="The five titles readers keep coming back to, shelf by shelf."
    >
      Weekly best <span class="italic">sellers</span>
      <template #action>
        <div
          role="tablist"
          aria-label="Weekly best seller shelves"
          class="scrollbar-none -mb-[25px] flex max-w-full gap-7 overflow-x-auto md:gap-9"
        >
          <button
            v-for="tab in TABS"
            :key="tab.subject"
            type="button"
            role="tab"
            :aria-selected="activeSubject === tab.subject"
            class="relative shrink-0 whitespace-nowrap pb-4 text-[12px] lg:pb-7 font-medium uppercase tracking-[0.14em] transition-colors"
            :class="activeSubject === tab.subject ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
            @click="activeSubject = tab.subject"
          >
            {{ tab.label }}
            <span
              class="absolute inset-x-0 bottom-0 h-px bg-foreground transition-opacity duration-300"
              :class="activeSubject === tab.subject ? 'opacity-100' : 'opacity-0'"
              aria-hidden="true"
            />
          </button>
        </div>
      </template>
    </StoreSectionHeader>

    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <div class="lg:col-span-7">
        <ol class="divide-y divide-border border-y border-border">
          <li v-for="(book, index) in currentBooks" :key="book._id">
            <button
              type="button"
              class="group grid w-full grid-cols-[2.5rem_3rem_minmax(0,1fr)] items-center gap-4 px-3 py-4 text-left transition-colors duration-300 sm:grid-cols-[3.25rem_3.5rem_minmax(0,1fr)_auto] md:gap-6 md:px-5"
              :class="selectedBook?._id === book._id ? 'bg-muted' : 'hover:bg-muted/50'"
              :aria-pressed="selectedBook?._id === book._id"
              @click="selectedBook = book"
            >
              <span
                class="font-serif text-[2.25rem] font-light leading-none tracking-[-0.04em] tabular-nums transition-colors md:text-[2.75rem]"
                :class="selectedBook?._id === book._id ? 'text-foreground' : 'text-muted-foreground/60 group-hover:text-foreground'"
              >
                {{ String(index + 1).padStart(2, "0") }}
              </span>

              <div class="ed-cover aspect-[2/3] w-full overflow-hidden bg-background">
                <img
                  v-if="book.cover_url"
                  :src="book.cover_url"
                  :alt="book.title"
                  class="block h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div class="min-w-0">
                <p class="eyebrow truncate leading-normal">
                  {{ book.authors?.join(", ") || "Unknown author" }}
                </p>
                <p class="mt-1.5 line-clamp-2 font-serif text-lg leading-snug text-foreground md:text-xl">
                  {{ book.title }}
                </p>
                <p class="mt-1.5 text-[13px] tabular-nums text-muted-foreground sm:hidden">
                  {{ book.sold ?? 0 }} sold
                </p>
              </div>

              <div class="hidden flex-col items-end gap-1.5 text-[13px] tabular-nums text-muted-foreground sm:flex">
                <span class="flex items-center gap-1">
                  <Star class="size-3 fill-current" />
                  {{ book.rating ?? "No rating" }}
                </span>
                <span>{{ book.sold ?? 0 }} sold</span>
              </div>
            </button>
          </li>
        </ol>

        <NuxtLink
          :to="`/subjects/${encodeURIComponent(activeSubject)}`"
          class="group mt-8 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]"
        >
          <span class="ed-link">View more</span>
          <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </NuxtLink>
      </div>

      <div class="lg:col-span-5">
        <div v-if="selectedBook" class="flex flex-col">
          <NuxtLink
            :to="`/details/${selectedBook._id}`"
            class="group flex aspect-[4/3] items-center justify-center bg-muted transition-colors duration-500 hover:bg-accent"
            :aria-label="selectedBook.title"
          >
            <div
              class="ed-cover aspect-[2/3] w-[38%] overflow-hidden bg-card transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5"
            >
              <img
                v-if="selectedBook.cover_url"
                :src="selectedBook.cover_url"
                :alt="selectedBook.title"
                class="h-full w-full object-cover"
              />
            </div>
          </NuxtLink>

          <p class="eyebrow mt-7 leading-normal">
            {{ selectedBook.authors?.join(", ") || "Unknown author" }}
          </p>
          <h3 class="mt-3 font-serif text-[1.75rem] font-normal leading-[1.1] tracking-[-0.015em] text-foreground md:text-[2rem]">
            {{ selectedBook.title }}
          </h3>
          <p class="mt-3 font-serif text-xl tabular-nums text-foreground">
            {{ formatUsd(selectedBook.price ?? 0) }}
          </p>
          <p class="mt-4 line-clamp-4 text-[15px] leading-relaxed text-foreground/85">
            {{ selectedBook.description || "No description available" }}
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <UiButton
              variant="ink"
              size="cta"
              class="shadow-none"
              @click="addToCart(selectedBook._id)"
            >
              Add to cart
            </UiButton>
            <NuxtLink
              :to="`/details/${selectedBook._id}`"
              class="group inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]"
            >
              <span class="ed-link">View details</span>
              <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </NuxtLink>
          </div>
        </div>

        <div
          v-else
          class="flex aspect-[4/3] items-center justify-center bg-muted p-8 text-center"
        >
          <p class="font-serif text-2xl italic text-muted-foreground">
            Select a book to view details
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ArrowRight, Star } from "lucide-vue-next";
import { useAuthDialogStore } from "@/stores/authDialog";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import { formatUsd } from "@/utils/pricing";
import type { Book, SnackbarPayload } from "@/types";

defineProps<{ number?: string }>();

const emit = defineEmits<{
  "show-snackbar": [payload: SnackbarPayload];
}>();

const TABS: { subject: string; label: string }[] = [
  { subject: "marketing", label: "Marketing" },
  { subject: "kids education", label: "Kids Education" },
];

const LIST_SIZE = 5;

const bookStore = useBookStore();
const { homeSubjects } = storeToRefs(bookStore);
const cartStore = useCartStore();
const authDialog = useAuthDialogStore();

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
  const signedIn = authDialog.ensureSignedIn(
    "Sign in to add books to your cart.",
    () => addToCart(bookId)
  );
  if (!signedIn) return;

  try {
    await cartStore.addToCart({
      bookId,
      quantity: 1,
      productType: "hardbook",
    });
    emit("show-snackbar", { message: "Added to cart!", color: "success" });
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    emit("show-snackbar", {
      message: error.response?.data?.msg || "Failed to add to cart",
      color: "error",
    });
  }
}
</script>
