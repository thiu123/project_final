<template>
  <div>
    <v-app-bar color="white" elevation="1">
      <v-container class="d-flex align-center">
        <div class="d-flex align-center">
          <v-btn
            variant="text"
            color="grey-darken-3"
            class="text-body-2 font-weight-regular"
          >
            <v-icon size="small" class="mr-1">mdi-phone</v-icon>
            +84971450800
          </v-btn>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex">
          <v-btn
            icon="mdi-facebook"
            variant="text"
            color="grey-darken-3"
            size="large"
          ></v-btn>
          <v-btn
            icon="mdi-instagram"
            variant="text"
            color="grey-darken-3"
            size="large"
          ></v-btn>
          <v-btn
            icon="mdi-twitter"
            variant="text"
            color="grey-darken-3"
            size="large"
          ></v-btn>
          <v-btn
            icon="mdi-pinterest"
            variant="text"
            color="grey-darken-3"
            size="large"
          ></v-btn>
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
            <v-btn variant="text" to="/" class="text-none text-subtitle-2"
              >HOME</v-btn
            >
            <v-btn variant="text" to="/about" class="text-none text-subtitle-2"
              >ABOUT US</v-btn
            >
            <v-btn variant="text" to="/books" class="text-none text-subtitle-2"
              >BOOKS</v-btn
            >
            <v-btn
              variant="text"
              to="/new-release"
              class="text-none text-subtitle-2"
              >NEW RELEASE</v-btn
            >
            <v-btn
              variant="text"
              to="/contact"
              class="text-none text-subtitle-2"
              >CONTACT US</v-btn
            >
            <v-btn variant="text" to="/blog" class="text-none text-subtitle-2"
              >BLOG</v-btn
            >
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex align-center">
            <v-text-field
              :loading="loading"
              append-inner-icon="mdi-magnify"
              density="compact"
              label="Search templates"
              variant="outlined"
              style="width:12vw"
              hide-details
              single-line
              @click:append-inner="onClick"
            ></v-text-field>
            <v-btn icon="mdi-heart-outline" variant="text"></v-btn>
            <v-btn icon="mdi-cart-outline" variant="text"></v-btn>
          </div>
        </div>
      </v-container>
    </v-app-bar>
  </div>
</template>
<script>
definePageMeta({
  layout: "default",
});
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("auth", ["currentUser"]),
  },
};
</script>
