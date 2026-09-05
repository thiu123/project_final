<template>
  <div>
    <div class="p-4">
      <!-- Header Section -->
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 class="mb-2 text-3xl font-bold text-foreground">User Management</h1>
          <p class="text-base text-muted-foreground">
            Manage all users in the system
          </p>
        </div>
        <UiButton
          class="bg-waterblue text-white hover:bg-waterblue/90"
          :loading="loading"
          @click="refreshUsers"
        >
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
      </div>

      <!-- Statistics Cards -->
      <div class="mb-6 grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-3">
          <div
            class="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex items-center">
              <div class="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-customyellow">
                <Users class="h-5 w-5 text-customblack" />
              </div>
              <div>
                <p class="mb-0 text-xs text-muted-foreground">Total Users</p>
                <p class="mb-0 text-2xl font-bold tabular-nums text-foreground">
                  {{ totalUsers }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 md:col-span-3">
          <div
            class="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex items-center">
              <div class="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-waterblue">
                <UserCheck class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="mb-0 text-xs text-muted-foreground">Regular Users</p>
                <p class="mb-0 text-2xl font-bold tabular-nums text-foreground">
                  {{ regularUsers }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 md:col-span-3">
          <div
            class="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex items-center">
              <div class="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-darkgreen">
                <ShieldCheck class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="mb-0 text-xs text-muted-foreground">Admins</p>
                <p class="mb-0 text-2xl font-bold tabular-nums text-foreground">
                  {{ adminUsers }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 md:col-span-3">
          <div
            class="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex items-center">
              <div class="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-lightgreen">
                <UserPlus class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="mb-0 text-xs text-muted-foreground">This Month</p>
                <p class="mb-0 text-2xl font-bold tabular-nums text-foreground">
                  {{ newUsersThisMonth }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="mb-4 grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-6">
          <UiInput v-model="search" placeholder="Search users...">
            <template #prepend>
              <Search class="h-4 w-4" />
            </template>
            <template #append>
              <button
                v-if="search"
                type="button"
                class="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
                @click="search = ''"
              >
                <X class="h-4 w-4" />
              </button>
            </template>
          </UiInput>
        </div>
        <div class="col-span-12 md:col-span-3">
          <div class="flex items-center gap-1">
            <UiSelect v-model="filterRole">
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Filter by Role" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem
                  v-for="opt in roleOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <UiButton
              v-if="filterRole"
              variant="ghost"
              size="iconSm"
              aria-label="Clear role filter"
              @click="filterRole = undefined"
            >
              <X class="h-4 w-4" />
            </UiButton>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <UiProgress v-if="loading" indeterminate class="h-1 rounded-none" />

        <UiTooltipProvider :delay-duration="200">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/60 text-left">
                <tr>
                  <th class="w-[80px] px-4 py-3 font-medium text-muted-foreground">Avatar</th>
                  <th class="px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th class="px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th class="px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  <th class="w-[120px] px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="item in paginatedUsers" :key="item._id" class="hover:bg-muted/40">
                  <!-- Avatar -->
                  <td class="px-4 py-3">
                    <UiAvatar class="my-2 size-10">
                      <UiAvatarImage
                        :src="item?.avatar_url || ''"
                        :alt="item?.username"
                      />
                      <UiAvatarFallback>
                        <CircleUser class="h-6 w-6" />
                      </UiAvatarFallback>
                    </UiAvatar>
                  </td>

                  <!-- Username -->
                  <td class="px-4 py-3">
                    <div class="flex items-center">
                      <div>
                        <div class="font-medium">{{ item.username }}</div>
                        <div class="text-xs text-muted-foreground">{{ item.email }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Role -->
                  <td class="px-4 py-3">
                    <UiBadge
                      class="border-transparent"
                      :class="
                        item.admin
                          ? 'bg-customyellow text-customblack'
                          : 'bg-waterblue text-white'
                      "
                    >
                      <ShieldCheck v-if="item.admin" class="h-3 w-3" />
                      <UserIcon v-else class="h-3 w-3" />
                      {{ item.admin ? "Admin" : "User" }}
                    </UiBadge>
                  </td>

                  <!-- Created Date -->
                  <td class="px-4 py-3">
                    <div class="text-xs">
                      {{ formatDate(item.createdAt) }}
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <UiTooltip>
                        <UiTooltipTrigger as-child>
                          <UiButton
                            variant="ghost"
                            size="iconSm"
                            aria-label="View user details"
                            @click="viewUser(item)"
                          >
                            <Eye class="h-4 w-4" />
                          </UiButton>
                        </UiTooltipTrigger>
                        <UiTooltipContent>View Details</UiTooltipContent>
                      </UiTooltip>

                      <UiTooltip>
                        <UiTooltipTrigger as-child>
                          <UiButton
                            variant="ghost"
                            size="iconSm"
                            class="text-destructive hover:text-destructive"
                            aria-label="Delete user"
                            :disabled="
                              Boolean(
                                item.admin && currentUser && item._id === currentUser._id
                              )
                            "
                            @click="confirmDelete(item)"
                          >
                            <Trash2 class="h-4 w-4" />
                          </UiButton>
                        </UiTooltipTrigger>
                        <UiTooltipContent>Delete User</UiTooltipContent>
                      </UiTooltip>
                    </div>
                  </td>
                </tr>

                <!-- No data -->
                <tr v-if="!paginatedUsers.length">
                  <td colspan="5" class="px-4 py-8 text-center">
                    <div v-if="loading" class="flex justify-center py-4">
                      <UiSpinner size="lg" class="text-muted-foreground" />
                    </div>
                    <div v-else>
                      <UserX class="mx-auto h-20 w-20 text-muted-foreground/40" />
                      <h3 class="mb-2 mt-4 text-lg font-semibold text-foreground">
                        No Users Found
                      </h3>
                      <p class="text-muted-foreground">
                        No users match your search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UiTooltipProvider>

        <!-- Pagination -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
          <div class="text-sm text-muted-foreground">
            Showing {{ paginatedUsers.length }} of {{ filteredUsers.length }} users
          </div>

          <UiPagination
            v-slot="{ page: currentPage }"
            v-model:page="page"
            :total="filteredUsers.length"
            :items-per-page="itemsPerPage"
            :sibling-count="1"
            class="mx-0 w-auto justify-end"
            show-edges
          >
            <UiPaginationContent v-slot="{ items }">
              <UiPaginationPrevious />
              <template v-for="(item, index) in items">
                <UiPaginationItem
                  v-if="item.type === 'page'"
                  :key="index"
                  :value="item.value"
                  :is-active="item.value === currentPage"
                >
                  {{ item.value }}
                </UiPaginationItem>
                <UiPaginationEllipsis v-else :key="item.type" :index="index" />
              </template>
              <UiPaginationNext />
            </UiPaginationContent>
          </UiPagination>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <UiDialog v-model:open="deleteDialog">
      <UiDialogContent class="sm:max-w-lg" hide-close>
        <UiDialogHeader>
          <UiDialogTitle class="flex items-center text-2xl font-semibold">
            <Trash2 class="mr-2 h-6 w-6 text-destructive" />
            Confirm Delete
          </UiDialogTitle>
        </UiDialogHeader>

        <p class="text-sm text-foreground">
          Are you sure you want to delete user
          <strong>{{ selectedUser?.username }}</strong
          >?
          <br />
          <span class="text-destructive">This action cannot be undone.</span>
        </p>

        <UiDialogFooter>
          <UiButton variant="ghost" @click="deleteDialog = false">Cancel</UiButton>
          <UiButton
            variant="destructive"
            :loading="deleteLoading"
            @click="deleteUser"
          >
            Delete
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <!-- User Details Dialog -->
    <UiDialog v-model:open="detailsDialog">
      <UiDialogContent class="sm:max-w-xl" hide-close>
        <UiDialogHeader>
          <UiDialogTitle class="flex items-center text-2xl font-semibold">
            <CircleUser class="mr-2 h-6 w-6" />
            User Details
          </UiDialogTitle>
        </UiDialogHeader>

        <div v-if="selectedUser" class="grid grid-cols-12 gap-4">
          <div class="col-span-12 text-center">
            <UiAvatar class="mx-auto mb-4 h-[100px] w-[100px]">
              <UiAvatarImage
                :src="selectedUser.avatar_url || ''"
                :alt="selectedUser.username"
              />
              <UiAvatarFallback>
                <CircleUser class="h-14 w-14" />
              </UiAvatarFallback>
            </UiAvatar>
          </div>

          <div class="col-span-6">
            <div class="text-sm font-medium text-foreground">Username</div>
            <div class="text-sm text-muted-foreground">
              {{ selectedUser.username }}
            </div>
          </div>

          <div class="col-span-6">
            <div class="text-sm font-medium text-foreground">Email</div>
            <div class="text-sm text-muted-foreground">
              {{ selectedUser.email }}
            </div>
          </div>

          <div class="col-span-6">
            <div class="mb-1 text-sm font-medium text-foreground">Role</div>
            <UiBadge
              class="border-transparent"
              :class="
                selectedUser.admin
                  ? 'bg-customyellow text-customblack'
                  : 'bg-waterblue text-white'
              "
            >
              {{ selectedUser.admin ? "Admin" : "User" }}
            </UiBadge>
          </div>

          <div class="col-span-6">
            <div class="text-sm font-medium text-foreground">User ID</div>
            <div class="text-xs text-muted-foreground">
              {{ selectedUser._id }}
            </div>
          </div>

          <div class="col-span-12">
            <div class="text-sm font-medium text-foreground">Joined Date</div>
            <div class="text-sm text-muted-foreground">
              {{ formatDate(selectedUser.createdAt) }}
            </div>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton variant="ghost" @click="detailsDialog = false">Close</UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <!-- Snackbar for notifications -->
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
import { useAuthStore } from "@/stores/auth";
import {
  CircleUser,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-vue-next";
import { getAllUsers, deleteUser as deleteUserApi } from "~/api/userApi";
import type { User } from "@/types";

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);

const users = ref<User[]>([]);
const loading = ref(false);
const deleteLoading = ref(false);
const search = ref("");
const filterRole = ref<string | undefined>(undefined);
const deleteDialog = ref(false);
const detailsDialog = ref(false);
const selectedUser = ref<User | null>(null);

const page = ref(1);
const itemsPerPage = 10;

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

const roleOptions = [
  { label: "All Users", value: "all" },
  { label: "Regular Users", value: "user" },
  { label: "Admins", value: "admin" },
];

const totalUsers = computed(() => users.value.length);

const regularUsers = computed(
  () => users.value.filter((user) => !user.admin).length
);

const adminUsers = computed(
  () => users.value.filter((user) => user.admin).length
);

const newUsersThisMonth = computed(() => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return users.value.filter((user) => {
    const userDate = new Date(user.createdAt as string);
    return (
      userDate.getMonth() === currentMonth &&
      userDate.getFullYear() === currentYear
    );
  }).length;
});

const filteredUsers = computed<User[]>(() => {
  let filtered = users.value;

  // Role filter (original values: null / false / true)
  if (filterRole.value === "admin") {
    filtered = filtered.filter((user) => user.admin);
  } else if (filterRole.value === "user") {
    filtered = filtered.filter((user) => !user.admin);
  }

  // Text search (previously handled internally by v-data-table's :search)
  if (search.value) {
    const query = search.value.toLowerCase();
    filtered = filtered.filter((user) =>
      [user.username, user.email, user._id].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }

  return filtered;
});

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage)
);

async function fetchUsers() {
  try {
    loading.value = true;
    const response = await getAllUsers();
    users.value = response.data || [];
    showSnackbar("Users loaded successfully", "success");
  } catch (error) {
    console.error("Error fetching users:", error);
    showSnackbar("Failed to load users", "error");
  } finally {
    loading.value = false;
  }
}

async function refreshUsers() {
  await fetchUsers();
}

function confirmDelete(user: User) {
  selectedUser.value = user;
  deleteDialog.value = true;
}

async function deleteUser() {
  if (!selectedUser.value) return;

  try {
    deleteLoading.value = true;
    await deleteUserApi(selectedUser.value._id);

    // Remove user from local array
    users.value = users.value.filter(
      (user) => user._id !== selectedUser.value?._id
    );

    showSnackbar(
      `User ${selectedUser.value.username} deleted successfully`,
      "success"
    );
    deleteDialog.value = false;
    selectedUser.value = null;
  } catch (error) {
    console.error("Error deleting user:", error);
    showSnackbar("Failed to delete user", "error");
  } finally {
    deleteLoading.value = false;
  }
}

function viewUser(user: User) {
  selectedUser.value = user;
  detailsDialog.value = true;
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showSnackbar(message: string, color = "success") {
  snackbar.show = true;
  snackbar.message = message;
  snackbar.color = color;
}

// Keep pagination consistent with the (re-implemented) filtering
watch([search, filterRole], () => {
  page.value = 1;
});

watch(pageCount, (val) => {
  if (page.value > val) page.value = Math.max(1, val);
});

onMounted(async () => {
  await fetchUsers();
});
</script>
