<template>
  <div>
    <!-- Mobile scrim (temporary drawer behavior on small screens) -->
    <div
      v-if="drawer"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      aria-hidden="true"
      @click="$emit('update:drawer', false)"
    ></div>

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-waterblue/10 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] transition-transform duration-300 dark:from-card dark:to-background md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:shrink-0 md:translate-x-0"
      :class="drawer ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- User Profile Header -->
      <div class="border-b border-border p-6 text-center">
        <div class="mb-4 flex justify-center">
          <UserAvatar
            :src="currentUser?.avatar_url"
            :name="currentUser?.username"
            class="h-[100px] w-[100px] border-4 border-white text-3xl shadow-md dark:border-muted"
          >
            <CircleUser class="h-10 w-10 text-muted-foreground" />
          </UserAvatar>
        </div>
        <h3 class="mb-2 text-2xl font-bold text-foreground">
          {{ currentUser?.username || "User" }}
        </h3>
        <p class="mb-3 text-sm text-muted-foreground">
          {{ currentUser?.email || "No email" }}
        </p>
      </div>

      <!-- Navigation Menu -->
      <nav class="p-4">
        <button
          v-for="item in menuItems"
          :key="item.value"
          type="button"
          class="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300"
          :class="
            activeTab === item.value
              ? 'bg-waterblue text-white shadow'
              : 'text-foreground hover:bg-muted'
          "
          @click="$emit('update:activeTab', item.value)"
        >
          <component
            :is="item.icon"
            class="h-5 w-5 shrink-0"
            :class="
              activeTab === item.value ? 'text-white' : 'text-muted-foreground'
            "
          />
          <span class="flex-1 text-base font-medium">{{ item.title }}</span>
          <ChevronRight
            v-if="activeTab === item.value"
            class="h-4 w-4 shrink-0 text-white"
          />
        </button>
      </nav>

      <!-- Quick Stats Section -->
      <div class="mt-auto p-4">
        <div
          class="rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] p-4 shadow dark:from-card dark:to-card"
        >
          <h4 class="mb-3 text-base font-bold text-foreground">Quick Stats</h4>
          <div class="mb-3 flex items-center justify-between">
            <div class="text-center">
              <div class="text-lg font-bold text-waterblue">
                {{ ordersCount }}
              </div>
              <div class="text-xs text-muted-foreground">Orders</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-customyellow">
                {{ favoritesCount }}
              </div>
              <div class="text-xs text-muted-foreground">Favorites</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-lightgreen">
                {{ reviewsCount }}
              </div>
              <div class="text-xs text-muted-foreground">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
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
  ChevronRight,
  CircleUser,
  Heart,
  Lock,
  Package,
  Star,
} from "lucide-vue-next";

withDefaults(
  defineProps<{
    drawer?: boolean;
    activeTab?: string;
  }>(),
  {
    drawer: true,
    activeTab: "personal",
  }
);

defineEmits<{
  (e: "update:drawer", value: boolean): void;
  (e: "update:activeTab", value: string): void;
}>();

const authStore = useAuthStore();
const orderStore = useOrderStore();
const favoriteStore = useFavoriteStore();
const reviewStore = useReviewStore();

const { currentUser } = storeToRefs(authStore);
const { userOrders } = storeToRefs(orderStore);
const { favorites } = storeToRefs(favoriteStore);
const { userReviews } = storeToRefs(reviewStore);

const menuItems: { title: string; value: string; icon: Component }[] = [
  { title: "Personal Info", value: "personal", icon: CircleUser },
  { title: "Orders", value: "orders", icon: Package },
  { title: "Favorites", value: "favorites", icon: Heart },
  { title: "My Reviews", value: "reviews", icon: Star },
  { title: "Change Password", value: "password", icon: Lock },
];

const ordersCount = computed(
  () =>
    userOrders.value?.filter((order) => order.status === "Paid").length || 0
);
const favoritesCount = computed(() => favorites.value?.length || 0);
const reviewsCount = computed(() => userReviews.value?.length || 0);

async function loadAllData() {
  try {
    await Promise.all([
      orderStore.fetchUserOrders(),
      favoriteStore.getFavoritesForEachUser(),
      reviewStore.loadUserReviewsAction(),
    ]);
  } catch (error) {
    console.error("Error loading profile data:", error);
  }
}

onMounted(async () => {
  // Fetch data ngay khi component mounted
  await loadAllData();
});
</script>
