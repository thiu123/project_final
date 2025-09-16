<template>
  <v-app-bar class="bg-waterblue elevation-0">
    <v-container
      class="d-flex align-center justify-space-between py-0"
      style="width: 65%"
    >
      <div
        class="d-flex align-center cursor-pointer"
        style="text-decoration: none"
        to="/"
      >
        <nuxt-link to="/" class="d-flex align-center text-decoration-none">
          <v-avatar size="40" class="mr-3 bg-customyellow">
            <v-icon color="darkgreen" size="24"
              >mdi-book-open-page-variant</v-icon
            >
          </v-avatar>
          <span class="font-weight-bold text-h5 text-white letter-spacing"
            >THBookStore</span
          >
        </nuxt-link>
      </div>
      <div class="d-flex algin-center justify-space-between ga-10">
        <v-btn
          rounded="lg"
          variant="flat"
          flat
          class="ml-4 font-weight-bold text-subtitle-1"
          :style="
            $route.path === '/'
              ? 'backgroundColor: #DCF763'
              : 'backgroundColor:transparent'
          "
          :class="$route.path === '/' ? 'text-darkgreen' : 'text-white'"
          to="/"
        >
          Home
        </v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              :style="
                $route.path.startsWith('/subjects')
                  ? 'backgroundColor: #DCF763'
                  : 'backgroundColor: transparent'
              "
              :class="
                $route.path.startsWith('/subjects')
                  ? 'text-darkgreen'
                  : 'text-white'
              "
              variant="text"
              class="font-weight-bold text-subtitle-1"
              v-bind="props"
            >
              Category <v-icon icon="mdi-chevron-down"></v-icon>
            </v-btn>
          </template>

          <v-list>
            <template v-for="(category, index) in bookSubjects" :key="index">
              <!-- Categories with subcategories -->
              <v-list-group v-if="category.subcategories">
                <template v-slot:activator="{ props }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{
                      category.category
                    }}</v-list-item-title>
                  </v-list-item>
                </template>

                <template
                  v-for="(subcategory, subIndex) in category.subcategories"
                  :key="subIndex"
                >
                  <v-list-item
                    @click="
                      $router.push(
                        `/subjects/${encodeURIComponent(
                          subcategory.toLowerCase()
                        )}`
                      )
                    "
                  >
                    <v-list-item-title class="text-subtitle-2">{{
                      subcategory
                    }}</v-list-item-title>
                  </v-list-item>

                  <!-- Divider between subcategories (except after the last one) -->
                  <v-divider
                    v-if="subIndex < category.subcategories.length - 1"
                    class="opacity-25"
                  ></v-divider>
                </template>
              </v-list-group>

              <!-- Categories without subcategories -->
              <v-list-item
                v-else
                @click="
                  $router.push(
                    `/subjects/${encodeURIComponent(
                      category.category.toLowerCase()
                    )}`
                  )
                "
              >
                <v-list-item-title>{{ category.category }}</v-list-item-title>
              </v-list-item>

              <!-- Divider between categories (except after the last one) -->
              <v-divider
                v-if="index < bookSubjects.length - 1"
                class="opacity-25"
              ></v-divider>
            </template>
          </v-list>
        </v-menu>
        <v-btn
          :style="
            $route.path === '/contact'
              ? 'backgroundColor: #435058'
              : 'backgroundColor: transparent'
          "
          :class="$route.path === '/contact' ? 'text-darkgreen' : 'text-white'"
          class="font-weight-bold text-subtitle-1"
          variant="text"
          to="/contact"
        >
          Contact Us
        </v-btn>
      </div>
      <!-- <v-btn
        :style="
          $route.path === '/new-arrivals'
            ? 'backgroundColor: #435058'
            : 'backgroundColor: transparent'
        "
        :class="
          $route.path === '/new-arrivals' ? 'text-darkgreen' : 'text-white'
        "
        class="font-weight-bold text-subtitle-1"
        variant="text"
        to="/new-arrivals"
      >
        New Arrivals
      </v-btn> -->

      <!-- <v-btn
        :style="
          $route.path === '/best-selling'
            ? 'backgroundColor: #DCF763'
            : 'backgroundColor: transparent'
        "
        :class="
          $route.path === '/best-selling' ? 'text-darkgreen' : 'text-white'
        "
        class="font-weight-bold text-subtitle-1"
        variant="text"
        to="/best-selling"
      >
        Best Selling Books
      </v-btn> -->

      <!-- <v-btn
        :style="
          $route.path === '/view-all'
            ? 'backgroundColor: #DCF763'
            : 'backgroundColor: transparent'
        "
        :class="$route.path === '/view-all' ? 'text-darkgreen' : 'text-white'"
        class="font-weight-bold text-subtitle-1"
        variant="text"
        to="/view-all"
      >
        View All The Day
      </v-btn> -->

      <div class="d-flex align-center">
        <v-btn icon class="ml-1" @click="$router.push('/cart')">
          <v-icon>mdi-cart-plus</v-icon>
        </v-btn>

        <v-btn icon @click="$router.push('/favorites')">
          <v-img width="28px" height="28px" src="../assets/heart.svg" />
        </v-btn>
        <v-menu
          v-model="accountMenu"
          :close-on-content-click="false"
          location="bottom"
          open-on-hover
          transition="slide-y-transition"
        >
          <template v-if="isSessionRestored" v-slot:activator="{ props }">
            <template v-if="!currentUser">
              <v-btn
                color="customyellow"
                variant="flat"
                class="ml-4 font-weight-bold text-darkgreen text-subtitle-1"
                rounded
                v-bind="props"
                style="min-width: 140px"
              >
                Account
                <v-img
                  class="ml-1"
                  width="28px"
                  height="28px"
                  src="../assets/user_icon.svg"
                />
              </v-btn>
            </template>

            <template v-else>
              <v-btn
                v-bind="props"
                class="ml-4"
                variant="text"
                :style="{
                  '--v-theme-overlay-multiplier': '0',
                }"
                size="x-large"
              >
                <div class="d-flex align-center">
                  <v-avatar color="info" size="30">
                    <v-img
                      :src="currentUser.avatar_url"
                      cover
                      :alt="currentUser.name + ' avatar'"
                    >
                      <template v-slot:placeholder>
                        <v-icon icon="mdi-account-circle" size="24"></v-icon>
                      </template>
                    </v-img>
                  </v-avatar>
                  <span
                    class="ml-2 text-subtitle-1 font-weight-bold text-white"
                  >
                    {{ currentUser.name }}
                  </span>
                </div>
              </v-btn>
            </template>
          </template>

          <v-card
            v-if="!currentUser"
            min-width="200"
            elevation="0"
            rounded="lg"
            class="pa-2 mt-3"
          >
            <div class="d-flex flex-column" style="gap: 10px">
              <v-btn
                color="darkgreen"
                block
                rounded="lg"
                class="text-white text-body-1"
                @click="openDialog('sign-in')"
              >
                Sign In
              </v-btn>

              <v-btn
                variant="outlined"
                color="darkgreen"
                block
                class="text-body-1"
                rounded="lg"
                @click="openDialog('sign-up')"
              >
                Sign Up
              </v-btn>
            </div>
          </v-card>

          <v-card
            v-else
            min-width="200"
            elevation="0"
            rounded="lg"
            class="pa-2 mt-3"
          >
            <v-list>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">{{
                  currentUser.username
                }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  currentUser.email
                }}</v-list-item-subtitle>
              </v-list-item>

              <v-divider></v-divider>

              <v-list-item @click="goToProfile('personal')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account" size="20"></v-icon>
                </template>
                <v-list-item-title>Personal Info</v-list-item-title>
              </v-list-item>

              <v-list-item @click="goToProfile('orders')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-package-variant" size="20"></v-icon>
                </template>
                <v-list-item-title>Orders</v-list-item-title>
              </v-list-item>

              <v-list-item @click="goToProfile('wishlist')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-heart" size="20"></v-icon>
                </template>
                <v-list-item-title>Wishlist</v-list-item-title>
              </v-list-item>

              <v-list-item @click="goToProfile('reviews')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-star" size="20"></v-icon>
                </template>
                <v-list-item-title>My Reviews</v-list-item-title>
              </v-list-item>

              <v-list-item @click="goToProfile('password')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-lock" size="20"></v-icon>
                </template>
                <v-list-item-title>Change Password</v-list-item-title>
              </v-list-item>

              <v-divider></v-divider>

              <v-list-item @click="handleLogout">
                <template v-slot:prepend>
                  <v-icon icon="mdi-logout" size="20" color="error"></v-icon>
                </template>
                <v-list-item-title class="text-error">Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>

      <v-dialog v-model="dialogSignIn">
        <Login
          class="position-relative"
          @toggleLinkSignUp="openDialog"
          @show-snackbar="showSnackbar"
        />
        <v-icon
          @click="dialogSignIn = false"
          class="cursor-pointer position-absolute"
          size="large"
          color="white"
          style="top: 9%; right: 19%"
          >mdi-close</v-icon
        >
      </v-dialog>

      <v-dialog v-model="dialogSignUp">
        <SignUp
          @checkIsSignUp="handleCheckIsSignUp"
          @toggleLinkSignIn="openDialog"
        />
        <v-icon
          @click="dialogSignUp = false"
          color="white"
          class="cursor-pointer position-absolute"
          size="large"
          style="top: 9%; right: 19%"
          >mdi-close</v-icon
        >
      </v-dialog>
    </v-container>

    <!-- Snackbar Alert -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    />
  </v-app-bar>
