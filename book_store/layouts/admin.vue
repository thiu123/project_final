<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      class="admin-sidebar"
      color="grey-lighten-5"
      width="280"
      rail-width="72"
    >
      <!-- Header -->
      <div class="d-flex align-center pa-4" style="min-height: 80px">
        <v-btn
          icon
          @click.stop="rail = !rail"
          variant="text"
          size="small"
          class="mr-3"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <div v-if="!rail" class="d-flex align-center">
          <v-avatar color="primary" size="40" class="mr-3">
            <v-icon color="white">mdi-shield-crown</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold text-primary">Admin Panel</div>
            <div class="text-caption text-grey">THBookStore</div>
          </div>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- Navigation Menu -->
      <v-list density="compact" nav class="pa-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.value"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          :active="activeTab === item.value"
          @click="setActiveTab(item.value)"
          rounded="xl"
          class="mb-1"
          :class="{ 'v-list-item--active': activeTab === item.value }"
        >
          <template v-if="item.badge" v-slot:append>
            <v-chip :color="item.badge.color" size="x-small" variant="flat">
              {{ item.badge.text }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>

      <!-- User Info (Bottom) -->
      <template v-slot:append>
        <v-divider></v-divider>
        <div class="pa-4">
          <v-list-item
            v-if="!rail"
            :prepend-avatar="userAvatar"
            :title="userName"
            :subtitle="userRole"
            class="px-0"
          >
            <template v-slot:append>
              <v-btn
                icon="mdi-logout"
                variant="text"
                size="small"
                @click="logout"
              ></v-btn>
            </template>
          </v-list-item>

          <div v-else class="text-center">
            <v-btn icon variant="text" size="small" @click="logout">
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="admin-main">
      <!-- Top Bar -->
      <v-app-bar color="white" elevation="1" height="80" class="admin-topbar">
        <v-app-bar-title class="ml-4">
          <div class="d-flex align-center">
            <v-icon
              :icon="currentTabIcon"
              class="mr-3"
              color="primary"
            ></v-icon>
            <span class="text-h5 font-weight-bold">{{ currentTabTitle }}</span>
          </div>
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <!-- Top Bar Actions -->
        <div class="d-flex align-center mr-4">
          <v-btn icon variant="text" class="mr-2">
            <v-icon>mdi-bell</v-icon>
            <v-badge color="red" content="3" overlap></v-badge>
          </v-btn>

          <v-btn icon variant="text" class="mr-2">
            <v-icon>mdi-cog</v-icon>
          </v-btn>

          <v-divider vertical class="mx-3"></v-divider>

          <v-chip :color="getStatusColor()" variant="flat" size="small">
            <v-icon start size="small">mdi-circle</v-icon>
            Online
          </v-chip>
        </div>
      </v-app-bar>

      <!-- Content Area -->
      <v-container fluid class="admin-content pa-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "AdminLayout",
  data() {
    return {
      drawer: true,
      rail: false,
      activeTab: "book-management",
      menuItems: [
        {
          title: "Book Management",
          value: "book-management",
          icon: "mdi-book-multiple",
          badge: {
            text: "1240",
            color: "primary",
          },
        },
        {
          title: "User Management",
          value: "user-management",
          icon: "mdi-account-multiple",
          badge: {
            text: "856",
            color: "success",
          },
        },
        {
          title: "Order Management",
          value: "order-management",
          icon: "mdi-package-variant",
          badge: {
            text: "124",
            color: "warning",
          },
        },
        {
          title: "Analytics",
          value: "analytics",
          icon: "mdi-chart-line",
        },
        {
          title: "Settings",
          value: "settings",
          icon: "mdi-cog",
        },
      ],
      userName: "Admin User",
      userRole: "Super Administrator",
      userAvatar: "https://cdn.vuetifyjs.com/images/john.jpg",
    };
  },
  computed: {
    currentTabTitle() {
      const item = this.menuItems.find((item) => item.value === this.activeTab);
      return item ? item.title : "Dashboard";
    },
    currentTabIcon() {
      const item = this.menuItems.find((item) => item.value === this.activeTab);
      return item ? item.icon : "mdi-view-dashboard";
    },
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
      this.$router.push(`/admin?tab=${tab}`);
    },
    getStatusColor() {
      return "success";
    },
    logout() {
      // Handle logout logic
      this.$router.push("/");
    },
  },
  mounted() {
    // Get tab from query params
    const tab = this.$route.query.tab;
    if (tab && this.menuItems.find((item) => item.value === tab)) {
      this.activeTab = tab;
    }
  },
};
</script>

<style scoped>
.admin-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.admin-main {
  background-color: #f8f9fa;
}

.admin-topbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.admin-content {
  min-height: calc(100vh - 80px);
}

.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.1) !important;
  color: #1976d2 !important;
}

.v-list-item--active .v-icon {
  color: #1976d2 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed !important;
    z-index: 1000;
  }
}
</style>
