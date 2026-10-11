<template>
  <div class="min-h-screen bg-background">
    <DetailsPageSkeleton v-if="isLoading" />

    <div
      v-else-if="loadFailed"
      class="container mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center md:py-32"
    >
      <div class="relative mb-10">
        <div
          class="flex size-24 -rotate-6 items-center justify-center rounded-3xl bg-accent text-accent-foreground"
        >
          <BookX class="size-10" />
        </div>
        <div
          aria-hidden="true"
          class="absolute -bottom-3 -right-5 size-10 rotate-12 rounded-xl bg-primary/25"
        ></div>
      </div>
      <h1 class="text-3xl font-bold tracking-tight">We couldn't find that book</h1>
      <p class="mt-3 text-muted-foreground">
        It may have been taken off the shelf, or the link is slightly off.
      </p>
      <UiButton
        as-child
        variant="ink"
        class="mt-8 h-12 rounded-full px-7 text-base font-semibold shadow-none"
      >
        <NuxtLink to="/subjects/all">
          Browse the catalogue
          <ArrowRight />
        </NuxtLink>
      </UiButton>
    </div>

    <div v-else class="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
        <ol class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li>
            <NuxtLink to="/" class="transition-colors hover:text-foreground">Home</NuxtLink>
          </li>
          <li aria-hidden="true" class="text-border">/</li>
          <template v-if="primarySubject">
            <li>
              <NuxtLink
                :to="`/subjects/${subjectSlug(primarySubject)}`"
                class="capitalize transition-colors hover:text-foreground"
              >
                {{ primarySubject }}
              </NuxtLink>
            </li>
            <li aria-hidden="true" class="text-border">/</li>
          </template>
          <li class="max-w-[40ch] truncate font-medium text-foreground" aria-current="page">
            {{ book.title }}
          </li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
        <div class="hero-rise lg:sticky lg:top-28 lg:col-span-5">
          <DetailsCoverStage
            :book="book"
            :favorite="isFavorite"
            @toggle-favorite="handleToggleFavorites"
          />
        </div>

        <div class="lg:col-span-7">
          <div v-if="book.subjects?.length" class="hero-rise mb-5 flex flex-wrap gap-2">
            <NuxtLink
              v-for="subject in book.subjects.slice(0, 3)"
              :key="subject"
              :to="`/subjects/${subjectSlug(subject)}`"
              class="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {{ subject }}
            </NuxtLink>
          </div>

          <h1
            class="hero-rise text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl"
            style="--rise-delay: 60ms"
          >
            {{ book.title }}
          </h1>

          <p
            v-if="author"
            class="hero-rise mt-4 text-lg text-muted-foreground"
            style="--rise-delay: 120ms"
          >
            by
            <NuxtLink
              :to="`/subjects/all?search=${encodeURIComponent(author)}`"
              class="group relative ml-0.5 inline-block font-semibold text-foreground"
            >
              {{ author }}
              <svg
                aria-hidden="true"
                class="absolute -bottom-1.5 left-0 h-2 w-full text-accent transition-colors group-hover:text-primary dark:text-accent/80"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 4 Q 6.25 0 12.5 4 T 25 4 T 37.5 4 T 50 4 T 62.5 4 T 75 4 T 87.5 4 T 100 4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </NuxtLink>
          </p>

          <a
            href="#reviews"
            class="hero-rise group mt-5 inline-flex items-center gap-2 text-sm"
            style="--rise-delay: 160ms"
          >
            <UiRating :model-value="displayRating" :size="18" readonly />
            <span class="font-semibold tabular-nums">{{ displayRating.toFixed(1) }}</span>
            <span class="text-muted-foreground underline-offset-4 group-hover:underline">
              {{ totalReviews }} {{ totalReviews === 1 ? "review" : "reviews" }}
            </span>
          </a>

          <div
            class="hero-rise mt-8 border-t border-dashed border-border pt-8"
            style="--rise-delay: 200ms"
          >
            <div class="flex flex-wrap items-end gap-x-4 gap-y-1">
              <span class="text-5xl font-bold tracking-tight tabular-nums">
                {{ formatUsd(displayPrice) }}
              </span>
              <span
                v-if="productType === 'ebook'"
                class="pb-1.5 text-lg tabular-nums text-muted-foreground line-through"
              >
                {{ formatUsd(hardbookPrice) }}
              </span>
            </div>
            <p class="mt-3 flex items-center gap-2 text-sm font-medium">
              <span class="relative flex size-2.5">
                <span
                  v-if="stockStatus.pulse"
                  class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  :class="stockStatus.dot"
                ></span>
                <span class="relative inline-flex size-2.5 rounded-full" :class="stockStatus.dot"></span>
              </span>
              {{ stockStatus.label }}
            </p>
          </div>

          <div class="hero-rise mt-8" style="--rise-delay: 240ms">
            <p class="mb-3 text-sm font-semibold">Pick a format</p>
            <DetailsFormatPicker
              v-model="productType"
              :hardbook-price="hardbookPrice"
              :ebook-price="ebookPrice"
            />

            <button
              v-if="productType === 'ebook'"
              type="button"
              class="group mt-5 inline-flex items-center gap-2 text-sm font-semibold"
              @click="router.push({ path: '/reader', query: { bookId } })"
            >
              <CheckCircle2 v-if="hasPurchasedEbook" class="size-4 text-success" />
              <BookOpen v-else class="size-4" />
              <span
                class="underline decoration-accent decoration-[3px] underline-offset-4 transition-colors group-hover:decoration-primary"
              >
                {{ hasPurchasedEbook ? "You own this ebook, open the reader" : "Read the first 20 pages free" }}
              </span>
              <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div class="hero-rise mt-8 flex flex-wrap gap-3" style="--rise-delay: 280ms">
            <div
              class="inline-flex h-12 shrink-0 items-center rounded-full border border-border bg-card p-1"
            >
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full transition hover:bg-muted active:scale-90 disabled:pointer-events-none disabled:opacity-40"
                aria-label="Decrease quantity"
                :disabled="quantity <= 1 || isOutOfStock"
                @click="quantity--"
              >
                <Minus class="size-4" />
              </button>
              <input
                v-model.number="quantity"
                type="number"
                inputmode="numeric"
                min="1"
                :max="maxQuantity"
                :disabled="isOutOfStock"
                aria-label="Quantity"
                class="w-10 bg-transparent text-center text-base font-semibold tabular-nums [appearance:textfield] focus:outline-none disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                @change="clampQuantity"
              />
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full transition hover:bg-muted active:scale-90 disabled:pointer-events-none disabled:opacity-40"
                aria-label="Increase quantity"
                :disabled="quantity >= maxQuantity || isOutOfStock"
                @click="quantity++"
              >
                <Plus class="size-4" />
              </button>
            </div>

            <UiButton
              variant="ink"
              class="group h-12 min-w-[10rem] flex-1 rounded-full text-base font-semibold shadow-none"
              :disabled="isOutOfStock"
              @click="handleAddToCart"
            >
              <ShoppingCart class="transition-transform duration-300 group-hover:-rotate-12" />
              {{ isOutOfStock ? "Out of stock" : "Add to cart" }}
            </UiButton>
            <UiButton
              class="group h-12 min-w-[10rem] flex-1 rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-none hover:bg-accent/80 active:scale-[0.98]"
              :disabled="isOutOfStock"
              @click="handleBuyNow"
            >
              Buy now
              <ArrowRight class="transition-transform group-hover:translate-x-1" />
            </UiButton>
          </div>

          <p
            v-if="
              productType === 'hardbook' &&
              (book.stock ?? 0) > 0 &&
              (book.stock ?? 0) < MAX_LINE_QUANTITY
            "
            class="mt-3 text-xs font-medium text-warning"
          >
            Up to {{ book.stock }} copies per order.
          </p>
        </div>
      </div>

      <section
        v-reveal
        class="mt-20 grid grid-cols-1 gap-12 md:mt-28 lg:grid-cols-12 lg:gap-16"
        aria-labelledby="about-heading"
      >
        <div class="lg:col-span-7">
          <h2 id="about-heading" class="text-2xl font-bold tracking-tight md:text-3xl">
            About this book
          </h2>
          <template v-if="displayDescription">
            <p
              class="mt-5 whitespace-pre-line text-base leading-[1.75] text-foreground/85"
              :class="isLongDescription && !descriptionExpanded && 'line-clamp-6'"
            >
              {{ displayDescription }}
            </p>
            <button
              v-if="isLongDescription"
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
              :aria-expanded="descriptionExpanded"
              @click="descriptionExpanded = !descriptionExpanded"
            >
              {{ descriptionExpanded ? "Show less" : "Read more" }}
              <ChevronDown
                class="size-4 transition-transform duration-300"
                :class="descriptionExpanded && 'rotate-180'"
              />
            </button>
          </template>
          <p v-else class="mt-5 text-muted-foreground">
            The publisher hasn't shared a description for this one yet.
          </p>
        </div>

        <div class="lg:col-span-5">
          <DetailsFactSheet :book="book" />
        </div>
      </section>

      <section id="reviews" v-reveal class="mt-20 scroll-mt-28 md:mt-28" aria-label="Reviews">
        <DetailsReviewsSummary
          :book-id="bookId"
          :rating="displayRating"
          :total="totalReviews"
          :breakdown="breakdown"
          :reviews="reviews"
          :locked="!currentUser && totalReviews > 0"
          @sign-in="handleSignInForReviews"
        />
      </section>

      <DetailsRelatedShelf
        v-if="primarySubject && book._id"
        :subject="primarySubject"
        :exclude-id="book._id"
        class="mt-20 md:mt-28"
      />
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
import {
  ArrowRight,
  BookOpen,
  BookX,
  CheckCircle2,
  ChevronDown,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useAuthDialogStore } from "@/stores/authDialog";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { useOrderStore } from "@/stores/order";
