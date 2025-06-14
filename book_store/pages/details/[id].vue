<template>
  <!-- Main content area -->
  <v-container class="py-6" v-if="!isLoading">
    <!-- Breadcrumb -->
    <v-breadcrumbs :items="breadcrumbItems" class="px-0 mb-4" density="compact">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <v-row>
      <!-- Left side - Book image -->
      <v-col cols="12" md="4" lg="3">
        <v-card class="book-image-card" elevation="8" rounded="xl">
          <v-img
            :src="
              detailsBooks.cover_url || '/placeholder.svg?height=400&width=260'
            "
            alt="Book Cover"
            class="rounded-xl"
            min-height="470"
            max-height="470"
            cover
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  color="grey-lighten-4"
                  indeterminate
                ></v-progress-circular>
              </div>
            </template>
          </v-img>
        </v-card>
      </v-col>

      <!-- Right side - Book details -->
      <v-col cols="12" md="8" lg="9">
        <div class="book-details">
          <!-- Title and Author -->
          <div class="mb-6">
            <h1 class="text-h3 font-weight-bold mb-3 text-primary">
              {{ detailsBooks.title }}
            </h1>

            <div class="d-flex align-center mb-3">
              <v-icon color="grey-darken-1" class="mr-2"
                >mdi-account-edit</v-icon
              >
              <span class="text-h6 text-grey-darken-1 mr-2">by</span>
              <v-chip
                color="primary"
                variant="outlined"
                size="large"
                class="font-weight-medium"
              >
                {{ detailsBooks.authors?.[0] }}
              </v-chip>
            </div>

            <!-- Rating -->
            <div class="d-flex align-center mb-4">
              <v-rating
                :model-value="4"
                color="amber"
                density="compact"
                readonly
                size="large"
                class="mr-3"
              ></v-rating>
              <span class="text-h6 font-weight-medium">4.0</span>
              <span class="text-body-1 text-grey-darken-1 ml-2"
                >(24 reviews)</span
              >
            </div>
          </div>

          <!-- Price and Availability -->
          <v-card class="mb-6" elevation="2" rounded="lg">
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <div class="text-h4 font-weight-bold text-success mb-1">
                    ${{ detailsBooks.price || "120.00" }}
                  </div>
                  <v-chip color="success" size="small" variant="flat">
                    <v-icon start>mdi-check-circle</v-icon>
                    In Stock
                  </v-chip>
                </div>
                <v-btn icon variant="outlined" color="pink" size="large">
                  <v-icon>mdi-heart-outline</v-icon>
                </v-btn>
              </div>

              <!-- Quantity selector -->
              <div class="mb-6">
                <v-label class="text-subtitle-1 font-weight-bold mb-2"
                  >Quantity</v-label
                >
                <div class="d-flex align-center">
                  <v-btn
                    icon
                    variant="outlined"
                    color="primary"
                    size="large"
                    @click="quantity > 1 ? quantity-- : 1"
                    :disabled="quantity <= 1"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>

                  <v-text-field
                    v-model="quantity"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="mx-3"
                    style="max-width: 80px"
                    min="1"
                    max="10"
                  ></v-text-field>

                  <v-btn
                    icon
                    variant="outlined"
                    color="primary"
                    size="large"
                    @click="quantity++"
                    :disabled="quantity >= 10"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="d-flex flex-column flex-sm-row ga-3">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="x-large"
                  class="text-none flex-grow-1"
                  rounded="lg"
                  @click="handleAddToCart"
                >
                  <v-icon start>mdi-cart-plus</v-icon>
                  Add to Cart
                </v-btn>

                <v-btn
                  color="darkgreen"
                  variant="flat"
                  size="x-large"
                  class="text-none flex-grow-1"
                  rounded="lg"
                >
                  <v-icon start>mdi-lightning-bolt</v-icon>
                  Buy Now
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Book details section -->
    <v-card class="mt-8" elevation="3" rounded="xl">
      <v-card-title
        class="pa-6 text-white"
        style="background: linear-gradient(90deg, #2563eb 0%, #9333ea 100%)"
      >
        <v-icon start class="mr-2">mdi-book-information-variant</v-icon>
        Book Details
      </v-card-title>

      <v-card-text class="pa-0">
        <v-list lines="two">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-identifier</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium"
              >Book ID</v-list-item-title
            >
            <v-list-item-subtitle>
              {{ detailsBooks.key?.split("/").pop() || "8935250707640" }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-account-edit</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium"
              >Author</v-list-item-title
            >
            <v-list-item-subtitle>
              <v-chip color="primary" variant="text" size="small" class="pa-0">
                {{ detailsBooks.authors?.[0] }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-calendar</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium"
              >Publication Year</v-list-item-title
            >
            <v-list-item-subtitle>
              {{ detailsBooks.first_publish_year }}
            </v-list-item-subtitle>
          </v-list-item>

          <!-- <v-list-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-translate</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium"
              >Language</v-list-item-title
            >
            <v-list-item-subtitle>English</v-list-item-subtitle>
          </v-list-item> -->
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Book description -->
    <v-card
      class="mt-6"
      elevation="3"
      rounded="xl"
      v-if="detailsBooks.description"
    >
      <v-card-title
        class="pa-6 text-white"
        style="background: linear-gradient(90deg, #9333ea 0%, #ec4899 100%)"
      >
        <v-icon start class="mr-2">mdi-text-box</v-icon>
        Description
      </v-card-title>
      <v-card-text class="pa-6">
        <p class="text-body-1 line-height-relaxed">
          {{
            typeof detailsBooks.description === "object"
              ? detailsBooks.description.value
              : detailsBooks.description
          }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Rating section -->
    <v-card class="mt-6" elevation="3" rounded="xl">
      <v-card-title class="pa-6 bg-amber text-white">
        <v-icon start class="mr-2">mdi-star</v-icon>
        Customer Reviews
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="4">
            <div class="text-center">
              <div class="text-h2 font-weight-bold text-amber mb-2">
                4.0<span class="text-h4 text-grey-darken-1">/5</span>
              </div>
              <v-rating
                :model-value="4"
                color="amber"
                density="comfortable"
                readonly
                size="large"
                class="mb-2"
              ></v-rating>
              <div class="text-body-2 text-grey-darken-1">
                Based on 24 reviews
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="8">
            <div class="rating-breakdown">
              <div
                class="d-flex align-center mb-2"
                v-for="(rating, index) in ratingBreakdown"
                :key="index"
              >
                <span class="text-body-2 mr-2" style="min-width: 20px">{{
                  5 - index
                }}</span>
                <v-icon color="amber" size="small" class="mr-2"
                  >mdi-star</v-icon
                >
                <v-progress-linear
                  :model-value="rating.percentage"
                  color="amber"
                  height="8"
                  rounded
                  class="flex-grow-1 mr-3"
                ></v-progress-linear>
                <span class="text-body-2" style="min-width: 30px"
                  >({{ rating.count }})</span
                >
              </div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <div class="text-center">
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            rounded="lg"
            class="text-none"
          >
            <v-icon start>mdi-pencil</v-icon>
            Write a Review
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>

  <!-- Enhanced Loading state -->
  <v-container
    v-else
    class="d-flex flex-column justify-center align-center"
    style="min-height: 60vh"
  >
    <v-progress-circular
      indeterminate
      color="primary"
      size="80"
      width="6"
      class="mb-4"
    ></v-progress-circular>
    <div class="text-h6 text-grey-darken-1">Loading book details...</div>
  </v-container>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      detailsBooks: {},
      isLoading: false,
      quantity: 1,
      authors: [],
    };
  },
  methods: {
    ...mapActions("cart", ["addToCart"]),
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
        // console.log("Fetched Data:", response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        this.isLoading = false;
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
    async handleAddToCart() {
      try {
        await this.addToCart({
          bookId: this.detailsBooks._id,
          quantity: this.quantity,
        });
        // console.log("Book added to cart:", this.detailsBooks);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },
  },
  async mounted() {
    await this.getDetailsBooks();
  },
};
</script>

<style scoped>
.min-width-200 {
  min-width: 200px;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Make sure the rating stars are properly sized */
:deep(.v-rating .v-icon) {
  padding: 0;
}
</style>
