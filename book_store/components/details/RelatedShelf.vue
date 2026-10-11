<template>
  <section v-if="books.length">
    <StoreSectionHeader
      number="03"
      eyebrow="From the same shelf"
      :to="`/subjects/${slug}`"
      link-label="Browse shelf"
    >
      More in <span class="italic capitalize">{{ subject }}</span>
    </StoreSectionHeader>

    <div class="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="(book, index) in books"
        :key="book._id"
        v-reveal="index * 70"
        :class="VISIBILITY[index]"
      >
        <BookGridCard
          :book="book"
          :favorite="isFavoriteBook(favorites, book._id)"
          @add-to-cart="emit('add-to-cart', $event)"
          @toggle-favorite="favoriteStore.toggleFavorites($event)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { getBooks } from "@/api/bookApi";
import { useFavoriteStore } from "@/stores/favorite";
import { isFavoriteBook } from "@/utils/favorites";
import { subjectSlug } from "@/utils/subjects";
import type { Book } from "@/types";

const SHELF_SIZE = 5;

const VISIBILITY = ["", "", "", "sm:hidden lg:block", "hidden lg:block"];

const props = defineProps<{
  subject: string;
  excludeId: string;
}>();

const emit = defineEmits<{
  "add-to-cart": [bookId: string];
}>();

const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);

const books = ref<Book[]>([]);

const slug = computed(() => subjectSlug(props.subject));

onMounted(async () => {
  try {
    const response = await getBooks({ subject: props.subject, limit: SHELF_SIZE + 1 });
    books.value = response.data.items
      .filter((book) => book._id !== props.excludeId)
      .slice(0, SHELF_SIZE);
  } catch (error) {
    console.error("Error fetching related books:", error);
  }
});
</script>
