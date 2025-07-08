<template>
  <v-footer class="footer-main">
    <v-container>
      <!-- Main Footer Content -->
      <v-row class="py-8">
        <!-- Company Info Section -->
        <v-col cols="12" md="4" class="mb-6">
          <div class="d-flex align-center mb-4">
            <v-avatar size="48" class="mr-3 bg-customyellow">
              <v-icon color="darkgreen" size="28"
                >mdi-book-open-page-variant</v-icon
              >
            </v-avatar>
            <span class="text-h5 font-weight-bold text-customblack"
              >THBookStore</span
            >
          </div>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Your trusted destination for discovering and collecting the world's
            finest books. From timeless classics to contemporary bestsellers.
          </p>

          <!-- Contact Info -->
          <div class="contact-info">
            <div class="d-flex align-center mb-2">
              <v-icon color="waterblue" size="18" class="mr-3"
                >mdi-map-marker</v-icon
              >
              <span class="text-body-2">1234 Bookstore Drive & 4th Ave</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon color="waterblue" size="18" class="mr-3"
                >mdi-phone</v-icon
              >
              <span class="text-body-2">0971450800</span>
            </div>
            <div class="d-flex align-center mb-4">
              <v-icon color="waterblue" size="18" class="mr-3"
                >mdi-email</v-icon
              >
              <span class="text-body-2">nhokhieukute2004@gmail.com</span>
            </div>
          </div>

          <!-- Social Media -->
          <div class="social-links">
            <span
              class="text-subtitle-2 font-weight-bold text-customblack mb-3 d-block"
              >Follow Us</span
            >
            <div class="d-flex ga-2">
              <v-btn
                icon
                variant="outlined"
                color="waterblue"
                size="small"
                class="social-btn"
              >
                <v-icon>mdi-facebook</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="outlined"
                color="waterblue"
                size="small"
                class="social-btn"
              >
                <v-icon>mdi-twitter</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="outlined"
                color="waterblue"
                size="small"
                class="social-btn"
              >
                <v-icon>mdi-instagram</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- Shopping Section -->
        <v-col cols="12" md="2" class="mb-6">
          <h3 class="text-h6 font-weight-bold text-customblack mb-4">
            Shopping
          </h3>
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in shoppingLinks"
              :key="i"
              :value="item"
              class="px-0 py-1"
              density="compact"
              @click="navigateTo(item.route)"
            >
              <v-list-item-title class="text-body-2 footer-link">
                {{ item.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Account Section -->
        <v-col cols="12" md="2" class="mb-6">
          <h3 class="text-h6 font-weight-bold text-customblack mb-4">
            My Account
          </h3>
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in accountLinks"
              :key="i"
              :value="item"
              class="px-0 py-1"
              density="compact"
              @click="navigateTo(item.route)"
            >
              <v-list-item-title class="text-body-2 footer-link">
                {{ item.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Categories Section -->
        <v-col cols="12" md="2" class="mb-6">
          <h3 class="text-h6 font-weight-bold text-customblack mb-4">
            Categories
          </h3>
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in categoryLinks"
              :key="i"
              :value="item"
              class="px-0 py-1"
              density="compact"
              @click="navigateTo(item.route)"
            >
              <v-list-item-title class="text-body-2 footer-link">
                {{ item.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Quick Actions Section -->
        <v-col cols="12" md="2" class="mb-6">
          <h3 class="text-h6 font-weight-bold text-customblack mb-4">
            Quick Actions
          </h3>
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in quickActions"
              :key="i"
              :value="item"
              class="px-0 py-1"
              density="compact"
              @click="navigateTo(item.route)"
            >
              <v-list-item-title class="text-body-2 footer-link">
                {{ item.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- Footer Divider -->
      <v-divider class="footer-divider mb-4"></v-divider>

      <!-- Bottom Footer -->
      <div
        class="d-flex flex-column flex-md-row justify-space-between align-center py-4"
      >
        <div class="text-center text-md-left mb-2 mb-md-0">
          <span class="text-body-2 text-medium-emphasis">
            © 2025 THBookStore. All Rights Reserved.
          </span>
        </div>
        <div class="d-flex ga-4">
          <span class="text-body-2 text-medium-emphasis">Privacy Policy</span>
          <span class="text-body-2 text-medium-emphasis">Terms of Service</span>
        </div>
      </div>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      shoppingLinks: [
        { name: "Shopping Cart", route: "/cart" },
        { name: "My Orders", route: "/order" },
        { name: "My Favorites", route: "/favorites" },
      ],
      accountLinks: [
        { name: "My Profile", route: "/profiles" },
        { name: "Login", route: "/login" },
        { name: "Sign Up", route: "/signup" },
      ],
      categoryLinks: [
        { name: "Literary Fiction", route: "/subjects/literary fiction" },
        { name: "Romance", route: "/subjects/romance" },
        { name: "Manga", route: "/subjects/manga" },
        { name: "All Categories", route: "/" },
      ],
      quickActions: [
        { name: "Home", route: "/" },
        { name: "Browse Books", route: "/" },
        { name: "Contact Us", route: "/contact" },
      ],
    };
  },
  methods: {
    navigateTo(route) { 
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.footer-main {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #dee2e6;
}

.contact-info {
  background: rgba(82, 149, 208, 0.05);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #5295d0;
}

.social-links {
  margin-top: 16px;
}

.social-btn {
  transition: all 0.3s ease;
}

.social-btn:hover {
  background-color: #5295d0 !important;
  color: white !important;
  transform: translateY(-2px);
}

.footer-link {
  color: #6c757d;
  transition: color 0.3s ease;
  cursor: pointer;
}

.footer-link:hover {
  color: #5295d0;
}

.footer-divider {
  border-color: #dee2e6;
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .footer-main {
    text-align: center;
  }

  .contact-info {
    text-align: left;
  }
}
</style>
