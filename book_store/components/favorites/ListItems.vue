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

        <!-- Favorites Grid -->
        <div>
          <!-- Stats Bar -->
          <v-card class="mb-6 pa-4" elevation="1">
            <v-row align="center">
              <v-col cols="auto">
                <v-chip color="primary" variant="elevated" size="large">
                  <v-icon start>mdi-heart</v-icon>
                  {{ validFavorites.length }}
                  {{ validFavorites.length === 1 ? "Book" : "Books" }}
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
              v-for="favorite in validFavorites"
              :key="favorite._id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="book-card" elevation="3" hover>
                <div class="position-relative book-cover-container">
                  <div class="book-cover-wrapper">
                    <img
                      :src="favorite?.bookId?.cover_url"
                      :alt="favorite?.bookId?.title"
                      class="book-cover-image"
                      loading="lazy"
                    />
                  </div>

                  <!-- Favorite Button -->
                  <v-btn
                    icon
                    size="small"
                    :color="
                      isFavorite(favorite.bookId._id) ? 'red' : 'grey-darken-2'
                    "
                    class="favorite-btn"
                    @click="
                      confirmRemoveFromFavorites(
                        favorite.bookId._id,
                        favorite.bookId.title
                      )
                    "
                  >
                    <v-icon>
                      {{
                        isFavorite(favorite.bookId._id)
                          ? "mdi-heart"
                          : "mdi-heart-outline"
                      }}
                    </v-icon>
                    <v-tooltip activator="parent" location="top">
                      {{
                        isFavorite(favorite.bookId._id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }}
                    </v-tooltip>
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
              v-for="favorite in validFavorites"
              :key="favorite._id"
              class="mb-4"
              elevation="2"
            >
              <v-row no-gutters>
                <v-col cols="3" sm="2">
                  <v-img
                    :src="favorite?.bookId?.cover_url"
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
                        :color="
                          isFavorite(favorite.bookId._id)
                            ? 'red'
                            : 'grey-darken-2'
                        "
                        variant="text"
                        @click="
                          confirmRemoveFromFavorites(
                            favorite.bookId._id,
                            favorite.bookId.title
                          )
                        "
                      >
                        <v-icon>
                          {{
                            isFavorite(favorite.bookId._id)
                              ? "mdi-heart"
                              : "mdi-heart-outline"
                          }}
                        </v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{
                            isFavorite(favorite.bookId._id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }}
                        </v-tooltip>
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

        <!-- Remove Confirmation Dialog -->
        <v-dialog v-model="removeDialog.show" max-width="450" persistent>
          <v-card rounded="xl" class="elevation-8">
            <v-card-title
              class="text-h6 text-center pa-6 pb-4 bg-error text-white"
            >
              <v-icon start color="white" class="me-2">mdi-heart-broken</v-icon>
              Remove from Favorites
            </v-card-title>

            <v-card-text class="pa-6 text-center">
              <v-icon color="error" size="large" class="mb-4"
                >mdi-alert-circle</v-icon
              >
              <div class="text-body-1 mb-2">
                Are you sure you want to remove
                <strong>"{{ removeDialog.bookTitle }}"</strong> from your
                favorites?
              </div>
              <div class="text-caption text-medium-emphasis">
                You can always add it back later by clicking the heart icon on
                the book.
              </div>
            </v-card-text>

            <v-card-actions class="pa-6 pt-0">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                @click="removeDialog.show = false"
                class="me-3"
              >
                Cancel
              </v-btn>
              <v-btn
                color="error"
                variant="elevated"
                @click="confirmRemove"
                :loading="removeDialog.loading"
              >
                <v-icon start>mdi-delete</v-icon>
                Remove
              </v-btn>
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
    toggleFavorites: {
      type: Function,
      required: true,
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
      removeDialog: {
        show: false,
        loading: false,
        bookId: null,
        bookTitle: "",
      },
    };
  },
  computed: {
    // Filter out favorites with null bookId
    validFavorites() {
      return this.favorites.filter(
        (favorite) => favorite && favorite.bookId && favorite.bookId._id
      );
    },
  },
  methods: {
    async removeFromFavorites(bookId) {
      try {
        const favoriteIndex = this.favorites.findIndex(
          (favorite) => favorite.bookId._id === bookId
        );

        if (favoriteIndex > -1) {
          const removedFavorite = this.favorites[favoriteIndex];

          await this.toggleFavorites(bookId);

          this.showSnackbar(
            `"${removedFavorite.bookId.title}" removed from favorites`,
            "info"
          );
        }
      } catch (error) {
        console.error("Error removing from favorites:", error);
        this.showSnackbar(
          "Failed to remove book from favorites. Please try again.",
          "error"
        );
      }
    },
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    async confirmRemove() {
      this.removeDialog.loading = true;
      try {
        await this.toggleFavorites(this.removeDialog.bookId);
        const favoriteIndex = this.favorites.findIndex(
          (favorite) => favorite.bookId._id === this.removeDialog.bookId
        );
        if (favoriteIndex > -1) {
          this.favorites.splice(favoriteIndex, 1);
        }
        this.showSnackbar(
          `"${this.removeDialog.bookTitle}" removed from favorites`,
          "info"
        );
      } catch (error) {
        console.error("Error confirming remove:", error);
        this.showSnackbar(
          "Failed to remove book from favorites. Please try again.",
          "error"
        );
      } finally {
        this.removeDialog.show = false;
        this.removeDialog.loading = false;
      }
    },
    confirmRemoveFromFavorites(bookId, bookTitle) {
      this.removeDialog.bookId = bookId;
      this.removeDialog.bookTitle = bookTitle;
      this.removeDialog.show = true;
    },
    isFavorite(bookId) {
      return this.favorites.some(
        (favorite) => favorite?.bookId?._id === bookId
      );
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
  background: white;
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-cover-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  min-height: 220px;
  position: relative;
}

.book-cover-wrapper {
  width: 70%;
  max-width: 180px;
  aspect-ratio: 2/3;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover-wrapper {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
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