</template>
<script>
definePageMeta({
  layout: "default",
});
import { mapState } from "vuex";
import { mapActions } from "vuex";
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
      snackbar: {
        show: false,
        message: "",
        color: "success",
        timeout: 3000,
      },
      bookSubjects: [
        {
          category: "Fiction",
          subcategories: [
            "Literary Fiction",
            "Historical Fiction",
            "Contemporary Fiction",
          ],
        },
        {
          category: "Romance",
          subcategories: ["Contemporary Romance", "Historical Romance"],
        },
        {
          category: "Manga",
        },
        {
          category: "Biography & Memoir",
          subcategories: ["Historical Figures", "Political Leaders"],
        },
        {
          category: "History",
          subcategories: ["Ancient History", "Modern History"],
        },
        {
          category: "Health & Wellness",
          subcategories: ["Cooking", "Nutrition", "Exercise"],
        },
        {
          category: "Science & Nature",
          subcategories: [
            "Popular Science",
            "Astronomy",
            "Biology & Life Sciences",
          ],
        },
        {
          category: "Business & Economics",
          subcategories: ["Personal Finance", "Investing", "Entrepreneurship"],
        },
      ],
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
    // ...mapActions("cart", ["fetchCart"]),
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
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
  async mounted() {
    await this.restoreSession();
    this.isSessionRestored = true;
  },
};
</script>
