<template>
  <div class="min-h-screen bg-canvas">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-customblack/50 backdrop-blur-[2px] md:hidden"
        aria-hidden="true"
        @click="mobileOpen = false"
      />
    </Transition>

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-border bg-background transition-[width,transform] duration-200 ease-out md:translate-x-0"
      :class="[
        rail ? 'md:w-[68px]' : 'md:w-[248px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <NuxtLink
          to="/admin"
          class="flex min-w-0 items-center gap-2.5"
          :class="rail ? 'md:mx-auto' : ''"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-customblack text-customyellow dark:bg-customyellow dark:text-customblack"
          >
            <BookOpenText class="h-4 w-4" />
          </span>
          <span class="min-w-0" :class="rail ? 'md:hidden' : ''">
            <span class="block truncate text-sm font-semibold text-foreground">
              Book Store
            </span>
            <span class="block truncate text-xs text-muted-foreground">
              Admin
            </span>
          </span>
        </NuxtLink>

        <button
          type="button"
          class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Close sidebar"
          @click="mobileOpen = false"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 pb-4 pt-2" aria-label="Admin">
        <div
          v-for="group in menuGroups"
          :key="group.label"
          class="mt-4 first:mt-0"
        >
          <p
            v-if="group.label"
            class="mb-1 px-2.5 text-xs font-medium text-muted-foreground"
            :class="rail ? 'md:sr-only' : ''"
          >
            {{ group.label }}
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in group.items" :key="item.value">
              <button
                type="button"
                class="group relative flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors"
                :class="[
                  activeTab === item.value
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  rail ? 'md:justify-center md:px-0' : '',
                ]"
                :aria-current="activeTab === item.value ? 'page' : undefined"
                :title="rail ? item.title : undefined"
                @click="setActiveTab(item.value)"
              >
                <component
                  :is="item.icon"
                  class="h-4 w-4 shrink-0"
                  :class="activeTab === item.value ? 'text-foreground' : ''"
                />
                <span class="truncate" :class="rail ? 'md:hidden' : ''">
                  {{ item.title }}
                </span>
                <span
                  v-if="item.value === 'order-management' && unreadCount"
                  class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-semibold tabular-nums text-background"
                  :class="rail ? 'md:absolute md:right-1 md:top-0.5 md:ml-0 md:h-4 md:min-w-4 md:px-1 md:text-[10px]' : ''"
                >
                  {{ unreadCount > 9 ? "9+" : unreadCount }}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div class="border-t border-border p-3">
        <div
          class="flex items-center gap-2.5 rounded-md px-1.5 py-1"
          :class="rail ? 'md:flex-col md:px-0' : ''"
        >
          <UserAvatar
            :src="currentUser?.avatar_url"
            :name="currentUser?.username || 'Admin'"
            class="h-8 w-8 shrink-0"
          />
          <div class="min-w-0 flex-1" :class="rail ? 'md:hidden' : ''">
            <div class="truncate text-sm font-medium text-foreground">
              {{ currentUser?.username || "Admin" }}
            </div>
            <div class="truncate text-xs text-muted-foreground">
              {{ currentUser?.email || "Administrator" }}
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Log out"
            title="Log out"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>

    <div
      class="flex min-h-screen flex-col transition-[padding] duration-200 ease-out"
      :class="rail ? 'md:pl-[68px]' : 'md:pl-[248px]'"
    >
      <header
        class="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-canvas/85 px-4 backdrop-blur-md md:px-6"
      >
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Open sidebar"
          @click="mobileOpen = true"
        >
          <Menu class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          :aria-label="rail ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="rail = !rail"
        >
          <PanelLeft class="h-4 w-4" />
        </button>

        <UiSeparator orientation="vertical" class="mx-1 hidden h-5 md:block" />

        <nav
          aria-label="Breadcrumb"
          class="flex min-w-0 items-center gap-1.5 text-sm"
        >
          <span class="hidden text-muted-foreground sm:inline">Admin</span>
          <ChevronRight
            class="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/60 sm:block"
          />
          <span class="truncate font-medium text-foreground">
            {{ currentItem.title }}
          </span>
        </nav>

        <div class="ml-auto flex items-center gap-1">
          <UiButton
            as="a"
            href="/"
            target="_blank"
            rel="noopener"
            variant="ghost"
            size="sm"
            class="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <Store class="h-4 w-4" />
            View store
          </UiButton>
          <AdminOrderNotificationBell />
          <ThemeToggle />
        </div>
      </header>

      <main class="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">
        <slot />
      </main>
    </div>

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="4000"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useSnackbar } from "@/composables/useSnackbar";
import { formatVndAsUsd } from "@/utils/pricing";
import type { Component } from "vue";
import {
  BookCopy,
  BookOpenText,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MessagesSquare,
  Package,
  PanelLeft,
  Store,
  TicketPercent,
  Users,
  X,
} from "lucide-vue-next";

interface AdminMenuItem {
  title: string;
  value: string;
  icon: Component;
}

interface AdminMenuGroup {
  label: string;
  items: AdminMenuItem[];
}

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);

const notificationStore = useNotificationStore();
const { latest, unreadCount } = storeToRefs(notificationStore);
const { snackbar, notify } = useSnackbar();

const rail = ref(false);
const mobileOpen = ref(false);

const menuGroups: AdminMenuGroup[] = [
  {
    label: "",
    items: [{ title: "Dashboard", value: "dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", value: "order-management", icon: Package },
      { title: "Vouchers", value: "voucher-management", icon: TicketPercent },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Books", value: "book-management", icon: BookCopy },
      { title: "Reviews", value: "review-management", icon: MessagesSquare },
    ],
  },
  {
    label: "Customers",
    items: [
      { title: "Users", value: "user-management", icon: Users },
      { title: "Feedback", value: "contact-management", icon: MessageSquare },
    ],
  },
];

const menuItems = menuGroups.flatMap((group) => group.items);

const activeTab = computed(() => {
  const tab = route.query.tab as string | undefined;
  return tab && menuItems.some((item) => item.value === tab) ? tab : "dashboard";
});

const currentItem = computed(
  () => menuItems.find((item) => item.value === activeTab.value) ?? menuItems[0]
);

useHead({
  title: computed(() => `${currentItem.value.title} · Admin`),
});

function setActiveTab(tab: string) {
  mobileOpen.value = false;
  router.push(`/admin?tab=${tab}`);
}

function handleLogout() {
  authStore.logout();
  router.push("/");
}

watch(latest, (order) => {
  if (order) {
    notify(`New order from ${order.customer} · ${formatVndAsUsd(order.total)}`);
  }
});

onUnmounted(() => {
  notificationStore.disconnect();
});

onMounted(() => {
  authStore.restoreSession();
  notificationStore.connect(authStore.accessToken);
});
</script>
