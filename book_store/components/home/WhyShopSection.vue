<template>
  <v-container
    class="my-12 py-16 why-shop-section rounded-xl"
    style="background: linear-gradient(135deg, #dcf763 0%, #c8e6c9 100%)"
  >
    <v-container class="max-width-container">
      <v-row align="center" class="min-height-row">
        <!-- Floating Books Section -->
        <v-col cols="12" md="6" class="position-relative books-container">
          <div class="floating-books-wrapper position-relative">
            <div class="decorative-circle circle-1"></div>
            <div class="decorative-circle circle-2"></div>
            <div class="decorative-circle circle-3"></div>

            <div
              class="position-absolute floating-book"
              style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
            >
              <div
                class="book-card rounded-xl"
                style="width: 210px; transition: all 0.3s ease"
                :style="{
                  transform: 'rotate(-15deg)',
                  boxShadow:
                    '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                }"
              >
                <v-img
                  :src="books[1]?.cover_url"
                  class="rounded-xl book-image"
                  height="320"
                  cover
                  style="filter: brightness(1.1)"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular
                        color="primary"
                        indeterminate
                      ></v-progress-circular>
                    </div>
                  </template>

                  <div
                    style="
                      position: absolute;
                      inset: 0;
                      border-radius: 12px;
                      background: radial-gradient(
                        circle at 50% 50%,
                        rgba(255, 255, 255, 0.2) 0%,
                        rgba(255, 255, 255, 0) 70%
                      );
                      pointer-events: none;
                    "
                  ></div>
                </v-img>

                <div
                  style="
                    position: absolute;
                    inset: -15px;
                    border-radius: 16px;
                    background: radial-gradient(
                      circle at 50% 50%,
                      rgba(76, 175, 80, 0.15) 0%,
                      rgba(76, 175, 80, 0) 70%
                    );
                    filter: blur(15px);
                    z-index: -1;
                  "
                ></div>
              </div>
            </div>

            <div class="floating-element star-1">
              <v-icon color="amber" size="24">mdi-star</v-icon>
            </div>
            <div class="floating-element star-2">
              <v-icon color="orange" size="20">mdi-star</v-icon>
            </div>
            <div class="floating-element heart-1">
              <v-icon color="red" size="18">mdi-heart</v-icon>
            </div>
          </div>
        </v-col>

        <!-- Content Section -->
        <v-col cols="12" md="6" class="content-section">
          <div class="content-wrapper">
            <div class="mb-6">
              <v-chip
                color="darkgreen"
                variant="elevated"
                size="large"
                class="mb-4 chip-badge"
              >
                <v-icon start size="small">mdi-shield-check</v-icon>
                Why Choose Us
              </v-chip>
              <h2 class="display-1 font-weight-bold mb-4 main-title">
                Why Shop with Us?
              </h2>
            </div>

            <div class="features-list mb-8">
              <div class="feature-item d-flex align-start mb-4">
                <v-avatar color="darkgreen" size="48" class="mr-4">
                  <v-icon color="white" size="24">mdi-truck-fast</v-icon>
                </v-avatar>
                <div>
                  <h4 class="text-h6 font-weight-bold mb-2 text-darkgreen">
                    Fast & Free Delivery
                  </h4>
                  <p class="text-body-1 text-grey-darken-1">
                    Get your books delivered quickly with our free shipping on
                    orders over $25.
                  </p>
                </div>
              </div>

              <div class="feature-item d-flex align-start mb-4">
                <v-avatar color="orange" size="48" class="mr-4">
                  <v-icon color="white" size="24">mdi-book-open-variant</v-icon>
                </v-avatar>
                <div>
                  <h4 class="text-h6 font-weight-bold mb-2 text-darkgreen">
                    Vast Collection
                  </h4>
                  <p class="text-body-1 text-grey-darken-1">
                    Discover millions of books across all genres and categories
                    in our extensive library.
                  </p>
                </div>
              </div>

              <div class="feature-item d-flex align-start mb-4">
                <v-avatar color="blue" size="48" class="mr-4">
                  <v-icon color="white" size="24">mdi-shield-star</v-icon>
                </v-avatar>
                <div>
                  <h4 class="text-h6 font-weight-bold mb-2 text-darkgreen">
                    Quality Guarantee
                  </h4>
                  <p class="text-body-1 text-grey-darken-1">
                    All our books are carefully selected and quality-checked
                    before shipping.
                  </p>
                </div>
              </div>
            </div>

            <div class="action-buttons d-flex flex-wrap ga-4">
              <v-btn
                color="darkgreen"
                variant="elevated"
                size="x-large"
                rounded="xl"
                class="font-weight-bold"
                elevation="4"
              >
                <v-icon start size="small">mdi-rocket-launch</v-icon>
                Learn More
              </v-btn>

              <v-btn
                color="white"
                variant="elevated"
                size="x-large"
                rounded="xl"
                class="font-weight-bold text-darkgreen"
                elevation="2"
              >
                <v-icon start size="small">mdi-phone</v-icon>
                Contact Us
              </v-btn>
            </div>

            <div class="stats-section mt-8">
              <v-row>
                <v-col cols="4">
                  <div class="text-center">
                    <h3 class="text-h4 font-weight-bold text-darkgreen">
                      10K+
                    </h3>
                    <p class="text-caption text-grey-darken-1">
                      Happy Customers
                    </p>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <h3 class="text-h4 font-weight-bold text-darkgreen">
                      50K+
                    </h3>
                    <p class="text-caption text-grey-darken-1">
                      Books Available
                    </p>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <h3 class="text-h4 font-weight-bold text-darkgreen">99%</h3>
                    <p class="text-caption text-grey-darken-1">
                      Satisfaction Rate
                    </p>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: "WhyShopSection",
  props: {
    books: {
      type: Array,
      required: true,
    },
  },
};
</script>
