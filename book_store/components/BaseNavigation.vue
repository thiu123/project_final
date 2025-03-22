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
            ? 'backgroundColor: #435058'
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
                ? 'backgroundColor: #435058'
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
            ? 'backgroundColor: #435058'
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
            ? 'backgroundColor: #435058'
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
      <v-btn
        color="customyellow"
        variant="flat"
        class="ml-4 font-weight-bold text-darkgreen text-subtitle-1"
        rounded
        @click="$router.push('/login')"
      >
        Sign In
        <v-img
          class="ml-1"
          width="28px"
          height="28px"
          src="../assets/user_icon.svg"
        />
      </v-btn>
    </v-container>
  </v-app-bar>
</template>
<script>
definePageMeta({
  layout: "default",
});
import { mapState } from "vuex";
export default {
  data() {
    return {
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
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
};
</script>
