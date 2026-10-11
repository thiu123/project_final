<template>
  <section class="container mx-auto max-w-7xl px-4">
    <StoreSectionHeader
      :number="number"
      eyebrow="Browse"
      description="The shelves our readers return to most, ranked by the number of titles."
      to="/subjects/all"
      link-label="All books"
    >
      Shop by <span class="italic">category</span>
    </StoreSectionHeader>

    <div
      v-if="tiles.length"
      class="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-12"
    >
      <NuxtLink
        v-for="(tile, index) in tiles"
        :key="tile.slug"
        v-reveal="index * 70"
        :to="`/subjects/${tile.slug}`"
        class="group flex flex-col"
        :class="index === 0 ? 'col-span-2 lg:col-span-6 lg:row-span-2' : 'lg:col-span-3'"
      >
        <div
          class="relative flex items-center justify-center overflow-hidden transition-colors duration-500"
          :class="
            index === 0
              ? 'aspect-[5/4] bg-foreground dark:bg-accent lg:aspect-auto lg:flex-1'
              : 'aspect-square bg-muted group-hover:bg-accent'
          "
        >
          <p
            v-if="index === 0"
            class="absolute left-5 top-5 text-[11px] font-medium uppercase leading-none tracking-[0.22em] text-background/60 dark:text-muted-foreground md:left-7 md:top-7"
          >
            Most stocked
          </p>
          <div
            v-if="tile.cover"
            class="ed-cover aspect-[2/3] overflow-hidden bg-card transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5"
            :class="index === 0 ? 'w-[32%] lg:w-[36%]' : 'w-[44%]'"
          >
            <img :src="tile.cover" alt="" class="h-full w-full object-cover" loading="lazy" />
          </div>
          <span
            v-else
            class="font-serif text-6xl italic"
            :class="index === 0 ? 'text-background/40 dark:text-muted-foreground/40' : 'text-muted-foreground/40'"
            aria-hidden="true"
          >
            {{ tile.name.charAt(0) }}
          </span>
        </div>

        <div
          class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-4"
        >
          <h3
            class="min-w-0 font-serif font-normal capitalize leading-tight text-foreground transition-colors group-hover:text-primary"
            :class="index === 0 ? 'text-[1.75rem] md:text-[2.25rem]' : 'text-lg md:text-[1.35rem]'"
          >
            {{ tile.name }}
          </h3>
          <span class="shrink-0 text-[12px] tabular-nums text-muted-foreground">
            {{ tile.count.toLocaleString() }} {{ tile.count === 1 ? "title" : "titles" }}
          </span>
        </div>
      </NuxtLink>
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-12"
      aria-hidden="true"
    >
      <div class="col-span-2 flex flex-col lg:col-span-6 lg:row-span-2">
        <UiSkeleton class="aspect-[5/4] w-full rounded-none lg:aspect-auto lg:flex-1" />
        <UiSkeleton class="mt-4 h-8 w-1/2 rounded-none" />
      </div>
      <div v-for="n in 4" :key="n" class="lg:col-span-3">
        <UiSkeleton class="aspect-square w-full rounded-none" />
        <UiSkeleton class="mt-4 h-5 w-2/3 rounded-none" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";

defineProps<{ number?: string }>();

const TILE_COUNT = 5;

const { categories } = storeToRefs(useBookStore());

const tiles = computed(() =>
  categories.value
    .flatMap((category) =>
      category.subcategories.length ? category.subcategories : [category]
    )
    .filter((node) => node.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, TILE_COUNT)
    .map((node) => ({
      name: node.name,
      slug: node.slug,
      count: node.count,
      cover: node.cover_url,
    }))
);
</script>
