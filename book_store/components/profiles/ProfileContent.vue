<template>
  <div class="profile-content">
    <!-- Mobile Header -->
    <v-app-bar
      v-if="$vuetify.display.smAndDown"
      color="white"
      elevation="1"
      density="compact"
      class="border-b border-grey-lighten-3"
    >
      <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h6 font-weight-bold text-customblack"
        >My Profile</v-toolbar-title
      >
    </v-app-bar>

    <v-container class="pa-6">
      <!-- Personal Info Section -->
      <div v-if="activeTab === 'personal'" class="content-section">
        <div class="d-flex align-center mb-6">
          <v-icon
            icon="mdi-account-circle"
            size="32"
            color="waterblue"
            class="mr-3"
          ></v-icon>
          <h2 class="text-h4 font-weight-bold text-customblack">
            Personal Information
          </h2>
        </div>

        <v-card
          elevation="4"
          class="rounded-xl overflow-hidden"
          style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
        >
          <v-card-text class="pa-8">
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="currentUser?.username || ''"
                    label="First Name"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="waterblue"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="currentUser?.email || ''"
                    label="Email"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="waterblue"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn
                color="waterblue"
                size="large"
                class="mt-4 font-weight-bold text-white"
                rounded="lg"
                elevation="2"
                hover
              >
                <v-icon start class="mr-2">mdi-content-save</v-icon>
                Update Information
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </div>

      <!-- Orders Section -->
      <div v-if="activeTab === 'orders'" class="content-section">
        <div class="d-flex align-center mb-6">
          <v-icon
            icon="mdi-package-variant"
            size="32"
            color="waterblue"
            class="mr-3"
          ></v-icon>
          <h2 class="text-h4 font-weight-bold text-customblack">
            Order History
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="loadingOrders" class="text-center pa-12">
          <v-progress-circular
            indeterminate
            color="waterblue"
            size="64"
          ></v-progress-circular>
          <p class="mt-6 text-body-1 text-grey-darken-1">Loading orders...</p>
        </div>

        <!-- Orders List -->
        <div v-else-if="userOrdersPaid && userOrdersPaid.length > 0">
          <v-card
            v-for="order in userOrdersPaid"
            :key="order._id"
            elevation="3"
            class="mb-6 rounded-xl overflow-hidden transition-all duration-300 hover:elevation-6"
            style="
              background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            "
          >
            <v-card-text class="pa-8">
              <div class="d-flex justify-space-between align-center mb-6">
                <div>
                  <h3 class="text-h5 font-weight-bold text-customblack mb-2">
                    Order #{{ order.orderId }}
                  </h3>
                  <p class="text-body-2 text-grey-darken-1">
                    <v-icon icon="mdi-calendar" size="16" class="mr-1"></v-icon>
                    {{ new Date(order.createdAt).toLocaleDateString() }}
                  </p>
                </div>
                <v-chip
                  :color="getStatusColor(order.status)"
                  variant="flat"
                  size="large"
                  class="font-weight-bold"
                >
                  <v-icon start size="16" class="mr-1">{{
                    getStatusIcon(order.status)
                  }}</v-icon>
                  {{ order.status || "Pending" }}
                </v-chip>
              </div>

              <v-divider class="mb-6"></v-divider>

              <div
                v-for="item in order.items"
                :key="item._id"
                class="d-flex align-center mb-4 p-4 rounded-lg"
                style="background: rgba(82, 149, 208, 0.05)"
              >
                <div class="book-image-container mr-4">
                  <v-img
                    :src="
                      item.bookId?.cover_url ||
                      'https://via.placeholder.com/60x80'
                    "
                    width="60"
                    height="80"
                    class="rounded-lg elevation-2"
                    cover
                    :aspect-ratio="3 / 4"
                  ></v-img>
                </div>
                <div class="flex-grow-1">
                  <h4
                    class="text-subtitle-1 font-weight-bold text-customblack mb-1"
                  >
                    {{ item.bookId?.title || "Unknown Book" }}
                  </h4>
                  <p class="text-body-2 text-grey-darken-1">
                    Quantity: {{ item.quantity }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-h6 font-weight-bold text-waterblue">
                    ${{ (item.bookId?.price * item.quantity).toFixed(2) }}
                  </p>
                </div>
              </div>

              <v-divider class="my-6"></v-divider>

              <div class="d-flex justify-space-between align-center">
                <v-btn
                  variant="outlined"
                  color="waterblue"
                  size="large"
                  rounded="lg"
                  :to="`/order/status/${order.orderId}`"
                  class="font-weight-bold"
                >
                  <v-icon start class="mr-2">mdi-eye</v-icon>
                  View Details
                </v-btn>
                <div class="text-right">
                  <p class="text-caption text-grey-darken-1 mb-1">
                    Total Amount
                  </p>
                  <p class="text-h5 font-weight-bold text-customblack">
                    ${{ (order.total / 24).toFixed(2) }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Orders Message -->
        <div v-else class="text-center pa-12">
          <v-icon size="80" color="grey-lighten-2" class="mb-6"
            >mdi-package-variant</v-icon
          >
          <h3 class="text-h5 font-weight-bold text-customblack mb-3">
            No orders yet
          </h3>
          <p class="text-body-1 text-grey-darken-1 mb-6 max-width-400 mx-auto">
            You haven't placed any orders yet. Start shopping to see your order
            history here.
          </p>
          <v-btn
            color="waterblue"
            variant="elevated"
            size="large"
            rounded="lg"
            to="/"
            class="font-weight-bold text-white"
          >
            <v-icon start class="mr-2">mdi-shopping</v-icon>
            Start Shopping
          </v-btn>
        </div>
      </div>

      <!-- Wishlist Section -->
      <div v-if="activeTab === 'wishlist'" class="content-section">
        <div class="d-flex align-center mb-6">
          <v-icon
            icon="mdi-heart"
            size="32"
            color="waterblue"
            class="mr-3"
          ></v-icon>
          <h2 class="text-h4 font-weight-bold text-customblack">My Wishlist</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loadingFavorites" class="text-center pa-12">
          <v-progress-circular
            indeterminate
            color="waterblue"
            size="64"
          ></v-progress-circular>
          <p class="mt-6 text-body-1 text-grey-darken-1">
            Loading favorites...
          </p>
        </div>

        <!-- Favorites List -->
        <div v-else-if="favorites && favorites.length > 0">
          <v-row>
            <v-col
              v-for="favorite in favorites"
              :key="favorite._id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                elevation="3"
                class="h-100 rounded-xl overflow-hidden transition-all duration-300 hover:elevation-6"
                style="
                  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                "
              >
                <v-img
                  :src="
                    favorite.bookId?.cover_url ||
                    'https://via.placeholder.com/200x300'
                  "
                  height="200"
                  cover
                  class="book-cover"
                ></v-img>
                <v-card-text class="pa-6">
                  <h4
                    class="text-subtitle-1 font-weight-bold text-customblack mb-2 text-truncate"
                  >
                    {{ favorite.bookId?.title || "Unknown Book" }}
                  </h4>
                  <p class="text-body-2 text-grey-darken-1 mb-3">
                    by {{ favorite.bookId?.author || "Unknown Author" }}
                  </p>
                  <p class="text-h6 font-weight-bold text-waterblue mb-4">
                    ${{ favorite.bookId?.price?.toFixed(2) || "0.00" }}
                  </p>
                </v-card-text>
                <v-card-actions class="pa-6 pt-0">
                  <v-btn
                    color="waterblue"
                    variant="flat"
                    size="large"
                    block
                    rounded="lg"
                    :to="`/details/${favorite.bookId?._id}`"
                    class="font-weight-bold text-white mb-3"
                  >
                    <v-icon start class="mr-2">mdi-eye</v-icon>
                    View Details
                  </v-btn>
                  <v-btn
                    icon="mdi-heart"
                    color="red"
                    variant="text"
                    size="large"
                    @click="removeFromFavorites(favorite.bookId?._id)"
                    class="transition-all duration-300 hover:scale-110"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- No Favorites Message -->
        <div v-else class="text-center pa-12">
          <v-icon size="80" color="grey-lighten-2" class="mb-6"
            >mdi-heart</v-icon
          >
          <h3 class="text-h5 font-weight-bold text-customblack mb-3">
            No favorites yet
          </h3>
          <p class="text-body-1 text-grey-darken-1 mb-6 max-width-400 mx-auto">
            You haven't added any books to your wishlist yet. Start exploring to
            find your favorite books!
          </p>
          <v-btn
            color="waterblue"
            variant="elevated"
            size="large"
            rounded="lg"
            to="/"
            class="font-weight-bold text-white"
          >
            <v-icon start class="mr-2">mdi-magnify</v-icon>
            Browse Books
          </v-btn>
        </div>
      </div>

      <!-- Reviews Section -->
      <div v-if="activeTab === 'reviews'" class="content-section">
        <div class="d-flex align-center mb-6">
          <v-icon
            icon="mdi-star"
            size="32"
            color="waterblue"
            class="mr-3"
          ></v-icon>
          <h2 class="text-h4 font-weight-bold text-customblack">My Reviews</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loadingReviews" class="text-center pa-12">
          <v-progress-circular
            indeterminate
            color="waterblue"
            size="64"
          ></v-progress-circular>
          <p class="mt-6 text-body-1 text-grey-darken-1">Loading reviews...</p>
        </div>

        <!-- Reviews List -->
        <div v-else-if="userReviews && userReviews.length > 0">
          <v-card
            v-for="review in userReviews"
            :key="review._id"
            elevation="3"
            class="mb-6 rounded-xl overflow-hidden transition-all duration-300 hover:elevation-6"
            style="
              background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            "
          >
            <v-card-text class="pa-8">
              <div class="d-flex align-start mb-6">
                <div class="flex-shrink-0 mr-6">
                  <v-img
                    :src="
                      review?.bookId?.cover_url ||
                      'https://via.placeholder.com/80x120'
                    "
                    width="80"
                    height="120"
                    class="rounded-lg elevation-3 transition-transform hover:scale-105"
                    cover
                    :aspect-ratio="2 / 3"
                  >
                    <template v-slot:placeholder>
                      <div
                        class="d-flex align-center justify-center fill-height bg-grey-lighten-3"
                      >
                        <v-icon color="grey-lighten-1" size="24"
                          >mdi-book-open-variant</v-icon
                        >
                      </div>
                    </template>
                  </v-img>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-space-between align-start mb-3">
                    <div>
                      <h3
                        class="text-h5 font-weight-bold text-customblack mb-2"
                      >
                        {{ review.bookId?.title || "Unknown Book" }}
                      </h3>
                      <p class="text-body-2 text-grey-darken-1 mb-3">
                        by
                        {{
                          review.bookId?.authors?.join(", ") || "Unknown Author"
                        }}
                      </p>
                    </div>
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      size="large"
                      @click="
                        confirmDeleteReview(review._id, review.bookId?.title)
                      "
                      class="transition-all duration-300 hover:scale-110"
                    >
                      <v-icon>mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Delete Review
                      </v-tooltip>
                    </v-btn>
                  </div>

                  <div class="d-flex align-center mb-4">
                    <v-rating
                      :model-value="review.rating"
                      readonly
                      size="small"
                      color="amber"
                      density="compact"
                    ></v-rating>
                    <span class="text-caption text-grey-darken-1 ml-3">
                      <v-icon
                        icon="mdi-calendar"
                        size="14"
                        class="mr-1"
                      ></v-icon>
                      {{ new Date(review.createdAt).toLocaleDateString() }}
                    </span>
                  </div>
                </div>
              </div>

              <v-divider class="mb-6"></v-divider>

              <div
                class="bg-grey-lighten-5 pa-6 rounded-xl border-l-4 border-waterblue"
              >
                <p class="text-body-1 mb-0 text-customblack">
                  {{ review.comment }}
                </p>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Reviews Message -->
        <div v-else class="text-center pa-12">
          <v-icon size="80" color="grey-lighten-2" class="mb-6"
            >mdi-star-outline</v-icon
          >
          <h3 class="text-h5 font-weight-bold text-customblack mb-3">
            No reviews yet
          </h3>
          <p class="text-body-1 text-grey-darken-1 mb-6 max-width-400 mx-auto">
            You haven't written any reviews yet. Start reading and share your
            thoughts!
          </p>
          <v-btn
            color="waterblue"
            variant="elevated"
            size="large"
            rounded="lg"
            to="/"
            class="font-weight-bold text-white"
          >
            <v-icon start class="mr-2">mdi-magnify</v-icon>
            Browse Books
          </v-btn>
        </div>
      </div>

      <!-- Change Password Section -->
      <div v-if="activeTab === 'password'" class="content-section">
        <div class="d-flex align-center mb-6">
          <v-icon
            icon="mdi-lock"
            size="32"
            color="waterblue"
            class="mr-3"
          ></v-icon>
          <h2 class="text-h4 font-weight-bold text-customblack">
            Change Password
          </h2>
        </div>

        <v-card
          elevation="4"
          class="rounded-xl overflow-hidden"
          style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
        >
          <v-card-text class="pa-8">
            <v-form ref="passwordForm" v-model="passwordFormValid">
              <v-text-field
                v-model="passwordForm.current"
                label="Current Password"
                type="password"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="waterblue"
                class="mb-6"
                :rules="[(v) => !!v || 'Current password is required']"
                required
              ></v-text-field>

              <v-text-field
                v-model="passwordForm.new"
                label="New Password"
                type="password"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="waterblue"
                class="mb-6"
                :rules="[
                  (v) => !!v || 'New password is required',
                  (v) =>
                    v.length >= 6 || 'Password must be at least 6 characters',
                ]"
                required
              ></v-text-field>

              <v-text-field
                v-model="passwordForm.confirm"
                label="Confirm New Password"
                type="password"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="waterblue"
                class="mb-6"
                :rules="[
                  (v) => !!v || 'Please confirm your password',
                  (v) => v === passwordForm.new || 'Passwords do not match',
                ]"
                required
              ></v-text-field>

              <v-btn
                color="waterblue"
                size="large"
                rounded="lg"
                class="font-weight-bold text-white"
                elevation="2"
                :loading="changingPassword"
                :disabled="!passwordFormValid"
                @click="updatePassword"
              >
                <v-icon start class="mr-2">mdi-lock-reset</v-icon>
                Update Password
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "ProfileContent",
  props: {
    activeTab: {
      type: String,
      default: "personal",
    },
    loadingOrders: {
      type: Boolean,
      default: false,
    },
    loadingFavorites: {
      type: Boolean,
      default: false,
    },
    loadingReviews: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["toggle-drawer", "show-snackbar"],
  data() {
    return {
      passwordForm: {
        current: "",
        new: "",
        confirm: "",
      },
      passwordFormValid: false,
      changingPassword: false,
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("order", ["userOrders"]),
    ...mapState("favorite", ["favorites"]),
    ...mapState("review", ["userReviews"]),
    userOrdersPaid() {
      return this.userOrders.filter((order) => order.status === "Paid");
    },
  },
  mounted() {
    console.log(this.userOrdersPaid, "czxczxcxz");
  },
  methods: {
    ...mapActions("favorite", ["toggleFavorites"]),
    ...mapActions("review", ["deleteReview"]),
    ...mapActions("auth", ["changePassword"]),
    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case "paid":
          return "success";
        case "pending":
          return "warning";
        case "processing":
          return "info";
        case "failed":
          return "error";
        default:
          return "grey";
      }
    },
    getStatusIcon(status) {
      switch (status?.toLowerCase()) {
        case "paid":
          return "mdi-check-circle";
        case "pending":
          return "mdi-clock";
        case "processing":
          return "mdi-cog";
        case "failed":
          return "mdi-close-circle";
        default:
          return "mdi-help-circle";
      }
    },
    removeFromFavorites(bookId) {
      this.toggleFavorites(bookId);
    },
    confirmDeleteReview(reviewId, bookTitle) {
      if (
        confirm(
          `Are you sure you want to delete your review for "${bookTitle}"? This action cannot be undone.`
        )
      ) {
        this.deleteReview(reviewId);
      }
    },
    async updatePassword() {
      console.log("updatePassword called");
      try {
        // Validate form
        const { valid } = await this.$refs.passwordForm.validate();
        console.log("Form validation result:", valid);
        if (!valid) return;

        this.changingPassword = true;
        console.log("Starting password change...");

        const result = await this.changePassword({
          currentPassword: this.passwordForm.current,
          newPassword: this.passwordForm.new,
        });
        console.log("Password change result:", result);

        // Show success message
        console.log("Emitting success snackbar");
        this.$emit("show-snackbar", {
          message: "Password updated successfully!",
          color: "success",
        });

        // Reset form
        this.passwordForm = {
          current: "",
          new: "",
          confirm: "",
        };
        this.$refs.passwordForm.reset();
      } catch (error) {
        console.error("Error changing password:", error);

        // Show error message
        console.log("Emitting error snackbar");
        this.$emit("show-snackbar", {
          message:
            error.message ||
            error.msg ||
            "Failed to update password. Please try again.",
          color: "error",
        });
      } finally {
        this.changingPassword = false;
      }
    },
  },
};
</script>

<style scoped>
.content-section {
  min-height: 80vh;
}

.profile-content {
  background: linear-gradient(115deg, #ffffff, #d4dfed);
  min-height: 100vh;
}

@media (max-width: 960px) {
  .profile-content {
    padding-top: 64px;
  }
}

.transition-all {
  transition: all 0.3s ease;
}

.duration-300 {
  transition-duration: 300ms;
}

.hover\:elevation-6:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:scale-110:hover {
  transform: scale(1.1);
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

.max-width-400 {
  max-width: 400px;
}

.transition-transform {
  transition: transform 0.3s ease;
}
</style>
