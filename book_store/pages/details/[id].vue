<template>
  <div class="min-h-screen bg-background">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex min-h-[50vh] items-center justify-center px-4"
    >
      <div class="text-center">
        <UiSpinner size="xl" class="mx-auto mb-4 text-primary" />
        <p class="text-lg font-semibold text-muted-foreground">
          Loading book details...
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="px-4 py-6">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="mb-6">
        <ol class="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <NuxtLink to="/" class="text-primary hover:underline">Home</NuxtLink>
          </li>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <li class="text-muted-foreground">
            {{ book.title || "Book Details" }}
          </li>
        </ol>
      </nav>

      <!-- Book Overview Section -->
      <UiCard class="mb-6 shadow">
        <div class="p-6">
          <div class="grid grid-cols-12 gap-4">
            <!-- Book Cover -->
            <div class="col-span-12 md:col-span-4">
              <div class="text-center">
                <div
                  class="mx-auto max-w-[380px] overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    :src="
                      book?.cover_url ||
                      '/placeholder.svg?height=400&width=260'
                    "
                    alt="Book Cover"
                    class="mx-auto h-[480px] w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <!-- Book Info -->
            <div class="col-span-12 md:col-span-8">
              <div>
                <!-- Title -->
                <h1 class="mb-4 text-3xl font-bold text-primary">
                  {{ book.title }}
                </h1>

                <!-- Author -->
                <div class="mb-4 flex items-center">
                  <UserPen class="mr-2 h-6 w-6 text-muted-foreground" />
                  <span class="mr-2 text-base font-medium text-muted-foreground"
                    >by</span
                  >
                  <UiBadge
                    variant="outline"
                    class="border-primary px-3 py-1 text-sm text-primary"
                  >
                    {{ book.authors?.[0] }}
                  </UiBadge>
                </div>

                <!-- Rating -->
                <div class="mb-6 flex items-center">
                  <UiRating
                    :model-value="displayRating"
                    :size="16"
                    readonly
                    class="mr-2"
                  />
                  <span class="mr-1 text-base font-medium">{{
                    displayRating
                  }}</span>
                  <span class="text-sm text-muted-foreground"
                    >({{ totalReviews }} reviews)</span
                  >
                </div>

                <!-- Sold Count -->
                <div class="mb-4">
                  <UiBadge variant="success">
                    <Flame class="h-3.5 w-3.5" />
                    Sold {{ book.sold || 0 }}
                  </UiBadge>
                </div>

                <!-- Price & Stock -->
                <div class="mb-6 rounded-lg bg-muted p-4">
                  <div class="mb-4 flex items-center justify-between">
                    <div>
                      <div class="mb-2 text-4xl font-bold text-success">
                        {{ formatUsd(displayPrice) }}
                      </div>
                      <!-- Stock Status -->
                      <div v-if="productType === 'hardbook'">
                        <UiBadge
                          v-if="(book.stock ?? 0) > LOW_STOCK_THRESHOLD"
                          variant="success"
                        >
                          <CheckCircle2 class="h-3.5 w-3.5" />
                          In Stock ({{ book.stock }} available)
                        </UiBadge>
                        <UiBadge
                          v-else-if="(book.stock ?? 0) > 0"
                          variant="warning"
                        >
                          <AlertTriangle class="h-3.5 w-3.5" />
                          Low Stock (Only {{ book.stock }} left!)
                        </UiBadge>
                        <UiBadge v-else variant="destructive">
                          <XCircle class="h-3.5 w-3.5" />
                          Out of Stock
                        </UiBadge>
                      </div>
                      <UiBadge v-else variant="info">
                        <InfinityIcon class="h-3.5 w-3.5" />
                        Digital Product - Always Available
                      </UiBadge>
                    </div>
                    <UiButton
                      variant="outline"
                      size="icon"
                      :aria-label="
                        isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      "
                      @click="handleToggleFavorites"
                    >
                      <Heart
                        class="h-5 w-5"
                        :class="
                          isFavorite
                            ? 'fill-current text-destructive'
                            : 'text-muted-foreground'
                        "
                      />
                    </UiButton>
                  </div>
                </div>

                <!-- Product Type Selection -->
                <div class="mb-6 rounded-lg border border-border bg-muted/50 p-4">
                  <span class="mb-3 block text-sm font-medium"
                    >Choose Product Type</span
                  >
                  <div class="flex flex-wrap items-center gap-4">
                    <label class="flex cursor-pointer items-center">
                      <input
                        v-model="productType"
                        type="radio"
                        value="hardbook"
                        class="h-4 w-4 accent-primary"
                      />
                      <span class="ml-2 flex items-center">
                        <BookOpen class="mr-2 h-6 w-6 text-primary" />
                        <span>
                          <span class="font-medium">📚 Hardbook</span>
                          <span class="block text-xs text-muted-foreground">
                            {{ formatUsd(hardbookPrice) }}
                          </span>
                        </span>
                      </span>
                    </label>

                    <label class="ml-4 flex cursor-pointer items-center">
                      <input
                        v-model="productType"
                        type="radio"
                        value="ebook"
                        class="h-4 w-4 accent-success"
                      />
                      <span class="ml-2 flex items-center">
                        <Tablet class="mr-2 h-6 w-6 text-success" />
                        <span>
                          <span class="font-medium">📱 Ebook (PDF)</span>
                          <span class="block text-xs text-muted-foreground">
                            {{ formatUsd(ebookPrice) }}
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>

                  <!-- Ebook Preview Button -->
                  <UiButton
                    v-if="productType === 'ebook'"
                    variant="outline"
                    size="sm"
                    class="mt-2"
                    :class="
                      hasPurchasedEbook
                        ? 'border-success text-success hover:text-success'
                        : 'border-info text-info hover:text-info'
                    "
                    @click="router.push({ path: '/reader', query: { bookId } })"
                  >
                    <CheckCircle2 v-if="hasPurchasedEbook" class="h-4 w-4" />
                    <BookOpen v-else class="h-4 w-4" />
                    {{ hasPurchasedEbook ? "Preview full" : "Preview (20 pages free)" }}
                  </UiButton>
                </div>

                <!-- Quantity & Actions -->
                <div class="rounded-lg border border-border bg-card p-4">
                  <!-- Quantity -->
                  <div class="mb-4">
                    <span class="mb-2 block text-sm font-medium">Quantity</span>
                    <div class="flex max-w-[200px] items-center">
                      <UiButton
                        variant="outline"
                        size="iconSm"
                        aria-label="Decrease quantity"
                        :disabled="quantity <= 1 || isOutOfStock"
                        @click="quantity > 1 ? quantity-- : 1"
                      >
                        <Minus class="h-4 w-4" />
                      </UiButton>
                      <input
                        v-model.number="quantity"
                        type="number"
                        min="1"
                        :max="maxQuantity"
                        :disabled="isOutOfStock"
                        class="mx-2 h-9 w-20 rounded-md border border-input bg-background px-2 text-center text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <UiButton
                        variant="outline"
                        size="iconSm"
                        aria-label="Increase quantity"
                        :disabled="quantity >= maxQuantity || isOutOfStock"
                        @click="quantity++"
                      >
                        <Plus class="h-4 w-4" />
                      </UiButton>
                    </div>
                    <div
                      v-if="
                        productType === 'hardbook' &&
                        (book.stock ?? 0) > 0 &&
                        (book.stock ?? 0) < MAX_LINE_QUANTITY
                      "
                      class="mt-1 text-xs text-warning"
                    >
                      Maximum {{ book.stock }} items available
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col gap-3 sm:flex-row">
                    <UiButton
                      size="lg"
                      class="grow"
                      :disabled="isOutOfStock"
                      @click="handleAddToCart"
                    >
                      <ShoppingCart class="h-5 w-5" />
                      {{ isOutOfStock ? "Out of Stock" : "Add to Cart" }}
                    </UiButton>
                    <UiButton
                      variant="success"
                      size="lg"
                      class="grow"
                      :disabled="isOutOfStock"
                      @click="handleBuyNow"
                    >
                      <Zap class="h-5 w-5" />
                      Buy Now
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <div class="grid grid-cols-12 gap-4">
        <!-- Book Details -->
        <div class="col-span-12 md:col-span-6">
          <UiCard class="h-full overflow-hidden shadow">
            <div
              class="flex items-center bg-primary px-4 py-3 font-semibold text-primary-foreground"
            >
              <BookOpen class="mr-2 h-5 w-5" />
              Book Details
            </div>
            <div>
              <div class="flex items-start gap-4 px-4 py-3">
                <Hash class="mt-0.5 h-6 w-6 text-primary" />
                <div>
                  <div class="text-sm font-medium">Book ID</div>
                  <div class="text-sm text-muted-foreground">
                    {{ book.key?.split("/").pop() || "8935250707640" }}
                  </div>
                </div>
              </div>

              <UiSeparator />

              <div class="flex items-start gap-4 px-4 py-3">
                <UserPen class="mt-0.5 h-6 w-6 text-primary" />
                <div>
                  <div class="text-sm font-medium">Author</div>
                  <div class="text-sm text-muted-foreground">
                    {{ book.authors?.[0] }}
                  </div>
                </div>
              </div>

              <UiSeparator />

              <div class="flex items-start gap-4 px-4 py-3">
                <Calendar class="mt-0.5 h-6 w-6 text-primary" />
                <div>
                  <div class="text-sm font-medium">Publication Year</div>
                  <div class="text-sm text-muted-foreground">
                    {{ book.first_publish_year }}
                  </div>
                </div>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- Customer Reviews -->
        <div class="col-span-12 md:col-span-6">
          <UiCard class="h-full overflow-hidden shadow">
            <div
              class="flex items-center bg-amber-500 px-4 py-3 font-semibold text-white"
            >
              <Star class="mr-2 h-5 w-5" />
              Customer Reviews
            </div>
            <div class="p-4">
              <div class="mb-4 text-center">
                <div class="mb-2 text-4xl font-bold text-amber-500">
                  {{ displayRating.toFixed(1)
                  }}<span class="text-2xl font-semibold text-muted-foreground"
                    >/5</span
                  >
                </div>
                <UiRating
                  :model-value="displayRating"
                  :size="16"
                  readonly
                  class="mb-2 justify-center"
                />
                <div class="text-sm text-muted-foreground">
                  Based on {{ totalReviews }}
                  {{ totalReviews === 1 ? "review" : "reviews" }}
                </div>
              </div>

              <!-- Rating Breakdown -->
              <div class="mb-4">
                <div
                  v-for="(rating, index) in ratingBreakdown"
                  :key="index"
                  class="mb-1 flex items-center"
                >
                  <span class="mr-2 min-w-[15px] text-xs">{{ 5 - index }}</span>
                  <Star
                    class="mr-2 h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                  <div
                    class="mr-2 h-1.5 grow overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      class="h-full rounded-full bg-amber-400 transition-all"
                      :style="{ width: `${rating.percentage}%` }"
                    />
                  </div>
                  <span class="min-w-[25px] text-xs">({{ rating.count }})</span>
                </div>
              </div>

              <div class="text-center">
                <UiButton
                  variant="outline"
                  size="sm"
                  class="border-primary text-primary hover:text-primary"
                  @click="router.push(`/reviews/${book._id}`)"
                >
                  <Pencil class="h-4 w-4" />
                  Write Review
                </UiButton>
              </div>
            </div>
          </UiCard>
        </div>
      </div>

      <!-- Description -->
      <UiCard
        v-if="book.description"
        class="mt-6 overflow-hidden shadow"
      >
        <div
          class="flex items-center bg-secondary px-4 py-3 font-semibold text-secondary-foreground"
        >
          <FileText class="mr-2 h-5 w-5" />
          Description
        </div>
        <div class="p-4">
          <p class="text-base leading-relaxed">
            {{ displayDescription }}
          </p>
        </div>
      </UiCard>
    </div>

    <!-- Snackbar -->
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
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Flame,
  Hash,
  Heart,
  Infinity as InfinityIcon,
  Minus,
  Pencil,
  Plus,
  ShoppingCart,
  Star,
  Tablet,
  UserPen,
  XCircle,
  Zap,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { useOrderStore } from "@/stores/order";
