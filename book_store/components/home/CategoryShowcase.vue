<template>
  <section class="container mx-auto mt-16 max-w-7xl px-4 md:mt-24">
    <div v-reveal class="mb-8 flex items-end justify-between gap-6">
      <h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Shop by category
      </h2>
      <NuxtLink
        to="/subjects/all"
        class="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
      >
        All categories
        <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <div
      v-if="tiles.length"
      class="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:grid-rows-2"
    >
      <NuxtLink
        v-for="(tile, index) in tiles"
        :key="tile.slug"
        v-reveal="index * 70"
        :to="`/subjects/${tile.slug}`"
        class="group relative isolate flex overflow-hidden rounded-2xl p-5 ring-1 ring-border transition-shadow duration-300 hover:shadow-[0_20px_40px_-20px_hsl(var(--foreground)/0.35)] md:p-6"
        :class="[
          TONES[index % TONES.length],
          index === 0
            ? 'col-span-2 min-h-[280px] lg:row-span-2 lg:min-h-[440px]'
            : 'min-h-[200px] lg:min-h-0',
        ]"
      >
        <div class="relative z-[1] flex max-w-[58%] flex-col">
          <h3
            class="font-bold capitalize leading-tight tracking-tight"
            :class="index === 0 ? 'text-2xl md:text-4xl' : 'text-base md:text-lg'"
          >
            {{ tile.name }}
          </h3>
          <p class="mt-1.5 text-sm opacity-75">
            {{ tile.count.toLocaleString() }} {{ tile.count === 1 ? "title" : "titles" }}
          </p>
          <span
            v-if="index === 0"
            class="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold"
          >
            Browse shelf
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>

        <div
          v-if="tile.cover"
          class="absolute -z-0 aspect-[2/3] overflow-hidden rounded-md shadow-[0_18px_36px_-12px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-out"
          :class="
            index === 0
              ? 'bottom-[-10%] right-[6%] w-[34%] rotate-[8deg] group-hover:rotate-[4deg] group-hover:-translate-y-2 lg:w-[30%]'
              : 'bottom-[-18%] right-[-4%] w-[46%] rotate-[10deg] group-hover:rotate-[6deg] group-hover:-translate-y-2'
          "
        >
          <img
            :src="tile.cover"
            alt=""
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </NuxtLink>
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:grid-rows-2"
    >
      <UiSkeleton class="col-span-2 h-[280px] rounded-2xl lg:row-span-2 lg:h-[440px]" />
      <UiSkeleton v-for="n in 4" :key="n" class="h-[200px] rounded-2xl lg:h-auto" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ArrowRight } from "lucide-vue-next";
import { useBookStore } from "@/stores/book";

const TILE_COUNT = 5;

const TONES = [
  "bg-darkgreen text-white",
  "bg-accent text-accent-foreground",
  "bg-primary/15 text-foreground",
  "bg-muted text-foreground",
  "bg-foreground text-background",
];

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
