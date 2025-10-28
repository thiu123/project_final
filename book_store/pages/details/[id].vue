<template>
  <div class="book-details-page">
    <!-- Loading State -->
    <v-container
      v-if="isLoading"
      class="d-flex justify-center align-center"
      style="min-height: 50vh"
    >
      <div class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="60"
          width="4"
          class="mb-4"
        ></v-progress-circular>
        <p class="text-h6 text-grey-darken-2">Loading book details...</p>
      </div>
    </v-container>

    <!-- Main Content -->
    <v-container v-else class="py-6" fluid>
      <!-- Breadcrumb -->
      <v-breadcrumbs :items="breadcrumbItems" class="px-0 mb-6">
        <template v-slot:divider>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>

      <!-- Book Overview Section -->
      <v-card class="mb-6" elevation="2" rounded="lg">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Book Cover -->
            <v-col cols="12" md="4">
              <div class="text-center">
                <v-img
                  :src="
                    detailsBooks?.cover_url ||
                    '/placeholder.svg?height=400&width=260'
                  "
                  alt="Book Cover"
                  class="rounded-lg mx-auto"
                  max-width="380"
                  height="480"
                  cover
                >
                  <template v-slot:placeholder>
                    <v-skeleton-loader
                      type="image"
                      width="280"
                      height="380"
                    ></v-skeleton-loader>
                  </template>
                </v-img>
              </div>
            </v-col>

            <!-- Book Info -->
            <v-col cols="12" md="8">
              <div class="book-info">
                <!-- Title -->
                <h1 class="text-h4 font-weight-bold mb-4 text-primary">
                  {{ detailsBooks.title }}
                </h1>

                <!-- Author -->
                <div class="d-flex align-center mb-4">
                  <v-icon color="grey-darken-2" class="mr-2"
                    >mdi-account-edit</v-icon
                  >
                  <span class="text-subtitle-1 text-grey-darken-2 mr-2"
                    >by</span
                  >
                  <v-chip color="primary" variant="outlined" size="default">
                    {{ detailsBooks.authors?.[0] }}
                  </v-chip>
                </div>

                <!-- Rating -->
                <div class="d-flex align-center mb-6">
                  <v-rating
                    :model-value="displayRating"
                    color="amber"
                    density="compact"
                    readonly
                    size="small"
                    class="mr-2"
                  ></v-rating>
                  <span class="text-subtitle-1 font-weight-medium mr-1">{{
                    displayRating
                  }}</span>
                  <span class="text-body-2 text-grey-darken-1"
                    >({{ totalReviews }} reviews)</span
                  >
                </div>

                <!-- Price & Stock -->
                <div class="price-section mb-6">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <div>
                      <div class="text-h3 font-weight-bold text-success mb-2">
                        ${{ displayPrice }}
                      </div>
                      <!-- Stock Status -->
                      <div v-if="productType === 'hardbook'">
                        <v-chip
                          v-if="detailsBooks.stock > 20"
                          color="success"
                          size="small"
                          prepend-icon="mdi-check-circle"
                        >
                          In Stock ({{ detailsBooks.stock }} available)
                        </v-chip>
                        <v-chip
                          v-else-if="detailsBooks.stock > 0"
                          color="warning"
                          size="small"
                          prepend-icon="mdi-alert"
                        >
                          Low Stock (Only {{ detailsBooks.stock }} left!)
                        </v-chip>
                        <v-chip
                          v-else
                          color="error"
                          size="small"
                          prepend-icon="mdi-close-circle"
                        >
                          Out of Stock
                        </v-chip>
                      </div>
                      <v-chip
                        v-else
                        color="info"
                        size="small"
                        prepend-icon="mdi-infinity"
                      >
                        Digital Product - Always Available
                      </v-chip>
                    </div>
                    <v-btn
                      :icon="
                        isFavorite(detailsBooks._id)
                          ? 'mdi-heart'
                          : 'mdi-heart-outline'
                      "
                      :color="isFavorite(detailsBooks._id) ? 'red' : 'grey'"
                      variant="outlined"
                      @click="handleToggleFavorites(detailsBooks._id)"
                    ></v-btn>
                  </div>
                </div>

                <!-- Product Type Selection -->
                <div class="product-type-section mb-6">
                  <v-label
                    class="text-subtitle-2 font-weight-medium mb-3 d-block"
                    >Choose Product Type</v-label
                  >
                  <v-radio-group v-model="productType" inline>
                    <v-radio value="hardbook" color="primary">
                      <template v-slot:label>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2" color="primary">mdi-book</v-icon>
                          <div>
                            <span class="font-weight-medium">📚 Hardbook</span>
                            <div class="text-caption text-grey">
                              ${{ detailsBooks.price }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </v-radio>

                    <v-radio value="ebook" color="success" class="ml-4">
                      <template v-slot:label>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2" color="success"
                            >mdi-tablet</v-icon
                          >
                          <div>
                            <span class="font-weight-medium"
                              >📱 Ebook (PDF)</span
                            >

                            <div class="text-caption text-grey">
                              ${{ ebookPrice }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>

                  <!-- Ebook Preview Button -->
                  <v-btn
                    v-if="productType === 'ebook'"
                    :color="hasPurchasedEbook ? 'success' : 'info'"
                    variant="outlined"
                    size="small"
                    class="mt-2"
                    :prepend-icon="
                      hasPurchasedEbook
                        ? 'mdi-check-circle'
                        : 'mdi-book-open-page-variant'
                    "
                    @click="previewEbook"
                  >
                    {{ previewButtonText }}
                  </v-btn>
                </div>

                <!-- Quantity & Actions -->
                <div class="purchase-section">
                  <!-- Quantity -->
                  <div class="mb-4">
                    <v-label class="text-subtitle-2 font-weight-medium mb-2"
                      >Quantity</v-label
                    >
                    <div class="d-flex align-center" style="max-width: 200px">
                      <v-btn
                        icon="mdi-minus"
                        variant="outlined"
                        size="small"
                        @click="quantity > 1 ? quantity-- : 1"
                        :disabled="quantity <= 1 || isOutOfStock"
                      ></v-btn>
                      <v-text-field
                        v-model="quantity"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mx-2"
                        style="max-width: 80px"
                        min="1"
                        :max="maxQuantity"
                        :disabled="isOutOfStock"
                      ></v-text-field>
                      <v-btn
                        icon="mdi-plus"
                        variant="outlined"
                        size="small"
                        @click="quantity++"
                        :disabled="quantity >= maxQuantity || isOutOfStock"
                      ></v-btn>
                    </div>
                    <div
                      v-if="
                        productType === 'hardbook' &&
                        detailsBooks.stock > 0 &&
                        detailsBooks.stock < 10
                      "
                      class="text-caption text-warning mt-1"
                    >
                      Maximum {{ detailsBooks.stock }} items available
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex flex-column flex-sm-row ga-3">
                    <v-btn
                      color="primary"
                      variant="flat"
                      size="large"
                      class="flex-grow-1"
                      prepend-icon="mdi-cart-plus"
                      @click="handleAddToCart(detailsBooks._id, quantity)"
                      :disabled="isOutOfStock"
                    >
                      {{ isOutOfStock ? "Out of Stock" : "Add to Cart" }}
                    </v-btn>
                    <v-btn
                      color="success"
                      variant="flat"
                      size="large"
                      class="flex-grow-1"
                      prepend-icon="mdi-lightning-bolt"
                      :disabled="isOutOfStock"
                    >
                      Buy Now
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row>
        <!-- Book Details -->
        <v-col cols="12" md="6">
          <v-card elevation="2" rounded="lg" height="100%">
            <v-card-title class="bg-primary text-white">
              <v-icon class="mr-2">mdi-book-information-variant</v-icon>
              Book Details
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>Book ID</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ detailsBooks.key?.split("/").pop() || "8935250707640" }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account-edit</v-icon>
                  </template>
                  <v-list-item-title>Author</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ detailsBooks.authors?.[0] }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Publication Year</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ detailsBooks.first_publish_year }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Customer Reviews -->
        <v-col cols="12" md="6">
          <v-card elevation="2" rounded="lg" height="100%">
            <v-card-title class="bg-amber text-white">
              <v-icon class="mr-2">mdi-star</v-icon>
              Customer Reviews
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-center mb-4">
                <div class="text-h3 font-weight-bold text-amber mb-2">
                  4.0<span class="text-h5 text-grey-darken-1">/5</span>
                </div>
                <v-rating
                  :model-value="4"
                  color="amber"
                  readonly
                  size="small"
                  class="mb-2"
                ></v-rating>
                <div class="text-body-2 text-grey-darken-1">
                  Based on 24 reviews
                </div>
              </div>

              <!-- Rating Breakdown -->
              <div class="rating-breakdown mb-4">
                <div
                  class="d-flex align-center mb-1"
                  v-for="(rating, index) in ratingBreakdown"
                  :key="index"
                >
                  <span class="text-caption mr-2" style="min-width: 15px">{{
                    5 - index
                  }}</span>
                  <v-icon color="amber" size="x-small" class="mr-2"
                    >mdi-star</v-icon
                  >
                  <v-progress-linear
                    :model-value="rating.percentage"
                    color="amber"
                    height="6"
                    rounded
                    class="flex-grow-1 mr-2"
                  ></v-progress-linear>
                  <span class="text-caption" style="min-width: 25px"
                    >({{ rating.count }})</span
                  >
                </div>
              </div>

              <div class="text-center">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-pencil"
                  @click="$router.push(`/reviews/${detailsBooks._id}`)"
                >
                  Write Review
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Description -->
      <v-card
        v-if="detailsBooks.description"
        class="mt-6"
        elevation="2"
        rounded="lg"
      >
        <v-card-title class="bg-secondary text-white">
          <v-icon class="mr-2">mdi-text-box</v-icon>
          Description
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1 line-height-1-6">
            {{
              typeof detailsBooks.description === "object"
                ? detailsBooks.description.value
                : detailsBooks.description
            }}
          </p>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Snackbar -->
    <SnackbarAlert
      v-model="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
