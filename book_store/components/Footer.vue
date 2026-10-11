<template>
  <footer class="mt-24 bg-foreground text-background dark:border-t dark:border-border dark:bg-card dark:text-foreground md:mt-32">
    <div class="container mx-auto max-w-7xl px-4 pb-10 pt-16 md:pt-24">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <p class="font-serif text-4xl leading-[1.08] tracking-[-0.02em] md:text-5xl">
            Good books,<br />
            <span class="italic">carefully</span> chosen.
          </p>
          <p class="mt-6 max-w-[40ch] text-[15px] leading-relaxed opacity-70">
            Timeless classics and contemporary favourites, in hardback for the shelf or as ebooks for the
            journey.
          </p>
        </div>

        <nav class="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-12" aria-label="Footer">
          <div v-for="group in LINK_GROUPS" :key="group.title">
            <p class="text-[11px] font-medium uppercase tracking-[0.22em] opacity-60">{{ group.title }}</p>
            <ul class="mt-5 space-y-3">
              <li v-for="link in group.links" :key="link.name">
                <NuxtLink :to="link.route" class="ed-link text-[15px]">{{ link.name }}</NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div
        class="mt-16 grid grid-cols-1 gap-6 border-t pt-8 text-sm sm:grid-cols-3 [border-color:hsl(var(--background)/0.15)] dark:[border-color:hsl(var(--border))]"
      >
        <p class="flex items-center gap-3 opacity-80">
          <MapPin class="size-4 shrink-0" :stroke-width="1.5" />
          1234 Bookstore Drive &amp; 4th Ave
        </p>
        <p class="flex items-center gap-3 opacity-80">
          <Phone class="size-4 shrink-0" :stroke-width="1.5" />
          0971450800
        </p>
        <p class="flex min-w-0 items-center gap-3 opacity-80">
          <Mail class="size-4 shrink-0" :stroke-width="1.5" />
          <span class="truncate">nhokhieukute2004@gmail.com</span>
        </p>
      </div>

      <p
        class="mt-16 select-none whitespace-nowrap text-center font-serif text-[17vw] font-medium leading-[0.8] tracking-[-0.04em] opacity-[0.12] lg:text-[13.5rem]"
        aria-hidden="true"
      >
        TH<span class="font-normal italic">Book</span>Store
      </p>

      <div class="mt-10 flex flex-col items-center justify-between gap-4 text-xs opacity-60 md:flex-row">
        <span>&copy; 2025 THBookStore. All rights reserved.</span>
        <div class="flex items-center gap-6">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <div class="flex items-center gap-4">
            <span v-for="social in SOCIALS" :key="social.label" :aria-label="social.label">
              <component :is="social.icon" class="size-4" :stroke-width="1.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-vue-next";

const LINK_GROUPS = [
  {
    title: "Shop",
    links: [
      { name: "All books", route: "/subjects/all" },
      { name: "Literary Fiction", route: "/subjects/literary-fiction" },
      { name: "Romance", route: "/subjects/romance" },
      { name: "Manga", route: "/subjects/manga" },
    ],
  },
  {
    title: "Account",
    links: [
      { name: "My profile", route: "/profiles" },
      { name: "My orders", route: "/profiles?tab=orders" },
      { name: "Favorites", route: "/favorites" },
      { name: "Cart", route: "/cart" },
    ],
  },
  {
    title: "Help",
    links: [
      { name: "Contact us", route: "/contact" },
      { name: "Sign in", route: "/login" },
      { name: "Create account", route: "/signup" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", icon: Facebook },
  { label: "X", icon: Twitter },
  { label: "Instagram", icon: Instagram },
];
</script>
