<template>
  <v-app>
    <v-main>
      <v-container class="py-8">
        <!-- Header Section -->
        <div class="text-center mb-8">
          <h1 class="text-h3 font-weight-bold text-primary mb-2">
            My Favorite Books
          </h1>
          <p class="text-h6 text-medium-emphasis">
            Your personal collection of beloved reads
          </p>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading">
          <!-- Stats Bar Skeleton -->
          <v-card class="mb-6 pa-4" elevation="1">
            <v-row align="center">
              <v-col cols="auto">
                <v-skeleton-loader
                  type="chip"
                  width="120"
                  height="32"
                ></v-skeleton-loader>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto">
                <v-skeleton-loader
                  type="button"
                  width="80"
                  height="40"
                ></v-skeleton-loader>
              </v-col>
            </v-row>
          </v-card>

          <!-- Grid View Skeleton -->
          <v-row v-if="viewMode === 'grid'">
            <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
              <v-card class="book-card" elevation="3">
                <v-skeleton-loader
                  type="image"
                  height="300"
                ></v-skeleton-loader>
                <v-card-text class="pb-2">
                  <v-skeleton-loader
                    type="heading"
                    class="mb-2"
                  ></v-skeleton-loader>
                  <v-skeleton-loader
                    type="text"
                    class="mb-2"
                  ></v-skeleton-loader>
                  <v-skeleton-loader
                    type="text"
                    class="mb-2"
                  ></v-skeleton-loader>
                  <div class="d-flex align-center">
                    <v-skeleton-loader
                      type="text"
                      width="60"
                      class="mr-2"
                    ></v-skeleton-loader>
                    <v-spacer></v-spacer>
                    <v-skeleton-loader
                      type="chip"
                      width="80"
                    ></v-skeleton-loader>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-skeleton-loader
                    type="button"
                    width="100%"
                    height="36"
                  ></v-skeleton-loader>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- List View Skeleton -->
          <div v-else>
            <v-card v-for="n in 4" :key="n" class="mb-4" elevation="2">
              <v-row no-gutters>
                <v-col cols="3" sm="2">
                  <v-skeleton-loader
                    type="image"
                    height="150"
                  ></v-skeleton-loader>
                </v-col>
                <v-col cols="9" sm="10">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div style="flex: 1">
                        <v-skeleton-loader
                          type="heading"
                          class="mb-2"
                        ></v-skeleton-loader>
                        <v-skeleton-loader
                          type="text"
                          class="mb-2"
                        ></v-skeleton-loader>
                      </div>
                      <v-skeleton-loader
                        type="button"
                        width="40"
                        height="40"
                        class="ml-2"
                      ></v-skeleton-loader>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <v-skeleton-loader
                        type="chip"
                        width="60"
                        class="mr-2 mb-2"
                      ></v-skeleton-loader>
                      <v-skeleton-loader
                        type="chip"
                        width="80"
                        class="mr-2 mb-2"
                      ></v-skeleton-loader>
                      <v-skeleton-loader
                        type="chip"
                        width="70"
                        class="mr-2 mb-2"
                      ></v-skeleton-loader>
                    </div>
                    <div class="d-flex align-center">
                      <v-skeleton-loader
                        type="text"
                        width="60"
                        class="mr-2"
                      ></v-skeleton-loader>
                      <v-spacer></v-spacer>
                      <v-skeleton-loader
                        type="button"
                        width="120"
                        height="36"
                      ></v-skeleton-loader>
                    </div>
                  </v-card-text>
                </v-col>
              </v-row>
            </v-card>
          </div>
        </div>

        <!-- Empty State -->
        <v-card
          v-else-if="favorites.length === 0"
          class="text-center pa-12"
          elevation="2"
        >
          <v-icon size="80" color="grey-lighten-1" class="mb-4"
            >mdi-heart-outline</v-icon
          >
          <h2 class="text-h5 mb-2">No favorites yet</h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Start adding books to your favorites to see them here
          </p>
          <v-btn color="primary" size="large" @click="browseBooksDialog = true">
            <v-icon start>mdi-book-search</v-icon>
            Browse Books
          </v-btn>
        </v-card>

        <!-- Favorites Grid -->
        <div v-else>
          <!-- Stats Bar -->
          <v-card class="mb-6 pa-4" elevation="1">
            <v-row align="center">
              <v-col cols="auto">
                <v-chip color="primary" variant="elevated" size="large">
                  <v-icon start>mdi-heart</v-icon>
                  {{ favorites.length }}
                  {{ favorites.length === 1 ? "Book" : "Books" }}
                </v-chip>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto">
                <v-btn-toggle v-model="viewMode" mandatory>
                  <v-btn
                    value="grid"
                    icon="mdi-view-grid"
                    variant="outlined"
                  ></v-btn>
                  <v-btn
                    value="list"
                    icon="mdi-view-list"
                    variant="outlined"
                  ></v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
          </v-card>

          <!-- Grid View -->
          <v-row v-if="viewMode === 'grid'">
            <v-col
              v-for="favorite in favorites"
              :key="favorite._id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="book-card" elevation="3" hover>
                <div class="position-relative">
                  <v-img
                    :src="favorite.bookId.cover_url"
                    height="300"
                    cover
                    class="book-cover"
                  >
                    <template v-slot:placeholder>
                      <div
                        class="d-flex align-center justify-center fill-height"
                      >
                        <v-progress-circular
                          indeterminate
                        ></v-progress-circular>
                      </div>
                    </template>
                  </v-img>

                  <!-- Favorite Button -->
                  <v-btn
                    icon
                    size="small"
                    color="red"
                    class="favorite-btn"
                    @click="removeFromFavorites(favorite.bookId._id)"
                  >
                    <v-icon>mdi-heart</v-icon>
                  </v-btn>

                  <!-- Rating Badge -->
                  <v-chip
                    v-if="favorite.bookId.rating"
                    color="amber"
                    size="small"
                    class="rating-chip"
                  >
                    <v-icon start size="small">mdi-star</v-icon>
                    {{ favorite.bookId.rating }}
                  </v-chip>
                </div>

                <v-card-text class="pb-2">
                  <h3 class="text-h6 font-weight-bold mb-1 text-truncate">
                    {{ favorite.bookId.title }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-2">
                    by {{ favorite.bookId.authors.join(", ") }}
                  </p>
                  <p class="text-body-2 mb-2">
                    {{ favorite.bookId.subjects.join(", ") }}
                  </p>
                  <div class="d-flex align-center">
                    <span class="text-h6 font-weight-bold text-primary"
                      >${{ favorite.bookId.price }}</span
                    >
                    <v-spacer></v-spacer>
                    <v-chip color="success" size="small" variant="tonal">
                      {{ favorite.bookId.first_publish_year }}
                    </v-chip>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    block
                    @click="$router.push(`/details/${favorite.bookId._id}`)"
                  >
                    <v-icon start>mdi-eye</v-icon>
                    View Details
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- List View -->
          <div v-else>
            <v-card
              v-for="favorite in favorites"
              :key="favorite._id"
              class="mb-4"
              elevation="2"
            >
              <v-row no-gutters>
                <v-col cols="3" sm="2">
                  <v-img
                    :src="favorite.bookId.cover_url"
                    height="150"
                    cover
                  ></v-img>
                </v-col>
                <v-col cols="9" sm="10">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div>
                        <h3 class="text-h6 font-weight-bold">
                          {{ favorite.bookId.title }}
                        </h3>
                        <p class="text-body-2 text-medium-emphasis">
                          by {{ favorite.bookId.authors.join(", ") }}
                        </p>
                      </div>
                      <v-btn
                        icon
                        size="small"
                        color="red"
                        variant="text"
                        @click="removeFromFavorites(favorite.bookId._id)"
                      >
                        <v-icon>mdi-heart</v-icon>
                      </v-btn>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <v-chip
                        v-for="subject in favorite.bookId.subjects"
                        :key="subject"
                        size="small"
                        variant="outlined"
                      >
                        {{ subject }}
                      </v-chip>
                      <v-chip
                        v-if="favorite.bookId.rating"
                        color="amber"
                        size="small"
                      >
                        <v-icon start size="small">mdi-star</v-icon>
                        {{ favorite.bookId.rating }}
                      </v-chip>
                      <v-chip color="info" size="small" variant="tonal">
                        {{ favorite.bookId.first_publish_year }}
                      </v-chip>
                    </div>

                    <div class="d-flex align-center">
                      <span class="text-h6 font-weight-bold text-primary"
                        >${{ favorite.bookId.price }}</span
                      >
                      <v-spacer></v-spacer>
                      <v-btn
                        color="primary"
                        variant="outlined"
                        @click="$router.push(`/details/${favorite.bookId._id}`)"
                      >
                        <v-icon start>mdi-eye</v-icon>
                        View Details
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-col>
              </v-row>
            </v-card>
          </div>
        </div>

        <!-- Browse Books Dialog -->
        <v-dialog v-model="browseBooksDialog" max-width="400">
          <v-card>
            <v-card-title>Browse Books</v-card-title>
            <v-card-text>
              <p>
                This would typically navigate to your book catalog or search
                page.
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="browseBooksDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Snackbar for notifications -->
        <SnackbarAlert
          v-model="snackbar.show"
          :text="snackbar.message"
          :color="snackbar.color"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "FavoritesListItems",
  props: {
    favorites: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      viewMode: "grid",
      browseBooksDialog: false,
      selectedBook: null,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  methods: {
    removeFromFavorites(bookId) {
      const favoriteIndex = this.favorites.findIndex(
        (favorite) => favorite.bookId._id === bookId
      );
      if (favoriteIndex > -1) {
        const removedFavorite = this.favorites.splice(favoriteIndex, 1)[0];
        this.showSnackbar(
          `"${removedFavorite.bookId.title}" removed from favorites`,
          "info"
        );
      }
    },
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  mounted() {
    console.log("favorites:", this.favorites);
  },
};
</script>

<style scoped>
.book-card {
  transition: transform 0.2s ease-in-out;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-cover {
  border-radius: 8px 8px 0 0;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.rating-chip {
  position: absolute;
  top: 8px;
  left: 8px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
