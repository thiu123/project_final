<template>
  <div class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <header class="hero-rise border-b border-border pb-8 md:pb-12">
      <p class="eyebrow">Account</p>
      <h1 class="mt-5 break-words font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl">
        Hello, <span class="italic">{{ currentUser?.username || "reader" }}</span>
      </h1>
      <p class="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
        Your details, orders, saved books and reviews, all on one page.
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
      <ProfilesProfileSidebar v-model:activeTab="activeTab" class="lg:col-span-3" />

      <ProfilesProfileContent
        class="pt-10 lg:col-span-9 lg:pt-14"
        :active-tab="activeTab"
        :loading-orders="loadingOrders"
        :loading-favorites="loadingFavorites"
        :loading-reviews="loadingReviews"
        @show-snackbar="notifyFromPayload"
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
import { useAuthStore } from "@/stores/auth";
import { useFavoriteStore } from "@/stores/favorite";
import { useOrderStore } from "@/stores/order";
import { useReviewStore } from "@/stores/review";
import { useSnackbar } from "@/composables/useSnackbar";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const orderStore = useOrderStore();
const favoriteStore = useFavoriteStore();
const reviewStore = useReviewStore();

const { currentUser } = storeToRefs(authStore);

const activeTab = ref("personal");
const loadingOrders = ref(false);
const loadingFavorites = ref(false);
const loadingReviews = ref(false);
const { snackbar, notifyFromPayload } = useSnackbar();

watch(activeTab, (newTab) => {
  router.replace({ query: { tab: newTab } });

  if (newTab === "orders") {
    loadUserOrders();
  }
  if (newTab === "favorites") {
    loadFavorites();
  }
  if (newTab === "reviews") {
    loadUserReviews();
  }
});

onMounted(() => {
  // Check if user is authenticated
  if (!currentUser.value) {
    router.push("/login");
  }

  // Handle tab parameter from URL query
  const tabParam = route.query.tab;
  if (tabParam) {
    activeTab.value = tabParam as string;
  }
});

async function loadUserOrders() {
  loadingOrders.value = true;
  try {
    await orderStore.fetchUserOrders();
  } catch (error) {
    console.error("Error loading orders:", error);
  } finally {
    loadingOrders.value = false;
  }
}

async function loadFavorites() {
  loadingFavorites.value = true;
  try {
    await favoriteStore.getFavoritesForEachUser();
  } catch (error) {
    console.error("Error loading favorites:", error);
  } finally {
    loadingFavorites.value = false;
  }
}

async function loadUserReviews() {
  loadingReviews.value = true;
  try {
    await reviewStore.loadUserReviewsAction();
  } catch (error) {
    console.error("Error loading reviews:", error);
  } finally {
    loadingReviews.value = false;
  }
}

</script>
