<template>
  <section class="relative overflow-hidden">
    <!-- Decorative brand background -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-waterblue/15 blur-3xl dark:bg-waterblue/10"
      ></div>
      <div
        class="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-customyellow/25 blur-3xl dark:bg-customyellow/[0.07]"
      ></div>
      <div
        class="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      ></div>
    </div>

    <div class="container relative mx-auto px-4 py-12 md:py-20">
      <div class="grid grid-cols-12 items-center gap-8">
        <!-- Book showcase -->
        <div class="col-span-12 text-center md:col-span-6">
          <div class="relative inline-block">
            <!-- Elliptical drop shadow under the book -->
            <div
              class="absolute -bottom-5 left-1/2 h-6 w-56 -translate-x-1/2 rounded-[50%] bg-black/25 blur-xl dark:bg-black/60"
              aria-hidden="true"
            ></div>

            <img
              v-if="book?.cover_url"
              :src="book?.cover_url"
              :alt="book?.title"
              class="mx-auto h-[380px] w-[280px] rounded-xl bg-muted object-cover shadow-2xl ring-1 ring-black/10 transition-transform duration-500 hover:-translate-y-2 dark:ring-white/10"
            />
            <div
              v-else
              class="mx-auto flex h-[380px] w-[280px] items-center justify-center rounded-xl bg-muted shadow-2xl"
            >
              <UiSpinner size="lg" class="text-primary" />
            </div>
          </div>

          <div class="mt-4">
            <span
              class="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-300"
            >
              <Star class="h-3.5 w-3.5 fill-current" />
              4.8
            </span>
          </div>
        </div>

        <!-- Hero content -->
        <div class="col-span-12 text-center md:col-span-6 md:text-left">
          <UiBadge class="mb-4 font-bold capitalize">
            {{ book?.subjects?.[0] }}
          </UiBadge>

          <h1
            class="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-5xl"
          >
            {{ book?.title }}
          </h1>

          <p class="mb-6 text-muted-foreground">By {{ book?.authors?.[0] }}</p>

          <div
            class="flex flex-col justify-center gap-4 sm:flex-row md:justify-start"
          >
            <UiButton
              size="lg"
              class="font-bold shadow-md"
              @click="book && router.push(`/details/${book._id}`)"
            >
              <Info class="mr-1 h-5 w-5" />
              More Info
            </UiButton>

            <UiButton
              size="lg"
              variant="secondary"
              class="font-bold"
              @click="book && emit('add-to-cart', book._id, 1)"
            >
              Add to Cart
              <ShoppingCart class="ml-1 h-5 w-5" />
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Info, ShoppingCart, Star } from "lucide-vue-next";
import type { Book } from "@/types";

defineProps<{
  book?: Book;
}>();

const emit = defineEmits<{
  (e: "add-to-cart", bookId: string, quantity: number): void;
}>();

const router = useRouter();
</script>
