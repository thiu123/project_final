<template>
  <div>
    <div
      v-if="!isLoadingBook && !book?.pdf_url"
      class="container mx-auto px-4 py-16"
    >
      <div class="mx-auto max-w-xl text-center">
        <FileWarning class="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 class="mb-2 mt-4 text-2xl font-bold">
          No ebook file available yet
        </h2>
        <p class="text-base text-muted-foreground">
          This book doesn't have an ebook file uploaded yet. Please check back
          later.
        </p>
      </div>
    </div>

    <EpubReader
      v-else-if="book?.pdf_url"
      :pdf-url="book.pdf_url"
      :is-purchased="hasPurchasedEbook"
      :preview-limit="20"
      :book-id="bookId"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useOrderStore } from "@/stores/order";
import { FileWarning } from "lucide-vue-next";
import { getBookById } from "@/api/bookApi";
import type { Book } from "@/types";

const route = useRoute();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const { currentUser } = storeToRefs(authStore);
const { purchasedEbooks } = storeToRefs(orderStore);

const bookId = ref<string | null>(null);
const book = ref<Book | null>(null);
const isLoadingBook = ref(true);

const isLoggedIn = computed(() => currentUser.value !== null);

// ✅ Lấy purchase status từ store
const hasPurchasedEbook = computed(() =>
  bookId.value ? purchasedEbooks.value[bookId.value] || false : false
);

onMounted(async () => {
  // Lấy bookId từ query string
  bookId.value = (route.query.bookId as string) || null;

  if (bookId.value) {
    try {
      const response = await getBookById(bookId.value);
      book.value = response.data;
    } catch (error: any) {
      console.error("Failed to load book:", error);
    }
  }
  isLoadingBook.value = false;

  // Kiểm tra user đã login chưa
  if (isLoggedIn.value && bookId.value) {
    await orderStore.checkEbookPurchase(bookId.value);
  }
});
</script>
