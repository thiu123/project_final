<template>
  <v-app>
    <!-- Header -->
    <v-app-bar color="white" elevation="1">
      <v-container class="d-flex align-center">
        <div class="d-flex align-center">
          <v-btn variant="text" color="grey-darken-3" class="text-body-2 font-weight-regular">
            <v-icon size="small" class="mr-1">mdi-phone</v-icon>
            +01 8374802234
          </v-btn>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex">
          <v-btn icon="mdi-facebook" variant="text" color="grey-darken-3" size="small"></v-btn>
          <v-btn icon="mdi-instagram" variant="text" color="grey-darken-3" size="small"></v-btn>
          <v-btn icon="mdi-twitter" variant="text" color="grey-darken-3" size="small"></v-btn>
          <v-btn icon="mdi-pinterest" variant="text" color="grey-darken-3" size="small"></v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <v-app-bar color="white" elevation="0">
      <v-container>
        <div class="d-flex align-center">
          <v-avatar color="grey-lighten-3" size="40" class="mr-4">
            <v-icon color="grey">mdi-book-open-page-variant</v-icon>
          </v-avatar>
          <div class="d-none d-sm-flex">
            <v-btn variant="text" to="/" class="text-none text-subtitle-2">HOME</v-btn>
            <v-btn variant="text" to="/about" class="text-none text-subtitle-2">ABOUT US</v-btn>
            <v-btn variant="text" to="/books" class="text-none text-subtitle-2">BOOKS</v-btn>
            <v-btn variant="text" to="/new-release" class="text-none text-subtitle-2">NEW RELEASE</v-btn>
            <v-btn variant="text" to="/contact" class="text-none text-subtitle-2">CONTACT US</v-btn>
            <v-btn variant="text" to="/blog" class="text-none text-subtitle-2">BLOG</v-btn>
          </div>
          <v-spacer></v-spacer>
          <div>
            <v-btn icon="mdi-magnify" variant="text"></v-btn>
            <v-btn icon="mdi-heart-outline" variant="text"></v-btn>
            <v-btn icon="mdi-cart-outline" variant="text"></v-btn>
          </div>
        </div>
      </v-container>
    </v-app-bar>

    <v-main>
      <!-- Hero Section -->
      <v-container fluid class="pa-0">
        <v-carousel
          hide-delimiters
          show-arrows="hover"
          height="500"
          cycle
        >
          <v-carousel-item>
            <v-sheet height="100%" color="#f8f0f0" class="d-flex align-center">
              <v-container>
                <v-row>
                  <v-col cols="12" md="6" class="d-flex flex-column justify-center">
                    <h1 class="text-h3 font-weight-bold text-deep-purple-darken-1 mb-4">Ipsum Dolor Si</h1>
                    <p class="text-body-1 mb-6">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel commodo ex. Donec auctor velit placerat leo. Ut vel commodo ex. Donec auctor velit placerat leo. Aenea, quis urna, a mi.
                    </p>
                    <v-btn
                      color="deep-purple-darken-1"
                      variant="outlined"
                      class="text-none px-6 align-self-start"
                    >
                      READ MORE
                    </v-btn>
                  </v-col>
                  <v-col cols="12" md="6" class="d-flex justify-center align-center">
                    <v-img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Variation%203.png-rabVzAPv7dZ0dAkPZ8QztHDiONBCpO.jpeg"
                      max-width="300"
                      alt="The Assignment Book"
                      class="book-cover-shadow"
                    ></v-img>
                  </v-col>
                </v-row>
              </v-container>
            </v-sheet>
          </v-carousel-item>
        </v-carousel>
      </v-container>

      <!-- Categories Section -->
      <v-container class="py-12">
        <h2 class="text-h5 font-weight-bold mb-8">Explore our Top Categories</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card elevation="0" class="rounded-lg">
              <v-img
                src="https://placehold.co/300x200"
                height="200"
                cover
                class="rounded-lg"
              ></v-img>
              <v-card-title class="text-center py-4">Higher Education</v-card-title>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card elevation="0" class="rounded-lg">
              <v-img
                src="https://placehold.co/300x200"
                height="200"
                cover
                class="rounded-lg"
              ></v-img>
              <v-card-title class="text-center py-4">Management Books</v-card-title>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card elevation="0" class="rounded-lg">
              <v-img
                src="https://placehold.co/300x200"
                height="200"
                cover
                class="rounded-lg"
              ></v-img>
              <v-card-title class="text-center py-4">Engineering Books</v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <div class="text-center mt-6">
          <v-btn variant="outlined" color="grey-darken-1" class="text-none px-6">VIEW MORE</v-btn>
        </div>
      </v-container>

      <!-- New Release Books -->
      <v-container fluid class="py-12 bg-grey-lighten-4">
        <v-container>
          <h2 class="text-h5 font-weight-bold mb-8">New Release Books</h2>
          <v-row>
            <v-col v-for="(book, i) in newReleaseBooks" :key="i" cols="6" sm="4" md="3">
              <v-card elevation="0" class="rounded-lg h-100">
                <div class="position-relative">
                  <v-img
                    :src="book.image"
                    height="250"
                    cover
                    class="rounded-lg"
                  ></v-img>
                  <v-btn
                    v-if="book.addToCart"
                    color="#ff5e3a"
                    class="text-none text-white position-absolute bottom-0 start-0 mb-2 ms-2"
                    size="small"
                  >
                    ADD TO CART
                  </v-btn>
                </div>
                <v-card-title class="text-subtitle-1 px-0 pt-4 pb-1">{{ book.title }}</v-card-title>
                <v-card-text class="px-0 pt-0 pb-2">
                  <span class="text-orange-darken-2 font-weight-medium">${{ book.price }}</span>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div class="text-center mt-6">
            <div class="d-flex justify-center mb-4">
              <v-btn
                v-for="n in 4"
                :key="n"
                icon="mdi-circle"
                :color="n === 1 ? 'orange-darken-2' : 'grey-lighten-1'"
                density="compact"
                size="x-small"
                variant="text"
                class="mx-1"
              ></v-btn>
            </div>
            <v-btn text color="orange-darken-2" class="text-none">View All Products →</v-btn>
          </div>
        </v-container>
      </v-container>

      <!-- Featured Book -->
      <v-container class="py-12">
        <v-row>
          <v-col cols="12" md="5" class="d-flex justify-center align-center">
            <v-img
              src="https://placehold.co/300x400"
              max-width="300"
              class="book-cover-shadow"
            ></v-img>
          </v-col>
          <v-col cols="12" md="7" class="d-flex flex-column justify-center">
            <h2 class="text-h5 font-weight-bold mb-4">Featured Book</h2>
            <h3 class="text-h4 font-weight-bold text-deep-purple-darken-1 mb-4">Birds Gonna Be Happy</h3>
            <p class="text-body-1 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel commodo ex. Donec auctor velit placerat leo. Ut vel commodo ex. Donec auctor velit placerat leo.
            </p>
            <div class="mb-6">
              <span class="text-h5 text-orange-darken-2 font-weight-bold">$ 45.00</span>
            </div>
            <v-btn
              color="deep-purple-darken-1"
              variant="outlined"
              class="text-none px-6 align-self-start"
            >
              VIEW MORE
            </v-btn>
          </v-col>
        </v-row>
        <div class="text-center mt-6">
          <div class="d-flex justify-center">
            <v-btn
              v-for="n in 4"
              :key="n"
              icon="mdi-circle"
              :color="n === 1 ? 'orange-darken-2' : 'grey-lighten-1'"
              density="compact"
              size="x-small"
              variant="text"
              class="mx-1"
            ></v-btn>
          </div>
        </div>
      </v-container>

      <!-- Promotion Section -->
      <v-container fluid class="py-12 bg-pink-lighten-5">
        <v-container>
          <v-row>
            <v-col cols="12" md="7" class="d-flex flex-column justify-center">
              <h2 class="text-h4 font-weight-bold mb-4">All books are 50% off now!<br>Don't miss such a deal!</h2>
              <p class="text-body-1 mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel commodo ex. Donec auctor velit placerat leo. Ut vel commodo ex.
              </p>
              <div class="d-flex mb-8">
                <div class="me-6 text-center">
                  <div class="text-h4 font-weight-bold text-orange-darken-2">768</div>
                  <div class="text-caption text-uppercase">DAYS</div>
                </div>
                <div class="me-6 text-center">
                  <div class="text-h4 font-weight-bold text-orange-darken-2">01</div>
                  <div class="text-caption text-uppercase">HOUR</div>
                </div>
                <div class="me-6 text-center">
                  <div class="text-h4 font-weight-bold text-orange-darken-2">27</div>
                  <div class="text-caption text-uppercase">MINS</div>
                </div>
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-orange-darken-2">55</div>
                  <div class="text-caption text-uppercase">SEC</div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="5" class="d-flex justify-center align-center">
              <v-img
                src="https://placehold.co/300x300"
                max-width="300"
                alt="Stack of books"
              ></v-img>
            </v-col>
          </v-row>
        </v-container>
      </v-container>

      <!-- Newsletter -->
      <v-container fluid class="py-12 bg-orange-darken-2">
        <v-container>
          <h2 class="text-h4 font-weight-bold text-white text-center mb-2">Subscribe to Our Newsletter</h2>
          <p class="text-body-1 text-white text-center mb-6">
            Stay in the loop! We'll share news about books that blow your mind.
          </p>
          <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
              <v-form>
                <div class="d-flex">
                  <v-text-field
                    placeholder="youremail@example.com"
                    variant="outlined"
                    bg-color="white"
                    hide-details
                    class="rounded-s-lg"
                    density="compact"
                  ></v-text-field>
                  <v-btn
                    color="deep-orange-darken-2"
                    class="text-white rounded-e-lg"
                    height="40"
                  >
                    SUBSCRIBE
                  </v-btn>
                </div>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-container>

      <!-- Latest Articles -->
      <v-container class="py-12">
        <h2 class="text-h5 font-weight-bold text-center mb-8">Latest Articles</h2>
        <v-row>
          <v-col v-for="(article, i) in latestArticles" :key="i" cols="12" md="4">
            <v-card elevation="0" class="h-100">
              <v-img
                :src="article.image"
                height="250"
                cover
                class="rounded-lg"
              ></v-img>
              <v-card-title class="px-0 pt-4 pb-0">{{ article.title }}</v-card-title>
              <v-card-text class="px-0 pt-2">
                <div class="d-flex">
                  <v-rating
                    :model-value="5"
                    color="amber"
                    density="compact"
                    size="small"
                    readonly
                  ></v-rating>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <div class="text-center mt-6">
          <v-btn variant="text" color="deep-purple-darken-1" class="text-none">READ ALL ARTICLES →</v-btn>
        </div>
      </v-container>

      <!-- Footer -->
      <v-footer class="bg-orange-darken-2 pt-16 pb-8">
        <v-container>
          <v-row>
            <v-col cols="12" md="4" class="mb-8">
              <div class="d-flex align-center mb-4">
                <v-avatar color="white" size="40" class="mr-2">
                  <v-icon color="orange-darken-2">mdi-book-open-page-variant</v-icon>
                </v-avatar>
                <span class="text-h6 text-white font-weight-bold">BOOKSTORE</span>
              </div>
              <p class="text-white text-body-2 mb-6">
                Discover the perfect books for every occasion and interest, with our carefully curated collection.
              </p>
              <div class="d-flex">
                <v-btn icon="mdi-facebook" variant="text" color="white" size="small"></v-btn>
                <v-btn icon="mdi-linkedin" variant="text" color="white" size="small"></v-btn>
                <v-btn icon="mdi-twitter" variant="text" color="white" size="small"></v-btn>
                <v-btn icon="mdi-youtube" variant="text" color="white" size="small"></v-btn>
              </div>
            </v-col>
            <v-col cols="6" md="2" class="mb-8">
              <h3 class="text-h6 text-white font-weight-bold mb-4">COMPANY</h3>
              <v-list density="compact" bg-color="transparent" class="pa-0">
                <v-list-item
                  v-for="(item, i) in companyLinks"
                  :key="i"
                  :title="item"
                  class="px-0 text-white"
                  density="compact"
                ></v-list-item>
              </v-list>
            </v-col>
            <v-col cols="6" md="2" class="mb-8">
              <h3 class="text-h6 text-white font-weight-bold mb-4">IMPORTANT LINKS</h3>
              <v-list density="compact" bg-color="transparent" class="pa-0">
                <v-list-item
                  v-for="(item, i) in importantLinks"
                  :key="i"
                  :title="item"
                  class="px-0 text-white"
                  density="compact"
                ></v-list-item>
              </v-list>
            </v-col>
          </v-row>
          <v-divider color="white" class="my-6 opacity-25"></v-divider>
          <div class="d-flex flex-column flex-sm-row justify-space-between align-center">
            <div class="text-white text-body-2 mb-4 mb-sm-0">
              © 2023 Bookstore. All Rights Reserved.
            </div>
            <div class="text-white text-body-2">
              Privacy | Terms of Service
            </div>
          </div>
        </v-container>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const newReleaseBooks = ref([
  {
    title: 'Simple Way Of Piece Life',
    price: '40.00',
    image: 'https://placehold.co/180x250',
    addToCart: true
  },
  {
    title: 'Great Travel At Desert',
    price: '38.00',
    image: 'https://placehold.co/180x250',
    addToCart: false
  },
  {
    title: 'The Lady Beauty Scarlett',
    price: '45.00',
    image: 'https://placehold.co/180x250',
    addToCart: false
  },
  {
    title: 'Once Upon A Time',
    price: '35.00',
    image: 'https://placehold.co/180x250',
    addToCart: false
  }
]);

const latestArticles = ref([
  {
    title: 'Reading Books Always Makes The Moments Happy',
    image: 'https://placehold.co/350x250'
  },
  {
    title: 'Reading Books Always Makes The Moments Happy',
    image: 'https://placehold.co/350x250'
  },
  {
    title: 'Reading Books Always Makes The Moments Happy',
    image: 'https://placehold.co/350x250'
  }
]);

const companyLinks = ref([
  'HOME',
  'ABOUT US',
  'BOOKS',
  'NEW RELEASE',
  'CONTACT US',
  'BLOG'
]);

const importantLinks = ref([
  'Privacy Policy',
  'FAQs',
  'Terms of Service'
]);
</script>

<style>
.book-cover-shadow {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.bottom-0 {
  bottom: 0;
}

.start-0 {
  left: 0;
}

.rounded-s-lg {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.rounded-e-lg {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}
</style>