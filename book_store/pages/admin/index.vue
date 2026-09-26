<template>
  <Transition name="admin-tab-fade" mode="out-in">
    <component :is="currentView" :key="currentTab" />
  </Transition>
</template>

<script setup lang="ts">
import type { NavigationGuard } from "vue-router";
import { definePageMeta } from "#imports";
import {
  AdminBookManagement,
  AdminContactManagement,
  AdminDashboardManagement,
  AdminOrderManagement,
  AdminReviewManagement,
  AdminUserManagement,
  AdminVoucherManagement,
} from "#components";

definePageMeta({
  layout: "admin",
  middleware: "admin" as unknown as NavigationGuard,
});

const VIEWS = {
  dashboard: AdminDashboardManagement,
  "book-management": AdminBookManagement,
  "user-management": AdminUserManagement,
  "review-management": AdminReviewManagement,
  "contact-management": AdminContactManagement,
  "order-management": AdminOrderManagement,
  "voucher-management": AdminVoucherManagement,
} as const;

type AdminTab = keyof typeof VIEWS;

const route = useRoute();

const currentTab = computed<AdminTab>(() => {
  const tab = route.query.tab as string | undefined;
  return tab && tab in VIEWS ? (tab as AdminTab) : "dashboard";
});

const currentView = computed(() => VIEWS[currentTab.value]);
</script>

<style scoped>
.admin-tab-fade-enter-active,
.admin-tab-fade-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.admin-tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.admin-tab-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .admin-tab-fade-enter-active,
  .admin-tab-fade-leave-active {
    transition: none;
  }
}
</style>
