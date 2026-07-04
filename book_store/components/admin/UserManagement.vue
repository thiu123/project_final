<template>
  <div>
    <v-container fluid>
      <!-- Header Section -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2 admin-heading">
                User Management
              </h1>
              <p class="text-subtitle-1 text-grey">
                Manage all users in the system
              </p>
            </div>
            <v-btn
              color="waterblue"
              @click="refreshUsers"
              :loading="loading"
              prepend-icon="mdi-refresh"
            >
              Refresh
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="3">
          <v-card class="admin-card stat-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="customyellow" rounded="lg" class="mr-3">
                  <v-icon color="customblack">mdi-account-multiple</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">Total Users</p>
                  <p class="text-h5 font-weight-bold mb-0 stat-value">
                    {{ totalUsers }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="admin-card stat-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="waterblue" rounded="lg" class="mr-3">
                  <v-icon color="white">mdi-account-check</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">Regular Users</p>
                  <p class="text-h5 font-weight-bold mb-0 stat-value">
                    {{ regularUsers }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="admin-card stat-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="darkgreen" rounded="lg" class="mr-3">
                  <v-icon color="white">mdi-account-star</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">Admins</p>
                  <p class="text-h5 font-weight-bold mb-0 stat-value">
                    {{ adminUsers }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="admin-card stat-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="lightgreen" rounded="lg" class="mr-3">
                  <v-icon color="white">mdi-account-plus</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">This Month</p>
                  <p class="text-h5 font-weight-bold mb-0 stat-value">
                    {{ newUsersThisMonth }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search and Filter Section -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search users..."
            single-line
            hide-details
            clearable
            variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filterRole"
            :items="roleOptions"
            label="Filter by Role"
            variant="outlined"
            hide-details
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <!-- Users Table -->
      <v-card class="admin-card" elevation="0">
        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :loading="loading"
          :search="search"
          class="elevation-1"
          item-value="_id"
        >
          <!-- Avatar Column -->
          <template v-slot:item.avatar_url="{ item }">
            <v-avatar size="40" class="my-2">
              <v-img
                v-if="item?.avatar_url"
                :src="item?.avatar_url"
                :alt="item?.username"
              ></v-img>
              <v-icon v-else>mdi-account-circle</v-icon>
            </v-avatar>
          </template>

          <!-- Username Column -->
          <template v-slot:item.username="{ item }">
            <div class="d-flex align-center">
              <div>
                <div class="font-weight-medium">{{ item.username }}</div>
                <div class="text-caption text-grey">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <!-- Role Column -->
          <template v-slot:item.admin="{ item }">
            <v-chip
              :color="item.admin ? 'customyellow' : 'waterblue'"
              variant="flat"
              size="small"
            >
              <v-icon
                start
                :color="item.admin ? 'customblack' : 'white'"
                :icon="item.admin ? 'mdi-account-star' : 'mdi-account'"
              ></v-icon>
              <span :style="{ color: item.admin ? '#191b24' : '#fff' }">{{
                item.admin ? "Admin" : "User"
              }}</span>
            </v-chip>
          </template>

          <!-- Created Date Column -->
          <template v-slot:item.createdAt="{ item }">
            <div class="text-caption">
              {{ formatDate(item.createdAt) }}
            </div>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-tooltip text="View Details">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    @click="viewUser(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Delete User">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="red"
                    @click="confirmDelete(item)"
                    :disabled="
                      item.admin && currentUser && item._id === currentUser._id
                    "
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>

          <!-- No data slot -->
          <template v-slot:no-data>
            <div class="text-center pa-8">
              <v-icon size="80" color="grey-lighten-2">mdi-account-off</v-icon>
              <h3 class="text-h6 mt-4 mb-2">No Users Found</h3>
              <p class="text-grey">No users match your search criteria</p>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="red" class="mr-2">mdi-delete-alert</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete user
          <strong>{{ selectedUser?.username }}</strong
          >?
          <br />
          <span class="text-red">This action cannot be undone.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="red"
            variant="flat"
            @click="deleteUser"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card v-if="selectedUser">
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-account-details</v-icon>
          User Details
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" class="text-center">
              <v-avatar size="100" class="mb-4">
                <v-img
                  v-if="selectedUser.avatar_url"
                  :src="selectedUser.avatar_url"
                  :alt="selectedUser.username"
                ></v-img>
                <v-icon v-else size="60">mdi-account-circle</v-icon>
              </v-avatar>
            </v-col>
            <v-col cols="6">
              <v-list-item>
                <v-list-item-title>Username</v-list-item-title>
                <v-list-item-subtitle>{{
                  selectedUser.username
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{
                  selectedUser.email
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item>
                <v-list-item-title>Role</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="selectedUser.admin ? 'customyellow' : 'waterblue'"
                    variant="flat"
                    size="small"
                  >
                    <span
                      :style="{
                        color: selectedUser.admin ? '#191b24' : '#fff',
                      }"
                      >{{ selectedUser.admin ? "Admin" : "User" }}</span
                    >
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item>
                <v-list-item-title>User ID</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{
                  selectedUser._id
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="12">
              <v-list-item>
                <v-list-item-title>Joined Date</v-list-item-title>
                <v-list-item-subtitle>{{
                  formatDate(selectedUser.createdAt)
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script>
import { getAllUsers, deleteUser } from "~/api/userApi";
import SnackbarAlert from "~/components/SnackbarAlert.vue";

export default {
  name: "UserManagement",
  components: {
    SnackbarAlert,
  },
  data() {
    return {
      users: [],
      loading: false,
      deleteLoading: false,
      search: "",
      filterRole: null,
      deleteDialog: false,
      detailsDialog: false,
      selectedUser: null,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
      headers: [
        {
          title: "Avatar",
          value: "avatar_url",
          sortable: false,
          width: "80px",
        },
        { title: "User", value: "username", sortable: true },
        { title: "Role", value: "admin", sortable: true },
        { title: "Joined", value: "createdAt", sortable: true },
        { title: "Actions", value: "actions", sortable: false, width: "120px" },
      ],
      roleOptions: [
        { title: "All Users", value: null },
        { title: "Regular Users", value: false },
        { title: "Admins", value: true },
      ],
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    totalUsers() {
      return this.users.length;
    },
    regularUsers() {
      return this.users.filter((user) => !user.admin).length;
    },
    adminUsers() {
      return this.users.filter((user) => user.admin).length;
    },
    newUsersThisMonth() {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      return this.users.filter((user) => {
        const userDate = new Date(user.createdAt);
        return (
          userDate.getMonth() === currentMonth &&
          userDate.getFullYear() === currentYear
        );
      }).length;
    },
    filteredUsers() {
      let filtered = this.users;

      if (this.filterRole !== null) {
        filtered = filtered.filter((user) => user.admin === this.filterRole);
      }

      return filtered;
    },
  },
  async mounted() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        const response = await getAllUsers();
        this.users = response.data || [];
        this.showSnackbar("Users loaded successfully", "success");
      } catch (error) {
        console.error("Error fetching users:", error);
        this.showSnackbar("Failed to load users", "error");
      } finally {
        this.loading = false;
      }
    },
    async refreshUsers() {
      await this.fetchUsers();
    },
    confirmDelete(user) {
      this.selectedUser = user;
      this.deleteDialog = true;
    },
    async deleteUser() {
      if (!this.selectedUser) return;

      try {
        this.deleteLoading = true;
        await deleteUser(this.selectedUser._id);

        // Remove user from local array
        this.users = this.users.filter(
          (user) => user._id !== this.selectedUser._id
        );

        this.showSnackbar(
          `User ${this.selectedUser.username} deleted successfully`,
          "success"
        );
        this.deleteDialog = false;
        this.selectedUser = null;
      } catch (error) {
        console.error("Error deleting user:", error);
        this.showSnackbar("Failed to delete user", "error");
      } finally {
        this.deleteLoading = false;
      }
    },
    viewUser(user) {
      this.selectedUser = user;
      this.detailsDialog = true;
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    showSnackbar(message, color = "success") {
      this.snackbar = {
        show: true,
        message,
        color,
      };
    },
  },
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.admin-card {
  border-radius: var(--admin-radius-md, 16px);
  box-shadow: var(--admin-shadow-sm, 0 2px 10px -2px rgba(25, 27, 36, 0.08));
}

.admin-heading {
  color: var(--admin-ink, #191b24);
}

.stat-card {
  transition: transform var(--admin-transition, 200ms ease),
    box-shadow var(--admin-transition, 200ms ease);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--admin-shadow-md, 0 12px 28px -8px rgba(25, 27, 36, 0.14));
}

.stat-value {
  font-variant-numeric: tabular-nums;
  color: var(--admin-ink, #191b24);
}
</style>
