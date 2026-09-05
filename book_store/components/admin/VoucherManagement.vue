<template>
  <div class="voucher-management p-6">
    <!-- Header -->
    <div class="mb-6 rounded-2xl border border-border bg-card shadow-sm">
      <div class="p-6">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 class="mb-2 text-3xl font-bold text-foreground">
              Voucher Management
            </h2>
            <p class="mb-0 text-base text-muted-foreground">
              Manage discount vouchers and promotional codes
            </p>
          </div>

          <div class="flex items-center gap-3">
            <UiButton
              class="bg-customyellow text-customblack transition-transform hover:-translate-y-px hover:bg-customyellow/90"
              @click="openAddDialog"
            >
              <Plus class="h-4 w-4" />
              Create Voucher
            </UiButton>

            <UiButton
              variant="outline"
              class="border-waterblue text-waterblue hover:bg-waterblue/10 hover:text-waterblue"
              :loading="loading"
              @click="fetchVouchers"
            >
              <RefreshCw v-if="!loading" class="h-4 w-4" />
              Refresh
            </UiButton>
          </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-4">
            <UiInput v-model="search" placeholder="Search vouchers...">
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
              <UiSelect
                :model-value="filterStatus"
                @update:model-value="filterStatus = ($event as string) || undefined"
              >
                <UiSelectTrigger class="w-full">
                  <UiSelectValue placeholder="Filter by status" />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiButton
                v-if="filterStatus"
                variant="ghost"
                size="iconSm"
                aria-label="Clear status filter"
                @click="filterStatus = undefined"
              >
                <X class="h-4 w-4" />
              </UiButton>
            </div>
          </div>

          <div class="col-span-12 md:col-span-3">
            <div class="flex items-center gap-1">
              <UiSelect
                :model-value="filterType"
                @update:model-value="filterType = ($event as string) || undefined"
              >
                <UiSelectTrigger class="w-full">
                  <UiSelectValue placeholder="Filter by type" />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem
                    v-for="opt in typeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiButton
                v-if="filterType"
                variant="ghost"
                size="iconSm"
                aria-label="Clear type filter"
                @click="filterType = undefined"
              >
                <X class="h-4 w-4" />
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vouchers Table -->
    <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <UiProgress v-if="loading" indeterminate class="h-1 rounded-none" />

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/60 text-left">
            <tr>
              <th class="px-4 py-3 font-medium text-muted-foreground">Code</th>
              <th class="px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th class="px-4 py-3 font-medium text-muted-foreground">Value</th>
              <th class="px-4 py-3 font-medium text-muted-foreground">Min Order</th>
              <th class="px-4 py-3 font-medium text-muted-foreground">Max Discount</th>
              <th class="px-4 py-3 font-medium text-muted-foreground">Usage</th>
              <th class="px-4 py-3 font-medium text-muted-foreground">Expiry Date</th>
              <th class="px-4 py-3 font-medium text-muted-foreground">Active</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="item in paginatedVouchers"
              :key="item._id"
              class="hover:bg-muted/40"
            >
              <!-- Code -->
              <td class="px-4 py-3">
                <UiBadge class="border-transparent bg-foreground font-bold text-background">
                  {{ item.code }}
                </UiBadge>
              </td>

              <!-- Type -->
              <td class="px-4 py-3">
                <UiBadge
                  class="border-transparent"
                  :class="
                    item.discountType === 'percentage'
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                      : 'bg-orange-500/15 text-orange-600 dark:text-orange-300'
                  "
                >
                  {{
                    item.discountType === "percentage" ? "Percentage" : "Fixed Amount"
                  }}
                </UiBadge>
              </td>

              <!-- Value -->
              <td class="px-4 py-3">
                <span class="text-lg font-bold">
                  {{
                    item.discountType === "percentage"
                      ? `${item.discountValue}%`
                      : `$${item.discountValue}`
                  }}
                </span>
              </td>

              <!-- Min Order -->
              <td class="px-4 py-3">
                <span class="text-sm">${{ item.minOrderAmount }}</span>
              </td>

              <!-- Max Discount -->
              <td class="px-4 py-3">
                <span class="text-sm">
                  {{ item.maxDiscount ? `$${item.maxDiscount}` : "No limit" }}
                </span>
              </td>

              <!-- Usage -->
              <td class="px-4 py-3">
                <UiBadge class="border-transparent" :class="usageColorClass(item)">
                  {{ item.usedCount }} / {{ item.usageLimit || "∞" }}
                </UiBadge>
              </td>

              <!-- Expiry Date -->
              <td class="px-4 py-3">
                <div>
                  <div class="text-sm">{{ formatDate(item.expiryDate) }}</div>
                  <UiBadge
                    v-if="isExpired(item.expiryDate)"
                    class="mt-1 border-transparent bg-destructive/15 text-destructive"
                  >
                    Expired
                  </UiBadge>
                  <UiBadge
                    v-else-if="isExpiringSoon(item.expiryDate)"
                    class="mt-1 border-transparent bg-warning/15 text-warning"
                  >
                    Expiring Soon
                  </UiBadge>
                </div>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <UiSwitch
                  v-model="item.isActive"
                  @update:model-value="toggleVoucherStatus(item)"
                />
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <UiTooltipProvider :delay-duration="200">
                  <div class="flex justify-center gap-2">
                    <UiTooltip>
                      <UiTooltipTrigger as-child>
                        <UiButton
                          variant="ghost"
                          size="iconSm"
                          class="text-primary hover:text-primary"
                          aria-label="Edit voucher"
                          @click="editVoucher(item)"
                        >
                          <Pencil class="h-4 w-4" />
                        </UiButton>
                      </UiTooltipTrigger>
                      <UiTooltipContent>Edit</UiTooltipContent>
                    </UiTooltip>

                    <UiTooltip>
                      <UiTooltipTrigger as-child>
                        <UiButton
                          variant="ghost"
                          size="iconSm"
                          class="text-destructive hover:text-destructive"
                          aria-label="Delete voucher"
                          @click="confirmDelete(item)"
                        >
                          <Trash2 class="h-4 w-4" />
                        </UiButton>
                      </UiTooltipTrigger>
                      <UiTooltipContent>Delete</UiTooltipContent>
                    </UiTooltip>
                  </div>
                </UiTooltipProvider>
              </td>
            </tr>

            <tr v-if="!paginatedVouchers.length">
              <td colspan="9" class="px-4 py-8 text-center text-muted-foreground">
                {{ loading ? "Loading vouchers..." : "No data available" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <div class="text-sm text-muted-foreground">
          Showing {{ paginatedVouchers.length }} of
          {{ filteredVouchers.length }} vouchers
        </div>

        <UiPagination
          v-slot="{ page: currentPage }"
          v-model:page="page"
          :total="filteredVouchers.length"
          :items-per-page="itemsPerPage"
          :sibling-count="1"
          show-edges
          class="mx-0 w-auto justify-end"
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

    <!-- Add/Edit Dialog -->
    <UiDialog v-model:open="dialog">
      <UiDialogContent
        hide-close
        class="gap-0 overflow-hidden p-0 sm:max-w-2xl"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <div class="bg-customblack p-6">
          <UiDialogTitle class="text-2xl font-bold text-white">
            {{ editMode ? "Edit Voucher" : "Create New Voucher" }}
          </UiDialogTitle>
          <UiDialogDescription class="sr-only">
            {{
              editMode
                ? "Update the details of this discount voucher."
                : "Fill in the details to create a new discount voucher."
            }}
          </UiDialogDescription>
        </div>

        <div class="max-h-[70vh] overflow-y-auto p-6">
          <form @submit.prevent="saveVoucher">
            <div class="grid grid-cols-12 gap-4">
              <!-- Code -->
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  v-model="formData.code"
                  label="Voucher Code *"
                  :disabled="editMode"
                  hint="e.g., SUMMER2024"
                  :error-message="formErrors.code"
                />
              </div>

              <!-- Discount Type -->
              <div class="col-span-12 md:col-span-6">
                <UiLabel class="mb-1.5 block">Discount Type *</UiLabel>
                <UiSelect
                  :model-value="formData.discountType"
                  @update:model-value="
                    formData.discountType = $event as Voucher['discountType']
                  "
                >
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue placeholder="Discount Type *" />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem
                      v-for="opt in discountTypeItems"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
                <p v-if="formErrors.discountType" class="mt-1 text-xs text-destructive">
                  {{ formErrors.discountType }}
                </p>
              </div>

              <!-- Discount Value -->
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  v-model="formData.discountValue"
                  :label="
                    formData.discountType === 'percentage'
                      ? 'Discount (%) *'
                      : 'Discount Amount ($) *'
                  "
                  type="number"
                  :error-message="formErrors.discountValue"
                >
                  <template v-if="formData.discountType !== 'percentage'" #prepend>
                    <span class="text-sm">$</span>
                  </template>
                  <template v-if="formData.discountType === 'percentage'" #append>
                    <span class="text-sm">%</span>
                  </template>
                </UiInput>
              </div>

              <!-- Min Order Amount -->
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  v-model="formData.minOrderAmount"
                  label="Minimum Order Amount ($)"
                  type="number"
                  hint="0 = no minimum"
                >
                  <template #prepend>
                    <span class="text-sm">$</span>
                  </template>
                </UiInput>
              </div>

              <!-- Max Discount (only for percentage) -->
              <div
                v-if="formData.discountType === 'percentage'"
                class="col-span-12 md:col-span-6"
              >
                <UiInput
                  v-model="formData.maxDiscount"
                  label="Max Discount Amount ($)"
                  type="number"
                  hint="Leave empty for no limit"
                >
                  <template #prepend>
                    <span class="text-sm">$</span>
                  </template>
                  <template #append>
                    <button
                      v-if="formData.maxDiscount !== null && formData.maxDiscount !== undefined && String(formData.maxDiscount) !== ''"
                      type="button"
                      class="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Clear max discount"
                      @click="formData.maxDiscount = null"
                    >
                      <X class="h-4 w-4" />
                    </button>
                  </template>
                </UiInput>
              </div>

              <!-- Usage Limit -->
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  v-model="formData.usageLimit"
                  label="Usage Limit"
                  type="number"
                  hint="Leave empty for unlimited"
                >
                  <template #append>
                    <button
                      v-if="formData.usageLimit !== null && formData.usageLimit !== undefined && String(formData.usageLimit) !== ''"
                      type="button"
                      class="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Clear usage limit"
                      @click="formData.usageLimit = null"
                    >
                      <X class="h-4 w-4" />
                    </button>
                  </template>
                </UiInput>
              </div>

              <!-- Expiry Date -->
              <div class="col-span-12 md:col-span-6">
                <UiInput
                  v-model="formData.expiryDate"
                  label="Expiry Date *"
                  type="date"
                  :error-message="formErrors.expiryDate"
                />
              </div>

              <!-- Active Status -->
              <div class="col-span-12 flex items-end pb-1 md:col-span-6">
                <UiSwitch v-model="formData.isActive" label="Active" />
              </div>

              <!-- Description -->
              <div class="col-span-12">
                <UiTextarea
                  v-model="formData.description"
                  label="Description"
                  :rows="3"
                  hint="Optional description for this voucher"
                />
              </div>
            </div>
          </form>
        </div>

        <div class="flex items-center justify-end gap-2 p-6 pt-0">
          <UiButton variant="ghost" @click="closeDialog"> Cancel </UiButton>
          <UiButton
            class="bg-customyellow text-customblack transition-transform hover:-translate-y-px hover:bg-customyellow/90"
            :loading="saving"
            :disabled="!valid"
            @click="saveVoucher"
          >
            {{ editMode ? "Update" : "Create" }}
          </UiButton>
        </div>
      </UiDialogContent>
    </UiDialog>

    <!-- Delete Confirmation Dialog -->
    <UiDialog v-model:open="deleteDialog">
      <UiDialogContent hide-close class="sm:max-w-sm">
        <UiDialogHeader>
          <UiDialogTitle>Confirm Delete</UiDialogTitle>
          <UiDialogDescription class="text-sm text-foreground">
            Are you sure you want to delete voucher
            <strong>{{ deleteItem?.code }}</strong
            >? This action cannot be undone.
          </UiDialogDescription>
        </UiDialogHeader>

        <UiDialogFooter>
          <UiButton variant="ghost" @click="deleteDialog = false">Cancel</UiButton>
          <UiButton variant="destructive" @click="deleteVoucher">Delete</UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <!-- Snackbar -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-vue-next";
import {
  getAllVouchers,
  createVoucher as createVoucherApi,
  updateVoucher as updateVoucherApi,
  deleteVoucher as deleteVoucherApi,
} from "~/api/voucherApi";
import type { Voucher } from "@/types";

interface VoucherForm {
  _id?: string;
  code: string;
  discountType: Voucher["discountType"];
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  usedCount?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
const search = ref("");
const filterStatus = ref<string | undefined>(undefined);
const filterType = ref<string | undefined>(undefined);
const vouchers = ref<Voucher[]>([]);
const deleteItem = ref<Voucher | null>(null);

const page = ref(1);
const itemsPerPage = 10;

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Expired", value: "expired" },
];

const typeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

const discountTypeItems = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed Amount ($)", value: "fixed" },
];

function defaultFormData(): VoucherForm {
  return {
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
}

const formData = ref<VoucherForm>(defaultFormData());
const formErrors = ref<Record<string, string>>({});

// Same rules as the original v-form
const rules = {
  required: (v: unknown) => !!v || "This field is required",
  positive: (v: number) => v > 0 || "Value must be greater than 0",
};

// Live validity, mirroring v-form's `v-model="valid"`
const valid = computed(
  () =>
    rules.required(formData.value.code) === true &&
    rules.required(formData.value.discountType) === true &&
    rules.required(formData.value.discountValue) === true &&
    rules.positive(formData.value.discountValue) === true &&
    rules.required(formData.value.expiryDate) === true
);

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

const filteredVouchers = computed<Voucher[]>(() => {
  let filtered = [...vouchers.value];

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (v: any) =>
        v.code.toLowerCase().includes(searchLower) ||
        v.description?.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (filterStatus.value) {
    if (filterStatus.value === "active") {
      filtered = filtered.filter((v) => v.isActive && !isExpired(v.expiryDate));
    } else if (filterStatus.value === "inactive") {
      filtered = filtered.filter((v) => !v.isActive);
    } else if (filterStatus.value === "expired") {
      filtered = filtered.filter((v) => isExpired(v.expiryDate));
    }
  }

  // Type filter
  if (filterType.value) {
    filtered = filtered.filter((v) => v.discountType === filterType.value);
  }

  return filtered;
});

const paginatedVouchers = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredVouchers.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() =>
  Math.ceil(filteredVouchers.value.length / itemsPerPage)
);

async function fetchVouchers() {
  loading.value = true;
  try {
    // The backend returns the raw voucher array even though the API's TS type
    // declares a wrapped response — handle both shapes safely.
    const response = await getAllVouchers();
    vouchers.value = Array.isArray(response)
      ? (response as Voucher[])
      : response?.data ?? [];
  } catch (error) {
    showSnackbar("Failed to fetch vouchers", "error");
    console.error("Error fetching vouchers:", error);
  } finally {
    loading.value = false;
  }
}

function openAddDialog() {
  editMode.value = false;
  formData.value = defaultFormData();
  formErrors.value = {};
  dialog.value = true;
}

function editVoucher(item: Voucher) {
  editMode.value = true;
  formData.value = {
    ...item,
    expiryDate: formatDateForInput(item.expiryDate),
  };
  formErrors.value = {};
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  formErrors.value = {};
}

function validateForm() {
  formErrors.value = {};

  const codeCheck = rules.required(formData.value.code);
  if (codeCheck !== true) formErrors.value.code = codeCheck as string;

  const typeCheck = rules.required(formData.value.discountType);
  if (typeCheck !== true) formErrors.value.discountType = typeCheck as string;

  const valueRequired = rules.required(formData.value.discountValue);
  const valuePositive = rules.positive(formData.value.discountValue);
  if (valueRequired !== true) {
    formErrors.value.discountValue = valueRequired as string;
  } else if (valuePositive !== true) {
    formErrors.value.discountValue = valuePositive as string;
  }

  const expiryCheck = rules.required(formData.value.expiryDate);
  if (expiryCheck !== true) formErrors.value.expiryDate = expiryCheck as string;

  return Object.keys(formErrors.value).length === 0;
}

async function saveVoucher() {
  if (!validateForm()) return;

  saving.value = true;
  try {
    if (editMode.value) {
      await updateVoucherApi(
        formData.value._id as string,
        formData.value as Partial<Voucher>
      );
      showSnackbar("Voucher updated successfully", "success");
    } else {
      await createVoucherApi(formData.value as Partial<Voucher>);
      showSnackbar("Voucher created successfully", "success");
    }

    closeDialog();
    fetchVouchers();
  } catch (error: any) {
    showSnackbar(error.message || "Failed to save voucher", "error");
    console.error("Error saving voucher:", error);
  } finally {
    saving.value = false;
  }
}

function confirmDelete(item: Voucher) {
  deleteItem.value = item;
  deleteDialog.value = true;
}

async function deleteVoucher() {
  try {
    await deleteVoucherApi(deleteItem.value?._id as string);
    showSnackbar("Voucher deleted successfully", "success");
    deleteDialog.value = false;
    fetchVouchers();
  } catch (error) {
    showSnackbar("Failed to delete voucher", "error");
    console.error("Error deleting voucher:", error);
  }
}

async function toggleVoucherStatus(item: Voucher) {
  try {
    await updateVoucherApi(item._id, { isActive: item.isActive });
    showSnackbar(
      `Voucher ${item.isActive ? "activated" : "deactivated"}`,
      "success"
    );
  } catch (error) {
    item.isActive = !item.isActive;
    showSnackbar("Failed to update status", "error");
    console.error("Error updating status:", error);
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateForInput(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

function isExpired(date: string) {
  return new Date(date) < new Date();
}

function isExpiringSoon(date: string) {
  const expiryDate = new Date(date);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

function usageColorClass(item: Voucher) {
  const colorClasses: Record<string, string> = {
    info: "bg-info/15 text-info",
    warning: "bg-warning/15 text-warning",
    error: "bg-destructive/15 text-destructive",
    success: "bg-success/15 text-success",
  };

  if (!item.usageLimit) return colorClasses.info;
  const percentage = ((item.usedCount ?? 0) / item.usageLimit) * 100;
  if (percentage >= 90) return colorClasses.error;
  if (percentage >= 70) return colorClasses.warning;
  return colorClasses.success;
}

function showSnackbar(message: string, color = "success") {
  snackbar.show = true;
  snackbar.message = message;
  snackbar.color = color;
}

// Keep pagination consistent with the (re-implemented) filtering
watch([search, filterStatus, filterType], () => {
  page.value = 1;
});

watch(pageCount, (val) => {
  if (page.value > val) page.value = Math.max(1, val);
});

onMounted(() => {
  fetchVouchers();
});
</script>