import { useReviewStore } from "@/stores/review";
import { useSnackbar } from "@/composables/useSnackbar";
import { isFavoriteBook } from "@/utils/favorites";
import { EBOOK_PRICE_RATIO, formatUsd } from "@/utils/pricing";
import { getBookById } from "@/api/bookApi";
import { getAverageRating } from "@/api/reviewApi";
import type { Book, ProductType } from "@/types";

/** Stock below this is called out as running low. */
const LOW_STOCK_THRESHOLD = 20;
/** Cap on a single line, so one order cannot clear the shelf. */
const MAX_LINE_QUANTITY = 10;

const route = useRoute();
const router = useRouter();

const cartStore = useCartStore();
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
const isLoading = ref(false);
const quantity = ref(1);
const productType = ref<ProductType>("hardbook");
const averageRating = ref(0);
const totalReviews = ref(0);

const bookId = computed(() => route.params.id as string);

const isFavorite = computed(() => isFavoriteBook(favorites.value, book.value._id));

/** Counts per star, highest first — index 0 is five stars. */
const ratingBreakdown = computed(() => {
  const counts = [0, 0, 0, 0, 0];
  for (const review of reviews.value) {
    if (review.rating >= 1 && review.rating <= 5) counts[5 - review.rating]++;
  }
  const total = reviews.value.length;
  return counts.map((count) => ({
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
});

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

/**
 * Some legacy rows store the description as `{ value }` rather than a string.
 */
const displayDescription = computed(() => {
  const description = book.value.description as unknown;
  return typeof description === "object" && description !== null
    ? (description as { value: string }).value
    : (description as string | undefined);
});

watch(productType, () => {
  quantity.value = Math.min(quantity.value, Math.max(1, maxQuantity.value));
});

onMounted(async () => {
  await loadBook();
  await Promise.all([
    orderStore.fetchUserOrders(),
    reviewStore.loadReviews(bookId.value),
  ]);
});

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

async function handleAddToCart() {
  try {
    await cartStore.addToCart({
      bookId: bookId.value,
      quantity: quantity.value,
      productType: productType.value,
    });

    const typeName = productType.value === "ebook" ? "Ebook" : "Hardbook";
    notify(`${typeName} added to cart successfully!`);
  } catch (error) {
    console.error("Error adding to cart:", error);
    notifyError("Failed to add to cart.");
  }
}

async function handleBuyNow() {
  try {
    await cartStore.addToCart({
      bookId: bookId.value,
      quantity: quantity.value,
      productType: productType.value,
    });
    router.push("/cart");
  } catch (error) {
    console.error("Error during buy now:", error);
    notifyError("Failed to proceed to checkout.");
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
