<template>
  <v-footer class="bg-orange-darken-2 pt-16 pb-8">
    <v-container>
      <v-row>
        <v-col cols="12" md="4" class="mb-8">
          <div class="d-flex align-center mb-4">
            <v-avatar color="white" size="40" class="mr-2">
              <v-icon color="orange-darken-2"
                >mdi-book-open-page-variant</v-icon
              >
            </v-avatar>
            <span class="text-h6 text-white font-weight-bold">BOOKSTORE</span>
          </div>
          <p class="text-white text-body-2 mb-6">
            Discover the perfect books for every occasion and interest, with our
            carefully curated collection.
          </p>
          <div class="d-flex">
            <v-btn
              icon="mdi-facebook"
              variant="text"
              color="white"
              size="small"
            ></v-btn>
            <v-btn
              icon="mdi-linkedin"
              variant="text"
              color="white"
              size="small"
            ></v-btn>
            <v-btn
              icon="mdi-twitter"
              variant="text"
              color="white"
              size="small"
            ></v-btn>
            <v-btn
              icon="mdi-youtube"
              variant="text"
              color="white"
              size="small"
            ></v-btn>
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
          <h3 class="text-h6 text-white font-weight-bold mb-4">
            IMPORTANT LINKS
          </h3>
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
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center"
      >
        <div class="text-white text-body-2 mb-4 mb-sm-0">
          © 2023 Bookstore. All Rights Reserved.
        </div>
        <div class="text-white text-body-2">Privacy | Terms of Service</div>
      </div>
    </v-container>
  </v-footer>
</template>
<script>
definePageMeta({
  layout: "default",
});
export default {

};
</script>