import { useReviewStore } from "@/stores/review";
import { useSnackbar } from "@/composables/useSnackbar";
import { isFavoriteBook } from "@/utils/favorites";
import { EBOOK_PRICE_RATIO, formatUsd } from "@/utils/pricing";
import { ratingBreakdown } from "@/utils/reviews";
import { subjectSlug } from "@/utils/subjects";
import { getBookById } from "@/api/bookApi";
import { getAverageRating } from "@/api/reviewApi";
import type { Book, ProductType } from "@/types";

/** Stock below this is called out as running low. */
const LOW_STOCK_THRESHOLD = 20;
/** Cap on a single line, so one order cannot clear the shelf. */
const MAX_LINE_QUANTITY = 10;
const LONG_DESCRIPTION_LENGTH = 600;

const route = useRoute();
const router = useRouter();

const cartStore = useCartStore();
const authDialog = useAuthDialogStore();
const orderStore = useOrderStore();
const favoriteStore = useFavoriteStore();
const reviewStore = useReviewStore();
const authStore = useAuthStore();

const { favorites } = storeToRefs(favoriteStore);
const { currentUser } = storeToRefs(authStore);
const { purchasedEbooks } = storeToRefs(orderStore);
const { reviews } = storeToRefs(reviewStore);

const { snackbar, notify, notifyError } = useSnackbar();

