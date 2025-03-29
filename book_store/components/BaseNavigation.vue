<template>
  <v-app-bar class="bg-darkgreen elevation-0">
    <v-container class="d-flex align-center py-0">
      <div class="d-flex align-center">
        <v-icon
          color="white"
          icon="mdi-book-open-page-variant"
          class="mr-2"
        ></v-icon>
        <span class="font-weight-bold text-white">THBookStore</span>
      </div>
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
          <v-list-item
            v-for="(item, i) in subjects"
            :key="i"
            :value="item"
            @click="
              () =>
                $router.push(
                  `/subjects/${encodeURIComponent(item.toLowerCase())}`
                )
            "
          >
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            {{ currentUser }}
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn
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
      </v-btn>

      <v-btn
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
      </v-btn>

      <v-btn
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
      </v-btn>

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

      <v-spacer></v-spacer>
      <v-btn icon class="ml-1">
        <v-img width="28px" height="28px" src="../assets/shopping_bag.svg" />
      </v-btn>
      <v-btn icon>
        <v-img width="28px" height="28px" src="../assets/heart.svg" />
      </v-btn>

      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        location="bottom"
        open-on-hover
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ props }">
          <template v-if="!currentUser">
            <v-btn
              color="customyellow"
              variant="flat"
              class="ml-4 font-weight-bold text-darkgreen text-subtitle-1"
              rounded
              v-bind="props"
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
            <div class="d-flex align-center" v-bind="props">
              <v-avatar color="info">
                <v-icon icon="mdi-account-circle"></v-icon>
              </v-avatar>
              <span class="ml-2 text-subtitle-1 font-weight-bold">
                {{ currentUser.name }}
              </span>
            </div>
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

            <v-list-item @click="handleLogout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <v-dialog v-model="dialogSignIn">
        <Login class="position-relative" />
        <v-icon
          @click="dialogSignIn = false"
          class="cursor-pointer position-absolute"
          size="large"
          color="white"
          style="top: 8%; right: 15%"
          >mdi-close</v-icon
        >
      </v-dialog>

      <v-dialog v-model="dialogSignUp">
        <SignUp />
        <v-icon
          @click="dialogSignUp = false"
          color="white"
          class="cursor-pointer position-absolute"
          size="large"
          style="top: 8%; right: 15%"
          >mdi-close</v-icon
        >
      </v-dialog>
    </v-container>
  </v-app-bar>
</template>
<script>
definePageMeta({
  layout: "default",
});
import { mapState } from "vuex";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      dialogSignUp: false,
      dialogSignIn: false,
      menu: false,
      subjects: [
        "Fiction",
        "Mystery",
        "Fantasy",
        "Romance",
        "Manga",
        "Self-Help",
        "Biography",
        "History",
        "IT & Programming",
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
    openDialog(type) {
      if (this.currentUser) {
        this.dialogSignIn = false;
        this.dialogSignUp = false;
        return;
      }

      if (type === "sign-in") {
        this.dialogSignIn = true;
      } else if (type === "sign-up") {
        this.dialogSignUp = true;
      }
    },
    handleLogout() {
      this.logout();
      this.$router.push("/");
    },
  },
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
  mounted() {
    this.restoreSession();
  },
};
</script>
