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
          <template v-for="(item, i) in breadcrumbItems" :key="i">
            <ChevronRight
              v-if="i > 0"
              class="h-4 w-4 text-muted-foreground"
            />
            <li>
              <NuxtLink
                v-if="!item.disabled && item.href"
                :to="item.href"
                class="text-primary hover:underline"
              >
                {{ item.title }}
              </NuxtLink>
              <span v-else class="text-muted-foreground">{{ item.title }}</span>
            </li>
          </template>
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
                      detailsBooks?.cover_url ||
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
                  {{ detailsBooks.title }}
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
                    {{ detailsBooks.authors?.[0] }}
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
                    Sold {{ detailsBooks.sold || 0 }}
                  </UiBadge>
                </div>

                <!-- Price & Stock -->
                <div class="mb-6 rounded-lg bg-muted p-4">
                  <div class="mb-4 flex items-center justify-between">
                    <div>
                      <div class="mb-2 text-4xl font-bold text-success">
                        ${{ displayPrice }}
                      </div>
                      <!-- Stock Status -->
                      <div v-if="productType === 'hardbook'">
                        <UiBadge
                          v-if="(detailsBooks.stock ?? 0) > 20"
                          variant="success"
                        >
                          <CheckCircle2 class="h-3.5 w-3.5" />
                          In Stock ({{ detailsBooks.stock }} available)
                        </UiBadge>
                        <UiBadge
                          v-else-if="(detailsBooks.stock ?? 0) > 0"
                          variant="warning"
                        >
                          <AlertTriangle class="h-3.5 w-3.5" />
                          Low Stock (Only {{ detailsBooks.stock }} left!)
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
                        isFavorite(detailsBooks._id)
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      "
                      @click="handleToggleFavorites(detailsBooks._id)"
                    >
                      <Heart
                        class="h-5 w-5"
                        :class="
                          isFavorite(detailsBooks._id)
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
                            ${{ detailsBooks.price }}
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
                            ${{ ebookPrice }}
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
                    @click="previewEbook"
                  >
                    <CheckCircle2 v-if="hasPurchasedEbook" class="h-4 w-4" />
                    <BookOpen v-else class="h-4 w-4" />
                    {{ previewButtonText }}
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
                        (detailsBooks.stock ?? 0) > 0 &&
                        (detailsBooks.stock ?? 0) < 10
                      "
                      class="mt-1 text-xs text-warning"
                    >
                      Maximum {{ detailsBooks.stock }} items available
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col gap-3 sm:flex-row">
                    <UiButton
                      size="lg"
                      class="grow"
                      :disabled="isOutOfStock"
                      @click="handleAddToCart(detailsBooks._id, quantity)"
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
                    {{ detailsBooks.key?.split("/").pop() || "8935250707640" }}
                  </div>
                </div>
              </div>

              <UiSeparator />

              <div class="flex items-start gap-4 px-4 py-3">
                <UserPen class="mt-0.5 h-6 w-6 text-primary" />
                <div>
                  <div class="text-sm font-medium">Author</div>
                  <div class="text-sm text-muted-foreground">
                    {{ detailsBooks.authors?.[0] }}
                  </div>
                </div>
              </div>

              <UiSeparator />

              <div class="flex items-start gap-4 px-4 py-3">
                <Calendar class="mt-0.5 h-6 w-6 text-primary" />
                <div>
                  <div class="text-sm font-medium">Publication Year</div>
                  <div class="text-sm text-muted-foreground">
                    {{ detailsBooks.first_publish_year }}
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
                  @click="router.push(`/reviews/${detailsBooks._id}`)"
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
        v-if="detailsBooks.description"
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
      v-model="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { useOrderStore } from "@/stores/order";
import { useReviewStore } from "@/stores/review";
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
import { getBookById } from "@/api/bookApi";
import { getAverageRating as fetchAverageRating } from "@/api/reviewApi";
import type { Book, ProductType } from "@/types";

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

const detailsBooks = ref<Partial<Book>>({});
const isLoading = ref(false);
const quantity = ref(1);
const productType = ref<ProductType>("hardbook");
const showSnackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");
const averageRating = ref(0);
const totalReviews = ref(0);

const ratingBreakdown = computed(() => {
  if (!reviews.value || reviews.value.length === 0) {
    return [
      { percentage: 0, count: 0 },
      { percentage: 0, count: 0 },
      { percentage: 0, count: 0 },
      { percentage: 0, count: 0 },
      { percentage: 0, count: 0 },
    ];
  }

  const counts = [0, 0, 0, 0, 0];
  reviews.value.forEach((review) => {
    const rating = review.rating;
    if (rating >= 1 && rating <= 5) {
      counts[5 - rating]++;
    }
  });

  const total = reviews.value.length;
  return counts.map((count) => ({
    percentage: total > 0 ? (count / total) * 100 : 0,
    count,
  }));
});

