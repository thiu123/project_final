<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile sidebar overlay -->
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
        class="fixed inset-0 z-40 bg-black/60 md:hidden"
        aria-hidden="true"
        @click="mobileOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-card transition-all duration-200 md:translate-x-0"
      :class="[
        rail ? 'md:w-[72px]' : 'md:w-[280px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Header -->
      <div class="flex min-h-[80px] items-center px-4">
        <button
          type="button"
          class="mr-3 hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          aria-label="Toggle sidebar"
          @click.stop="rail = !rail"
        >
          <Menu class="h-5 w-5" />
        </button>

        <div class="flex items-center" :class="rail ? 'md:hidden' : ''">
          <div
            class="mr-2 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-customyellow"
          >
            <ShieldCheck class="h-[18px] w-[18px] text-customblack" />
          </div>
          <div class="text-base font-bold tracking-tight text-foreground">
            Admin Panel
          </div>
        </div>

        <button
          type="button"
          class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Close sidebar"
          @click="mobileOpen = false"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-2">
        <button
          v-for="item in menuItems"
          :key="item.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm font-medium transition-colors"
          :class="[
            activeTab === item.value
              ? 'border-customyellow bg-customyellow/15 text-foreground'
              : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
            rail ? 'md:justify-center md:border-l-0 md:px-0' : '',
          ]"
          :title="item.title"
          @click="setActiveTab(item.value)"
        >
          <component
            :is="item.icon"
            class="h-5 w-5 shrink-0"
            :class="activeTab === item.value ? 'text-lightgreen dark:text-customyellow' : ''"
          />
          <span class="truncate" :class="rail ? 'md:hidden' : ''">
            {{ item.title }}
          </span>
        </button>
      </nav>

      <!-- User Info (Bottom) -->
      <div class="border-t border-border p-4">
        <div class="flex items-center gap-3" :class="rail ? 'md:hidden' : ''">
          <UserAvatar
            :src="currentUser?.avatar_url"
            :name="currentUser?.username || 'Admin User'"
            class="h-9 w-9"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold text-foreground">
              {{ currentUser?.username || "Admin User" }}
            </div>
            <div class="truncate text-xs text-muted-foreground">
              Administrator
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Logout"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>

        <div v-if="rail" class="hidden text-center md:block">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Logout"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div
      class="flex min-h-screen flex-col transition-[padding] duration-200"
      :class="rail ? 'md:pl-[72px]' : 'md:pl-[280px]'"
    >
      <!-- Top Bar -->
      <header
        class="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6"
      >
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Open sidebar"
          @click="mobileOpen = true"
        >
          <Menu class="h-5 w-5" />
        </button>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-[10px] bg-customyellow"
        >
          <component :is="currentTabIcon" class="h-5 w-5 text-customblack" />
        </div>
        <h1 class="truncate text-2xl font-bold tracking-tight text-foreground">
          {{ currentTabTitle }}
        </h1>

        <div class="ml-auto flex items-center gap-2">
          <AdminOrderNotificationBell />
          <ThemeToggle />
        </div>
      </header>

      <!-- Content Area -->
      <main class="min-h-[calc(100vh-80px)] flex-1 p-6">
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
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MessagesSquare,
  Package,
  ShieldCheck,
  TicketPercent,
  Users,
  X,
} from "lucide-vue-next";

interface AdminMenuItem {
  title: string;
  value: string;
  icon: Component;
}

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);

const notificationStore = useNotificationStore();
const { latest } = storeToRefs(notificationStore);
const { snackbar, notify } = useSnackbar();

const rail = ref(false);
const mobileOpen = ref(false);
const activeTab = ref("dashboard");

const menuItems: AdminMenuItem[] = [
  {
    title: "Dashboard",
    value: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Book Management",
    value: "book-management",
    icon: BookCopy,
  },
  {
    title: "User Management",
    value: "user-management",
    icon: Users,
  },
  {
    title: "Review Management",
    value: "review-management",
    icon: MessagesSquare,
  },
  {
    title: "Contact & Feedback Management",
    value: "contact-management",
    icon: MessageSquare,
  },
  {
    title: "Order Management",
    value: "order-management",
    icon: Package,
  },
  {
    title: "Voucher Management",
    value: "voucher-management",
    icon: TicketPercent,
  },
];

const currentTabTitle = computed(() => {
  const item = menuItems.find((item) => item.value === activeTab.value);
  return item ? item.title : "Dashboard";
});

const currentTabIcon = computed<Component>(() => {
  const item = menuItems.find((item) => item.value === activeTab.value);
  return item ? item.icon : LayoutDashboard;
});

function setActiveTab(tab: string) {
  activeTab.value = tab;
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
  // Get tab from query params
  const tab = route.query.tab as string | undefined;
  if (tab && menuItems.find((item) => item.value === tab)) {
    activeTab.value = tab;
  }
});
</script>

<style>
/* Shared design tokens for the whole admin panel — consumed by every
   book_store/components/admin/*.vue file via var(--admin-*). */
:root {
  --admin-ink: #191b24;
  --admin-canvas: #f1f2ee;
  --admin-accent: #dcf763;
  --admin-blue: #5295d0;
  --admin-slate: #435058;
  --admin-emerald: #059669;
  --admin-radius-sm: 10px;
  --admin-radius-md: 16px;
  --admin-radius-lg: 24px;
  --admin-shadow-sm: 0 2px 10px -2px rgba(25, 27, 36, 0.08);
  --admin-shadow-md: 0 12px 28px -8px rgba(25, 27, 36, 0.14);
  --admin-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark-mode overrides so admin components stay legible in both themes. */
.dark {
  --admin-ink: #ecedf1;
  --admin-canvas: #191b24;
  --admin-shadow-sm: 0 2px 10px -2px rgba(0, 0, 0, 0.4);
  --admin-shadow-md: 0 12px 28px -8px rgba(0, 0, 0, 0.5);
}
</style>