const book = ref<Partial<Book>>({});
const isLoading = ref(true);
const loadFailed = ref(false);
const quantity = ref(1);
const productType = ref<ProductType>("hardbook");
const averageRating = ref(0);
const totalReviews = ref(0);
const descriptionExpanded = ref(false);

const bookId = computed(() => route.params.id as string);

const isFavorite = computed(() => isFavoriteBook(favorites.value, book.value._id));

const author = computed(() => book.value.authors?.[0] ?? "");

const primarySubject = computed(() => book.value.subjects?.[0] ?? "");

const breakdown = computed(() => ratingBreakdown(reviews.value));

const displayRating = computed(() =>
  totalReviews.value > 0 ? averageRating.value : book.value.rating || 0
);

const hardbookPrice = computed(() => book.value.price ?? 0);

const ebookPrice = computed(() => hardbookPrice.value * EBOOK_PRICE_RATIO);

const displayPrice = computed(() =>
  productType.value === "ebook" ? ebookPrice.value : hardbookPrice.value
);

const hasPurchasedEbook = computed(
  () => purchasedEbooks.value[book.value._id as string] ?? false
);

const isOutOfStock = computed(
  () => productType.value === "hardbook" && (book.value.stock ?? 0) === 0
);

const maxQuantity = computed(() =>
  productType.value === "ebook"
    ? MAX_LINE_QUANTITY
    : Math.min(book.value.stock ?? 0, MAX_LINE_QUANTITY)
);

