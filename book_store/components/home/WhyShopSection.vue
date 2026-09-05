<template>
  <section class="container mx-auto my-12 px-4">
    <div
      class="rounded-3xl bg-gradient-to-br from-customyellow via-[#e6f4c9] to-[#c8e6c9] px-4 py-16 shadow-sm ring-1 ring-black/5 dark:from-[#252d13] dark:via-[#1e2a1b] dark:to-[#17271e] dark:ring-white/10 md:px-10"
    >
      <div class="grid grid-cols-12 items-center gap-10">
        <!-- Floating Books Section -->
        <div class="col-span-12 md:col-span-6">
          <div class="relative mx-auto h-[420px] max-w-md">
            <!-- Decorative circles -->
            <div
              class="decorative-circle absolute left-4 top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl dark:bg-white/5"
              aria-hidden="true"
            ></div>
            <div
              class="decorative-circle absolute bottom-6 right-6 h-40 w-40 rounded-full bg-lightgreen/20 blur-2xl dark:bg-lightgreen/10"
              aria-hidden="true"
            ></div>
            <div
              class="decorative-circle absolute right-16 top-4 h-20 w-20 rounded-full bg-darkgreen/10 blur-xl dark:bg-white/5"
              aria-hidden="true"
            ></div>

            <!-- Floating featured book -->
            <div
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                class="book-card relative w-[210px] -rotate-[15deg] rounded-xl transition-all duration-300 hover:rotate-[-10deg] hover:scale-105"
                style="
                  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
                    0 10px 10px rgba(0, 0, 0, 0.22);
                "
              >
                <div
                  class="relative h-[320px] overflow-hidden rounded-xl bg-muted"
                >
                  <img
                    v-if="books[1]?.cover_url"
                    :src="books[1]?.cover_url"
                    :alt="books[1]?.title"
                    class="h-full w-full rounded-xl object-cover brightness-110"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center"
                  >
                    <UiSpinner class="text-primary" />
                  </div>

                  <!-- Radial highlight overlay -->
                  <div
                    class="pointer-events-none absolute inset-0 rounded-xl"
                    style="
                      background: radial-gradient(
                        circle at 50% 50%,
                        rgba(255, 255, 255, 0.2) 0%,
                        rgba(255, 255, 255, 0) 70%
                      );
                    "
                  ></div>
                </div>

                <!-- Soft green glow behind the book -->
                <div
                  class="absolute -inset-4 -z-10 rounded-2xl blur-xl"
                  style="
                    background: radial-gradient(
                      circle at 50% 50%,
                      rgba(76, 175, 80, 0.15) 0%,
                      rgba(76, 175, 80, 0) 70%
                    );
                  "
                  aria-hidden="true"
                ></div>
              </div>
            </div>

            <!-- Floating accent icons -->
            <div class="floating-element star-1 absolute left-6 top-16">
              <Star class="h-6 w-6 fill-amber-400 text-amber-400" />
            </div>
            <div class="floating-element star-2 absolute right-10 top-24">
              <Star class="h-5 w-5 fill-orange-500 text-orange-500" />
            </div>
            <div class="floating-element heart-1 absolute bottom-16 left-12">
              <Heart class="h-[18px] w-[18px] fill-red-500 text-red-500" />
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="col-span-12 md:col-span-6">
          <div>
            <div class="mb-6">
              <span
                class="mb-4 inline-flex items-center gap-1.5 rounded-full bg-darkgreen px-4 py-1.5 text-sm font-semibold text-white shadow-md"
              >
                <ShieldCheck class="h-4 w-4" />
                Why Choose Us
              </span>
              <h2
                class="text-3xl font-bold text-darkgreen dark:text-emerald-50 md:text-4xl"
              >
                Why Shop with Us?
              </h2>
            </div>

            <div class="mb-8 space-y-4">
              <div class="flex items-start">
                <div
                  class="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-darkgreen shadow-md dark:bg-darkgreen/80"
                >
                  <Truck class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4
                    class="mb-2 text-lg font-bold text-darkgreen dark:text-emerald-50"
                  >
                    Fast & Free Delivery
                  </h4>
                  <p class="text-base text-darkgreen/80 dark:text-emerald-100/70">
                    Get your books delivered quickly with our free shipping on
                    orders over $25.
                  </p>
                </div>
              </div>

              <div class="flex items-start">
                <div
                  class="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 shadow-md"
                >
                  <BookOpen class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4
                    class="mb-2 text-lg font-bold text-darkgreen dark:text-emerald-50"
                  >
                    Vast Collection
                  </h4>
                  <p class="text-base text-darkgreen/80 dark:text-emerald-100/70">
                    Discover millions of books across all genres and categories
                    in our extensive library.
                  </p>
                </div>
              </div>

              <div class="flex items-start">
                <div
                  class="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 shadow-md"
                >
                  <BadgeCheck class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4
                    class="mb-2 text-lg font-bold text-darkgreen dark:text-emerald-50"
                  >
                    Quality Guarantee
                  </h4>
                  <p class="text-base text-darkgreen/80 dark:text-emerald-100/70">
                    All our books are carefully selected and quality-checked
                    before shipping.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-4">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl bg-darkgreen px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-darkgreen/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                @click="router.push('/subjects/literary fiction')"
              >
                <Rocket class="h-4 w-4" />
                Learn More
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-8 py-3.5 text-base font-bold text-darkgreen shadow transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-white/10 dark:text-emerald-50 dark:hover:bg-white/20"
                @click="router.push('/contact')"
              >
                <Phone class="h-4 w-4" />
                Contact Us
              </button>
            </div>

            <div class="mt-8 grid grid-cols-3 gap-4">
              <div class="text-center">
                <h3
                  class="text-3xl font-bold text-darkgreen dark:text-emerald-50"
                >
                  10K+
                </h3>
                <p class="text-xs text-darkgreen/70 dark:text-emerald-100/60">
                  Happy Customers
                </p>
              </div>
              <div class="text-center">
                <h3
                  class="text-3xl font-bold text-darkgreen dark:text-emerald-50"
                >
                  50K+
                </h3>
                <p class="text-xs text-darkgreen/70 dark:text-emerald-100/60">
                  Books Available
                </p>
              </div>
              <div class="text-center">
                <h3
                  class="text-3xl font-bold text-darkgreen dark:text-emerald-50"
                >
                  99%
                </h3>
                <p class="text-xs text-darkgreen/70 dark:text-emerald-100/60">
                  Satisfaction Rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  BadgeCheck,
  BookOpen,
  Heart,
  Phone,
  Rocket,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-vue-next";
import type { Book } from "@/types";

defineProps<{
  books: Book[];
}>();

const router = useRouter();
</script>

<style scoped>
/* Gentle float animation for the decorative icons (not expressible in Tailwind) */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating-element {
  animation: float 3s ease-in-out infinite;
}

.star-2 {
  animation-delay: 0.8s;
}

.heart-1 {
  animation-delay: 1.6s;
}
</style>
