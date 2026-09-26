<template>
  <div>
    <AdminPageHeader
      title="Users"
      description="Everyone with an account, including administrators."
    >
      <template #actions>
        <UiButton variant="outline" :loading="loading" @click="refreshUsers">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminStatStrip :items="stats" :loading="loading && !users.length" />

    <AdminPanel :loading="loading && users.length > 0">
      <template #toolbar>
        <AdminSearchInput v-model="search" placeholder="Search name, email or ID" />
        <div class="flex items-center gap-1 md:ml-auto md:w-48">
          <UiSelect v-model="filterRole">
            <UiSelectTrigger class="w-full bg-background" aria-label="Filter by role">
              <UiSelectValue placeholder="All roles" />
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
      </template>

      <div class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th class="w-px"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <AdminTableSkeleton v-if="loading && !users.length" :columns="4" media />
            <template v-else>
              <tr v-for="item in paginatedUsers" :key="item._id">
                <td>
                  <div class="flex items-center gap-3">
                    <UserAvatar
                      :src="item?.avatar_url"
                      :name="item?.username"
                      class="size-9 shrink-0"
                    />
                    <div class="min-w-0">
                      <button
                        type="button"
                        class="block max-w-[260px] truncate text-left font-medium text-foreground hover:underline"
                        @click="viewUser(item)"
                      >
                        {{ item.username }}
                        <span
                          v-if="currentUser && item._id === currentUser._id"
                          class="ml-1 text-xs font-normal text-muted-foreground"
                        >
                          (you)
                        </span>
                      </button>
                      <div class="max-w-[260px] truncate text-xs text-muted-foreground">
                        {{ item.email }}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <AdminPill
                    :tone="item.admin ? 'default' : 'muted'"
                    :icon="item.admin ? ShieldCheck : undefined"
                  >
                    {{ item.admin ? "Admin" : "Customer" }}
                  </AdminPill>
                </td>

                <td class="whitespace-nowrap text-muted-foreground">
                  {{ formatDate(item.createdAt) }}
                </td>

                <td>
                  <div class="flex items-center justify-end gap-0.5">
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="text-muted-foreground hover:text-foreground"
                      aria-label="View user details"
                      title="View details"
                      @click="viewUser(item)"
                    >
                      <Eye class="h-4 w-4" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete user"
                      title="Delete user"
                      :disabled="
                        Boolean(item.admin && currentUser && item._id === currentUser._id)
                      "
                      @click="confirmDelete(item)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </UiButton>
                  </div>
                </td>
              </tr>

              <tr v-if="!paginatedUsers.length" class="hover:bg-transparent">
                <td colspan="4">
                  <AdminEmptyState
                    :icon="UserX"
                    title="No users found"
                    description="Nobody matches this search or role filter."
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <template #footer>
        <AdminTablePagination
          v-model:page="page"
          :total="filteredUsers.length"
          :items-per-page="itemsPerPage"
          noun="users"
        />
      </template>
    </AdminPanel>

    <AdminConfirmDeleteDialog
      v-model:open="deleteDialog"
      title="Delete user?"
      question="The account is removed and the user can no longer sign in."
      :subject="selectedUser?.username"
      :loading="deleteLoading"
      @confirm="deleteUser"
    />

    <UiDialog v-model:open="detailsDialog">
      <UiDialogContent class="sm:max-w-md">
        <UiDialogHeader>
          <UiDialogTitle>User details</UiDialogTitle>
          <UiDialogDescription class="sr-only">
            Account information for this user.
          </UiDialogDescription>
        </UiDialogHeader>

        <div v-if="selectedUser">
          <div class="flex items-center gap-4">
            <UserAvatar
              :src="selectedUser.avatar_url"
              :name="selectedUser.username"
              class="size-14 shrink-0"
            />
            <div class="min-w-0">
              <div class="truncate text-base font-semibold text-foreground">
                {{ selectedUser.username }}
              </div>
              <div class="truncate text-sm text-muted-foreground">
                {{ selectedUser.email }}
              </div>
            </div>
          </div>

          <dl class="mt-5 divide-y divide-border rounded-lg border border-border text-sm">
            <div class="flex items-center justify-between gap-4 px-4 py-2.5">
              <dt class="text-muted-foreground">Role</dt>
              <dd>
                <AdminPill :tone="selectedUser.admin ? 'default' : 'muted'">
                  {{ selectedUser.admin ? "Admin" : "Customer" }}
                </AdminPill>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-2.5">
              <dt class="text-muted-foreground">Joined</dt>
              <dd class="text-foreground">{{ formatDate(selectedUser.createdAt) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-2.5">
              <dt class="shrink-0 text-muted-foreground">User ID</dt>
              <dd class="truncate font-mono text-xs text-foreground">
                {{ selectedUser._id }}
              </dd>
            </div>
          </dl>
        </div>

        <UiDialogFooter>
          <UiButton variant="outline" @click="detailsDialog = false">Close</UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

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
  Eye,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-vue-next";
import { getAllUsers, deleteUser as deleteUserApi } from "~/api/userApi";
import type { User } from "@/types";
import type { AdminStat } from "@/types/admin";

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
  { label: "All roles", value: "all" },
  { label: "Customers", value: "user" },
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

const stats = computed<AdminStat[]>(() => [
  { label: "Total users", value: totalUsers.value, icon: Users },
  { label: "Customers", value: regularUsers.value, icon: UserCheck },
  { label: "Admins", value: adminUsers.value, icon: ShieldCheck },
  { label: "Joined this month", value: newUsersThisMonth.value, icon: UserPlus },
]);

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
