<template>
  <v-container fluid class="pa-0">
    <v-sheet style="background: none">
      <div class="hero-decoration"></div>

      <v-container class="position-relative">
        <v-row align="center" justify="center">
          <v-col cols="12" md="6" class="text-center">
            <div class="book-showcase">
              <div class="book-shadow"></div>
              <v-img
                :src="book?.cover_url"
                width="280"
                height="380"
                class="book-cover mx-auto rounded-xl"
                :alt="book?.title"
                cover
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="white"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>

              <v-chip
                class="mt-2"
                color="amber"
                text-color="amber-darken-4"
                size="small"
              >
                <v-icon start size="small">mdi-star</v-icon>
                4.8
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="text-center text-md-left">
            <div class="hero-content">
              <v-chip
                color="primary"
                variant="flat"
                class="mb-4 text-white font-weight-bold text-capitalize"
                size="small"
              >
                {{ book?.subjects?.[0] }}
              </v-chip>

              <h1 class="text-black mb-2">
                {{ book?.title }}
              </h1>

              <p class="text-gray mb-2">By {{ book?.authors[0] }}</p>
              <div
                class="d-flex flex-column flex-sm-row ga-4 justify-center justify-md-start"
              >
                <v-btn
                  size="large"
                  variant="elevated"
                  color="primary"
                  class="text-white font-weight-bold"
                  @click="$router.push(`/details/${book._id}`)"
                  prepend-icon="mdi-information"
                >
                  More Info
                </v-btn>

                <v-btn
                  size="large"
                  variant="flat"
                  color="darkgreen"
                  class="hero-btn-secondary"
                  append-icon="mdi-cart-plus"
                >
                  Add to Cart
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  props: {
    book: {
      book: Object,
    },
    handleAddToCart: {
      type: Function,
      required: true,
    },
  },
};
</script>
