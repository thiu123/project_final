<template>
  <div>
    <div
      v-if="!isLoading && !pdfUrl"
      class="container mx-auto px-4 py-16"
    >
      <div class="mx-auto max-w-xl text-center">
        <FileWarning class="mx-auto h-16 w-16 text-muted-foreground" />
        <template v-if="book?.pdf_pages">
          <h2 class="mb-2 mt-4 text-2xl font-bold">No preview for this ebook</h2>
          <p class="text-base text-muted-foreground">
            Buy the ebook to read all {{ book.pdf_pages }} pages.
          </p>
          <UiButton class="mt-6" @click="router.push(`/details/${bookId}`)">
            Go to the book
          </UiButton>
        </template>
        <template v-else>
          <h2 class="mb-2 mt-4 text-2xl font-bold">
            No ebook file available yet
          </h2>
          <p class="text-base text-muted-foreground">
            This book doesn't have an ebook file uploaded yet. Please check back
            later.
          </p>
        </template>
      </div>
    </div>

    <EpubReader
      v-else-if="pdfUrl"
      :pdf-url="pdfUrl"
      :http-headers="httpHeaders"
      :is-purchased="canReadFull"
      :full-page-count="book?.pdf_pages ?? null"
      :book-id="bookId"
    />
  </div>
</template>

<script setup lang="ts">
import { FileWarning } from "lucide-vue-next";
import { ebookReadUrl, getBookById } from "@/api/bookApi";
import { useAuthStore } from "@/stores/auth";
import { useOrderStore } from "@/stores/order";
import type { Book } from "@/types";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();

const bookId = ref<string | null>(null);
const book = ref<Book | null>(null);
const pdfUrl = ref<string | null>(null);
const httpHeaders = ref<Record<string, string> | undefined>(undefined);
const canReadFull = ref(false);
const isLoading = ref(true);

async function hasFullAccess(id: string): Promise<boolean> {
  if (!book.value?.pdf_pages || !authStore.accessToken) return false;
  if (authStore.currentUser?.admin) return true;
  return orderStore.checkEbookPurchase(id);
}

onMounted(async () => {
  authStore.restoreSession();
  bookId.value = (route.query.bookId as string) || null;

  if (bookId.value) {
    try {
      const response = await getBookById(bookId.value);
      book.value = response.data;
    } catch (error: any) {
      console.error("Failed to load book:", error);
    }

    canReadFull.value = await hasFullAccess(bookId.value);
    if (canReadFull.value) {
      pdfUrl.value = ebookReadUrl(bookId.value);
      httpHeaders.value = { token: `Bearer ${authStore.accessToken}` };
    } else {
      pdfUrl.value = book.value?.pdf_preview_url ?? null;
    }
  }

  isLoading.value = false;
});
</script>
