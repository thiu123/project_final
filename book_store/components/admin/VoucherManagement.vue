<template>
  <div class="voucher-management">
    <!-- Header -->
    <v-card class="mb-6" elevation="2">
      <v-card-text class="pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h2 class="text-h4 font-weight-bold mb-2">Voucher Management</h2>
            <p class="text-grey text-body-1 mb-0">
              Manage discount vouchers and promotional codes
            </p>
          </div>

          <div class="d-flex align-center ga-3">
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              variant="elevated"
              @click="openAddDialog"
            >
              Create Voucher
            </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              variant="outlined"
              @click="fetchVouchers"
              :loading="loading"
            >
              Refresh
            </v-btn>
          </div>
        </div>

        <!-- Filters -->
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Search vouchers..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Filter by status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filterType"
              :items="typeOptions"
              label="Filter by type"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Vouchers Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredVouchers"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <!-- Code Column -->
        <template v-slot:item.code="{ item }">
          <v-chip
            color="primary"
            variant="flat"
            size="small"
            class="font-weight-bold"
          >
            {{ item.code }}
          </v-chip>
        </template>

        <!-- Type Column -->
        <template v-slot:item.discountType="{ item }">
          <v-chip
            :color="item.discountType === 'percentage' ? 'purple' : 'orange'"
            variant="tonal"
            size="small"
          >
            {{
              item.discountType === "percentage" ? "Percentage" : "Fixed Amount"
            }}
          </v-chip>
        </template>

        <!-- Value Column -->
        <template v-slot:item.discountValue="{ item }">
          <span class="text-h6 font-weight-bold">
            {{
              item.discountType === "percentage"
                ? `${item.discountValue}%`
                : `$${item.discountValue}`
            }}
          </span>
        </template>

        <!-- Min Order Column -->
        <template v-slot:item.minOrderAmount="{ item }">
          <span class="text-body-2">${{ item.minOrderAmount }}</span>
        </template>

        <!-- Max Discount Column -->
        <template v-slot:item.maxDiscount="{ item }">
          <span class="text-body-2">
            {{ item.maxDiscount ? `$${item.maxDiscount}` : "No limit" }}
          </span>
        </template>

        <!-- Usage Column -->
        <template v-slot:item.usage="{ item }">
          <v-chip :color="getUsageColor(item)" variant="tonal" size="small">
            {{ item.usedCount }} / {{ item.usageLimit || "∞" }}
          </v-chip>
        </template>

        <!-- Expiry Date Column -->
        <template v-slot:item.expiryDate="{ item }">
          <div>
            <div class="text-body-2">{{ formatDate(item.expiryDate) }}</div>
            <v-chip
              v-if="isExpired(item.expiryDate)"
              color="error"
              size="x-small"
              variant="tonal"
              class="mt-1"
            >
              Expired
            </v-chip>
            <v-chip
              v-else-if="isExpiringSoon(item.expiryDate)"
              color="warning"
              size="x-small"
              variant="tonal"
              class="mt-1"
            >
              Expiring Soon
            </v-chip>
          </div>
        </template>

        <!-- Status Column -->
        <template v-slot:item.isActive="{ item }">
          <v-switch
            v-model="item.isActive"
            color="success"
            hide-details
            density="compact"
            @change="toggleVoucherStatus(item)"
          ></v-switch>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-2">
            <v-tooltip text="Edit">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editVoucher(item)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Delete">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="700" persistent>
      <v-card>
        <v-card-title class="pa-6 bg-primary">
          <span class="text-h5 text-white font-weight-bold">
            {{ editMode ? "Edit Voucher" : "Create New Voucher" }}
          </span>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="valid">
            <v-row>
              <!-- Code -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.code"
                  label="Voucher Code *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  hint="e.g., SUMMER2024"
                  persistent-hint
                  :disabled="editMode"
                ></v-text-field>
              </v-col>

              <!-- Discount Type -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.discountType"
                  :items="[
                    { title: 'Percentage (%)', value: 'percentage' },
                    { title: 'Fixed Amount ($)', value: 'fixed' },
                  ]"
                  label="Discount Type *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- Discount Value -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.discountValue"
                  :label="
                    formData.discountType === 'percentage'
                      ? 'Discount (%) *'
                      : 'Discount Amount ($) *'
                  "
                  :rules="[rules.required, rules.positive]"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :prefix="formData.discountType === 'percentage' ? '' : '$'"
                  :suffix="formData.discountType === 'percentage' ? '%' : ''"
                ></v-text-field>
              </v-col>

              <!-- Min Order Amount -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.minOrderAmount"
                  label="Minimum Order Amount ($)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prefix="$"
                  hint="0 = no minimum"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <!-- Max Discount (only for percentage) -->
              <v-col
                cols="12"
                md="6"
                v-if="formData.discountType === 'percentage'"
              >
                <v-text-field
                  v-model.number="formData.maxDiscount"
                  label="Max Discount Amount ($)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prefix="$"
                  hint="Leave empty for no limit"
                  persistent-hint
                  clearable
                ></v-text-field>
              </v-col>

              <!-- Usage Limit -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.usageLimit"
                  label="Usage Limit"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  hint="Leave empty for unlimited"
                  persistent-hint
                  clearable
                ></v-text-field>
              </v-col>

              <!-- Expiry Date -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.expiryDate"
                  label="Expiry Date *"
                  :rules="[rules.required]"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Active Status -->
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.isActive"
                  label="Active"
                  color="success"
                  hide-details
                ></v-switch>
              </v-col>

              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  variant="outlined"
                  rows="3"
                  hint="Optional description for this voucher"
                  persistent-hint
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog"> Cancel </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveVoucher"
            :loading="saving"
            :disabled="!valid"
          >
            {{ editMode ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete voucher
          <strong>{{ deleteItem?.code }}</strong
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteVoucher"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "~/api/voucherApi";

export default {
  name: "VoucherManagement",
  data() {
    return {
      loading: false,
      saving: false,
      dialog: false,
      deleteDialog: false,
      editMode: false,
      valid: false,
      search: "",
      filterStatus: null,
      filterType: null,
      vouchers: [],
      deleteItem: null,

      headers: [
        { title: "Code", key: "code", sortable: true },
        { title: "Type", key: "discountType", sortable: true },
        { title: "Value", key: "discountValue", sortable: true },
        { title: "Min Order", key: "minOrderAmount", sortable: true },
        { title: "Max Discount", key: "maxDiscount", sortable: false },
        { title: "Usage", key: "usage", sortable: false },
        { title: "Expiry Date", key: "expiryDate", sortable: true },
        { title: "Active", key: "isActive", sortable: true },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ],

      statusOptions: [
        { title: "Active", value: "active" },
        { title: "Inactive", value: "inactive" },
        { title: "Expired", value: "expired" },
      ],

      typeOptions: [
        { title: "Percentage", value: "percentage" },
        { title: "Fixed Amount", value: "fixed" },
      ],

      formData: {
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscount: null,
        expiryDate: "",
        isActive: true,
        usageLimit: null,
        description: "",
      },

      rules: {
        required: (v) => !!v || "This field is required",
        positive: (v) => v > 0 || "Value must be greater than 0",
      },

      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },

  computed: {
    filteredVouchers() {
      let filtered = [...this.vouchers];

      // Search filter
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.code.toLowerCase().includes(searchLower) ||
            v.description?.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (this.filterStatus) {
        if (this.filterStatus === "active") {
          filtered = filtered.filter(
            (v) => v.isActive && !this.isExpired(v.expiryDate)
          );
        } else if (this.filterStatus === "inactive") {
          filtered = filtered.filter((v) => !v.isActive);
        } else if (this.filterStatus === "expired") {
          filtered = filtered.filter((v) => this.isExpired(v.expiryDate));
        }
      }

      // Type filter
      if (this.filterType) {
        filtered = filtered.filter((v) => v.discountType === this.filterType);
      }

      return filtered;
    },
  },

  methods: {
    async fetchVouchers() {
      this.loading = true;
      try {
        this.vouchers = await getAllVouchers();
      } catch (error) {
        this.showSnackbar("Failed to fetch vouchers", "error");
        console.error("Error fetching vouchers:", error);
      } finally {
        this.loading = false;
      }
    },

    openAddDialog() {
      this.editMode = false;
      this.formData = {
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscount: null,
        expiryDate: "",
        isActive: true,
        usageLimit: null,
        description: "",
      };
      this.dialog = true;
    },

    editVoucher(item) {
      this.editMode = true;
      this.formData = {
        ...item,
        expiryDate: this.formatDateForInput(item.expiryDate),
      };
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.$refs.form?.reset();
    },

    async saveVoucher() {
      if (!this.$refs.form.validate()) return;

      this.saving = true;
      try {
        if (this.editMode) {
          await updateVoucher(this.formData._id, this.formData);
          this.showSnackbar("Voucher updated successfully", "success");
        } else {
          await createVoucher(this.formData);
          this.showSnackbar("Voucher created successfully", "success");
        }

        this.closeDialog();
        this.fetchVouchers();
      } catch (error) {
        this.showSnackbar(error.message || "Failed to save voucher", "error");
        console.error("Error saving voucher:", error);
      } finally {
        this.saving = false;
      }
    },

    confirmDelete(item) {
      this.deleteItem = item;
      this.deleteDialog = true;
    },

    async deleteVoucher() {
      try {
        await deleteVoucher(this.deleteItem._id);
        this.showSnackbar("Voucher deleted successfully", "success");
        this.deleteDialog = false;
        this.fetchVouchers();
      } catch (error) {
        this.showSnackbar("Failed to delete voucher", "error");
        console.error("Error deleting voucher:", error);
      }
    },

    async toggleVoucherStatus(item) {
      try {
        await updateVoucher(item._id, { isActive: item.isActive });
        this.showSnackbar(
          `Voucher ${item.isActive ? "activated" : "deactivated"}`,
          "success"
        );
      } catch (error) {
        item.isActive = !item.isActive;
        this.showSnackbar("Failed to update status", "error");
        console.error("Error updating status:", error);
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    formatDateForInput(date) {
      return new Date(date).toISOString().split("T")[0];
    },

    isExpired(date) {
      return new Date(date) < new Date();
    },

    isExpiringSoon(date) {
      const expiryDate = new Date(date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate - today) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    },

    getUsageColor(item) {
      if (!item.usageLimit) return "info";
      const percentage = (item.usedCount / item.usageLimit) * 100;
      if (percentage >= 90) return "error";
      if (percentage >= 70) return "warning";
      return "success";
    },

    showSnackbar(message, color = "success") {
      this.snackbar = { show: true, message, color };
    },
  },

  mounted() {
    this.fetchVouchers();
  },
};
</script>

<style scoped>
.voucher-management {
  padding: 24px;
}
</style>
