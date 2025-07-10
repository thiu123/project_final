<template>
  <div class="profile-content">
    <!-- Mobile Header -->
    <v-app-bar
      v-if="$vuetify.display.smAndDown"
      color="white"
      elevation="1"
      density="compact"
    >
      <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h6">My Profile</v-toolbar-title>
    </v-app-bar>

    <v-container class="pa-6">
      <!-- Personal Info Section -->
      <div v-if="activeTab === 'personal'" class="content-section">
        <h2 class="text-h4 mb-6 font-weight-bold">Personal Information</h2>

        <v-card elevation="2" class="mb-6">
          <v-card-text class="pa-6">
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="currentUser?.username || ''"
                    label="First Name"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="currentUser?.email || ''"
                    label="Email"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn color="primary" size="large" class="mt-4">
                Update Information
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </div>

      <!-- Orders Section -->
      <div v-if="activeTab === 'orders'" class="content-section">
        <h2 class="text-h4 mb-6 font-weight-bold">Order History</h2>

        <!-- Loading State -->
        <div v-if="loadingOrders" class="text-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <p class="mt-4">Loading orders...</p>
        </div>

        <!-- Orders List -->
        <div v-else-if="userOrders && userOrders.length > 0">
          <v-card
            v-for="order in userOrders"
            :key="order._id"
            elevation="2"
            class="mb-4"
          >
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <div>
                  <h3 class="text-h6 font-weight-bold">
                    Order #{{ order.orderId }}
                  </h3>
                  <p class="text-body-2 text-grey-darken-1">
                    {{ new Date(order.createdAt).toLocaleDateString() }}
                  </p>
                </div>
                <v-chip
                  :color="getStatusColor(order.status)"
                  variant="flat"
                  size="small"
                >
                  {{ order.status || "Pending" }}
                </v-chip>
              </div>

              <v-divider class="mb-4"></v-divider>

              <div
                v-for="item in order.items"
                :key="item._id"
                class="d-flex mb-3"
              >
                <div class="book-image-container mr-4">
                  <v-img
                    :src="
                      item.bookId?.cover_url ||
                      'https://via.placeholder.com/60x80'
                    "
                    width="60"
                    height="80"
                    class="rounded"
                    cover
                    :aspect-ratio="3 / 4"
                  ></v-img>
                </div>
                <div class="flex-grow-1">
                  <h4 class="text-subtitle-1 font-weight-medium">
                    {{ item.bookId?.title || "Unknown Book" }}
                  </h4>
                  <p class="text-body-2 text-grey-darken-1">
                    Quantity: {{ item.quantity }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-h6 font-weight-bold">
                    ${{ (item.bookId?.price * item.quantity).toFixed(2) }}
                  </p>
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <div class="d-flex justify-space-between align-center">
                <v-btn
                  variant="outlined"
                  size="small"
                  :to="`/order/status/${order.orderId}`"
                >
                  View Details
                </v-btn>
                <p class="text-h6 font-weight-bold">
                  Total: ${{ (order.total / 24).toFixed(2) }}
                </p>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Orders Message -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-package-variant</v-icon
          >
          <h3 class="text-h6 mb-2">No orders yet</h3>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            You haven't placed any orders yet. Start shopping to see your order
            history here.
          </p>
          <v-btn color="primary" variant="elevated" to="/">
            Start Shopping
          </v-btn>
        </div>
      </div>

      <!-- Wishlist Section -->
      <div v-if="activeTab === 'wishlist'" class="content-section">
        <h2 class="text-h4 mb-6 font-weight-bold">My Wishlist</h2>

        <!-- Loading State -->
        <div v-if="loadingFavorites" class="text-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <p class="mt-4">Loading favorites...</p>
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
              <v-card elevation="2" class="h-100">
                <v-img
                  :src="
                    favorite.bookId?.cover_url ||
                    'https://via.placeholder.com/200x300'
                  "
                  height="200"
                  cover
                  class="book-cover"
                ></v-img>
                <v-card-text class="pa-4">
                  <h4
                    class="text-subtitle-1 font-weight-bold mb-2 text-truncate"
                  >
                    {{ favorite.bookId?.title || "Unknown Book" }}
                  </h4>
                  <p class="text-body-2 text-grey-darken-1 mb-2">
                    by {{ favorite.bookId?.author || "Unknown Author" }}
                  </p>
                  <p class="text-h6 font-weight-bold text-primary">
                    ${{ favorite.bookId?.price?.toFixed(2) || "0.00" }}
                  </p>
                </v-card-text>
                <v-card-actions class="pa-4 pt-0">
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="small"
                    block
                    :to="`/details/${favorite.bookId?._id}`"
                  >
                    View Details
                  </v-btn>
                  <v-btn
                    icon="mdi-heart"
                    color="red"
                    variant="text"
                    size="small"
                    @click="removeFromFavorites(favorite.bookId?._id)"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- No Favorites Message -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-heart</v-icon
          >
          <h3 class="text-h6 mb-2">No favorites yet</h3>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            You haven't added any books to your wishlist yet. Start exploring to
            find your favorite books!
          </p>
          <v-btn color="primary" variant="elevated" to="/">
            Browse Books
          </v-btn>
        </div>
      </div>

      <!-- Reviews Section -->
      <div v-if="activeTab === 'reviews'" class="content-section">
        <h2 class="text-h4 mb-6 font-weight-bold">My Reviews</h2>

        <!-- Loading State -->
        <div v-if="loadingReviews" class="text-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <p class="mt-4">Loading reviews...</p>
        </div>

        <!-- Reviews List -->
        <div v-else-if="userReviews && userReviews.length > 0">
          <v-card
            v-for="review in userReviews"
            :key="review._id"
            elevation="2"
            class="mb-4"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-start mb-4">
                <div class="flex-shrink-0 mr-4">
                  <v-img
                    :src="
                      review?.bookId?.cover_url ||
                      'https://via.placeholder.com/80x120'
                    "
                    width="80"
                    height="120"
                    class="rounded-lg elevation-3 transition-transform"
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
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div>
                      <h3 class="text-h6 font-weight-bold mb-1">
                        {{ review.bookId?.title || "Unknown Book" }}
                      </h3>
                      <p class="text-body-2 text-grey-darken-1 mb-2">
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
                      size="small"
                      @click="
                        confirmDeleteReview(review._id, review.bookId?.title)
                      "
                    >
                      <v-icon>mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Delete Review
                      </v-tooltip>
                    </v-btn>
                  </div>

                  <div class="d-flex align-center mb-3">
                    <v-rating
                      :model-value="review.rating"
                      readonly
                      size="small"
                      color="amber"
                      density="compact"
                    ></v-rating>
                    <span class="text-caption text-grey-darken-1 ml-2">
                      {{ new Date(review.createdAt).toLocaleDateString() }}
                    </span>
                  </div>
                </div>
              </div>

              <v-divider class="mb-4"></v-divider>

              <div
                class="bg-grey-lighten-5 pa-4 rounded-lg border-l-4 border-primary"
              >
                <p class="text-body-1 mb-0">{{ review.comment }}</p>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Reviews Message -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-star-outline</v-icon
          >
          <h3 class="text-h6 mb-2">No reviews yet</h3>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            You haven't written any reviews yet. Start reading and share your
            thoughts!
          </p>
          <v-btn color="primary" variant="elevated" to="/">
            Browse Books
          </v-btn>
        </div>
      </div>

      <!-- Change Password Section -->
      <div v-if="activeTab === 'password'" class="content-section">
        <h2 class="text-h4 mb-6 font-weight-bold">Change Password</h2>

        <v-card elevation="2" class="mb-6">
          <v-card-text class="pa-6">
            <v-form>
              <v-text-field
                v-model="passwordForm.current"
                label="Current Password"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="passwordForm.new"
                label="New Password"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="passwordForm.confirm"
                label="Confirm New Password"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              ></v-text-field>

              <v-btn color="primary" size="large"> Update Password </v-btn>
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
  emits: ["toggle-drawer"],
  data() {
    return {
      passwordForm: {
        current: "",
        new: "",
        confirm: "",
      },
    };
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("order", ["userOrders"]),
    ...mapState("favorite", ["favorites"]),
    ...mapState("review", ["userReviews"]),
  },
  methods: {
    ...mapActions("favorite", ["toggleFavorites"]),
    ...mapActions("review", ["deleteReview"]),
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
  },
};
</script>

<style scoped>
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
