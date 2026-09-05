<template>
  <div
    class="min-h-screen bg-gradient-to-br from-white to-[#d4dfed] pt-16 dark:from-background dark:to-card md:pt-0"
  >
    <!-- Mobile Header -->
    <header
      class="flex items-center gap-2 border-b border-border bg-card px-4 py-2 shadow-sm md:hidden"
    >
      <UiButton
        variant="ghost"
        size="icon"
        aria-label="Toggle navigation"
        @click="$emit('toggle-drawer')"
      >
        <Menu class="h-5 w-5" />
      </UiButton>
      <h1 class="text-lg font-bold text-foreground">My Profile</h1>
    </header>

    <div class="container mx-auto p-6">
      <!-- Personal Info Section -->
      <div v-if="activeTab === 'personal'" class="min-h-[80vh]">
        <div class="mb-6 flex items-center">
          <CircleUser class="mr-3 h-8 w-8 text-waterblue" />
          <h2 class="text-3xl font-bold text-foreground">
            Personal Information
          </h2>
        </div>

        <div
          class="overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow-md dark:from-card dark:to-card"
        >
          <div class="p-8">
            <!-- Avatar Upload Section -->
            <div class="mb-8 flex items-center">
              <UiAvatar class="mr-6 h-[120px] w-[120px] text-4xl shadow-md">
                <UiAvatarImage
                  :src="currentUser?.avatar_url || ''"
                  alt="User Avatar"
                />
                <UiAvatarFallback>
                  <User class="h-10 w-10 text-muted-foreground" />
                </UiAvatarFallback>
              </UiAvatar>

              <div>
                <h3 class="mb-2 text-2xl font-semibold">
                  {{ currentUser?.username || "User" }}
                </h3>
                <p class="mb-4 text-sm text-muted-foreground">
                  {{ currentUser?.email || "" }}
                </p>

                <UiButton
                  class="mr-3 bg-waterblue text-white hover:bg-waterblue/90"
                  :loading="uploadingAvatar"
                  @click="avatarInput?.click()"
                >
                  <Camera class="mr-1 h-4 w-4" />
                  Change Avatar
                </UiButton>

                <UiButton
                  v-if="currentUser?.avatar_url"
                  variant="outline"
                  class="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                  @click="removeAvatar"
                >
                  <Trash2 class="mr-1 h-4 w-4" />
                  Remove
                </UiButton>

                <!-- Hidden file input -->
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </div>
            </div>

            <UiSeparator class="mb-8" />

            <form class="grid grid-cols-12 gap-x-4" @submit.prevent>
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  :model-value="currentUser?.username || ''"
                  label="Username"
                  readonly
                  wrapper-class="mb-4"
                >
                  <template #prepend>
                    <User class="h-4 w-4" />
                  </template>
                </UiInput>
              </div>
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  :model-value="currentUser?.email || ''"
                  label="Email"
                  type="email"
                  readonly
                  wrapper-class="mb-4"
                >
                  <template #prepend>
                    <Mail class="h-4 w-4" />
                  </template>
                </UiInput>
              </div>
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  :model-value="roleLabel"
                  label="Role"
                  readonly
                  wrapper-class="mb-4"
                >
                  <template #prepend>
                    <ShieldCheck class="h-4 w-4" />
                  </template>
                </UiInput>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Orders Section -->
      <div v-if="activeTab === 'orders'" class="min-h-[80vh]">
        <div class="mb-6 flex items-center">
          <Package class="mr-3 h-8 w-8 text-waterblue" />
          <h2 class="text-3xl font-bold text-foreground">Order History</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loadingOrders" class="p-12 text-center">
          <UiSpinner size="xl" class="mx-auto text-waterblue" />
          <p class="mt-6 text-base text-muted-foreground">Loading orders...</p>
        </div>

        <!-- Orders List -->
        <div v-else-if="userOrdersPaid && userOrdersPaid.length > 0">
          <div
            v-for="order in userOrdersPaid"
            :key="order._id"
            class="mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow transition-all duration-300 hover:shadow-lg dark:from-card dark:to-card"
          >
            <div class="p-8">
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <h3 class="mb-2 text-2xl font-bold text-foreground">
                    Order #{{ order.orderId }}
                  </h3>
                  <p class="flex items-center text-sm text-muted-foreground">
                    <Calendar class="mr-1 h-4 w-4" />
                    {{ new Date(order.createdAt as string).toLocaleDateString() }}
                  </p>
                </div>
                <UiBadge
                  :variant="getStatusVariant(order.status)"
                  class="px-3 py-1 text-sm font-bold"
                  :class="getStatusClass(order.status)"
                >
                  <component
                    :is="getStatusIcon(order.status)"
                    class="mr-1 h-4 w-4"
                  />
                  {{ order.status || "Pending" }}
                </UiBadge>
              </div>

              <UiSeparator class="mb-6" />

              <div
                v-for="item in order.items"
                :key="item._id"
                class="mb-4 flex items-center rounded-lg bg-waterblue/5 p-4"
              >
                <div class="mr-4 flex min-w-[60px] items-center">
                  <img
                    :src="
                      item.bookId?.cover_url ||
                      'https://via.placeholder.com/60x80'
                    "
                    :alt="item.bookId?.title || 'Book cover'"
                    class="h-20 w-[60px] rounded-lg bg-muted object-cover shadow"
                  />
                </div>
                <div class="grow">
                  <h4 class="mb-1 text-base font-bold text-foreground">
                    {{ item.bookId?.title || "Unknown Book" }}
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    Quantity: {{ item.quantity }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-waterblue">
                    ${{ calculateItemPrice(item).toFixed(2) }}
                  </p>
                </div>
              </div>

              <UiSeparator class="my-6" />

              <!-- Order Summary Section -->
              <div class="mb-4">
                <!-- Subtotal -->
                <div class="mb-2 flex justify-between">
                  <span class="text-sm text-muted-foreground">Subtotal</span>
                  <span class="text-base font-medium">
                    ${{ calculateOrderSubtotal(order).toFixed(2) }}
                  </span>
                </div>

                <!-- Voucher Discount (if applied) -->
                <div v-if="order.voucher && order.voucher.code" class="mb-2">
                  <div
                    class="flex items-center justify-between rounded bg-success/10 p-2"
                  >
                    <div class="flex items-center">
                      <TicketPercent class="mr-2 h-4 w-4 shrink-0 text-success" />
                      <div>
                        <span class="text-sm text-muted-foreground">Discount</span>
                        <UiBadge variant="success" class="ml-2 px-1.5 py-0 text-[10px]">
                          {{ order.voucher.code }}
                        </UiBadge>
                      </div>
                    </div>
                    <span class="text-base font-bold text-success">
                      -${{ (order.voucher.discountAmount / 24000).toFixed(2) }}
                    </span>
                  </div>
                </div>

                <!-- Total -->
                <UiSeparator class="my-2" />
                <div class="flex items-center justify-between">
                  <span class="text-lg font-bold text-foreground">Total</span>
                  <span class="text-2xl font-bold text-waterblue">
                    ${{ (order.total / 24000).toFixed(2) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <UiButton
                  tag="NuxtLink"
                  :to="`/order/status/${order.orderId}`"
                  variant="outline"
                  size="lg"
                  class="rounded-lg border-waterblue font-bold text-waterblue hover:bg-waterblue/10 hover:text-waterblue"
                >
                  <Eye class="mr-2 h-5 w-5" />
                  View Details
                </UiButton>
              </div>
            </div>
          </div>
        </div>

        <!-- No Orders Message -->
        <div v-else class="p-12 text-center">
          <Package class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40" />
          <h3 class="mb-3 text-2xl font-bold text-foreground">No orders yet</h3>
          <p class="mx-auto mb-6 max-w-[400px] text-base text-muted-foreground">
            You haven't placed any orders yet. Start shopping to see your order
            history here.
          </p>
          <UiButton
            tag="NuxtLink"
            to="/"
            size="lg"
            class="rounded-lg bg-waterblue font-bold text-white shadow hover:bg-waterblue/90"
          >
            <ShoppingBag class="mr-2 h-5 w-5" />
            Start Shopping
          </UiButton>
        </div>
      </div>

      <!-- Wishlist Section -->
      <div v-if="activeTab === 'favorites'" class="min-h-[80vh]">
        <div class="mb-6 flex items-center">
          <Heart class="mr-3 h-8 w-8 text-waterblue" />
          <h2 class="text-3xl font-bold text-foreground">My Favorites</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loadingFavorites" class="p-12 text-center">
          <UiSpinner size="xl" class="mx-auto text-waterblue" />
          <p class="mt-6 text-base text-muted-foreground">
            Loading favorites...
          </p>
        </div>

        <!-- Favorites List -->
        <div v-else-if="validFavorites.length > 0">
          <div class="grid grid-cols-12 gap-4">
            <div
              v-for="favorite in validFavorites"
              :key="favorite._id"
              class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3"
            >
              <div
                class="group flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow transition-all duration-300 hover:shadow-lg dark:from-card dark:to-card"
              >
                <div class="relative flex min-h-[280px] items-center justify-center p-5">
                  <div
                    class="relative aspect-[2/3] w-[70%] max-w-[180px] overflow-hidden shadow-lg transition-all duration-[400ms] group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-2xl"
                  >
                    <img
                      :src="
                        favorite.bookId?.cover_url ||
                        'https://via.placeholder.com/200x300'
                      "
                      :alt="favorite.bookId?.title"
                      class="block h-full w-full bg-muted object-cover transition-transform duration-300"
                    />
                  </div>
                </div>
                <div class="p-6">
                  <h4 class="mb-2 truncate text-base font-bold text-foreground">
                    {{ favorite.bookId?.title }}
                  </h4>
                  <p class="mb-3 text-sm text-muted-foreground">
                    by {{ favorite.bookId?.author }}
                  </p>
                  <p class="mb-4 text-lg font-bold text-waterblue">
                    ${{ favorite.bookId?.price?.toFixed(2) }}
                  </p>
                </div>
                <div class="mt-auto flex flex-col items-center p-6 pt-0">
                  <UiButton
                    tag="NuxtLink"
                    :to="`/details/${favorite.bookId?._id}`"
                    block
                    size="lg"
                    class="mb-3 rounded-lg bg-waterblue font-bold text-white hover:bg-waterblue/90"
                  >
                    <Eye class="mr-2 h-5 w-5" />
                    View Details
                  </UiButton>
                  <UiButton
                    variant="ghost"
                    size="icon"
                    class="text-destructive transition-all duration-300 hover:scale-110 hover:text-destructive"
                    aria-label="Remove from favorites"
                    @click="removeFromFavorites(favorite.bookId?._id)"
                  >
                    <Heart class="h-5 w-5 fill-current" />
                  </UiButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Favorites Message -->
        <div v-else class="p-12 text-center">
          <Heart class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40" />
          <h3 class="mb-3 text-2xl font-bold text-foreground">
            No favorites yet
          </h3>
          <p class="mx-auto mb-6 max-w-[400px] text-base text-muted-foreground">
            You haven't added any books to your favorite yet. Start exploring to
            find your favorite books!
          </p>
          <UiButton
            tag="NuxtLink"
            to="/"
            size="lg"
            class="rounded-lg bg-waterblue font-bold text-white shadow hover:bg-waterblue/90"
          >
            <Search class="mr-2 h-5 w-5" />
            Browse Books
          </UiButton>
        </div>
      </div>

      <!-- Reviews Section -->
      <div v-if="activeTab === 'reviews'" class="min-h-[80vh]">
        <div class="mb-6 flex items-center">
          <Star class="mr-3 h-8 w-8 text-waterblue" />
          <h2 class="text-3xl font-bold text-foreground">My Reviews</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loadingReviews" class="p-12 text-center">
          <UiSpinner size="xl" class="mx-auto text-waterblue" />
          <p class="mt-6 text-base text-muted-foreground">Loading reviews...</p>
        </div>

        <!-- Reviews List -->
        <div v-else-if="populatedUserReviews && populatedUserReviews.length > 0">
          <div
            v-for="review in populatedUserReviews"
            :key="review._id"
            class="mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow transition-all duration-300 hover:shadow-lg dark:from-card dark:to-card"
          >
            <div class="p-8">
              <div class="mb-6 flex items-start">
                <div class="mr-6 shrink-0">
                  <img
                    :src="
                      review?.bookId?.cover_url ||
                      'https://via.placeholder.com/80x120'
                    "
                    :alt="review.bookId?.title || 'Book cover'"
                    class="h-[120px] w-20 rounded-lg bg-muted object-cover shadow-md transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div class="grow">
                  <div class="mb-3 flex items-start justify-between">
                    <div>
                      <h3 class="mb-2 text-2xl font-bold text-foreground">
                        {{ review.bookId?.title || "Unknown Book" }}
                      </h3>
                      <p class="mb-3 text-sm text-muted-foreground">
                        by
                        {{
                          review.bookId?.authors?.join(", ") || "Unknown Author"
                        }}
                      </p>
                    </div>
                    <UiTooltipProvider :delay-duration="200">
                      <UiTooltip>
                        <UiTooltipTrigger as-child>
                          <UiButton
                            variant="ghost"
                            size="icon"
                            class="text-destructive transition-all duration-300 hover:scale-110 hover:text-destructive"
                            aria-label="Delete Review"
                            @click="
                              confirmDeleteReview(
                                review._id,
                                review.bookId?.title
                              )
                            "
                          >
                            <Trash2 class="h-5 w-5" />
                          </UiButton>
                        </UiTooltipTrigger>
                        <UiTooltipContent>Delete Review</UiTooltipContent>
                      </UiTooltip>
                    </UiTooltipProvider>
                  </div>

                  <div class="mb-4 flex items-center">
                    <UiRating :model-value="review.rating" readonly :size="16" />
                    <span
                      class="ml-3 flex items-center text-xs text-muted-foreground"
                    >
                      <Calendar class="mr-1 h-3.5 w-3.5" />
                      {{ new Date(review.createdAt as string).toLocaleDateString() }}
                    </span>
                  </div>
                </div>
              </div>

              <UiSeparator class="mb-6" />

              <div class="rounded-xl border-l-4 border-waterblue bg-muted/50 p-6">
                <p class="mb-0 text-base text-foreground">
                  {{ review.comment }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Reviews Message -->
        <div v-else class="p-12 text-center">
          <Star class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40" />
          <h3 class="mb-3 text-2xl font-bold text-foreground">
            No reviews yet
          </h3>
          <p class="mx-auto mb-6 max-w-[400px] text-base text-muted-foreground">
            You haven't written any reviews yet. Start reading and share your
            thoughts!
          </p>
          <UiButton
            tag="NuxtLink"
            to="/"
            size="lg"
            class="rounded-lg bg-waterblue font-bold text-white shadow hover:bg-waterblue/90"
          >
            <Search class="mr-2 h-5 w-5" />
            Browse Books
          </UiButton>
        </div>
      </div>

      <!-- Change Password Section -->
      <div v-if="activeTab === 'password'" class="min-h-[80vh]">
        <div class="mb-6 flex items-center">
          <Lock class="mr-3 h-8 w-8 text-waterblue" />
          <h2 class="text-3xl font-bold text-foreground">Change Password</h2>
        </div>

        <div
          class="overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow-md dark:from-card dark:to-card"
        >
          <div class="p-8">
            <form @submit.prevent="updatePassword">
              <UiInput
                v-model="passwordForm.current"
                label="Current Password"
                type="password"
                required
                :error-message="passwordErrors.current"
                wrapper-class="mb-6"
                @focus="passwordErrors.current = ''"
              />

              <UiInput
                v-model="passwordForm.new"
                label="New Password"
                type="password"
                required
                :error-message="passwordErrors.new"
                wrapper-class="mb-6"
                @focus="passwordErrors.new = ''"
              />

              <UiInput
                v-model="passwordForm.confirm"
                label="Confirm New Password"
                type="password"
                required
                :error-message="passwordErrors.confirm"
                wrapper-class="mb-6"
                @focus="passwordErrors.confirm = ''"
              />

              <UiButton
                type="submit"
                size="lg"
                :loading="changingPassword"
                class="rounded-lg bg-waterblue font-bold text-white shadow hover:bg-waterblue/90"
              >
                <KeyRound class="mr-2 h-5 w-5" />
                Update Password
              </UiButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useFavoriteStore } from "@/stores/favorite";
import { useOrderStore } from "@/stores/order";
import { useReviewStore } from "@/stores/review";
import type { Component } from "vue";
import {
  Ban,
  Calendar,
  Camera,
  CheckCircle2,
  CircleUser,
  Clock,
  DollarSign,
  Eye,
  Heart,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  TicketPercent,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-vue-next";
import { uploadAvatar } from "@/api/userApi";
import type { Book, Order, OrderItem, Review, SnackbarPayload, User as UserType } from "@/types";

withDefaults(
  defineProps<{
    activeTab?: string;
    loadingOrders?: boolean;
    loadingFavorites?: boolean;
    loadingReviews?: boolean;
  }>(),
  {
    activeTab: "personal",
    loadingOrders: false,
    loadingFavorites: false,
    loadingReviews: false,
  }
);

const emit = defineEmits<{
  (e: "toggle-drawer"): void;
  (e: "show-snackbar", payload: SnackbarPayload): void;
}>();

const authStore = useAuthStore();
const orderStore = useOrderStore();
const favoriteStore = useFavoriteStore();
const reviewStore = useReviewStore();

const { currentUser } = storeToRefs(authStore);
const { userOrders } = storeToRefs(orderStore);
const { favorites } = storeToRefs(favoriteStore);
const { userReviews } = storeToRefs(reviewStore);

const passwordForm = reactive({
  current: "",
  new: "",
  confirm: "",
});
const passwordErrors = reactive({
  current: "",
  new: "",
  confirm: "",
});
const changingPassword = ref(false);
const uploadingAvatar = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);

// The original template read `currentUser?.isAdmin`, which does not exist on
// the User model (the real field is `admin`) — behavior preserved as-is.
const roleLabel = computed(() =>
  (currentUser.value as any)?.isAdmin ? "Administrator" : "Standard User"
);

const userOrdersPaid = computed(() =>
  userOrders.value
    .map((order) => {
      if (order.status.toLowerCase() !== "pending") {
        return order;
      }
      return undefined;
    })
    .filter((order): order is Order => order !== undefined)
);

// Favorites come back from the API with a populated `bookId` document, even
// though the store types them as Book[] — cast to the actual runtime shape.
// (`author` mirrors the original template; the Book model only has `authors`.)
type PopulatedFavorite = {
  _id: string;
  bookId: (Book & { author?: string }) | null;
};

const validFavorites = computed(() =>
  (favorites.value as unknown as PopulatedFavorite[]).filter(
    (favorite) => favorite && favorite.bookId && favorite.bookId._id
  )
);

// User reviews come back with a populated `bookId` document.
type PopulatedReview = Omit<Review, "bookId"> & { bookId?: Book | null };

const populatedUserReviews = computed(
  () => userReviews.value as unknown as PopulatedReview[]
);

function calculateItemPrice(item: OrderItem): number {
  const basePrice = item.bookId?.price || 0;
  const quantity = item.quantity || 0;

  if (item.productType === "ebook") {
    return basePrice * 0.7 * quantity;
  }

  return basePrice * quantity;
}

function calculateOrderSubtotal(order: Order): number {
  // Calculate subtotal by adding back discount to total
  if (order.voucher && order.voucher.discountAmount) {
    return (order.total + order.voucher.discountAmount) / 24000;
  }
  return order.total / 24000;
}

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "outline"
  | "muted";

function getStatusVariant(status?: string): BadgeVariant {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "paid":
      return "success";
    case "confirmed":
      return "info";
    case "in delivery":
    case "delivered":
      return "default"; // colored via getStatusClass (purple / teal)
    case "cancelled":
      return "muted";
    case "failed":
      return "destructive";
    default:
      return "muted";
  }
}

function getStatusClass(status?: string): string {
  switch (status?.toLowerCase()) {
    case "in delivery":
      return "bg-purple-600 text-white";
    case "delivered":
      return "bg-teal-600 text-white";
    default:
      return "";
  }
}

function getStatusIcon(status?: string): Component {
  switch (status?.toLowerCase()) {
    case "pending":
      return Clock;
    case "paid":
      return DollarSign;
    case "confirmed":
      return CheckCircle2;
    case "in delivery":
      return Truck;
    case "delivered":
      return Package;
    case "cancelled":
      return Ban;
    case "failed":
      return XCircle;
    default:
      return HelpCircle;
  }
}

function removeFromFavorites(bookId?: string) {
  if (!bookId) return;
  favoriteStore.toggleFavorites(bookId);
}

function confirmDeleteReview(reviewId: string, bookTitle?: string) {
  if (
    confirm(
      `Are you sure you want to delete your review for "${bookTitle}"? This action cannot be undone.`
    )
  ) {
    reviewStore.deleteReview(reviewId);
  }
}

function validatePasswordForm(): boolean {
  passwordErrors.current = passwordForm.current
    ? ""
    : "Current password is required";
  passwordErrors.new = !passwordForm.new
    ? "New password is required"
    : passwordForm.new.length < 6
      ? "Password must be at least 6 characters"
      : "";
  passwordErrors.confirm = !passwordForm.confirm
    ? "Please confirm your password"
    : passwordForm.confirm !== passwordForm.new
      ? "Passwords do not match"
      : "";

  return (
    !passwordErrors.current && !passwordErrors.new && !passwordErrors.confirm
  );
}

async function updatePassword() {
  try {
    // Validate form
    if (!validatePasswordForm()) return;

    changingPassword.value = true;

    await authStore.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
    });

    // Show success message
    emit("show-snackbar", {
      message: "Password updated successfully!",
      color: "success",
    });

    // Reset form
    passwordForm.current = "";
    passwordForm.new = "";
    passwordForm.confirm = "";
    passwordErrors.current = "";
    passwordErrors.new = "";
    passwordErrors.confirm = "";
  } catch (error: any) {
    console.error("Error changing password:", error);

    // Show error message
    emit("show-snackbar", {
      message:
        error.message ||
        error.msg ||
        "Failed to update password. Please try again.",
      color: "error",
    });
  } finally {
    changingPassword.value = false;
  }
}

