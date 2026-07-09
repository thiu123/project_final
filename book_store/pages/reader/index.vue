<template>
  <div>
    <v-container v-if="!isLoadingBook && !book?.pdf_url" class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey">mdi-file-document-alert-outline</v-icon>
          <h2 class="text-h5 font-weight-bold mt-4 mb-2">
            No ebook file available yet
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            This book doesn't have an ebook file uploaded yet. Please check
            back later.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <EpubReader
      v-else-if="book?.pdf_url"
      :pdf-url="book.pdf_url"
      :is-purchased="hasPurchasedEbook"
      :preview-limit="20"
      :book-id="bookId"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { getBookById } from "@/api/bookApi";

export default {
  data() {
    return {
      bookId: null,
      book: null,
      isLoadingBook: true,
    };
  },

  computed: {
    ...mapState("auth", ["currentUser"]),
    ...mapState("order", ["purchasedEbooks"]),

    isLoggedIn() {
      return this.currentUser !== null;
    },

    // ✅ Lấy purchase status từ store
    hasPurchasedEbook() {
      return this.purchasedEbooks[this.bookId] || false;
    },
  },

  async mounted() {
    // Lấy bookId từ query string
    this.bookId = this.$route.query.bookId;

    if (this.bookId) {
      try {
        const response = await getBookById(this.bookId);
        this.book = response.data;
      } catch (error) {
        console.error("Failed to load book:", error);
      }
    }
    this.isLoadingBook = false;

    // Kiểm tra user đã login chưa
    if (this.isLoggedIn && this.bookId) {
      await this.checkEbookPurchase(this.bookId);
    }
  },

  methods: {
    ...mapActions("order", ["checkEbookPurchase"]),
  },
};
</script>
