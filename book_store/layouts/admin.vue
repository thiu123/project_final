<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      class="admin-sidebar"
      color="customblack"
      width="280"
      rail-width="72"
    >
      <!-- Header -->
      <div class="d-flex align-center pa-4 sidebar-header">
        <v-btn
          icon
          @click.stop="rail = !rail"
          variant="text"
          size="small"
          color="whitesmoke"
          class="mr-3"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <div v-if="!rail" class="d-flex align-center">
          <div class="brand-mark mr-2">
            <v-icon size="18" color="customblack">mdi-shield-star</v-icon>
          </div>
          <div class="text-subtitle-1 font-weight-bold sidebar-brand-text">
            Admin Panel
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <v-list density="compact" nav class="pa-2 sidebar-nav">
        <v-list-item
          v-for="item in menuItems"
          :key="item.value"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          @click="setActiveTab(item.value)"
          rounded="lg"
          class="mb-1 sidebar-item"
          :class="{ 'sidebar-item--active': activeTab === item.value }"
        >
        </v-list-item>
      </v-list>

      <!-- User Info (Bottom) -->
      <template v-slot:append>
        <div class="pa-4 sidebar-footer">
          <v-list-item
            v-if="!rail"
            :prepend-avatar="currentUser?.avatar_url"
            :title="currentUser?.username || 'Admin User'"
            :subtitle="'Administrator'"
            class="px-0 sidebar-user"
          >
            <template v-slot:append>
              <v-btn
                icon="mdi-logout"
                variant="text"
                size="small"
                color="whitesmoke"
                @click="handleLogout"
              ></v-btn>
            </template>
          </v-list-item>

          <div v-else class="text-center">
            <v-btn
              icon
              variant="text"
              size="small"
              color="whitesmoke"
              @click="handleLogout"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="admin-main">
      <!-- Top Bar -->
      <v-app-bar
        color="whitesmoke"
        elevation="0"
        height="80"
        class="admin-topbar"
      >
        <v-app-bar-title class="ml-4">
          <div class="d-flex align-center">
            <div class="topbar-icon mr-3">
              <v-icon
                :icon="currentTabIcon"
                size="20"
                color="customblack"
              ></v-icon>
            </div>
            <span class="text-h5 font-weight-bold topbar-title">{{
              currentTabTitle
            }}</span>
          </div>
        </v-app-bar-title>

        <v-spacer></v-spacer>
      </v-app-bar>

      <!-- Content Area -->
      <v-container fluid class="admin-content pa-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "AdminLayout",
  data() {
    return {
      drawer: true,
      rail: false,
      activeTab: "dashboard",
      menuItems: [
        {
          title: "Dashboard",
          value: "dashboard",
          icon: "mdi-view-dashboard",
        },
        {
          title: "Book Management",
          value: "book-management",
          icon: "mdi-book-multiple",
        },
        {
          title: "User Management",
          value: "user-management",
          icon: "mdi-account-multiple",
        },
        {
          title: "Review Management",
          value: "review-management",
          icon: "mdi-comment-multiple",
        },
        {
          title: "Contact & Feedback Management",
          value: "contact-management",
          icon: "mdi-message-text",
        },
        {
          title: "Order Management",
          value: "order-management",
          icon: "mdi-package-variant",
        },
        {
          title: "Voucher Management",
          value: "voucher-management",
          icon: "mdi-ticket-percent",
        },
      ],
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("book", ["books"]),
    currentTabTitle() {
      const item = this.menuItems.find((item) => item.value === this.activeTab);
      return item ? item.title : "Dashboard";
    },
    currentTabIcon() {
      const item = this.menuItems.find((item) => item.value === this.activeTab);
      return item ? item.icon : "mdi-view-dashboard";
    },
    bookCount() {
      return this.books.length;
    },
  },
  methods: {
    ...mapActions("auth", ["logout", "restoreSession"]),
    setActiveTab(tab) {
      this.activeTab = tab;
      this.$router.push(`/admin?tab=${tab}`);
    },
    getStatusColor() {
      return "success";
    },
    handleLogout() {
      this.logout();
      this.$router.push("/");
    },
  },
  mounted() {
    this.restoreSession();
    console.log(this.currentUser, "current user in admin layout");
    // Get tab from query params
    const tab = this.$route.query.tab;
    if (tab && this.menuItems.find((item) => item.value === tab)) {
      this.activeTab = tab;
    }
  },
};
</script>

<style>
/* Shared design tokens for the whole admin panel — consumed by every
   book_store/components/admin/*.vue file via var(--admin-*). */
:root {
  --admin-ink: #191b24;
  --admin-canvas: #f1f2ee;
  --admin-accent: #dcf763;
  --admin-blue: #5295d0;
  --admin-slate: #435058;
  --admin-emerald: #059669;
  --admin-radius-sm: 10px;
  --admin-radius-md: 16px;
  --admin-radius-lg: 24px;
  --admin-shadow-sm: 0 2px 10px -2px rgba(25, 27, 36, 0.08);
  --admin-shadow-md: 0 12px 28px -8px rgba(25, 27, 36, 0.14);
  --admin-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

<style scoped>
.admin-sidebar {
  border-right: none !important;
}

.sidebar-header {
  min-height: 80px;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: var(--admin-radius-sm);
  background: var(--admin-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-brand-text {
  color: var(--admin-canvas);
  letter-spacing: -0.01em;
}

.sidebar-nav {
  gap: 2px;
}

.sidebar-item {
  color: rgba(241, 242, 238, 0.64) !important;
  transition:
    background-color var(--admin-transition),
    color var(--admin-transition);
}

.sidebar-item :deep(.v-icon) {
  color: rgba(241, 242, 238, 0.64);
  transition: color var(--admin-transition);
}

.sidebar-item:hover {
  background-color: rgba(241, 242, 238, 0.08) !important;
  color: var(--admin-canvas) !important;
}

.sidebar-item--active {
  background-color: rgba(220, 247, 99, 0.12) !important;
  color: var(--admin-accent) !important;
  border-left: 3px solid var(--admin-accent);
}

.sidebar-item--active :deep(.v-icon) {
  color: var(--admin-accent) !important;
}

.sidebar-footer {
  border-top: 1px solid rgba(241, 242, 238, 0.1);
}

.sidebar-user :deep(.v-list-item-title) {
  color: var(--admin-canvas);
  font-weight: 600;
}

.sidebar-user :deep(.v-list-item-subtitle) {
  color: rgba(241, 242, 238, 0.56);
}

.admin-main {
  background-color: var(--admin-canvas);
}

.admin-topbar {
  border-bottom: 1px solid rgba(25, 27, 36, 0.06) !important;
}

.topbar-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--admin-radius-sm);
  background: var(--admin-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-title {
  color: var(--admin-ink);
  letter-spacing: -0.01em;
}

.admin-content {
  min-height: calc(100vh - 80px);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed !important;
    z-index: 1000;
  }
}
</style>
