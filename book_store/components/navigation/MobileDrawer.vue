<template>
  <div>
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[60] bg-black/60"
        aria-hidden="true"
        @click="close"
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
        v-if="open"
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
              @click="close"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="mb-2 h-px bg-border" />

        <nav class="px-2">
          <button type="button" :class="itemClass('/')" @click="go('/')">
            <Home class="h-5 w-5" />
            Home
          </button>

          <button
            type="button"
            :class="itemClass()"
            @click="categoriesOpen = !categoriesOpen"
          >
            <Shapes class="h-5 w-5" />
            Category
            <ChevronDown
              class="ml-auto h-4 w-4 transition-transform duration-200"
              :class="{ 'rotate-180': categoriesOpen }"
            />
          </button>

          <NavigationCategoryTree
            v-if="categoriesOpen"
            :categories="categories"
            variant="mobile"
            @select="go(`/subjects/${$event}`)"
          />

          <button
            type="button"
            :class="itemClass('/favorites')"
            @click="go('/favorites')"
          >
            <Heart class="h-5 w-5" />
            Favorites
            <UiBadge v-if="favoritesCount > 0" class="ml-auto">
              {{ favoritesCount }}
            </UiBadge>
          </button>

          <button
            type="button"
            :class="itemClass('/contact')"
            @click="go('/contact')"
          >
            <Mail class="h-5 w-5" />
            Contact Us
          </button>

          <div class="my-2 h-px bg-border" />

          <template v-if="currentUser">
            <div class="mb-2 flex items-center rounded-lg bg-muted p-3">
              <NavigationUserAvatar :user="currentUser" class="mr-3 h-9 w-9" />
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
              :class="itemClass()"
              @click="go('/profiles?tab=personal')"
            >
              <User class="h-5 w-5" />
              Profile
            </button>

            <button
              type="button"
              :class="itemClass()"
              @click="go('/profiles?tab=orders')"
            >
              <Package class="h-5 w-5" />
              Orders
            </button>

            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              @click="emit('logout')"
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
                @click="openDialog('sign-in')"
              >
                Sign In
              </UiButton>
            </div>
            <div class="p-3 pt-0">
              <UiButton
                block
                variant="outline"
                class="rounded-full border-darkgreen text-darkgreen dark:border-border dark:text-foreground"
                @click="openDialog('sign-up')"
              >
                Sign Up
              </UiButton>
            </div>
          </template>
        </nav>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  ChevronDown,
  Heart,
  Home,
  LogOut,
  Mail,
  Package,
  Shapes,
  User,
  X,
} from "lucide-vue-next";
import type { CategoryNode, User as UserType } from "@/types";
import type { AuthDialog } from "@/components/navigation/AuthDialogs.vue";

defineProps<{
  categories: CategoryNode[];
  currentUser: UserType | null;
  favoritesCount: number;
}>();

const emit = defineEmits<{
  "open-dialog": [dialog: AuthDialog];
  logout: [];
}>();

const open = defineModel<boolean>("open", { default: false });

const route = useRoute();
const router = useRouter();

const categoriesOpen = ref(false);

function itemClass(path?: string) {
  const base =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted";
  return path && route.path === path
    ? `${base} bg-customyellow/20 font-bold`
    : base;
}

function close() {
  open.value = false;
}

function go(target: string) {
  close();
  router.push(target);
}

function openDialog(dialog: AuthDialog) {
  close();
  emit("open-dialog", dialog);
}
</script>
