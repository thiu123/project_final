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

        <!-- Empty State -->
        <v-card
          v-if="favorites.length === 0"
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
                    @click="viewDetails(favorite.bookId)"
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
                        @click="viewDetails(favorite.bookId)"
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

        <!-- Book Details Dialog -->
        <v-dialog v-model="detailsDialog" max-width="600">
          <v-card v-if="selectedBook">
            <v-card-title class="d-flex align-center">
              <span>Book Details</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="detailsDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="4">
                  <v-img
                    :src="selectedBook.cover_url"
                    aspect-ratio="0.7"
                    cover
                  ></v-img>
                </v-col>
                <v-col cols="8">
                  <h2 class="text-h5 font-weight-bold mb-2">
                    {{ selectedBook.title }}
                  </h2>
                  <p class="text-h6 text-medium-emphasis mb-3">
                    by {{ selectedBook.authors.join(", ") }}
                  </p>

                  <div class="mb-3">
                    <v-chip
                      v-for="subject in selectedBook.subjects"
                      :key="subject"
                      class="mr-2 mb-2"
                      size="small"
                      variant="outlined"
                    >
                      {{ subject }}
                    </v-chip>
                    <v-chip
                      v-if="selectedBook.rating"
                      color="amber"
                      size="small"
                      class="mr-2 mb-2"
                    >
                      <v-icon start size="small">mdi-star</v-icon>
                      {{ selectedBook.rating }}
                    </v-chip>
                  </div>

                  <p class="text-body-1 mb-3">{{ selectedBook.description }}</p>

                  <div class="d-flex align-center mb-3">
                    <span class="text-h5 font-weight-bold text-primary"
                      >${{ selectedBook.price }}</span
                    >
                    <v-spacer></v-spacer>
                    <v-chip color="info" variant="tonal">
                      Published: {{ selectedBook.first_publish_year }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="elevated" block>
                <v-icon start>mdi-cart-plus</v-icon>
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

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
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          timeout="3000"
        >
          {{ snackbar.message }}
          <template v-slot:actions>
            <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
          </template>
        </v-snackbar>
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
  },
  data() {
    return {
      viewMode: "grid",
      detailsDialog: false,
      browseBooksDialog: false,
      selectedBook: null,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
      //   favorites: [
      //     {
      //       id: 1,
      //       title: "The Great Gatsby",
      //       author: "F. Scott Fitzgerald",
      //       genre: "Classic Literature",
      //       price: 12.99,
      //       rating: 4.2,
      //       availability: "In Stock",
      //       cover: "/placeholder.svg?height=300&width=200",
      //       description:
      //         "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
      //     },
      //     {
      //       id: 2,
      //       title: "To Kill a Mockingbird",
      //       author: "Harper Lee",
      //       genre: "Fiction",
      //       price: 14.99,
      //       rating: 4.5,
      //       availability: "In Stock",
      //       cover: "/placeholder.svg?height=300&width=200",
      //       description:
      //         "A gripping tale of racial injustice and childhood innocence in the American South.",
      //     },
      //     {
      //       id: 3,
      //       title: "1984",
      //       author: "George Orwell",
      //       genre: "Dystopian Fiction",
      //       price: 13.99,
      //       rating: 4.4,
      //       availability: "Limited Stock",
      //       cover: "/placeholder.svg?height=300&width=200",
      //       description:
      //         "A dystopian social science fiction novel about totalitarian control and surveillance.",
      //     },
      //     {
      //       id: 4,
      //       title: "Pride and Prejudice",
      //       author: "Jane Austen",
      //       genre: "Romance",
      //       price: 11.99,
      //       rating: 4.3,
      //       availability: "In Stock",
      //       cover: "/placeholder.svg?height=300&width=200",
      //       description:
      //         "A romantic novel that critiques the British landed gentry at the end of the 18th century.",
      //     },
      //     {
      //       id: 5,
      //       title: "The Catcher in the Rye",
      //       author: "J.D. Salinger",
      //       genre: "Coming of Age",
      //       price: 13.49,
      //       rating: 3.9,
      //       availability: "In Stock",
      //       cover: "/placeholder.svg?height=300&width=200",
      //       description:
      //         "A controversial novel about teenage rebellion and alienation in post-war America.",
      //     },
      //     {
      //       id: 6,
      //       title: "Harry Potter and the Sorcerer's Stone",
      //       author: "J.K. Rowling",
      //       genre: "Fantasy",
      //       price: 15.99,
      //       rating: 4.7,
      //       availability: "In Stock",
      //       cover: "/placeholder.svg?height=300&width=200",
      //       description:
      //         "The first book in the beloved Harry Potter series about a young wizard's adventures.",
      //     },
      //   ],
    };
  },
  methods: {
    removeFromFavorites(bookId) {
      // Find the favorite by the book ID
      const favoriteIndex = this.favorites.findIndex(
        (favorite) => favorite.bookId._id === bookId
      );
      if (favoriteIndex > -1) {
        const removedFavorite = this.favorites.splice(favoriteIndex, 1)[0];
        this.showSnackbar(
          `"${removedFavorite.bookId.title}" removed from favorites`,
          "info"
        );
        // Here you would typically call an API to remove from backend
        // this.$emit('remove-favorite', bookId);
      }
    },
    viewDetails(book) {
      this.selectedBook = book;
      this.detailsDialog = true;
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
