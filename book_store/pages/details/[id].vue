<template>
  <div class="min-h-screen bg-background">
    <DetailsPageSkeleton v-if="isLoading" />

    <div
      v-else-if="loadFailed"
      class="container mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center md:py-40"
    >
      <p class="eyebrow">Error 404</p>
      <h1 class="mt-6 font-serif text-5xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl">
        This book is <span class="italic">off the shelf.</span>
      </h1>
      <p class="mt-5 text-[15px] text-muted-foreground">
        It may have been removed, or the link is slightly off.
      </p>
      <UiButton as-child variant="ink" size="cta" class="mt-10 shadow-none">
        <NuxtLink to="/subjects/all">Browse the catalogue</NuxtLink>
      </UiButton>
    </div>

    <div v-else class="container mx-auto max-w-7xl px-4 pt-8 md:pt-12">
      <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
        <ol class="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
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
          <li class="max-w-[40ch] truncate text-foreground" aria-current="page">
            {{ book.title }}
          </li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div class="hero-rise lg:col-span-7">
          <DetailsCoverStage :book="book" />
        </div>

        <div class="lg:sticky lg:top-36 lg:col-span-5">
          <div v-if="book.subjects?.length" class="hero-rise flex flex-wrap gap-x-3 gap-y-1">
            <NuxtLink
              v-for="subject in book.subjects.slice(0, 3)"
              :key="subject"
              :to="`/subjects/${subjectSlug(subject)}`"
              class="eyebrow transition-colors hover:text-foreground"
            >
              {{ subject }}
            </NuxtLink>
          </div>

          <h1
            class="hero-rise mt-5 font-serif text-4xl font-normal leading-[1.04] tracking-[-0.025em] md:text-[3.25rem]"
            style="--rise-delay: 60ms"
          >
            {{ book.title }}
          </h1>

          <p
            v-if="author"
            class="hero-rise mt-4 font-serif text-xl text-muted-foreground"
            style="--rise-delay: 120ms"
          >
            by
            <NuxtLink
              :to="`/subjects/all?search=${encodeURIComponent(author)}`"
              class="ed-link italic text-foreground"
            >
              {{ author }}
            </NuxtLink>
          </p>

          <a
            href="#reviews"
            class="hero-rise group mt-5 inline-flex items-center gap-3 text-sm"
            style="--rise-delay: 160ms"
          >
            <UiRating :model-value="displayRating" :size="14" readonly />
            <span class="tabular-nums">{{ displayRating.toFixed(1) }}</span>
            <span class="text-muted-foreground underline-offset-4 group-hover:underline">
              {{ totalReviews }} {{ totalReviews === 1 ? "review" : "reviews" }}
            </span>
          </a>

          <div class="hero-rise mt-8 border-t border-border pt-8" style="--rise-delay: 200ms">
            <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span class="font-serif text-4xl tabular-nums tracking-[-0.02em]">
                {{ formatUsd(displayPrice) }}
              </span>
              <span
                v-if="productType === 'ebook'"
                class="text-base tabular-nums text-muted-foreground line-through"
              >
                {{ formatUsd(hardbookPrice) }}
              </span>
            </div>
            <p class="mt-3 flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.14em]">
              <span class="size-1.5 rounded-full" :class="stockStatus.dot"></span>
              {{ stockStatus.label }}
            </p>
          </div>

          <div class="hero-rise mt-8" style="--rise-delay: 240ms">
            <p class="eyebrow mb-4">Format</p>
            <DetailsFormatPicker
              v-model="productType"
              :hardbook-price="hardbookPrice"
              :ebook-price="ebookPrice"
            />

            <button
              v-if="productType === 'ebook'"
              type="button"
              class="group mt-5 inline-flex items-center gap-2 text-sm"
              @click="router.push({ path: '/reader', query: { bookId } })"
            >
              <BookOpen class="size-4" :stroke-width="1.5" />
              <span class="ed-link">
                {{ hasPurchasedEbook ? "You own this ebook. Open the reader" : "Read the first 20 pages free" }}
              </span>
              <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div class="hero-rise mt-8 space-y-3" style="--rise-delay: 280ms">
            <div class="flex gap-3">
              <div class="inline-flex h-12 shrink-0 items-center border border-input">
                <button
                  type="button"
                  class="flex h-full w-11 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Decrease quantity"
                  :disabled="quantity <= 1 || isOutOfStock"
                  @click="quantity--"
                >
                  <Minus class="size-3.5" />
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  :max="maxQuantity"
                  :disabled="isOutOfStock"
                  aria-label="Quantity"
                  class="w-9 bg-transparent text-center text-sm tabular-nums [appearance:textfield] focus:outline-none disabled:opacity-30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @change="clampQuantity"
                />
                <button
                  type="button"
                  class="flex h-full w-11 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Increase quantity"
                  :disabled="quantity >= maxQuantity || isOutOfStock"
                  @click="quantity++"
                >
                  <Plus class="size-3.5" />
                </button>
              </div>

              <UiButton
                variant="ink"
                size="cta"
                class="flex-1 px-4 shadow-none"
                :disabled="isOutOfStock"
                @click="handleAddToCart"
              >
                {{ isOutOfStock ? "Out of stock" : "Add to cart" }}
              </UiButton>

              <button
                type="button"
                class="flex size-12 shrink-0 items-center justify-center border border-input transition-colors hover:border-foreground"
                :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
                :aria-pressed="isFavorite"
                @click="handleToggleFavorites"
              >
                <Heart
                  class="size-[18px]"
                  :stroke-width="1.5"
                  :class="isFavorite && 'fill-primary text-primary'"
                />
              </button>
            </div>

            <UiButton
              variant="outline"
              size="cta"
              block
              class="shadow-none"
              :disabled="isOutOfStock"
              @click="handleBuyNow"
            >
              Buy now
            </UiButton>

            <p
              v-if="
                productType === 'hardbook' &&
                (book.stock ?? 0) > 0 &&
                (book.stock ?? 0) < MAX_LINE_QUANTITY
              "
              class="pt-1 text-xs text-muted-foreground"
            >
              Up to {{ book.stock }} copies per order.
            </p>
          </div>
        </div>
      </div>

      <section
        v-reveal
        class="mt-24 grid grid-cols-1 gap-12 border-t border-border pt-12 md:mt-32 lg:grid-cols-12 lg:gap-16"
        aria-labelledby="about-heading"
      >
        <div class="lg:col-span-7">
          <p class="eyebrow mb-4"><span class="text-foreground">01</span><span class="mx-2">&mdash;</span>The book</p>
          <h2
            id="about-heading"
            class="font-serif text-[2rem] font-normal leading-[1.05] tracking-[-0.02em] md:text-[2.75rem]"
          >
            About <span class="italic">this book</span>
          </h2>
          <template v-if="displayDescription">
            <p
              class="mt-8 whitespace-pre-line font-serif text-[1.2rem] leading-[1.7] text-foreground/85 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-foreground"
              :class="isLongDescription && !descriptionExpanded && 'line-clamp-[9]'"
            >
              {{ displayDescription }}
            </p>
            <button
              v-if="isLongDescription"
              type="button"
              class="mt-6 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]"
              :aria-expanded="descriptionExpanded"
              @click="descriptionExpanded = !descriptionExpanded"
            >
              <span class="ed-link">{{ descriptionExpanded ? "Show less" : "Read more" }}</span>
              <Plus
                class="size-4 transition-transform duration-300"
                :class="descriptionExpanded && 'rotate-45'"
              />
            </button>
          </template>
          <p v-else class="mt-8 font-serif text-xl italic text-muted-foreground">
            The publisher hasn't shared a description for this one yet.
          </p>
        </div>

        <div class="lg:col-span-5 lg:pt-[4.75rem]">
          <p class="eyebrow mb-4">Details</p>
          <DetailsFactSheet :book="book" />
        </div>
      </section>

      <section id="reviews" v-reveal class="mt-24 scroll-mt-36 md:mt-32" aria-labelledby="reviews-heading">
        <StoreSectionHeader number="02" eyebrow="Reader reviews">
          <span id="reviews-heading">What readers <span class="italic">think</span></span>
        </StoreSectionHeader>
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
        class="mt-24 md:mt-32"
        @add-to-cart="handleQuickAdd"
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
import { ArrowRight, BookOpen, Heart, Minus, Plus } from "lucide-vue-next";
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
    return { label: "Instant access in the online reader", dot: "bg-foreground" };
  }
  const stock = book.value.stock ?? 0;
  if (stock > LOW_STOCK_THRESHOLD) {
    return { label: `In stock, ${stock} ready to ship`, dot: "bg-success" };
  }
  if (stock > 0) {
    return { label: `Only ${stock} left`, dot: "bg-warning" };
  }
  return { label: "Out of stock", dot: "bg-destructive" };
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

async function handleQuickAdd(id: string) {
  const signedIn = authDialog.ensureSignedIn("Sign in to add books to your cart.", () =>
    handleQuickAdd(id)
  );
  if (!signedIn) return;

  try {
    await cartStore.addToCart({ bookId: id, quantity: 1, productType: "hardbook" });
    notify("Hardback added to cart successfully!");
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
