<template>
  <div
    class="min-h-screen bg-gradient-to-br from-white to-[#d4dfed] pt-16 dark:from-background dark:to-card md:pt-0"
  >
    <div class="md:flex">
      <!-- Left Sidebar -->
      <ProfilesProfileSidebar
        v-model:drawer="drawer"
        v-model:activeTab="activeTab"
      />

      <!-- Main Content -->
      <div class="min-w-0 flex-1">
        <ProfilesProfileContent
          :active-tab="activeTab"
          :loading-orders="loadingOrders"
          :loading-favorites="loadingFavorites"
          :loading-reviews="loadingReviews"
          @toggle-drawer="drawer = !drawer"
          @show-snackbar="showSnackbar"
        />
      </div>
    </div>

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useFavoriteStore } from "@/stores/favorite";
import { useOrderStore } from "@/stores/order";
import { useReviewStore } from "@/stores/review";
import type { SnackbarPayload } from "@/types";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const orderStore = useOrderStore();
const favoriteStore = useFavoriteStore();
const reviewStore = useReviewStore();

const { currentUser } = storeToRefs(authStore);

const drawer = ref(true);
const activeTab = ref("personal");
const loadingOrders = ref(false);
const loadingFavorites = ref(false);
const loadingReviews = ref(false);
const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
  timeout: 4000,
});

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

function showSnackbar(data: SnackbarPayload) {
  snackbar.message = data.message;
  snackbar.color = data.color || "success";
  snackbar.show = true;
}
</script>
