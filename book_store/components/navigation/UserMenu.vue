<template>
  <!-- Signed out -->
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
      <UiDropdownMenuItem @select="emit('open-dialog', 'sign-in')">
        <LogIn class="mr-2 size-4" />
        Sign In
      </UiDropdownMenuItem>
      <UiDropdownMenuItem @select="emit('open-dialog', 'sign-up')">
        <UserPlus class="mr-2 size-4" />
        Sign Up
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>

  <!-- Signed in -->
  <UiDropdownMenu v-else>
    <UiDropdownMenuTrigger as-child>
      <button
        type="button"
        class="ml-1 hidden items-center rounded-full py-1 pl-1 pr-3 transition-all hover:-translate-y-0.5 hover:bg-muted sm:flex md:ml-2"
      >
        <NavigationUserAvatar :user="currentUser" class="h-9 w-9 shadow" />
        <span
          class="ml-2 hidden text-sm font-bold text-foreground md:inline lg:text-base"
        >
          {{ currentUser.username }}
        </span>
        <ChevronDown class="ml-1 hidden h-4 w-4 text-muted-foreground md:inline" />
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

      <UiDropdownMenuItem
        v-for="entry in PROFILE_MENU"
        :key="entry.tab"
        @select="navigateTo(`/profiles?tab=${entry.tab}`)"
      >
        <component :is="entry.icon" class="mr-2 size-4" />
        {{ entry.label }}
      </UiDropdownMenuItem>

      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem
        class="text-destructive focus:text-destructive"
        @select="emit('logout')"
      >
        <LogOut class="mr-2 size-4" />
        Logout
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script setup lang="ts">
import {
  ChevronDown,
  CircleUser,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-vue-next";
import { PROFILE_MENU } from "@/constants/profileMenu";
import type { User as UserType } from "@/types";
import type { AuthDialog } from "@/components/navigation/AuthDialogs.vue";

defineProps<{ currentUser: UserType | null }>();

const emit = defineEmits<{
  "open-dialog": [dialog: AuthDialog];
  logout: [];
}>();
</script>
