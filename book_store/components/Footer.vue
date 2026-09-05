<template>
  <footer class="border-t border-border bg-muted/40">
    <div class="container mx-auto px-4">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-12 gap-4 py-8">
        <!-- Company Info Section -->
        <div class="col-span-12 mb-6 md:col-span-4">
          <div class="mb-4 flex items-center">
            <div
              class="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-customyellow"
            >
              <BookOpen class="h-7 w-7 text-darkgreen" />
            </div>
            <span class="text-2xl font-semibold text-foreground">
              THBookStore
            </span>
          </div>
          <p class="mb-4 text-base text-muted-foreground">
            Your trusted destination for discovering and collecting the world's
            finest books. From timeless classics to contemporary bestsellers.
          </p>

          <!-- Contact Info -->
          <div
            class="rounded-lg border-l-[3px] border-waterblue bg-waterblue/5 p-4"
          >
            <div class="mb-2 flex items-center">
              <MapPin class="mr-3 h-[18px] w-[18px] shrink-0 text-waterblue" />
              <span class="text-sm text-foreground">
                1234 Bookstore Drive & 4th Ave
              </span>
            </div>
            <div class="mb-2 flex items-center">
              <Phone class="mr-3 h-[18px] w-[18px] shrink-0 text-waterblue" />
              <span class="text-sm text-foreground">0971450800</span>
            </div>
            <div class="flex items-center">
              <Mail class="mr-3 h-[18px] w-[18px] shrink-0 text-waterblue" />
              <span class="text-sm text-foreground">
                nhokhieukute2004@gmail.com
              </span>
            </div>
          </div>

          <!-- Social Media -->
          <div class="mt-4">
            <span class="mb-3 block text-sm font-bold text-foreground">
              Follow Us
            </span>
            <div class="flex gap-2">
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-waterblue text-waterblue transition-all duration-300 hover:-translate-y-0.5 hover:bg-waterblue hover:text-white"
                aria-label="Facebook"
              >
                <Facebook class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-waterblue text-waterblue transition-all duration-300 hover:-translate-y-0.5 hover:bg-waterblue hover:text-white"
                aria-label="Twitter"
              >
                <Twitter class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-waterblue text-waterblue transition-all duration-300 hover:-translate-y-0.5 hover:bg-waterblue hover:text-white"
                aria-label="Instagram"
              >
                <Instagram class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Shopping Section -->
        <div class="col-span-12 mb-6 sm:col-span-6 md:col-span-2">
          <h3 class="mb-4 text-lg font-semibold text-foreground">Shopping</h3>
          <ul class="space-y-1">
            <li v-for="(item, i) in shoppingLinks" :key="i">
              <button
                type="button"
                class="py-1 text-sm text-muted-foreground transition-colors duration-300 hover:text-waterblue"
                @click="goTo(item.route)"
              >
                {{ item.name }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Account Section -->
        <div class="col-span-12 mb-6 sm:col-span-6 md:col-span-2">
          <h3 class="mb-4 text-lg font-semibold text-foreground">My Account</h3>
          <ul class="space-y-1">
            <li v-for="(item, i) in accountLinks" :key="i">
              <button
                type="button"
                class="py-1 text-sm text-muted-foreground transition-colors duration-300 hover:text-waterblue"
                @click="goTo(item.route)"
              >
                {{ item.name }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Categories Section -->
        <div class="col-span-12 mb-6 sm:col-span-6 md:col-span-2">
          <h3 class="mb-4 text-lg font-semibold text-foreground">Categories</h3>
          <ul class="space-y-1">
            <li v-for="(item, i) in categoryLinks" :key="i">
              <button
                type="button"
                class="py-1 text-sm text-muted-foreground transition-colors duration-300 hover:text-waterblue"
                @click="goTo(item.route)"
              >
                {{ item.name }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Quick Actions Section -->
        <div class="col-span-12 mb-6 sm:col-span-6 md:col-span-2">
          <h3 class="mb-4 text-lg font-semibold text-foreground">
            Quick Actions
          </h3>
          <ul class="space-y-1">
            <li v-for="(item, i) in quickActions" :key="i">
              <button
                type="button"
                class="py-1 text-sm text-muted-foreground transition-colors duration-300 hover:text-waterblue"
                @click="goTo(item.route)"
              >
                {{ item.name }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer Divider -->
      <div class="mb-4 h-px bg-border/50" />

      <!-- Bottom Footer -->
      <div
        class="flex flex-col items-center justify-between py-4 md:flex-row"
      >
        <div class="mb-2 text-center md:mb-0 md:text-left">
          <span class="text-sm text-muted-foreground">
            © 2025 THBookStore. All Rights Reserved.
          </span>
        </div>
        <div class="flex gap-4">
          <span class="text-sm text-muted-foreground">Privacy Policy</span>
          <span class="text-sm text-muted-foreground">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-vue-next";

interface FooterLink {
  name: string;
  route: string;
}

const router = useRouter();

const shoppingLinks: FooterLink[] = [
  { name: "Shopping Cart", route: "/cart" },
  { name: "My Orders", route: "/order" },
  { name: "My Favorites", route: "/favorites" },
];

const accountLinks: FooterLink[] = [
  { name: "My Profile", route: "/profiles" },
  { name: "Login", route: "/login" },
  { name: "Sign Up", route: "/signup" },
];

const categoryLinks: FooterLink[] = [
  { name: "Literary Fiction", route: "/subjects/literary fiction" },
  { name: "Romance", route: "/subjects/romance" },
  { name: "Manga", route: "/subjects/manga" },
  { name: "All Categories", route: "/" },
];

const quickActions: FooterLink[] = [
  { name: "Home", route: "/" },
  { name: "Browse Books", route: "/" },
  { name: "Contact Us", route: "/contact" },
];

function goTo(route: string) {
  router.push(route);
}
</script>
