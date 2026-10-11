<template>
  <div>
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="open"
        class="fixed inset-y-0 left-0 z-[70] flex w-[min(88vw,360px)] flex-col overflow-y-auto bg-background"
        aria-label="Menu"
      >
        <div class="flex h-16 items-center justify-between border-b border-border px-5">
          <StoreWordmark size="sm" />
          <div class="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              class="inline-flex size-9 items-center justify-center transition-opacity hover:opacity-60"
              aria-label="Close menu"
              @click="close"
            >
              <X class="size-5" :stroke-width="1.5" />
            </button>
          </div>
        </div>

        <nav class="flex-1 px-5 py-6">
          <ul class="space-y-1">
            <li>
              <button type="button" :class="itemClass('/')" @click="go('/')">Home</button>
            </li>
            <li>
              <button type="button" :class="itemClass('/subjects/all')" @click="go('/subjects/all')">
                All books
              </button>
            </li>
            <li>
              <button
                type="button"
                :class="itemClass()"
                :aria-expanded="categoriesOpen"
                @click="categoriesOpen = !categoriesOpen"
              >
                Categories
                <Plus
                  class="ml-auto size-5 text-muted-foreground transition-transform duration-300"
                  :stroke-width="1.5"
                  :class="{ 'rotate-45': categoriesOpen }"
                />
              </button>
              <NavigationCategoryTree
                v-if="categoriesOpen"
                class="mb-3 mt-1"
                :categories="categories"
                @select="go(`/subjects/${$event}`)"
              />
            </li>
            <li>
              <button type="button" :class="itemClass('/favorites')" @click="go('/favorites')">
                Favorites
                <span v-if="favoritesCount > 0" class="ml-auto text-sm tabular-nums text-muted-foreground">
                  {{ favoritesCount }}
                </span>
              </button>
            </li>
            <li>
              <button type="button" :class="itemClass('/contact')" @click="go('/contact')">Contact</button>
            </li>
          </ul>
        </nav>

        <div class="border-t border-border px-5 py-6">
          <template v-if="currentUser">
            <div class="mb-5 flex items-center gap-3">
              <UserAvatar
                :src="currentUser?.avatar_url"
                :name="currentUser?.username"
                class="size-10 bg-muted text-sm font-semibold text-foreground"
              />
              <div class="min-w-0">
                <p class="truncate font-serif text-base">{{ currentUser.username }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ currentUser.email }}</p>
              </div>
            </div>
            <ul class="space-y-3 text-sm">
              <li>
                <button type="button" class="ed-link" @click="go('/profiles?tab=personal')">Profile</button>
              </li>
              <li>
                <button type="button" class="ed-link" @click="go('/profiles?tab=orders')">Orders</button>
              </li>
              <li>
                <button type="button" class="ed-link text-destructive" @click="emit('logout')">Sign out</button>
              </li>
            </ul>
          </template>

          <div v-else class="grid gap-3">
            <UiButton variant="ink" size="cta" block class="shadow-none" @click="openDialog('sign-in')">
              Sign in
            </UiButton>
            <UiButton variant="outline" size="cta" block class="shadow-none" @click="openDialog('sign-up')">
              Create account
            </UiButton>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Plus, X } from "lucide-vue-next";
import type { CategoryNode, User as UserType } from "@/types";
import type { AuthDialog } from "@/stores/authDialog";

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
  const base = "flex w-full items-center py-2.5 text-left font-serif text-2xl transition-colors";
  return path && route.path === path ? `${base} italic text-primary` : `${base} hover:text-primary`;
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
