<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :permanent="$vuetify.display.mdAndUp"
    :temporary="$vuetify.display.smAndDown"
    class="profile-sidebar"
    style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
  >
    <!-- User Profile Header -->
    <div class="pa-6 text-center border-b border-grey-lighten-3">
      <div class="mb-4">
        <v-avatar size="100" class="elevation-4 border-4 border-white">
          <v-img
            :src="currentUser?.avatar_url || 'https://via.placeholder.com/100'"
            alt="User Avatar"
            cover
          />
        </v-avatar>
      </div>
      <h3 class="text-h5 font-weight-bold text-customblack mb-2">
        {{ currentUser?.username || "User" }}
      </h3>
      <p class="text-body-2 text-grey-darken-1 mb-3">
        {{ currentUser?.email || "No email" }}
      </p>
      <v-chip
        color="waterblue"
        variant="flat"
        size="small"
        class="text-white font-weight-medium"
      >
        <v-icon start size="16" class="mr-1">mdi-account-check</v-icon>
        Active Member
      </v-chip>
    </div>

    <!-- Navigation Menu -->
    <v-list nav density="comfortable" class="pa-4">
      <v-list-item
        v-for="item in menuItems"
        :key="item.value"
        :value="item.value"
        :active="activeTab === item.value"
        @click="$emit('update:activeTab', item.value)"
        rounded="xl"
        class="mb-2 transition-all duration-300"
        :class="
          activeTab === item.value
            ? 'bg-waterblue text-white elevation-2'
            : 'hover:bg-grey-lighten-4'
        "
      >
        <template v-slot:prepend>
          <v-icon
            :icon="item.icon"
            size="20"
            :class="
              activeTab === item.value ? 'text-white' : 'text-grey-darken-1'
            "
          ></v-icon>
        </template>
        <v-list-item-title class="text-body-1 font-weight-medium">
          {{ item.title }}
        </v-list-item-title>
        <template v-slot:append>
          <v-icon
            v-if="activeTab === item.value"
            icon="mdi-chevron-right"
            size="16"
            class="text-white"
          ></v-icon>
        </template>
      </v-list-item>
    </v-list>

    <!-- Quick Stats Section -->
    <div class="pa-4 mt-auto">
      <v-card
        elevation="2"
        rounded="xl"
        class="pa-4"
        style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
      >
        <h4 class="text-subtitle-1 font-weight-bold text-customblack mb-3">
          Quick Stats
        </h4>
        <div class="d-flex justify-space-between align-center mb-3">
          <div class="text-center">
            <div class="text-h6 font-weight-bold text-waterblue">
              {{ ordersCount }}
            </div>
            <div class="text-caption text-grey-darken-1">Orders</div>
          </div>
          <div class="text-center">
            <div class="text-h6 font-weight-bold text-customyellow">
              {{ favoritesCount }}
            </div>
            <div class="text-caption text-grey-darken-1">Favorites</div>
          </div>
          <div class="text-center">
            <div class="text-h6 font-weight-bold text-lightgreen">
              {{ reviewsCount }}
            </div>
            <div class="text-caption text-grey-darken-1">Reviews</div>
          </div>
        </div>
      </v-card>
    </div>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "ProfileSidebar",
  props: {
    drawer: {
      type: Boolean,
      default: true,
    },
    activeTab: {
      type: String,
      default: "personal",
    },
  },
  emits: ["update:drawer", "update:activeTab"],
  data() {
    return {
      menuItems: [
        {
          title: "Personal Info",
          value: "personal",
          icon: "mdi-account-circle",
        },
        { title: "Orders", value: "orders", icon: "mdi-package-variant" },
        { title: "Wishlist", value: "wishlist", icon: "mdi-heart" },
        { title: "My Reviews", value: "reviews", icon: "mdi-star" },
        { title: "Change Password", value: "password", icon: "mdi-lock" },
      ],
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("order", ["userOrders"]),
    ...mapState("favorite", ["favorites"]),
    ...mapState("review", ["userReviews"]),
    ordersCount() {
      return this.userOrders?.length || 0;
    },
    favoritesCount() {
      return this.favorites?.length || 0;
    },
    reviewsCount() {
      return this.userReviews?.length || 0;
    },
  },
  methods: {
    ...mapActions("order", ["fetchUserOrders"]),
    ...mapActions("favorite", ["getFavoritesForEachUser"]),
    ...mapActions("review", ["loadUserReviewsAction"]),
    async loadAllData() {
      try {
        // Load all data in parallel để nhanh hơn
        await Promise.all([
          this.fetchUserOrders(),
          this.getFavoritesForEachUser(),
          this.loadUserReviewsAction(),
        ]);
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    },
  },
  async mounted() {
    // Fetch data ngay khi component mounted
    await this.loadAllData();
  },
};
</script>

<style scoped>
.profile-sidebar {
  border-right: 1px solid rgba(82, 149, 208, 0.1);
}

.transition-all {
  transition: all 0.3s ease;
}

.duration-300 {
  transition-duration: 300ms;
}

.hover\:bg-grey-lighten-4:hover {
  background-color: rgb(245, 245, 245) !important;
}
</style>
