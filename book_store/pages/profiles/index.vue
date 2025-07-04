<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <!-- Left Sidebar -->
      <v-col cols="12" md="3" lg="2">
        <ProfileSidebar v-model:drawer="drawer" v-model:activeTab="activeTab" />
      </v-col>

      <!-- Main Content -->
      <v-col cols="12" md="9" lg="10">
        <ProfileContent
          :active-tab="activeTab"
          :loading-orders="loadingOrders"
          :loading-favorites="loadingFavorites"
          @toggle-drawer="drawer = !drawer"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import ProfileSidebar from "~/components/profiles/ProfileSidebar.vue";
import ProfileContent from "~/components/profiles/ProfileContent.vue";

export default {
  components: {
    ProfileSidebar,
    ProfileContent,
  },
  data() {
    return {
      drawer: true,
      activeTab: "personal",
      loadingOrders: false,
      loadingFavorites: false,
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("order", ["userOrders", "order"]),
  },
  watch: {
    activeTab(newTab) {
      if (newTab === "orders") {
        this.loadUserOrders();
      }
      if (newTab === "wishlist") {
        this.loadFavorites();
      }
    },
  },
  mounted() {
    // console.log(this.currentUser, "currentUser");
    // console.log(this.userOrders, "userOrders");
    // Check if user is authenticated
    if (!this.currentUser) {
      this.$router.push("/login");
    }
  },
  methods: {
    ...mapActions("order", ["fetchUserOrders"]),
    ...mapActions("favorite", ["getFavoritesForEachUser"]),
    async loadUserOrders() {
      this.loadingOrders = true;
      try {
        await this.fetchUserOrders();
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        this.loadingOrders = false;
      }
    },
    async loadFavorites() {
      this.loadingFavorites = true;
      try {
        await this.getFavoritesForEachUser();
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        this.loadingFavorites = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.content-section {
  min-height: 80vh;
}

.profile-content {
  background-color: #fafafa;
  min-height: 100vh;
}

@media (max-width: 960px) {
  .profile-content {
    padding-top: 64px;
  }
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.book-image-container {
  min-width: 60px;
  display: flex;
  align-items: center;
}

.book-image-container .v-img {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