async function handleAvatarUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    emit("show-snackbar", {
      message: "Please select a valid image file",
      color: "error",
    });
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    emit("show-snackbar", {
      message: "File size must be less than 5MB",
      color: "error",
    });
    return;
  }

  try {
    uploadingAvatar.value = true;

    // Gửi file lên API với type='avatar'
    const response = await uploadAvatar(file);

    // Vì BE trả về 1 object user sau khi update avatar
    const updatedUser = response.data.data;

    if (updatedUser && updatedUser.avatar_url) {
      // Cập nhật store
      authStore.loginSuccess({
        ...(currentUser.value as UserType),
        avatar_url: updatedUser.avatar_url,
      });

      emit("show-snackbar", {
        message: "Avatar updated successfully!",
        color: "success",
      });
    }
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    emit("show-snackbar", {
      message: error.response?.data?.msg || "Failed to upload avatar",
      color: "error",
    });
  } finally {
    uploadingAvatar.value = false;
    // Reset file input
    if (avatarInput.value) {
      avatarInput.value.value = "";
    }
  }
}

function removeAvatar() {
  if (confirm("Are you sure you want to remove your avatar?")) {
    // Update current user in store to remove avatar
    authStore.loginSuccess({
      ...(currentUser.value as UserType),
      avatar_url: null,
    });

    emit("show-snackbar", {
      message: "Avatar removed successfully!",
      color: "success",
    });
  }
}
</script>
