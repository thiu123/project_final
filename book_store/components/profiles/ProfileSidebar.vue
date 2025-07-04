<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :permanent="$vuetify.display.mdAndUp"
    :temporary="$vuetify.display.smAndDown"
    color="grey-lighten-5"
    class="profile-sidebar"
  >
    <!-- User Profile Header -->
    <div class="pa-4 text-center border-b">
      <v-avatar size="80" class="mb-3">
        <v-img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="User Avatar"
        />
      </v-avatar>
      <h3 class="text-h6 font-weight-medium">
        {{ currentUser?.username || "User" }}
      </h3>
      <p class="text-body-2 text-grey-darken-1">
        {{ currentUser?.email || "No email" }}
      </p>
    </div>

    <!-- Navigation Menu -->
    <v-list nav density="comfortable" class="pa-2">
      <v-list-item
        v-for="item in menuItems"
        :key="item.value"
        :value="item.value"
        :active="activeTab === item.value"
        @click="$emit('update:activeTab', item.value)"
        rounded="lg"
        class="mb-1"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon" size="20"></v-icon>
        </template>
        <v-list-item-title class="text-body-2 font-weight-medium">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from "vuex";

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
        { title: "Personal Info", value: "personal", icon: "mdi-account" },
        { title: "Orders", value: "orders", icon: "mdi-package-variant" },
        { title: "Wishlist", value: "wishlist", icon: "mdi-heart" },
        { title: "My Reviews", value: "reviews", icon: "mdi-star" },
        { title: "Change Password", value: "password", icon: "mdi-lock" },
      ],
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
};
</script>

<style scoped>
.profile-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
