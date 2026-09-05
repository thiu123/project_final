<template>
  <div>
    <Transition name="admin-tab-fade" mode="out-in">
      <!-- Dashboard -->
      <AdminDashboardManagement v-if="currentTab === 'dashboard'" />

      <!-- Book Management Component -->
      <AdminBookManagement v-else-if="currentTab === 'book-management'" />

      <!-- User Management Component (Placeholder) -->
      <AdminUserManagement v-else-if="currentTab === 'user-management'" />

      <!-- Review Management Component -->
      <AdminReviewManagement v-else-if="currentTab === 'review-management'" />

      <!-- Contact Management Component -->
      <AdminContactManagement v-else-if="currentTab === 'contact-management'" />

      <!-- Order Management Component -->
      <AdminOrderManagement v-else-if="currentTab === 'order-management'" />

      <!-- Voucher Management Component -->
      <AdminVoucherManagement v-else-if="currentTab === 'voucher-management'" />

      <!-- Default Dashboard -->
      <div v-else class="p-8 text-center">
        <div
          class="mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-3xl bg-customyellow"
        >
          <LayoutDashboard class="h-10 w-10 text-customblack" />
        </div>
        <h2 class="mb-2 text-3xl font-bold text-foreground">
          Welcome to Admin Panel
        </h2>
        <p class="text-muted-foreground">Select a tab from sidebar to get started</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { NavigationGuard } from "vue-router";
import { definePageMeta } from "#imports";
import { LayoutDashboard } from "lucide-vue-next";

definePageMeta({
  layout: "admin",
  middleware: "admin" as unknown as NavigationGuard,
});

const route = useRoute();
const currentTab = ref("dashboard");

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      currentTab.value = newTab as string;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.admin-tab-fade-enter-active,
.admin-tab-fade-leave-active {
  transition: opacity 200ms ease;
}

.admin-tab-fade-enter-from,
.admin-tab-fade-leave-to {
  opacity: 0;
}
</style>
