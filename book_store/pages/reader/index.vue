<template>
  <div>
    <div
      v-if="!isLoading && !pdfUrl"
      class="container mx-auto max-w-2xl px-4 py-28 text-center md:py-40"
    >
      <p class="eyebrow">The reader</p>
      <template v-if="book?.pdf_pages">
        <h1 class="mt-6 font-serif text-4xl font-normal leading-[1.04] tracking-[-0.025em] md:text-5xl">
          No preview for <span class="italic">this ebook.</span>
        </h1>
        <p class="mt-5 text-[15px] text-muted-foreground">
          Buy the ebook to read all {{ book.pdf_pages }} pages.
        </p>
        <UiButton variant="ink" size="cta" class="mt-10 shadow-none" @click="router.push(`/details/${bookId}`)">
          Go to the book
        </UiButton>
      </template>
      <template v-else>
        <h1 class="mt-6 font-serif text-4xl font-normal leading-[1.04] tracking-[-0.025em] md:text-5xl">
          The ebook is <span class="italic">on its way.</span>
        </h1>
        <p class="mt-5 text-[15px] text-muted-foreground">
          This book doesn't have an ebook file uploaded yet. Please check back later.
        </p>
      </template>
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
