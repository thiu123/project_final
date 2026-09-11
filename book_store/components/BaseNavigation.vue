<template>
  <div>
    <header
      class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur"
    >
      <div
        class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 md:px-4 lg:h-[72px]"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="group flex shrink-0 items-center no-underline transition-transform duration-300 hover:scale-105"
        >
          <div
            class="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-customyellow shadow-md transition-transform duration-300 group-hover:rotate-[10deg] md:mr-3 lg:h-12 lg:w-12"
          >
            <BookOpen class="h-5 w-5 text-darkgreen lg:h-7 lg:w-7" />
          </div>
          <span
            class="text-base font-bold tracking-wide text-foreground transition-all duration-300 group-hover:tracking-wider lg:text-2xl"
          >
            THBookStore
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-2 lg:flex">
          <NuxtLink to="/" :class="navLinkClass(route.path === '/')">
            Home
          </NuxtLink>

          <div ref="categoryMenuRef" class="relative">
            <button
              type="button"
              class="flex items-center"
              :class="navLinkClass(route.path.startsWith('/subjects'))"
              @click="categoryMenuOpen = !categoryMenuOpen"
            >
              Category
              <ChevronDown
                class="ml-1 h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': categoryMenuOpen }"
              />
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="-translate-y-2 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="-translate-y-2 opacity-0"
            >
              <div
                v-if="categoryMenuOpen"
                class="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-[280px] overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
              >
                <NavigationCategoryTree
                  :categories="categories"
                  variant="desktop"
                  @select="goToSubject"
                />
              </div>
            </Transition>
          </div>

          <NuxtLink to="/contact" :class="navLinkClass(route.path === '/contact')">
            Contact & Feedback
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
            @click="mobileMenuOpen = true"
          >
            <Menu class="h-6 w-6" />
          </button>

          <NuxtLink
            to="/cart"
            class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Shopping cart"
          >
            <ShoppingCart class="h-6 w-6" />
            <span :class="COUNT_BADGE_CLASS">{{ cartItemCount }}</span>
          </NuxtLink>

          <NuxtLink
            to="/favorites"
            class="relative hidden h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            aria-label="Favorites"
          >
            <Heart class="h-6 w-6" />
            <span :class="COUNT_BADGE_CLASS">{{ favoritesCount }}</span>
          </NuxtLink>

          <ThemeToggle />

          <!-- Rendered only once the stored session has been read, so the menu
               does not flash "Account" at a signed-in user. -->
          <NavigationUserMenu
            v-if="isSessionRestored"
            :current-user="currentUser"
            @open-dialog="authDialog = $event"
            @logout="handleLogout"
          />
        </div>
      </div>
    </header>

    <NavigationAuthDialogs
      v-model="authDialog"
      @show-snackbar="notifyFromPayload"
    />

    <NavigationMobileDrawer
      v-model:open="mobileMenuOpen"
      :categories="categories"
      :current-user="currentUser"
      :favorites-count="favoritesCount"
      @open-dialog="authDialog = $event"
      @logout="handleLogout"
    />

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import {
  BookOpen,
  ChevronDown,
  Heart,
  Menu,
  ShoppingCart,
} from "lucide-vue-next";
import { onClickOutside } from "@vueuse/core";
import { useAuthStore } from "@/stores/auth";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { useSnackbar } from "@/composables/useSnackbar";
import { favoriteBookId } from "@/utils/favorites";
import type { AuthDialog } from "@/components/navigation/AuthDialogs.vue";

const COUNT_BADGE_CLASS =
  "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const favoriteStore = useFavoriteStore();
const cartStore = useCartStore();
const bookStore = useBookStore();

const { currentUser } = storeToRefs(authStore);
const { favorites } = storeToRefs(favoriteStore);
const { items: cartItems } = storeToRefs(cartStore);
// Category menu is driven by the API, so new categories appear without a redeploy.
const { categories } = storeToRefs(bookStore);

const { snackbar, notifyFromPayload } = useSnackbar();

const authDialog = ref<AuthDialog>(null);
const mobileMenuOpen = ref(false);
const isSessionRestored = ref(false);

const categoryMenuOpen = ref(false);
const categoryMenuRef = ref<HTMLElement | null>(null);
onClickOutside(categoryMenuRef, () => {
  categoryMenuOpen.value = false;
});

// Rows whose book was deleted come back with a null `bookId` and must not count.
const favoritesCount = computed(
  () => favorites.value.filter((favorite) => favoriteBookId(favorite)).length
);

const cartItemCount = computed(() => cartItems.value.length);

// Signing in (or out) resolves whatever dialog was open.
watch(currentUser, (user) => {
  if (user) authDialog.value = null;
});

onMounted(async () => {
  bookStore.fetchCategories();
  await Promise.all([
    favoriteStore.getFavoritesForEachUser(),
    cartStore.fetchCart(),
  ]);
  authStore.restoreSession();
  isSessionRestored.value = true;
});

function navLinkClass(active: boolean) {
  const base = "rounded-full px-6 py-2 text-base font-bold transition-all duration-300";
  return active
    ? `${base} bg-customyellow text-darkgreen -translate-y-0.5 shadow-[0_4px_12px_rgba(220,247,99,0.4)]`
    : `${base} text-foreground/80 hover:bg-muted hover:text-foreground hover:-translate-y-0.5`;
}

function goToSubject(slug: string) {
  categoryMenuOpen.value = false;
  router.push(`/subjects/${slug}`);
}

function handleLogout() {
  mobileMenuOpen.value = false;
  authStore.logout();
  router.push("/");
}
</script>
