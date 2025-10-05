<template>
  <div>
    <EpubReader
      pdf-url="/sample.pdf"
      :is-purchased="hasPurchasedEbook"
      :preview-limit="20"
      :book-id="bookId"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      bookId: null,
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

    console.log("📖 Reader Page Mounted");
    console.log("📚 Book ID:", this.bookId);
    console.log("� Current User:", this.currentUser);
    console.log("🔐 Is Logged In:", this.isLoggedIn);

    // Kiểm tra user đã login chưa
    if (this.isLoggedIn && this.bookId) {
      await this.checkEbookPurchase(this.bookId);
      console.log("✅ Purchase status from store:", this.hasPurchasedEbook);
    } else {
      if (!this.isLoggedIn) {
        console.log("⚠️ User chưa login");
      }
      if (!this.bookId) {
        console.log("⚠️ Không có bookId trong query");
      }
      console.log("⚠️ Default isPurchased: false");
    }
  },

  methods: {
    ...mapActions("order", ["checkEbookPurchase"]),
  },
};
</script>
