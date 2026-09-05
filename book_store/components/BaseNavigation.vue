<template>
  <div>
    <header
      class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur"
    >
      <div
        class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 md:px-4 lg:h-[72px]"
      >
        <!-- Logo Section -->
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

        <!-- Desktop Navigation -->
        <nav class="hidden items-center gap-2 lg:flex">
          <NuxtLink
            to="/"
            class="rounded-full px-6 py-2 text-base font-bold transition-all duration-300"
            :class="
              route.path === '/'
                ? 'bg-customyellow text-darkgreen -translate-y-0.5 shadow-[0_4px_12px_rgba(220,247,99,0.4)]'
                : 'text-foreground/80 hover:bg-muted hover:text-foreground hover:-translate-y-0.5'
            "
          >
            Home
          </NuxtLink>

          <!-- Category dropdown (supports expandable subcategory groups) -->
          <div ref="categoryMenuRef" class="relative">
            <button
              type="button"
              class="flex items-center rounded-full px-6 py-2 text-base font-bold transition-all duration-300"
              :class="
                route.path.startsWith('/subjects')
                  ? 'bg-customyellow text-darkgreen -translate-y-0.5 shadow-[0_4px_12px_rgba(220,247,99,0.4)]'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground hover:-translate-y-0.5'
              "
              @click="categoryMenuOpen = !categoryMenuOpen"
            >
              Category
              <ChevronDown
                class="ml-1 h-4 w-4 transition-transform duration-200"
                :class="categoryMenuOpen ? 'rotate-180' : ''"
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
                <template
                  v-for="(category, index) in bookSubjects"
                  :key="index"
                >
                  <!-- Categories with subcategories -->
                  <template v-if="category.subcategories">
                    <button
                      type="button"
                      class="flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-200 hover:translate-x-1 hover:bg-customyellow/15"
                      @click="toggleCategoryGroup(index)"
                    >
                      <span class="text-base font-bold text-foreground">
                        {{ category.category }}
                      </span>
                      <ChevronDown
                        class="h-4 w-4 text-muted-foreground transition-transform duration-200"
                        :class="openGroups.includes(index) ? 'rotate-180' : ''"
                      />
                    </button>

                    <template v-if="openGroups.includes(index)">
                      <template
                        v-for="(subcategory, subIndex) in category.subcategories"
                        :key="subIndex"
                      >
                        <button
                          type="button"
                          class="flex w-full items-center py-2 pl-8 pr-4 text-left text-sm font-medium text-foreground/90 transition-all duration-200 hover:translate-x-1 hover:bg-customyellow/10"
                          @click="goToSubject(subcategory)"
                        >
                          <ChevronRight class="mr-2 h-4 w-4" />
                          {{ subcategory }}
                        </button>
                        <div
                          v-if="subIndex < category.subcategories.length - 1"
                          class="mx-4 h-px bg-border/60"
                        />
                      </template>
                    </template>
                  </template>

                  <!-- Categories without subcategories -->
                  <button
                    v-else
                    type="button"
                    class="flex w-full items-center px-4 py-3 text-left text-base font-bold text-foreground transition-all duration-200 hover:translate-x-1 hover:bg-customyellow/15"
                    @click="goToSubject(category.category)"
                  >
                    {{ category.category }}
                  </button>

                  <div
                    v-if="index < bookSubjects.length - 1"
                    class="mx-4 h-px bg-border/60"
                  />
                </template>
              </div>
            </Transition>
          </div>

          <NuxtLink
            to="/contact"
            class="rounded-full px-6 py-2 text-base font-bold transition-all duration-300"
            :class="
              route.path === '/contact'
                ? 'bg-customyellow text-darkgreen -translate-y-0.5 shadow-[0_4px_12px_rgba(220,247,99,0.4)]'
                : 'text-foreground/80 hover:bg-muted hover:text-foreground hover:-translate-y-0.5'
            "
          >
            Contact & Feedback
          </NuxtLink>
        </nav>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1">
          <!-- Mobile Menu Button -->
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
            @click="mobileMenuDrawer = true"
          >
            <Menu class="h-6 w-6" />
          </button>

          <!-- Cart -->
          <button
            type="button"
            class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Shopping cart"
            @click="router.push('/cart')"
          >
            <ShoppingCart class="h-6 w-6" />
            <span
              class="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
            >
              {{ cartItemCount }}
            </span>
          </button>

          <!-- Favorites -->
          <button
            type="button"
            class="relative hidden h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            aria-label="Favorites"
            @click="router.push('/favorites')"
          >
            <Heart class="h-6 w-6" />
            <span
              class="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
            >
              {{ userFavoritesCount }}
            </span>
          </button>

          <!-- Theme toggle -->
          <ThemeToggle />

          <!-- Account / User Menu -->
          <template v-if="isSessionRestored">
            <UiDropdownMenu v-if="!currentUser">
              <UiDropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="ml-1 hidden items-center rounded-full bg-customyellow px-4 py-2 text-sm font-bold text-darkgreen shadow transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex md:ml-2 md:text-base"
                >
                  <span class="hidden md:inline">Account</span>
                  <CircleUser class="h-5 w-5 md:ml-1" />
                </button>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent align="end">
                <UiDropdownMenuItem @select="openDialog('sign-in')">
                  <LogIn class="mr-2 size-4" />
                  Sign In
                </UiDropdownMenuItem>
                <UiDropdownMenuItem @select="openDialog('sign-up')">
                  <UserPlus class="mr-2 size-4" />
                  Sign Up
                </UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>

            <UiDropdownMenu v-else>
              <UiDropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="ml-1 hidden items-center rounded-full py-1 pl-1 pr-3 transition-all hover:-translate-y-0.5 hover:bg-muted sm:flex md:ml-2"
                >
                  <UiAvatar class="h-9 w-9 shadow">
                    <UiAvatarImage
                      :src="
                        currentUser.avatar_url ||
                        'https://cdn.vuetifyjs.com/images/john.jpg'
                      "
                      :alt="currentUser.username + ' avatar'"
                    />
                    <UiAvatarFallback>
                      {{ (currentUser.username || "U").charAt(0).toUpperCase() }}
                    </UiAvatarFallback>
                  </UiAvatar>
                  <span
                    class="ml-2 hidden text-sm font-bold text-foreground md:inline lg:text-base"
                  >
                    {{ currentUser.username }}
                  </span>
                  <ChevronDown
                    class="ml-1 hidden h-4 w-4 text-muted-foreground md:inline"
                  />
                </button>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent align="end" class="w-56">
                <UiDropdownMenuLabel class="font-normal">
                  <div class="flex flex-col space-y-1">
                    <span class="truncate text-sm font-semibold text-foreground">
                      {{ currentUser.username }}
                    </span>
                    <span class="truncate text-xs text-muted-foreground">
                      {{ currentUser.email }}
                    </span>
                  </div>
                </UiDropdownMenuLabel>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuItem @select="goToProfile('personal')">
                  <User class="mr-2 size-4" />
                  Personal Info
                </UiDropdownMenuItem>
                <UiDropdownMenuItem @select="goToProfile('orders')">
                  <Package class="mr-2 size-4" />
                  Orders
                </UiDropdownMenuItem>
                <UiDropdownMenuItem @select="goToProfile('favorites')">
                  <Heart class="mr-2 size-4" />
                  Favorites
                </UiDropdownMenuItem>
                <UiDropdownMenuItem @select="goToProfile('reviews')">
                  <Star class="mr-2 size-4" />
                  My Reviews
                </UiDropdownMenuItem>
                <UiDropdownMenuItem @select="goToProfile('password')">
                  <Lock class="mr-2 size-4" />
                  Change Password
                </UiDropdownMenuItem>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @select="handleLogout"
                >
                  <LogOut class="mr-2 size-4" />
                  Logout
                </UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
          </template>
        </div>
      </div>
    </header>

    <!-- Auth Dialogs -->
    <UiDialog v-model:open="dialogSignIn">
      <UiDialogContent class="overflow-hidden p-0 sm:max-w-5xl">
        <UiDialogTitle class="sr-only">Sign In</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Sign in to your THBookStore account
        </UiDialogDescription>

        <Login
          @toggleLinkSignUp="openDialog"
          @toggleLinkForgotPassword="openDialog('forgot-password')"
          @show-snackbar="showSnackbar"
        />
      </UiDialogContent>
    </UiDialog>

    <UiDialog v-model:open="dialogSignUp">
      <UiDialogContent class="overflow-hidden p-0 sm:max-w-5xl">
        <UiDialogTitle class="sr-only">Sign Up</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Create a new THBookStore account
        </UiDialogDescription>

        <SignUp
          @checkIsSignUp="handleCheckIsSignUp"
          @toggleLinkSignIn="openDialog"
        />
      </UiDialogContent>
    </UiDialog>

    <UiDialog v-model:open="dialogForgotPassword">
      <UiDialogContent class="p-0 sm:max-w-lg">
        <UiDialogTitle class="sr-only">Forgot Password</UiDialogTitle>
        <UiDialogDescription class="sr-only">
          Reset your THBookStore account password
        </UiDialogDescription>

        <ForgotPassword @back-to-login="openDialog('sign-in')" />
      </UiDialogContent>
    </UiDialog>

    <!-- Mobile Navigation Drawer -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuDrawer"
        class="fixed inset-0 z-[60] bg-black/60"
        aria-hidden="true"
        @click="mobileMenuDrawer = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="mobileMenuDrawer"
        class="fixed inset-y-0 left-0 z-[70] w-[280px] overflow-y-auto border-r border-border bg-background py-2"
      >
        <!-- Brand -->
        <div class="mb-4 flex items-center px-4 pt-2">
          <div
            class="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-customyellow shadow"
          >
            <BookOpen class="h-6 w-6 text-darkgreen" />
          </div>
          <span class="text-lg font-bold text-foreground">THBookStore</span>
          <div class="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close menu"
              @click="mobileMenuDrawer = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="mb-2 h-px bg-border" />

        <nav class="px-2">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            :class="route.path === '/' ? 'bg-customyellow/20 font-bold' : ''"
            @click="navigateAndClose('/')"
          >
            <Home class="h-5 w-5" />
            Home
          </button>

          <!-- Category group -->
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            @click="mobileCategoryOpen = !mobileCategoryOpen"
          >
            <Shapes class="h-5 w-5" />
            Category
            <ChevronDown
              class="ml-auto h-4 w-4 transition-transform duration-200"
              :class="mobileCategoryOpen ? 'rotate-180' : ''"
            />
          </button>

          <template v-if="mobileCategoryOpen">
            <template v-for="(category, index) in bookSubjects" :key="index">
              <template v-if="category.subcategories">
                <button
                  type="button"
                  class="flex w-full items-center rounded-lg py-2 pl-8 pr-3 text-sm transition-colors hover:bg-muted"
                  @click="toggleMobileGroup(index)"
                >
                  {{ category.category }}
                  <ChevronDown
                    class="ml-auto h-4 w-4 transition-transform duration-200"
                    :class="mobileOpenGroups.includes(index) ? 'rotate-180' : ''"
                  />
                </button>

                <template v-if="mobileOpenGroups.includes(index)">
                  <button
                    v-for="(subcategory, subIndex) in category.subcategories"
                    :key="subIndex"
                    type="button"
                    class="flex w-full items-center rounded-lg py-2 pl-12 pr-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    @click="
                      navigateAndClose(
                        `/subjects/${encodeURIComponent(
                          subcategory.toLowerCase()
                        )}`
                      )
                    "
                  >
                    {{ subcategory }}
                  </button>
                </template>
              </template>

              <button
                v-else
                type="button"
                class="flex w-full items-center rounded-lg py-2 pl-8 pr-3 text-sm transition-colors hover:bg-muted"
                @click="
                  navigateAndClose(
                    `/subjects/${encodeURIComponent(
                      category.category.toLowerCase()
                    )}`
                  )
                "
              >
                {{ category.category }}
              </button>
            </template>
          </template>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            :class="
              route.path === '/favorites' ? 'bg-customyellow/20 font-bold' : ''
            "
            @click="navigateAndClose('/favorites')"
          >
            <Heart class="h-5 w-5" />
            Favorites
            <UiBadge v-if="userFavoritesCount > 0" class="ml-auto">
              {{ userFavoritesCount }}
            </UiBadge>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            :class="
              route.path === '/contact' ? 'bg-customyellow/20 font-bold' : ''
            "
            @click="navigateAndClose('/contact')"
          >
            <Mail class="h-5 w-5" />
            Contact Us
          </button>

          <div class="my-2 h-px bg-border" />

          <template v-if="currentUser">
            <div class="mb-2 flex items-center rounded-lg bg-muted p-3">
              <UiAvatar class="mr-3 h-9 w-9">
                <UiAvatarImage
                  :src="
                    currentUser.avatar_url ||
                    'https://cdn.vuetifyjs.com/images/john.jpg'
                  "
                  :alt="currentUser.username + ' avatar'"
                />
                <UiAvatarFallback>
                  {{ (currentUser.username || "U").charAt(0).toUpperCase() }}
                </UiAvatarFallback>
              </UiAvatar>
              <div class="min-w-0">
                <div class="truncate text-sm font-bold text-foreground">
                  {{ currentUser.username }}
                </div>
                <div class="truncate text-xs text-muted-foreground">
                  {{ currentUser.email }}
                </div>
              </div>
            </div>

            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              @click="navigateAndClose('/profiles?tab=personal')"
            >
              <User class="h-5 w-5" />
              Profile
            </button>

            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              @click="navigateAndClose('/profiles?tab=orders')"
            >
              <Package class="h-5 w-5" />
              Orders
            </button>

            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              @click="handleLogout"
            >
              <LogOut class="h-5 w-5" />
              Logout
            </button>
          </template>

          <template v-else>
            <div class="p-3">
              <UiButton
                block
                variant="secondary"
                class="rounded-full"
                @click="openDialogAndCloseMobile('sign-in')"
              >
                Sign In
              </UiButton>
            </div>
            <div class="p-3 pt-0">
              <UiButton
                block
                variant="outline"
                class="rounded-full border-darkgreen text-darkgreen dark:border-border dark:text-foreground"
                @click="openDialogAndCloseMobile('sign-up')"
              >
                Sign Up
              </UiButton>
            </div>
          </template>
        </nav>
      </aside>
    </Transition>

    <!-- Snackbar Alert -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleUser,
  Heart,
  Home,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Package,
  Shapes,
  ShoppingCart,
  Star,
  User,
  UserPlus,
  X,
} from "lucide-vue-next";
import { bookSubjects } from "@/constants/bookSubjects";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const favoriteStore = useFavoriteStore();
const cartStore = useCartStore();