const stockStatus = computed(() => {
  if (productType.value === "ebook") {
    return { label: "Instant access in the online reader", dot: "bg-info", pulse: false };
  }
  const stock = book.value.stock ?? 0;
  if (stock > LOW_STOCK_THRESHOLD) {
    return { label: `In stock, ${stock} ready to ship`, dot: "bg-success", pulse: true };
  }
  if (stock > 0) {
    return { label: `Hurry, only ${stock} left`, dot: "bg-warning", pulse: true };
  }
  return { label: "Out of stock", dot: "bg-destructive", pulse: false };
});

/**
 * Some legacy rows store the description as `{ value }` rather than a string.
 */
const displayDescription = computed(() => {
  const description = book.value.description as unknown;
  return typeof description === "object" && description !== null
    ? (description as { value: string }).value
    : (description as string | undefined);
});

const isLongDescription = computed(
  () => (displayDescription.value?.length ?? 0) > LONG_DESCRIPTION_LENGTH
);

watch(productType, () => {
  quantity.value = Math.min(quantity.value, Math.max(1, maxQuantity.value));
});

onMounted(async () => {
  await loadBook();
  if (loadFailed.value) return;
  await Promise.allSettled([
    orderStore.fetchUserOrders(),
    reviewStore.loadReviews(bookId.value),
  ]);
});

function handleSignInForReviews() {
  const signedIn = authDialog.ensureSignedIn(
    "Sign in to read reader reviews.",
    () => reviewStore.loadReviews(bookId.value).catch(() => {})
  );
  if (signedIn) reviewStore.loadReviews(bookId.value).catch(() => {});
}

async function loadBook() {
  isLoading.value = true;
  try {
    const response = await getBookById(bookId.value);
    book.value = response.data;

    await loadAverageRating();

    if (currentUser.value) {
      await orderStore.checkEbookPurchase(bookId.value);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function loadAverageRating() {
  try {
    const response = await getAverageRating(bookId.value);
    averageRating.value = response.data.averageRating;
    totalReviews.value = response.data.totalReviews;
  } catch (error) {
    console.error("Error fetching average rating:", error);
    averageRating.value = 0;
    totalReviews.value = 0;
  }
}

function clampQuantity() {
  const value = Math.floor(Number(quantity.value)) || 1;
  quantity.value = Math.min(Math.max(1, value), Math.max(1, maxQuantity.value));
}

async function handleAddToCart() {
  const signedIn = authDialog.ensureSignedIn(
    "Sign in to add books to your cart.",
    handleAddToCart
  );
  if (!signedIn) return;

  try {
    await cartStore.addToCart({
      bookId: bookId.value,
      quantity: quantity.value,
      productType: productType.value,
    });

    const typeName = productType.value === "ebook" ? "Ebook" : "Hardback";
    notify(`${typeName} added to cart successfully!`);
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    notifyError(error.response?.data?.msg || "Failed to add to cart.");
  }
}

async function handleBuyNow() {
  const signedIn = authDialog.ensureSignedIn(
    "Sign in to buy this book.",
    handleBuyNow
  );
  if (!signedIn) return;

  try {
    await cartStore.addToCart(
      {
        bookId: bookId.value,
        quantity: quantity.value,
        productType: productType.value,
      },
      { refresh: false }
    );
    router.push("/cart");
  } catch (error: any) {
    console.error("Error during buy now:", error);
    notifyError(error.response?.data?.msg || "Failed to proceed to checkout.");
  }
}

async function handleToggleFavorites() {
  // Read before the toggle: the store swaps the list out underneath us.
  const wasFavorite = isFavorite.value;
  try {
    await favoriteStore.toggleFavorites(bookId.value);
    notify(wasFavorite ? "Removed from favorites!" : "Added to favorites!");
  } catch (error) {
    console.error("Error toggling favorites:", error);
    notifyError("Failed to update favorites.");
  }
}
</script>
