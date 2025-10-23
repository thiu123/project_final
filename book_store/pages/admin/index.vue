<template>
  <div>
    <!-- Book Management Component -->
    <AdminBookManagement v-if="currentTab === 'book-management'" />

    <!-- User Management Component (Placeholder) -->
    <AdminUserManagement v-else-if="currentTab === 'user-management'" />

    <!-- Contact Management Component -->
    <AdminContactManagement v-else-if="currentTab === 'contact-management'" />

    <!-- Order Management Component -->
    <AdminOrderManagement v-else-if="currentTab === 'order-management'" />

    <!-- Analytics Component (Placeholder) -->
    <div v-else-if="currentTab === 'analytics'" class="text-center pa-8">
      <v-icon size="80" color="grey-lighten-2">mdi-chart-line</v-icon>
      <h2 class="text-h4 mt-4 mb-2">Analytics</h2>
      <p class="text-grey">Feature under development...</p>
    </div>

    <!-- Settings Component (Placeholder) -->
    <div v-else-if="currentTab === 'settings'" class="text-center pa-8">
      <v-icon size="80" color="grey-lighten-2">mdi-cog</v-icon>
      <h2 class="text-h4 mt-4 mb-2">Settings</h2>
      <p class="text-grey">Feature under development...</p>
    </div>

    <!-- Default Dashboard -->
    <div v-else class="text-center pa-8">
      <v-icon size="80" color="primary">mdi-view-dashboard</v-icon>
      <h2 class="text-h4 mt-4 mb-2">Welcome to Admin Panel</h2>
      <p class="text-grey">Select a tab from sidebar to get started</p>
    </div>
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
      currentTab: "book-management",
    };
  },
  watch: {
    "$route.query.tab": {
      handler(newTab) {
        // console.log(newTab, 'new tabbbb');
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
/* Additional styles if needed */
</style>