const { currentUser } = storeToRefs(authStore);
const { favorites } = storeToRefs(favoriteStore);
const { cart } = storeToRefs(cartStore);

const dialogSignUp = ref(false);
const dialogSignIn = ref(false);
const dialogForgotPassword = ref(false);
const isSessionRestored = ref(false);
const mobileMenuDrawer = ref(false);

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
  timeout: 3000,
});

// Desktop category dropdown state
const categoryMenuOpen = ref(false);
const openGroups = ref<number[]>([]);
const categoryMenuRef = ref<HTMLElement | null>(null);

// Mobile drawer category state
const mobileCategoryOpen = ref(false);
const mobileOpenGroups = ref<number[]>([]);

const userFavoritesCount = computed(() =>
  Array.isArray(favorites.value)
    ? favorites.value.filter((f: any) => f?.bookId != null).length
    : 0
);

const cartItemCount = computed(() =>
  cart.value.items ? cart.value.items.length : 0
);

watch(
  currentUser,
  (newValue) => {
    if (newValue) {
      dialogSignIn.value = false;
      dialogSignUp.value = false;
      dialogForgotPassword.value = false;
    }
  },
  { immediate: true }
);

function toggleCategoryGroup(index: number) {
  if (openGroups.value.includes(index)) {
    openGroups.value = openGroups.value.filter((i) => i !== index);
  } else {
    openGroups.value = [...openGroups.value, index];
  }
}

