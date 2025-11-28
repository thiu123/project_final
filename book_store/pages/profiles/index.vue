<template>
  <div class="profile-page">
    <v-container fluid class="pa-0">
      <v-row no-gutters>
        <!-- Left Sidebar -->
        <v-col class="bg-transparent" cols="12" md="3" lg="1">
          <ProfilesProfileSidebar
            v-model:drawer="drawer"
            v-model:activeTab="activeTab"
          />
        </v-col>

        <!-- Main Content -->
        <v-col cols="12" md="9" lg="11">
          <ProfilesProfileContent
            :active-tab="activeTab"
            :loading-orders="loadingOrders"
            :loading-favorites="loadingFavorites"
            :loading-reviews="loadingReviews"
            @toggle-drawer="drawer = !drawer"
            @show-snackbar="showSnackbar"
          />
        </v-col>
      </v-row>
    </v-container>

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      drawer: true,
      activeTab: "personal",
      loadingOrders: false,
      loadingFavorites: false,
      loadingReviews: false,
      snackbar: {
        show: false,
        message: "",
        color: "success",
        timeout: 4000,
      },
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
  watch: {
    activeTab(newTab) {
      this.$router.replace({ query: { tab: newTab } });

      if (newTab === "orders") {
        this.loadUserOrders();
      }
      if (newTab === "favorites") {
        this.loadFavorites();
      }
      if (newTab === "reviews") {
        this.loadUserReviews();
      }
    },
  },
  mounted() {
    // Check if user is authenticated
    if (!this.currentUser) {
      this.$router.push("/login");
    }

    // Handle tab parameter from URL query
    const tabParam = this.$route.query.tab;
    if (tabParam) {
      this.activeTab = tabParam;
    }
  },
  methods: {
    ...mapActions("order", ["fetchUserOrders"]),
    ...mapActions("favorite", ["getFavoritesForEachUser"]),
    ...mapActions("review", ["loadUserReviewsAction"]),

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
    async loadUserReviews() {
      this.loadingReviews = true;
      try {
        await this.loadUserReviewsAction();
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        this.loadingReviews = false;
      }
    },
    showSnackbar(data) {
      console.log("showSnackbar called with:", data);
      this.snackbar.message = data.message;
      this.snackbar.color = data.color || "success";
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.profile-page {
  background: linear-gradient(115deg, #ffffff, #d4dfed);
  min-height: 100vh;
}

@media (max-width: 960px) {
  .profile-page {
    padding-top: 64px;
  }
}
</style>
