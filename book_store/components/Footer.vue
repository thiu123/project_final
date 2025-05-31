<template>
  <v-footer class="bg-orange-darken-2">
    <v-container>
      <v-row>
        <v-col cols="12" md="3">
          <div class="d-flex align-center mb-4">
            <v-icon icon="mdi-book-open-page-variant" class="mr-2"></v-icon>
            <span class="text-h6 font-weight-bold">THBookStore</span>
          </div>
          <div class="text-body-2 mb-1">Contact Info:</div>
          <div class="text-body-2 mb-1">
            Address: 1234 Bookstore Drive & 4th Ave
          </div>
          <div class="text-body-2 mb-1">Phone: 0971450800</div>
          <div class="text-body-2 mb-4">Email: nhokhieukute2004@gmail.com</div>
          <div class="text-body-2 mb-2">Follow Us:</div>
          <div class="d-flex">
            <v-btn icon variant="text" color="primary">
              <v-icon>mdi-facebook</v-icon>
            </v-btn>
            <v-btn icon variant="text" color="primary">
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
            <v-btn icon variant="text" color="primary">
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="3">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Company</h3>
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in companyLinks"
              :key="i"
              :value="item"
              class="px-0"
              density="compact"
            >
              <v-list-item-title class="text-body-2">{{
                item
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" md="3">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">My Account</h3>
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in accountLinks"
              :key="i"
              :value="item"
              class="px-0"
              density="compact"
            >
              <v-list-item-title class="text-body-2">{{
                item
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" md="3">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Support</h3>
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in supportLinks"
              :key="i"
              :value="item"
              class="px-0"
              density="compact"
            >
              <v-list-item-title class="text-body-2">{{
                item
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <div class="text-center text-body-2">
        All Rights Reserved Copyright © 2024
      </div>
    </v-container>
  </v-footer>
</template>
<script>
definePageMeta({
  layout: "default",
});
export default {};
</script>
