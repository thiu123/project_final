<template>
  <div>
    <transition name="admin-tab-fade" mode="out-in">
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
      <div v-else class="text-center pa-8">
        <div class="admin-empty-icon mx-auto mb-4">
          <v-icon size="40" color="customblack">mdi-view-dashboard</v-icon>
        </div>
        <h2 class="text-h4 font-weight-bold mb-2">Welcome to Admin Panel</h2>
        <p class="text-grey">Select a tab from sidebar to get started</p>
      </div>
    </transition>
  </div>
</template>

<script>
definePageMeta({
  layout: "admin",
  middleware: "admin",
});

export default {
  name: "AdminPage",
  data() {
    return {
      currentTab: "dashboard",
    };
  },
  watch: {
    "$route.query.tab": {
      handler(newTab) {
        if (newTab) {
          this.currentTab = newTab;
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.admin-empty-icon {
  width: 88px;
  height: 88px;
  border-radius: var(--admin-radius-lg, 24px);
  background: var(--admin-accent, #dcf763);
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-tab-fade-enter-active,
.admin-tab-fade-leave-active {
  transition: opacity 200ms ease;
}

.admin-tab-fade-enter-from,
.admin-tab-fade-leave-to {
  opacity: 0;
}
</style>