function toggleMobileGroup(index: number) {
  if (mobileOpenGroups.value.includes(index)) {
    mobileOpenGroups.value = mobileOpenGroups.value.filter((i) => i !== index);
  } else {
    mobileOpenGroups.value = [...mobileOpenGroups.value, index];
  }
}

function goToSubject(name: string) {
  categoryMenuOpen.value = false;
  router.push(`/subjects/${encodeURIComponent(name.toLowerCase())}`);
}

function openDialog(type?: string) {
  if (currentUser.value && type !== "forgot-password") {
    dialogSignIn.value = false;
    dialogSignUp.value = false;
    dialogForgotPassword.value = false;
    return;
  }

  dialogSignIn.value = false;
  dialogSignUp.value = false;
  dialogForgotPassword.value = false;

  nextTick(() => {
    if (type === "sign-in") {
      dialogSignIn.value = true;
    } else if (type === "sign-up") {
      dialogSignUp.value = true;
    } else if (type === "forgot-password") {
      dialogForgotPassword.value = true;
    }
  });
}

function handleCheckIsSignUp(data: boolean) {
  dialogSignUp.value = false;
  dialogSignIn.value = data;
}

function handleLogout() {
  mobileMenuDrawer.value = false;
  authStore.logout();
  router.push("/");
}

function goToProfile(tab: string) {
  nextTick(() => {
    router.push(`/profiles?tab=${tab}`);
  });
}

function showSnackbar(data: { message: string; color?: string }) {
  snackbar.message = data.message;
  snackbar.color = data.color ?? "success";
  snackbar.show = true;

  if (data.color === "success") {
    dialogSignIn.value = false;
  }
}

function navigateAndClose(targetRoute: string) {
  mobileMenuDrawer.value = false;
  router.push(targetRoute);
}

function openDialogAndCloseMobile(type: string) {
  mobileMenuDrawer.value = false;
  nextTick(() => {
    openDialog(type);
  });
}

function onDocumentClick(event: MouseEvent) {
  if (
    categoryMenuOpen.value &&
    categoryMenuRef.value &&
    !categoryMenuRef.value.contains(event.target as Node)
  ) {
    categoryMenuOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", onDocumentClick);
  await favoriteStore.getFavoritesForEachUser();
  await cartStore.fetchCart();
  await authStore.restoreSession();
  isSessionRestored.value = true;
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>
