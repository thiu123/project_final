<template>
  <div class="container mx-auto px-4 py-16">
    <div class="mx-auto w-full lg:max-w-5xl xl:max-w-4xl">
      <div
        class="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/60 p-8 shadow-2xl"
      >
        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="mb-4 flex justify-center">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-customyellow shadow-md"
            >
              <Search class="h-8 w-8 text-darkgreen" />
            </div>
          </div>
          <h2 class="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Discover Your Next Great Read
          </h2>
          <p class="text-lg text-muted-foreground">
            Search through thousands of books to find your perfect match
          </p>
        </div>

        <!-- Search bar -->
        <form class="mb-6 grid grid-cols-12 gap-4" @submit.prevent="submitSearch">
          <div class="col-span-12 md:col-span-10">
            <UiInput
              v-model="query"
              placeholder="Search for books, authors, or genres..."
              class="h-12 rounded-xl"
            >
              <template #prepend>
                <Search class="h-5 w-5" />
              </template>
            </UiInput>
          </div>
          <div class="col-span-12 md:col-span-2">
            <UiButton
              type="submit"
              block
              size="lg"
              class="h-12 rounded-xl font-bold shadow-md"
              :disabled="!query.trim()"
            >
              Search
            </UiButton>
          </div>
        </form>

        <!-- Live results -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="-translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-2 opacity-0"
        >
          <div
            v-if="results.length"
            class="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          >
            <ul class="max-h-[400px] divide-y divide-border overflow-y-auto">
              <li
                v-for="book in results"
                :key="book._id"
                class="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted"
                @click="router.push(`/details/${book._id}`)"
              >
                <img
                  :src="book.cover_url"
                  :alt="book.title"
                  class="h-[60px] w-[60px] shrink-0 rounded-lg bg-muted object-cover"
                />

                <div class="min-w-0 flex-1">
                  <div class="mb-1 truncate font-bold text-foreground">
                    {{ book.title }}
                  </div>
                  <div class="truncate text-sm text-muted-foreground">
                    {{ book.authors?.join(", ") || "Unknown Author" }} •
                    {{ book.first_publish_year }}
                  </div>
                </div>

                <div class="flex shrink-0 items-center">
                  <Star class="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                  <span class="text-xs text-foreground">{{ book.rating ?? "—" }}</span>
                </div>
              </li>
            </ul>
          </div>
        </Transition>

        <!-- Trending -->
        <div class="text-center">
          <h3 class="mb-6 text-2xl font-semibold text-foreground">
            Trending This Week
          </h3>

          <div class="flex flex-wrap justify-center gap-4">
            <template v-if="trending.length">
              <div
                v-for="book in trending"
                :key="book._id"
                class="cursor-pointer overflow-hidden rounded-lg bg-muted shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                @click="router.push(`/details/${book._id}`)"
              >
                <img
                  v-if="book.cover_url"
                  :src="book.cover_url"
                  :alt="book.title"
                  class="h-[110px] w-20 object-cover"
                />
                <div v-else class="flex h-[110px] w-20 items-center justify-center">
                  <UiSpinner class="text-primary" />
                </div>
              </div>
            </template>
            <template v-else>
              <UiSkeleton
                v-for="n in 6"
                :key="n"
                class="h-[110px] w-20 rounded-xl shadow-md"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from "lodash/debounce";
import { Search, Star } from "lucide-vue-next";
import { searchBooksByTitle } from "@/api/bookApi";
import type { Book } from "@/types";

const props = withDefaults(
  defineProps<{
    /** Books shown under "Trending This Week"; the first three are used. */
    trendingBooks?: Book[];
  }>(),
  { trendingBooks: () => [] }
);

const router = useRouter();

const query = ref("");
const results = ref<Book[]>([]);

const trending = computed(() => props.trendingBooks.slice(0, 3));

const runSearch = debounce(async (term: string) => {
  try {
    const response = await searchBooksByTitle(term);
    results.value = response.data ?? [];
  } catch (error) {
    console.error("Error when searching", error);
    results.value = [];
  }
}, 300);

watch(query, (term) => {
  if (!term.trim()) {
    runSearch.cancel();
    results.value = [];
    return;
  }
  runSearch(term);
});

onBeforeUnmount(() => runSearch.cancel());

/**
 * The dropdown above is the live result list; submitting takes the buyer to the
 * full, paginated catalogue for the term. (The Search button previously only
 * logged to the console.)
 */
function submitSearch() {
  const term = query.value.trim();
  if (!term) return;
  router.push({ path: "/subjects/all", query: { search: term } });
}
</script>
