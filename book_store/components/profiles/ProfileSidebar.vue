<template>
  <nav aria-label="Account sections" class="lg:sticky lg:top-28 lg:self-start lg:pt-14">
    <div ref="stripRef" class="relative -mx-4 overflow-x-auto border-b border-border px-4 scrollbar-none lg:hidden">
      <ul class="flex gap-7">
        <li v-for="item in menuItems" :key="item.value">
          <button
            type="button"
            class="relative whitespace-nowrap py-4 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors"
            :class="activeTab === item.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
            :data-tab="item.value"
            :aria-current="activeTab === item.value ? 'page' : undefined"
            @click="$emit('update:activeTab', item.value)"
          >
            {{ item.title }}
            <span
              v-if="activeTab === item.value"
              class="absolute inset-x-0 bottom-0 h-px bg-foreground"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
    </div>

    <div class="hidden lg:block">
      <p class="eyebrow">Your account</p>
      <ul class="mt-5 border-t border-border">
        <li v-for="(item, index) in menuItems" :key="item.value" class="border-b border-border">
          <button
            type="button"
            class="group flex w-full items-center gap-4 py-4 text-left"
            :aria-current="activeTab === item.value ? 'page' : undefined"
            @click="$emit('update:activeTab', item.value)"
          >
            <span class="flex w-6 shrink-0 items-center" aria-hidden="true">
              <span v-if="activeTab === item.value" class="h-px w-5 bg-foreground" />
              <span v-else class="text-[11px] tabular-nums text-muted-foreground">
                {{ String(index + 1).padStart(2, "0") }}
              </span>
            </span>
            <span
              class="font-serif text-[1.3rem] leading-tight transition-colors"
              :class="activeTab === item.value ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'"
            >
              {{ item.title }}
            </span>
          </button>
        </li>
      </ul>

      <dl class="mt-10 space-y-4">
        <div v-for="stat in stats" :key="stat.label" class="flex items-baseline justify-between gap-4">
          <dt class="eyebrow">{{ stat.label }}</dt>
          <dd class="font-serif text-2xl tabular-nums leading-none">{{ stat.value }}</dd>
        </div>
      </dl>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFavoriteStore } from "@/stores/favorite";
import { useOrderStore } from "@/stores/order";
import { useReviewStore } from "@/stores/review";

const props = withDefaults(
  defineProps<{
    activeTab?: string;
  }>(),
  {
    activeTab: "personal",
  }
);

defineEmits<{
  (e: "update:activeTab", value: string): void;
}>();

const orderStore = useOrderStore();
const favoriteStore = useFavoriteStore();
const reviewStore = useReviewStore();

const { userOrders } = storeToRefs(orderStore);
const { favorites } = storeToRefs(favoriteStore);
const { userReviews } = storeToRefs(reviewStore);

const menuItems: { title: string; value: string }[] = [
  { title: "Personal info", value: "personal" },
  { title: "Orders", value: "orders" },
  { title: "Favorites", value: "favorites" },
  { title: "My reviews", value: "reviews" },
  { title: "Change password", value: "password" },
];

const ordersCount = computed(
  () =>
    userOrders.value?.filter((order) => order.status === "Paid").length || 0
);
const favoritesCount = computed(() => favorites.value?.length || 0);
const reviewsCount = computed(() => userReviews.value?.length || 0);

const stats = computed(() => [
  { label: "Paid orders", value: ordersCount.value },
  { label: "Favorites", value: favoritesCount.value },
  { label: "Reviews", value: reviewsCount.value },
]);

const stripRef = ref<HTMLElement | null>(null);

function revealActiveTab() {
  const strip = stripRef.value;
  const button = strip?.querySelector<HTMLElement>(`[data-tab="${props.activeTab}"]`);
  if (!strip || !button) return;
  strip.scrollLeft = button.offsetLeft - strip.clientWidth / 2 + button.offsetWidth / 2;
}

watch(
  () => props.activeTab,
  () => nextTick(revealActiveTab)
);

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
