<template>
  <div>
    <header ref="headerRef" class="sticky top-0 z-40 bg-background">
      <div
        class="flex h-9 items-center justify-center bg-foreground px-4 text-center text-[10.5px] font-medium uppercase tracking-[0.2em] text-background dark:bg-muted dark:text-muted-foreground"
      >
        <span class="truncate">
          Hardbacks to your door<span class="hidden sm:inline"><span class="mx-3 opacity-50">/</span>Ebooks open instantly</span>
        </span>
      </div>

      <div class="relative border-b border-border">
        <div
          class="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:h-[76px]"
        >
          <div class="flex items-center gap-1">
            <button
              type="button"
              :class="ICON_BUTTON_CLASS"
              class="-ml-2 lg:hidden"
              aria-label="Open menu"
              @click="mobileMenuOpen = true"
            >
              <Menu class="size-5" :stroke-width="1.5" />
            </button>

            <nav class="hidden items-center gap-8 lg:flex">
              <button
                type="button"
                class="flex items-center gap-1.5"
                :class="NAV_LINK_CLASS"
                :aria-expanded="categoryMenuOpen"
                @click="toggleCategoryMenu"
              >
                <span class="ed-link" :aria-current="route.path.startsWith('/subjects/') && route.path !== '/subjects/all' ? 'page' : undefined">
                  Categories
                </span>
                <ChevronDown
                  class="size-3.5 transition-transform duration-300"
                  :class="{ 'rotate-180': categoryMenuOpen }"
                />
              </button>
              <NuxtLink to="/subjects/all" :class="NAV_LINK_CLASS">
                <span class="ed-link" :aria-current="route.path === '/subjects/all' ? 'page' : undefined">
                  All books
                </span>
              </NuxtLink>
              <NuxtLink to="/contact" :class="NAV_LINK_CLASS">
                <span class="ed-link" :aria-current="route.path === '/contact' ? 'page' : undefined">
                  Contact
                </span>
              </NuxtLink>
            </nav>
          </div>

          <NuxtLink to="/" aria-label="THBookStore home" class="justify-self-center">
            <StoreWordmark />
          </NuxtLink>

          <div class="flex items-center justify-end gap-0.5">
            <button
              type="button"
              :class="ICON_BUTTON_CLASS"
              :aria-expanded="searchOpen"
              aria-label="Search books"
              @click="toggleSearch"
            >
              <Search class="size-5" :stroke-width="1.5" />
            </button>

            <ThemeToggle class="hidden sm:inline-flex" />

            <NuxtLink
              to="/favorites"
              :class="ICON_BUTTON_CLASS"
              class="hidden sm:inline-flex"
              aria-label="Favorites"
            >
              <Heart class="size-5" :stroke-width="1.5" />
              <span v-if="favoritesCount" :class="COUNT_BADGE_CLASS">{{ favoritesCount }}</span>
            </NuxtLink>

            <NuxtLink to="/cart" :class="ICON_BUTTON_CLASS" aria-label="Shopping cart">
              <ShoppingBag class="size-5" :stroke-width="1.5" />
              <span v-if="cartItemCount" :class="COUNT_BADGE_CLASS">{{ cartItemCount }}</span>
            </NuxtLink>

            <!-- Rendered only once the stored session has been read, so the menu
                 does not flash "Account" at a signed-in user. -->
            <NavigationUserMenu
              v-if="isSessionRestored"
              :current-user="currentUser"
              @open-dialog="authDialog.open($event)"
              @logout="handleLogout"
            />
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="-translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="categoryMenuOpen"
            class="absolute inset-x-0 top-full z-50 hidden max-h-[75vh] overflow-y-auto border-b border-border bg-background shadow-[0_32px_48px_-40px_hsl(var(--foreground)/0.5)] lg:block"
          >
            <div class="mx-auto grid max-w-7xl grid-cols-12 gap-10 px-4 py-10">
              <div class="col-span-9 grid grid-cols-3 gap-x-10 gap-y-9">
                <div v-for="category in categories" :key="category.slug">
                  <button
                    type="button"
                    class="group flex items-baseline gap-2 text-left"
                    @click="goToSubject(category.slug)"
                  >
                    <span class="font-serif text-xl leading-tight transition-colors group-hover:text-primary">
                      {{ category.name }}
                    </span>
                    <span class="text-[11px] tabular-nums text-muted-foreground">{{ category.count }}</span>
                  </button>
                  <ul v-if="category.subcategories.length" class="mt-3 space-y-2">
                    <li v-for="subcategory in category.subcategories" :key="subcategory.slug">
                      <button
                        type="button"
                        class="ed-link text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                        @click="goToSubject(subcategory.slug)"
                      >
                        {{ subcategory.name }}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="col-span-3 border-l border-border pl-10">
                <p class="eyebrow">The catalogue</p>
                <p class="mt-4 font-serif text-2xl leading-snug">
                  Every title on our shelves, <span class="italic">in one place.</span>
                </p>
                <NuxtLink
                  to="/subjects/all"
                  class="group mt-6 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]"
                  @click="categoryMenuOpen = false"
                >
                  <span class="ed-link">Browse all books</span>
                  <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="-translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="searchOpen"
            class="absolute inset-x-0 top-full z-50 border-b border-border bg-background"
          >
            <form
              class="mx-auto flex max-w-3xl items-center gap-4 px-4 py-6"
              role="search"
              @submit.prevent="submitSearch"
            >
              <Search class="size-5 shrink-0 text-muted-foreground" :stroke-width="1.5" />
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="search"
                aria-label="Search by title or author"
                placeholder="Search by title or author"
                class="h-12 min-w-0 flex-1 bg-transparent font-serif text-2xl placeholder:text-muted-foreground/60 focus:outline-none"
                @keydown.esc="searchOpen = false"
              />
              <UiButton type="submit" variant="ink" size="cta" class="hidden shadow-none sm:inline-flex">
                Search
              </UiButton>
            </form>
          </div>
        </Transition>
      </div>
    </header>

    <NavigationAuthDialogs @show-snackbar="notifyFromPayload" />

    <NavigationMobileDrawer
      v-model:open="mobileMenuOpen"
      :categories="categories"
      :current-user="currentUser"
      :favorites-count="favoritesCount"
      @open-dialog="authDialog.open($event)"
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
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
} from "lucide-vue-next";
import { onClickOutside } from "@vueuse/core";
import { useAuthStore } from "@/stores/auth";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { useSnackbar } from "@/composables/useSnackbar";
import { favoriteBookId } from "@/utils/favorites";
import { useAuthDialogStore } from "@/stores/authDialog";

