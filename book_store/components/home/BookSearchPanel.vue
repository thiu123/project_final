<template>
  <section class="bg-muted">
    <div
      v-reveal
      class="container mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 py-20 md:py-28 lg:grid-cols-12 lg:gap-16"
    >
      <div class="lg:col-span-7">
        <p class="eyebrow">Search the catalogue</p>
        <h2
          class="mt-5 font-serif text-[2.5rem] font-normal leading-[1.02] tracking-[-0.025em] text-foreground md:text-6xl"
        >
          What are you <span class="italic">reading</span> next?
        </h2>
        <p class="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
          Search by title or author across the whole catalogue.
        </p>

        <form
          class="mt-10 flex items-end gap-4 md:gap-6"
          role="search"
          @submit.prevent="submitSearch"
        >
          <label class="relative min-w-0 flex-1">
            <span class="sr-only">Search for books or authors</span>
            <Search
              class="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              :stroke-width="1.5"
            />
            <input
              v-model="query"
              type="search"
              autocomplete="off"
              placeholder="A title or an author"
              class="ed-input h-14 pl-9 font-serif text-xl md:text-2xl"
            />
          </label>
          <UiButton
            type="submit"
            variant="ink"
            size="cta"
            class="shrink-0 px-6 shadow-none md:px-8"
            :disabled="!query.trim()"
          >
            Search
          </UiButton>
        </form>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="-translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-1 opacity-0"
        >
          <ul
            v-if="results.length"
            class="max-h-[400px] divide-y divide-border overflow-y-auto border-b border-border"
          >
            <li v-for="book in results" :key="book._id">
              <NuxtLink
                :to="`/details/${book._id}`"
                class="group flex items-center gap-4 py-3"
              >
                <div class="ed-cover aspect-[2/3] w-10 shrink-0 overflow-hidden bg-background">
                  <img
                    v-if="book.cover_url"
                    :src="book.cover_url"
                    :alt="book.title"
                    class="h-full w-full object-cover"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
                    {{ book.title }}
                  </p>
                  <p class="mt-0.5 truncate text-[13px] text-muted-foreground">
                    {{ book.authors?.join(", ") || "Unknown author" }}<template v-if="book.first_publish_year">
                      <span class="mx-2 text-border">/</span>{{ book.first_publish_year }}</template>
                  </p>
                </div>

                <span class="flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <Star class="size-3 fill-current" />
                  {{ book.rating ?? "-" }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </Transition>
      </div>

      <div class="lg:col-span-4 lg:col-start-9">
        <p class="eyebrow">Trending this week</p>

        <div class="mt-6 grid grid-cols-3 gap-4 md:gap-5">
          <template v-if="trending.length">
            <NuxtLink
              v-for="book in trending"
              :key="book._id"
              :to="`/details/${book._id}`"
              class="group block"
            >
              <div
                class="ed-cover aspect-[2/3] overflow-hidden bg-background transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5"
              >
                <img
                  v-if="book.cover_url"
                  :src="book.cover_url"
                  :alt="book.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="flex h-full items-center justify-center p-2 text-center font-serif text-sm text-muted-foreground"
                >
                  {{ book.title }}
                </div>
              </div>
              <p class="mt-3 line-clamp-2 font-serif text-[15px] leading-snug text-foreground transition-colors group-hover:text-primary">
                {{ book.title }}
              </p>
            </NuxtLink>
          </template>
          <template v-else>
            <div v-for="n in 3" :key="n">
              <UiSkeleton class="aspect-[2/3] w-full rounded-none" />
              <UiSkeleton class="mt-3 h-4 w-3/4 rounded-none" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
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
