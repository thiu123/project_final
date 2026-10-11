<template>
  <UiDropdownMenu v-if="!currentUser">
    <UiDropdownMenuTrigger as-child>
      <button
        type="button"
        class="ml-1 hidden h-10 items-center gap-2 pl-2 text-[12.5px] font-medium uppercase tracking-[0.16em] text-foreground transition-opacity hover:opacity-60 sm:inline-flex"
      >
        <CircleUser class="size-5" :stroke-width="1.5" />
        <span class="hidden xl:inline">Account</span>
      </button>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-48">
      <UiDropdownMenuItem @select="emit('open-dialog', 'sign-in')">
        <LogIn class="mr-2 size-4" :stroke-width="1.5" />
        Sign in
      </UiDropdownMenuItem>
      <UiDropdownMenuItem @select="emit('open-dialog', 'sign-up')">
        <UserPlus class="mr-2 size-4" :stroke-width="1.5" />
        Create account
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>

  <UiDropdownMenu v-else>
    <UiDropdownMenuTrigger as-child>
      <button
        type="button"
        class="ml-1 hidden h-10 items-center gap-2 pl-1.5 transition-opacity hover:opacity-70 sm:inline-flex"
        :aria-label="`Account menu for ${currentUser.username}`"
      >
        <UserAvatar
          :src="currentUser?.avatar_url"
          :name="currentUser?.username"
          class="size-8 bg-muted text-xs font-semibold text-foreground"
        />
        <ChevronDown class="hidden size-3.5 text-muted-foreground xl:inline" />
      </button>
    </UiDropdownMenuTrigger>

    <UiDropdownMenuContent align="end" class="w-60">
      <UiDropdownMenuLabel class="py-3 font-normal">
        <span class="block truncate font-serif text-base text-foreground">
          {{ currentUser.username }}
        </span>
        <span class="mt-0.5 block truncate text-xs text-muted-foreground">
          {{ currentUser.email }}
        </span>
      </UiDropdownMenuLabel>
      <UiDropdownMenuSeparator />

      <UiDropdownMenuItem
        v-for="entry in PROFILE_MENU"
        :key="entry.tab"
        @select="navigateTo(`/profiles?tab=${entry.tab}`)"
      >
        <component :is="entry.icon" class="mr-2 size-4" :stroke-width="1.5" />
        {{ entry.label }}
      </UiDropdownMenuItem>

      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem
        class="text-destructive focus:text-destructive"
        @select="emit('logout')"
      >
        <LogOut class="mr-2 size-4" :stroke-width="1.5" />
        Sign out
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
import type { AuthDialog } from "@/stores/authDialog";

defineProps<{ currentUser: UserType | null }>();

const emit = defineEmits<{
  "open-dialog": [dialog: AuthDialog];
  logout: [];
}>();
</script>