const ICON_BUTTON_CLASS =
  "relative inline-flex size-10 items-center justify-center text-foreground transition-opacity hover:opacity-60";

const NAV_LINK_CLASS = "text-[12.5px] font-medium uppercase tracking-[0.16em] text-foreground";

const COUNT_BADGE_CLASS =
  "absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-foreground";

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

const authDialog = useAuthDialogStore();
const mobileMenuOpen = ref(false);
const isSessionRestored = ref(false);

const headerRef = ref<HTMLElement | null>(null);
const categoryMenuOpen = ref(false);
const searchOpen = ref(false);
const searchQuery = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);

onClickOutside(headerRef, () => {
  categoryMenuOpen.value = false;
  searchOpen.value = false;
});

watch(
  () => route.fullPath,
  () => {
    categoryMenuOpen.value = false;
    searchOpen.value = false;
  }
);

// Rows whose book was deleted come back with a null `bookId` and must not count.
const favoritesCount = computed(
  () => favorites.value.filter((favorite) => favoriteBookId(favorite)).length
);

const cartItemCount = computed(() => cartItems.value.length);

onMounted(async () => {
  bookStore.fetchCategories();
  await Promise.all([
    favoriteStore.getFavoritesForEachUser(),
    cartStore.fetchCart(),
  ]);
  authStore.restoreSession();
  isSessionRestored.value = true;
});

function toggleCategoryMenu() {
  searchOpen.value = false;
  categoryMenuOpen.value = !categoryMenuOpen.value;
}

async function toggleSearch() {
  categoryMenuOpen.value = false;
  searchOpen.value = !searchOpen.value;
  if (searchOpen.value) {
    await nextTick();
    searchInputRef.value?.focus();
  }
}

function submitSearch() {
  const query = searchQuery.value.trim();
  if (!query) return;
  searchOpen.value = false;
  router.push({ path: "/subjects/all", query: { search: query } });
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