const breadcrumbItems = computed(() => [
  { title: "Home", disabled: false, href: "/" },
  { title: detailsBooks.value.title || "Book Details", disabled: true },
]);

const displayRating = computed(() => {
  if (totalReviews.value > 0) {
    return averageRating.value;
  }
  return detailsBooks.value.rating || 0;
});

const ebookPrice = computed(() => {
  const price = detailsBooks.value.price || 120;
  return (price * 0.7).toFixed(2);
});

const displayPrice = computed(() =>
  productType.value === "ebook"
    ? ebookPrice.value
    : detailsBooks.value.price || "120.00"
);

const hasPurchasedEbook = computed(
  () => purchasedEbooks.value[detailsBooks.value._id as string] || false
);

const previewButtonText = computed(() =>
  hasPurchasedEbook.value ? "Preview full" : "Preview (20 pages free)"
);

const isOutOfStock = computed(
  () => productType.value === "hardbook" && detailsBooks.value.stock === 0
);

const maxQuantity = computed(() => {
  if (productType.value === "ebook") {
    return 10;
  }
  return Math.min(detailsBooks.value.stock || 0, 10);
});

const displayDescription = computed(() => {
  const description = detailsBooks.value.description as unknown;
  return typeof description === "object" && description !== null
    ? (description as { value: string }).value
    : (description as string | undefined);
});

watch(productType, () => {
  if (quantity.value > maxQuantity.value) {
    quantity.value = maxQuantity.value;
  }
});

async function getAverageRating(bookId: string) {
  try {
    const response = await fetchAverageRating(bookId);
    averageRating.value = response.data.averageRating;
    totalReviews.value = response.data.totalReviews;
  } catch (error) {
    console.error("Error fetching average rating:", error);
    averageRating.value = 0;
    totalReviews.value = 0;
  }
}

async function getDetailsBooks() {
  try {
    isLoading.value = true;
    const bookId = route.params.id as string;
    console.log("Book ID:", bookId);

    if (!bookId) {
      throw new Error("Invalid book ID");
    }

    const response = await getBookById(bookId);
    detailsBooks.value = response.data;

    await getAverageRating(bookId);

    if (currentUser.value) {
      await orderStore.checkEbookPurchase(bookId);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    isLoading.value = false;
  }
}

async function getOrderOfUser() {
  try {
    await orderStore.fetchUserOrders();
  } catch (error) {
    console.error("Error fetching user orders:", error);
  }
}

async function handleAddToCart(bookId: string | undefined, qty: number) {
  try {
    await cartStore.addToCart({
      bookId: bookId as string,
      quantity: qty,
      productType: productType.value,
    });

    const typeName = productType.value === "ebook" ? "Ebook" : "Hardbook";
    snackbarText.value = `${typeName} added to cart successfully!`;
    showSnackbar.value = true;
    snackbarColor.value = "success";
  } catch (error) {
    console.error("Error adding to cart:", error);
    snackbarText.value = "Failed to add to cart.";
    showSnackbar.value = true;
    snackbarColor.value = "error";
  }
}

async function handleBuyNow() {
  try {
    // Add to cart first
    await cartStore.addToCart({
      bookId: detailsBooks.value._id as string,
      quantity: quantity.value,
      productType: productType.value,
    });

    // Navigate to cart page for checkout
    router.push("/cart");
  } catch (error) {
    console.error("Error during buy now:", error);
    snackbarText.value = "Failed to proceed to checkout.";
    showSnackbar.value = true;
    snackbarColor.value = "error";
  }
}

function previewEbook() {
  router.push({
    path: "/reader",
    query: { bookId: detailsBooks.value._id },
  });
}

async function handleToggleFavorites(bookId: string | undefined) {
  try {
    await favoriteStore.toggleFavorites(bookId as string);
    snackbarText.value = isFavorite(bookId)
      ? "Added to favorites!"
      : "Removed from favorites!";
    showSnackbar.value = true;
    snackbarColor.value = "success";
  } catch (error) {
    console.error("Error toggling favorites:", error);
    snackbarText.value = "Failed to update favorites.";
    showSnackbar.value = true;
    snackbarColor.value = "error";
  }
}

function isFavorite(bookId: string | undefined) {
  return favorites.value.some((favorite: any) => {
    const favoriteBookId = favorite.bookId?._id || favorite.bookId;
    return favoriteBookId === bookId;
  });
}

onMounted(async () => {
  await getDetailsBooks();
  await getOrderOfUser();

  const bookId = route.params.id as string;
  if (bookId) {
    await reviewStore.loadReviews(bookId);
  }
});
</script>