</template>

<script>
import axios from "axios";
import { mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      detailsBooks: {},
      isLoading: false,
      quantity: 1,
      productType: "hardbook", // Mặc định chọn hardbook
      authors: [],
      showSnackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: [
        { percentage: 70, count: 12 },
        { percentage: 20, count: 5 },
        { percentage: 8, count: 2 },
        { percentage: 2, count: 1 },
        { percentage: 0, count: 0 },
      ],
    };
  },
  computed: {
    ...mapState("favorite", ["favorites"]),
    ...mapState("auth", ["currentUser"]),
    ...mapState("order", ["purchasedEbooks"]),

    breadcrumbItems() {
      return [
        { title: "Home", disabled: false, href: "/" },
        { title: this.detailsBooks.title || "Book Details", disabled: true },
      ];
    },
    // Hiển thị rating: nếu có review thì dùng average, không thì dùng rating mặc định từ database
    displayRating() {
      if (this.totalReviews > 0) {
        return this.averageRating;
      }
      return this.detailsBooks.rating || 0;
    },
    // Tính giá ebook (70% của giá hardbook)
    ebookPrice() {
      const price = this.detailsBooks.price || 120;
      return (price * 0.7).toFixed(2);
    },
    // Giá hiển thị dựa vào productType
    displayPrice() {
      return this.productType === "ebook"
        ? this.ebookPrice
        : this.detailsBooks.price || "120.00";
    },
    // ✅ Lấy purchase status từ store
    hasPurchasedEbook() {
      return this.purchasedEbooks[this.detailsBooks._id] || false;
    },
    // Text cho preview button
    previewButtonText() {
      return this.hasPurchasedEbook
        ? "Preview full"
        : "Preview (20 pages free)";
    },
    // Stock management
    isOutOfStock() {
      return this.productType === "hardbook" && this.detailsBooks.stock === 0;
    },
    maxQuantity() {
      if (this.productType === "ebook") {
        return 10; // Ebook không giới hạn stock
      }
      // Hardbook: giới hạn theo stock hoặc max 10
      return Math.min(this.detailsBooks.stock || 0, 10);
    },
  },
  watch: {
    productType() {
      // Adjust quantity when switching product type
      if (this.quantity > this.maxQuantity) {
        this.quantity = this.maxQuantity;
      }
    },
  },
  methods: {
    ...mapActions("cart", ["addToCart"]),
    ...mapActions("order", ["fetchUserOrders", "checkEbookPurchase"]),
    ...mapActions("favorite", ["toggleFavorites"]),
    async getAverageRating(bookId) {
      try {
        const { getAverageRating } = await import("~/api/reviewApi");
        const response = await getAverageRating(bookId);
        this.averageRating = response.data.averageRating;
        this.totalReviews = response.data.totalReviews;
      } catch (error) {
        console.error("Error fetching average rating:", error);
        this.averageRating = 0;
        this.totalReviews = 0;
      }
    },
    async getDetailsBooks() {
      try {
        this.isLoading = true;
        const bookId = this.$route.params.id;
        console.log("Book ID:", bookId);

        if (!bookId) {
          throw new Error("Invalid book ID");
        }

        const response = await axios.get(
          `http://localhost:5000/api/books/${bookId}`
        );
        this.detailsBooks = response.data;

        // Lấy average rating từ reviews
        await this.getAverageRating(bookId);

        // ✅ Check nếu user đã mua ebook này (dùng store action)
        if (this.currentUser) {
          await this.checkEbookPurchase(bookId);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async getOrderOfUser() {
      try {
        await this.fetchUserOrders();
      } catch (error) {
        console.error("Error fetching user orders:", error);
      }
    },
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    async handleAddToCart(bookId, quantity) {
      try {
        await this.addToCart({
          bookId,
          quantity,
          productType: this.productType,
        });

        const typeName = this.productType === "ebook" ? "Ebook" : "Hardbook";
        this.snackbarText = `${typeName} added to cart successfully!`;
        this.showSnackbar = true;
        this.snackbarColor = "success";
      } catch (error) {
        console.error("Error adding to cart:", error);
        this.snackbarText = "Failed to add to cart.";
        this.showSnackbar = true;
        this.snackbarColor = "error";
      }
    },

    // Preview ebook - đến trang reader (xem 20 trang)
    previewEbook() {
      this.$router.push({
        path: "/reader",
        query: { bookId: this.detailsBooks._id },
      });
    },

    async handleToggleFavorites(bookId) {
      try {
        await this.toggleFavorites(bookId);
        this.snackbarText = this.isFavorite(bookId)
          ? "Added to favorites!"
          : "Removed from favorites!";
        this.showSnackbar = true;
        this.snackbarColor = "success";
      } catch (error) {
        console.error("Error toggling favorites:", error);
        this.snackbarText = "Failed to update favorites.";
        this.showSnackbar = true;
        this.snackbarColor = "error";
      }
    },
    isFavorite(bookId) {
      return this.favorites.some((favorite) => {
        // Handle case where bookId is populated (contains full book object)
        const favoriteBookId = favorite.bookId?._id || favorite.bookId;
        return favoriteBookId === bookId;
      });
    },
  },
  async mounted() {
    await this.getDetailsBooks();
    await this.getOrderOfUser();
  },
};
</script>

<style scoped>
.book-details-page {
  background-color: #fafafa;
  min-height: 100vh;
}

.line-height-1-6 {
  line-height: 1.6;
}

.price-section {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.purchase-section {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.product-type-section {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

:deep(.v-rating .v-icon) {
  padding: 0;
}

:deep(.v-radio-group .v-selection-control) {
  margin-right: 0;
}

:deep(.v-radio .v-label) {
  opacity: 1 !important;
}
</style>
