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

        <v-card
          v-for="review in reviews"
          :key="review.id"
          elevation="2"
          class="mb-4"
        >
          <v-card-text class="pa-6">
            <div class="d-flex mb-4">
              <v-img
                :src="review.bookImage"
                width="60"
                height="80"
                class="rounded mr-4"
              ></v-img>
              <div class="flex-grow-1">
                <h3 class="text-h6 font-weight-bold">
                  {{ review.bookTitle }}
                </h3>
                <p class="text-body-2 text-grey-darken-1">
                  by {{ review.bookAuthor }}
                </p>
                <div class="d-flex align-center mt-2">
                  <v-rating
                    v-model="review.rating"
                    readonly
                    size="small"
                    color="amber"
                  ></v-rating>
                  <span class="text-body-2 ml-2">{{ review.date }}</span>
                </div>
              </div>
            </div>

            <p class="text-body-1">{{ review.comment }}</p>

            <div class="mt-4">
              <v-btn variant="outlined" size="small" class="mr-2">Edit</v-btn>
              <v-btn variant="outlined" color="error" size="small"
                >Delete</v-btn
              >
            </div>
          </v-card-text>
        </v-card>
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
  },
  emits: ["toggle-drawer"],
  data() {
    return {
      reviews: [
        {
          id: 1,
          bookTitle: "The Great Gatsby",
          bookAuthor: "F. Scott Fitzgerald",
          bookImage:
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop",
          rating: 5,
          date: "March 20, 2024",
          comment:
            "An absolutely brilliant masterpiece! Fitzgerald's writing is poetic and the story is both tragic and beautiful. The symbolism and themes are incredibly deep and thought-provoking.",
        },
        {
          id: 2,
          bookTitle: "To Kill a Mockingbird",
          bookAuthor: "Harper Lee",
          bookImage:
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop",
          rating: 4,
          date: "March 18, 2024",
          comment:
            "A powerful and important book that deals with serious themes of racism and moral growth. Scout is a wonderful narrator and the story is both heartbreaking and inspiring.",
        },
        {
          id: 3,
          bookTitle: "1984",
          bookAuthor: "George Orwell",
          bookImage:
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop",
          rating: 5,
          date: "March 12, 2024",
          comment:
            "Chilling and prophetic. Orwell's vision of a dystopian future feels more relevant than ever. The concepts of Big Brother and thoughtcrime are terrifyingly plausible.",
        },
      ],
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
  },
  methods: {
    ...mapActions("favorite", ["toggleFavorites"]),
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
