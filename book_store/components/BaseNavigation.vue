<template>
  <div>
    <v-app-bar
      class="bg-waterblue elevation-2"
      :height="$vuetify.display.mobile ? '64' : '100'"
    >
      <v-container
        class="d-flex align-center justify-space-between py-0 px-3 px-md-4"
        :style="{
          width: $vuetify.display.mobile ? '100%' : '65%',
          height: '100%',
        }"
      >
        <!-- Logo Section with Enhanced Animation -->
        <div
          class="d-flex align-center cursor-pointer logo-container"
          style="text-decoration: none"
          to="/"
        >
          <nuxt-link to="/" class="d-flex align-center text-decoration-none">
            <v-avatar
              :size="$vuetify.display.mobile ? '36' : '48'"
              class="mr-2 mr-md-3 bg-customyellow logo-avatar elevation-4"
            >
              <v-icon
                color="darkgreen"
                :size="$vuetify.display.mobile ? '20' : '28'"
                >mdi-book-open-page-variant</v-icon
              >
            </v-avatar>
            <span
              :class="[
                'font-weight-bold text-white letter-spacing logo-text',
                $vuetify.display.mobile ? 'text-subtitle-1' : 'text-h5',
              ]"
              >THBookStore</span
            >
          </nuxt-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="d-none d-lg-flex align-center justify-space-between ga-2">
          <v-btn
            rounded="pill"
            variant="flat"
            flat
            class="nav-btn px-6 font-weight-bold text-subtitle-1"
            :style="
              $route.path === '/'
                ? 'backgroundColor: #DCF763; transform: translateY(-2px)'
                : 'backgroundColor:transparent'
            "
            :class="
              $route.path === '/' ? 'text-darkgreen active-nav' : 'text-white'
            "
            to="/"
            elevation="0"
          >
            Home
          </v-btn>

          <v-menu offset-y transition="slide-y-transition">
            <template v-slot:activator="{ props }">
              <v-btn
                rounded="pill"
                :style="
                  $route.path.startsWith('/subjects')
                    ? 'backgroundColor: #DCF763; transform: translateY(-2px)'
                    : 'backgroundColor: transparent'
                "
                :class="
                  $route.path.startsWith('/subjects')
                    ? 'text-darkgreen active-nav'
                    : 'text-white'
                "
                variant="text"
                class="nav-btn px-6 font-weight-bold text-subtitle-1"
                v-bind="props"
              >
                Category
                <v-icon
                  icon="mdi-chevron-down"
                  class="ml-1 chevron-icon"
                ></v-icon>
              </v-btn>
            </template>

            <v-list
              class="category-menu elevation-8 rounded-lg mt-2 overflow-x-hidden"
              style="min-width: 280px"
            >
              <template v-for="(category, index) in bookSubjects" :key="index">
                <!-- Categories with subcategories -->
                <v-list-group
                  v-if="category.subcategories"
                  class="category-group"
                >
                  <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" class="category-item py-3">
                      <v-list-item-title class="font-weight-bold text-body-1">{{
                        category.category
                      }}</v-list-item-title>
                    </v-list-item>
                  </template>

                  <template
                    v-for="(subcategory, subIndex) in category.subcategories"
                    :key="subIndex"
                  >
                    <v-list-item
                      class="subcategory-item pl-8 py-2"
                      @click="
                        $router.push(
                          `/subjects/${encodeURIComponent(
                            subcategory.toLowerCase()
                          )}`
                        )
                      "
                    >
                      <v-list-item-title class="text-subtitle-2">
                        <v-icon size="16" class="mr-2"
                          >mdi-chevron-right</v-icon
                        >
                        {{ subcategory }}
                      </v-list-item-title>
                    </v-list-item>

                    <v-divider
                      v-if="subIndex < category.subcategories.length - 1"
                      class="opacity-25 mx-4"
                    ></v-divider>
                  </template>
                </v-list-group>

                <!-- Categories without subcategories -->
                <v-list-item
                  v-else
                  class="category-item py-3"
                  @click="
                    $router.push(
                      `/subjects/${encodeURIComponent(
                        category.category.toLowerCase()
                      )}`
                    )
                  "
                >
                  <v-list-item-title class="font-weight-bold text-body-1">{{
                    category.category
                  }}</v-list-item-title>
                </v-list-item>

                <v-divider
                  v-if="index < bookSubjects.length - 1"
                  class="opacity-25 mx-4"
                ></v-divider>
              </template>
            </v-list>
          </v-menu>

          <v-btn
            rounded="pill"
            :style="
              $route.path === '/contact'
                ? 'backgroundColor: #DCF763; transform: translateY(-2px)'
                : 'backgroundColor:transparent'
            "
            :class="
              $route.path === '/contact'
                ? 'text-darkgreen active-nav'
                : 'text-white'
            "
            class="nav-btn px-6 font-weight-bold text-subtitle-1"
            variant="text"
            to="/contact"
          >
            Contact Us
          </v-btn>
        </div>

        <!-- Action Buttons with Enhanced Icons -->
        <div class="d-flex align-center ga-1">
          <!-- Mobile Menu Button -->
          <v-btn
            icon
            class="d-lg-none action-icon-btn"
            :size="$vuetify.display.mobile ? 'default' : 'large'"
            @click="mobileMenuDrawer = true"
          >
            <v-icon :size="$vuetify.display.mobile ? '22' : '26'"
              >mdi-menu</v-icon
            >
          </v-btn>

          <v-btn
            icon
            class="action-icon-btn"
            :size="$vuetify.display.mobile ? 'default' : 'large'"
            @click="$router.push('/cart')"
          >
            <v-badge
              location="top right"
              color="primary"
              :content="cartItemCount"
            >
              <v-icon :size="$vuetify.display.mobile ? '22' : '26'"
                >mdi-cart-outline</v-icon
              >
            </v-badge>
          </v-btn>

          <v-btn
            icon
            class="action-icon-btn d-none d-sm-flex"
            :size="$vuetify.display.mobile ? 'default' : 'large'"
            @click="$router.push('/favorites')"
          >
            <v-badge
              location="top right"
              color="primary"
              :content="userFavoritesCount"
            >
              <v-icon :size="$vuetify.display.mobile ? '22' : '26'"
                >mdi-heart-outline</v-icon
              >
            </v-badge>
          </v-btn>

          <v-menu
            v-model="accountMenu"
            :close-on-content-click="false"
            location="bottom"
            open-on-hover
            transition="slide-y-transition"
            offset="8"
          >
            <template v-if="isSessionRestored" v-slot:activator="{ props }">
              <template v-if="!currentUser">
                <v-btn
                  color="customyellow"
                  variant="flat"
                  class="ml-1 ml-md-2 font-weight-bold text-darkgreen account-btn d-none d-sm-flex"
                  :class="
                    $vuetify.display.mobile
                      ? 'text-caption px-3'
                      : 'text-subtitle-1 px-4'
                  "
                  rounded="pill"
                  v-bind="props"
                  :size="$vuetify.display.mobile ? 'small' : 'default'"
                  elevation="2"
                >
                  <span class="d-none d-md-inline">Account</span>
                  <v-icon
                    class="ml-0 ml-md-1"
                    :size="$vuetify.display.mobile ? '18' : '22'"
                    >mdi-account-circle</v-icon
                  >
                </v-btn>
              </template>

              <template v-else>
                <v-btn
                  v-bind="props"
                  class="ml-1 ml-md-2 user-profile-btn d-none d-sm-flex"
                  variant="text"
                  :style="{
                    '--v-theme-overlay-multiplier': '0',
                  }"
                  :size="$vuetify.display.mobile ? 'small' : 'large'"
                  rounded="pill"
                >
                  <div class="d-flex align-center">
                    <v-avatar
                      color="info"
                      :size="$vuetify.display.mobile ? '28' : '36'"
                      class="elevation-2"
                    >
                      <v-img
                        :src="
                          currentUser.avatar_url ||
                          'https://cdn.vuetifyjs.com/images/john.jpg'
                        "
                        cover
                        :alt="currentUser.name + ' avatar'"
                      >
                      </v-img>
                    </v-avatar>
                    <span
                      class="ml-2 font-weight-bold text-white d-none d-md-inline"
                      :class="
                        $vuetify.display.mobile
                          ? 'text-caption'
                          : 'text-subtitle-1'
                      "
                    >
                      {{ currentUser.name }}
                    </span>
                    <v-icon
                      :size="$vuetify.display.mobile ? '16' : '20'"
                      class="ml-1 d-none d-md-inline"
                      >mdi-chevron-down</v-icon
                    >
                  </div>
                </v-btn>
              </template>
            </template>

            <v-card
              v-if="!currentUser"
              min-width="240"
              elevation="8"
              rounded="xl"
              class="pa-4 mt-3 auth-card"
            >
              <div class="d-flex flex-column" style="gap: 12px">
                <v-btn
                  color="darkgreen"
                  block
                  rounded="pill"
                  size="large"
                  class="text-white text-body-1 font-weight-bold"
                  elevation="0"
                  @click="openDialog('sign-in')"
                >
                  Sign In
                </v-btn>

                <v-btn
                  variant="outlined"
                  color="darkgreen"
                  block
                  size="large"
                  class="text-body-1 font-weight-bold"
                  rounded="pill"
                  @click="openDialog('sign-up')"
                >
                  Sign Up
                </v-btn>
              </div>
            </v-card>

            <v-card
              v-else
              min-width="260"
              elevation="8"
              rounded="xl"
              class="pa-2 mt-3 user-menu-card"
            >
              <v-list class="py-2">
                <v-list-item class="mb-2 user-info-item rounded-lg">
                  <v-list-item-title class="font-weight-bold text-body-1">{{
                    currentUser.username
                  }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{
                    currentUser.email
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item
                  class="menu-list-item rounded-lg my-1"
                  @click="goToProfile('personal')"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account" size="22" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium"
                    >Personal Info</v-list-item-title
                  >
                </v-list-item>

                <v-list-item
                  class="menu-list-item rounded-lg my-1"
                  @click="goToProfile('orders')"
                >
                  <template v-slot:prepend>
                    <v-icon
                      icon="mdi-package-variant"
                      size="22"
                      class="mr-2"
                    ></v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium"
                    >Orders</v-list-item-title
                  >
                </v-list-item>

                <v-list-item
                  class="menu-list-item rounded-lg my-1"
                  @click="goToProfile('wishlist')"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-heart" size="22" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium"
                    >Wishlist</v-list-item-title
                  >
                </v-list-item>

                <v-list-item
                  class="menu-list-item rounded-lg my-1"
                  @click="goToProfile('reviews')"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-star" size="22" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium"
                    >My Reviews</v-list-item-title
                  >
                </v-list-item>

                <v-list-item
                  class="menu-list-item rounded-lg my-1"
                  @click="goToProfile('password')"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-lock" size="22" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium"
                    >Change Password</v-list-item-title
                  >
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item
                  class="menu-list-item rounded-lg my-1 logout-item"
                  @click="handleLogout"
                >
                  <template v-slot:prepend>
                    <v-icon
                      icon="mdi-logout"
                      size="22"
                      color="error"
                      class="mr-2"
                    ></v-icon>
                  </template>
                  <v-list-item-title class="text-error font-weight-medium"
                    >Logout</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>

        <v-dialog
          v-model="dialogSignIn"
          min-width="1300"
          transition="dialog-transition"
        >
          <div class="position-relative">
            <Login
              @toggleLinkSignUp="openDialog"
              @show-snackbar="showSnackbar"
            />
            <v-btn
              icon
              @click="dialogSignIn = false"
              class="dialog-close-btn"
              size="large"
              variant="flat"
              color="rgba(255,255,255,0.2)"
            >
              <v-icon color="white">mdi-close</v-icon>
            </v-btn>
          </div>
        </v-dialog>

        <v-dialog
          v-model="dialogSignUp"
          min-width="1300"
          transition="dialog-transition"
        >
          <div class="position-relative">
            <SignUp
              @checkIsSignUp="handleCheckIsSignUp"
              @toggleLinkSignIn="openDialog"
            />
            <v-btn
              icon
              @click="dialogSignUp = false"
              class="dialog-close-btn"
              size="large"
              variant="flat"
              color="rgba(255,255,255,0.2)"
            >
              <v-icon color="white">mdi-close</v-icon>
            </v-btn>
          </div>
        </v-dialog>
      </v-container>
    </v-app-bar>

    <!-- Mobile Navigation Drawer (Outside app-bar for proper z-index) -->
    <v-navigation-drawer
      v-model="mobileMenuDrawer"
      location="left"
      temporary
      width="280"
      class="mobile-drawer"
    >
      <v-list class="py-2">
        <v-list-item class="mb-4">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3 bg-customyellow elevation-2">
              <v-icon color="darkgreen" size="24"
                >mdi-book-open-page-variant</v-icon
              >
            </v-avatar>
            <span class="font-weight-bold text-h6 text-customblack"
              >THBookStore</span
            >
          </div>
        </v-list-item>

        <v-divider class="mb-2"></v-divider>

        <v-list-item
          class="mobile-nav-item"
          @click="navigateAndClose('/')"
          :class="$route.path === '/' ? 'active-mobile-nav' : ''"
        >
          <template v-slot:prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" class="mobile-nav-item">
              <template v-slot:prepend>
                <v-icon>mdi-shape</v-icon>
              </template>
              <v-list-item-title>Category</v-list-item-title>
            </v-list-item>
          </template>

          <template v-for="(category, index) in bookSubjects" :key="index">
            <v-list-group v-if="category.subcategories" sub-group>
              <template v-slot:activator="{ props }">
                <v-list-item v-bind="props" class="pl-8">
                  <v-list-item-title class="text-body-2">{{
                    category.category
                  }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="(subcategory, subIndex) in category.subcategories"
                :key="subIndex"
                class="pl-12"
                @click="
                  navigateAndClose(
                    `/subjects/${encodeURIComponent(subcategory.toLowerCase())}`
                  )
                "
              >
                <v-list-item-title class="text-caption">{{
                  subcategory
                }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-item
              v-else
              class="pl-8"
              @click="
                navigateAndClose(
                  `/subjects/${encodeURIComponent(
                    category.category.toLowerCase()
                  )}`
                )
              "
            >
              <v-list-item-title class="text-body-2">{{
                category.category
              }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list-group>

        <v-list-item
          class="mobile-nav-item"
          @click="navigateAndClose('/favorites')"
          :class="$route.path === '/favorites' ? 'active-mobile-nav' : ''"
        >
          <template v-slot:prepend>
            <v-icon>mdi-heart</v-icon>
          </template>
          <v-list-item-title>Favorites</v-list-item-title>
          <template v-slot:append v-if="userFavoritesCount > 0">
            <v-chip size="x-small" color="primary">{{
              userFavoritesCount
            }}</v-chip>
          </template>
        </v-list-item>

        <v-list-item
          class="mobile-nav-item"
          @click="navigateAndClose('/contact')"
          :class="$route.path === '/contact' ? 'active-mobile-nav' : ''"
        >
          <template v-slot:prepend>
            <v-icon>mdi-email</v-icon>
          </template>
          <v-list-item-title>Contact Us</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <template v-if="currentUser">
          <v-list-item class="mb-2 pa-3 bg-grey-lighten-4 rounded">
            <div class="d-flex align-center">
              <v-avatar color="info" size="36" class="mr-3">
                <v-img
                  :src="
                    currentUser.avatar_url ||
                    'https://cdn.vuetifyjs.com/images/john.jpg'
                  "
                  cover
                ></v-img>
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-bold">
                  {{ currentUser.username }}
                </div>
                <div class="text-caption text-grey">
                  {{ currentUser.email }}
                </div>
              </div>
            </div>
          </v-list-item>

          <v-list-item
            class="mobile-nav-item"
            @click="navigateAndClose('/profiles?tab=personal')"
          >
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>

          <v-list-item
            class="mobile-nav-item"
            @click="navigateAndClose('/profiles?tab=orders')"
          >
            <template v-slot:prepend>
              <v-icon>mdi-package-variant</v-icon>
            </template>
            <v-list-item-title>Orders</v-list-item-title>
          </v-list-item>

          <v-list-item class="mobile-nav-item text-error" @click="handleLogout">
            <template v-slot:prepend>
              <v-icon color="error">mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </template>

        <template v-else>
          <v-list-item class="pa-3">
            <v-btn
              block
              color="darkgreen"
              rounded="pill"
              @click="openDialogAndCloseMobile('sign-in')"
            >
              Sign In
            </v-btn>
          </v-list-item>
          <v-list-item class="pa-3">
            <v-btn
              block
              variant="outlined"
              color="darkgreen"
              rounded="pill"
              @click="openDialogAndCloseMobile('sign-up')"
            >
              Sign Up
            </v-btn>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Snackbar Alert -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    />
  </div>
</template>

<script>
definePageMeta({
  layout: "default",
});
import { mapState } from "vuex";
import { mapActions } from "vuex";
import { bookSubjects } from "@/constants/bookSubjects.js";
import SnackbarAlert from "~/components/SnackbarAlert.vue";

export default {
  components: {
    SnackbarAlert,
  },
  data() {
    return {
      dialogSignUp: false,
      dialogSignIn: false,
      menu: false,
      accountMenu: false,
      isSessionRestored: false,
      mobileMenuDrawer: false,
      snackbar: {
        show: false,
        message: "",
        color: "success",
        timeout: 3000,
      },
      bookSubjects,
    };
  },
  watch: {
    currentUser: {
      handler(newValue) {
        if (newValue) {
          this.dialogSignIn = false;
          this.dialogSignUp = false;
        }
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions("auth", ["logout", "restoreSession"]),
    ...mapActions("favorite", ["getFavoritesForEachUser"]),
    ...mapActions("cart", ["fetchCart"]),
    openDialog(type) {
      if (this.currentUser) {
        this.dialogSignIn = false;
        this.dialogSignUp = false;
        return;
      }

      this.dialogSignIn = false;
      this.dialogSignUp = false;

      this.$nextTick(() => {
        if (type === "sign-in") {
          this.dialogSignIn = true;
        } else if (type === "sign-up") {
          this.dialogSignUp = true;
        }
      });
    },
    handleCheckIsSignUp(data) {
      this.dialogSignUp = false;
      this.dialogSignIn = data;
    },
    handleLogout() {
      this.logout();
      this.$router.push("/");
    },
    goToProfile(tab) {
      this.accountMenu = false;
      this.$nextTick(() => {
        this.$router.push(`/profiles?tab=${tab}`);
      });
    },
    showSnackbar(data) {
      this.snackbar.message = data.message;
      this.snackbar.color = data.color;
      this.snackbar.show = true;

      if (data.color === "success") {
        this.dialogSignIn = false;
      }
    },
    navigateAndClose(route) {
      this.mobileMenuDrawer = false;
      this.$router.push(route);
    },
    openDialogAndCloseMobile(type) {
      this.mobileMenuDrawer = false;
      this.$nextTick(() => {
        this.openDialog(type);
      });
    },
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("favorite", ["favorites"]),
    ...mapState("cart", ["cart"]),
    userFavoritesCount() {
      return this.favorites ? this.favorites.length : 0;
    },
    cartItemCount() {
      return this.cart.items ? this.cart.items.length : 0;
    },
  },
  async mounted() {
    await this.getFavoritesForEachUser();
    await this.fetchCart();
    await this.restoreSession();
    this.isSessionRestored = true;
  },
};
</script>

<style scoped>
/* Logo Animation */
.logo-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-container:hover .logo-avatar {
  transform: rotate(10deg);
}

.logo-text {
  transition: all 0.3s ease;
}

.logo-container:hover .logo-text {
  letter-spacing: 0.05em;
}

/* Navigation Buttons */
.nav-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(220, 247, 99, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.nav-btn:hover::before {
  width: 300px;
  height: 300px;
}

.nav-btn:hover {
  transform: translateY(-2px);
}

.active-nav {
  box-shadow: 0 4px 12px rgba(220, 247, 99, 0.4);
}

/* Category Menu */
.category-menu {
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.category-item,
.subcategory-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.category-item:hover {
  background: rgba(220, 247, 99, 0.15);
  transform: translateX(4px);
}

.subcategory-item:hover {
  background: rgba(220, 247, 99, 0.1);
  transform: translateX(4px);
}

.user-profile-btn {
  transition: all 0.3s ease;
  border-radius: 50px;
  padding: 4px 16px 4px 4px;
}

.user-profile-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Auth Card */
.auth-card {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* User Menu Card */
/* User Menu Card - FIX HORIZONTAL SCROLL */
.user-menu-card {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden !important;
  max-width: 320px;
  width: 280px;
}

.user-menu-card .v-list {
  overflow-x: hidden !important;
}

.user-menu-card .v-list-item {
  overflow: hidden !important;
  max-width: 100%;
}

.user-menu-card .v-list-item__content {
  overflow: hidden;
  min-width: 0;
}

.user-info-item {
  background: rgba(0, 0, 0, 0.03);
  overflow: hidden !important;
}

.user-info-item .v-list-item-title,
.user-info-item .v-list-item-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.menu-list-item {
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden !important;
}

.menu-list-item .v-list-item-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-list-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.logout-item:hover {
  background: rgba(244, 67, 54, 0.08);
}

/* Dialog Close Button */
.dialog-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.dialog-close-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: rotate(90deg);
}

/* Badge customization */
:deep(.v-badge__badge) {
  font-size: 10px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
}

/* Mobile Drawer Styles */
.mobile-drawer {
  z-index: 9999 !important;
}

:deep(.mobile-drawer .v-navigation-drawer__scrim) {
  z-index: 9998 !important;
}

:deep(.v-navigation-drawer) {
  z-index: 9999 !important;
}

.mobile-nav-item {
  transition: all 0.2s ease;
  cursor: pointer;
  margin: 2px 8px;
  border-radius: 8px;
}

.mobile-nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.active-mobile-nav {
  background: rgba(220, 247, 99, 0.2);
  font-weight: bold;
}

/* Responsive Adjustments */
@media (max-width: 599px) {
  .action-icon-btn {
    min-width: 36px !important;
    padding: 0 !important;
  }

  :deep(.v-badge__badge) {
    font-size: 9px;
    min-width: 16px;
    height: 16px;
  }
}

@media (max-width: 959px) {
  .logo-text {
    font-size: 1.1rem !important;
  }
}
</style>
