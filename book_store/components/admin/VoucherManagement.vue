<template>
  <div>
    <AdminPageHeader
      title="Vouchers"
      description="Discount codes customers can apply at checkout."
    >
      <template #actions>
        <UiButton variant="outline" :loading="loading" @click="fetchVouchers">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
        <UiButton variant="ink" @click="openForm(null)">
          <Plus class="h-4 w-4" />
          Create voucher
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminPanel :loading="loading && vouchers.length > 0">
      <template #toolbar>
        <AdminSearchInput v-model="search" placeholder="Search code or description" />
        <div class="flex items-center gap-2 md:ml-auto">
          <div class="w-full md:w-44">
            <AdminVouchersFilterSelect
              v-model="filterStatus"
              placeholder="All statuses"
              clear-label="Clear status filter"
              :options="STATUS_OPTIONS"
            />
          </div>
          <div class="w-full md:w-44">
            <AdminVouchersFilterSelect
              v-model="filterType"
              placeholder="All types"
              clear-label="Clear type filter"
              :options="TYPE_OPTIONS"
            />
          </div>
        </div>
      </template>

      <AdminVouchersVoucherTable
        :vouchers="paginatedVouchers"
        :loading="loading && !vouchers.length"
        @edit="openForm"
        @delete="askToDelete"
        @toggle-active="toggleActive"
      />

      <template #footer>
        <AdminTablePagination
          v-model:page="page"
          :total="filteredVouchers.length"
          :items-per-page="ITEMS_PER_PAGE"
          noun="vouchers"
        />
      </template>
    </AdminPanel>

    <AdminVouchersVoucherFormDialog
      v-model:open="formDialog"
      :voucher="editedVoucher"
      @saved="fetchVouchers"
      @show-snackbar="notifyFromPayload"
    />

    <AdminConfirmDeleteDialog
      v-model:open="deleteDialog"
      title="Delete voucher?"
      question="Customers will no longer be able to redeem this code."
      :subject="voucherToDelete?.code"
      :loading="deleting"
      @confirm="deleteVoucher"
    />

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw } from "lucide-vue-next";
import {
  getAllVouchers,
  updateVoucher as updateVoucherApi,
  deleteVoucher as deleteVoucherApi,
} from "~/api/voucherApi";
import { useSnackbar } from "@/composables/useSnackbar";
import { isExpired } from "@/utils/vouchers";
import type { Voucher } from "@/types";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Expired", value: "expired" },
];

const TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

const { snackbar, notify, notifyError, notifyFromPayload } = useSnackbar();

const vouchers = ref<Voucher[]>([]);
const loading = ref(false);
const deleting = ref(false);

const search = ref("");
const filterStatus = ref<string | undefined>(undefined);
const filterType = ref<string | undefined>(undefined);
const page = ref(1);

const formDialog = ref(false);
const deleteDialog = ref(false);
const editedVoucher = ref<Voucher | null>(null);
const voucherToDelete = ref<Voucher | null>(null);

const filteredVouchers = computed<Voucher[]>(() => {
  const term = search.value.trim().toLowerCase();

  return vouchers.value.filter((voucher) => {
    if (term) {
      const haystack = `${voucher.code} ${
        (voucher as Voucher & { description?: string }).description ?? ""
      }`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (filterStatus.value && !matchesStatus(voucher, filterStatus.value)) {
      return false;
    }

    if (filterType.value && voucher.discountType !== filterType.value) {
      return false;
    }

    return true;
  });
});

const paginatedVouchers = computed(() => {
  const start = (page.value - 1) * ITEMS_PER_PAGE;
  return filteredVouchers.value.slice(start, start + ITEMS_PER_PAGE);
});

const pageCount = computed(() =>
  Math.ceil(filteredVouchers.value.length / ITEMS_PER_PAGE)
);

watch([search, filterStatus, filterType], () => {
  page.value = 1;
});

// Deleting the last row of the last page would otherwise strand the pager.
watch(pageCount, (count) => {
  if (page.value > count) page.value = Math.max(1, count);
});

onMounted(fetchVouchers);

function matchesStatus(voucher: Voucher, status: string): boolean {
  if (status === "active") return voucher.isActive && !isExpired(voucher.expiryDate);
  if (status === "inactive") return !voucher.isActive;
  if (status === "expired") return isExpired(voucher.expiryDate);
  return true;
}

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
    console.error("Error fetching vouchers:", error);
    notifyError("Failed to fetch vouchers");
  } finally {
    loading.value = false;
  }
}

/** `null` opens the form blank, for creating. */
function openForm(voucher: Voucher | null) {
  editedVoucher.value = voucher;
  formDialog.value = true;
}

function askToDelete(voucher: Voucher) {
  voucherToDelete.value = voucher;
  deleteDialog.value = true;
}

async function deleteVoucher() {
  if (!voucherToDelete.value) return;

  deleting.value = true;
  try {
    await deleteVoucherApi(voucherToDelete.value._id);
    notify("Voucher deleted successfully");
    deleteDialog.value = false;
    voucherToDelete.value = null;
    await fetchVouchers();
  } catch (error) {
    console.error("Error deleting voucher:", error);
    notifyError("Failed to delete voucher");
  } finally {
    deleting.value = false;
  }
}

async function toggleActive(voucher: Voucher, active: boolean) {
  // Flip locally first so the switch responds immediately, and put it back if
  // the server refuses.
  voucher.isActive = active;
  try {
    await updateVoucherApi(voucher._id, { isActive: active });
    notify(`Voucher ${active ? "activated" : "deactivated"}`);
  } catch (error) {
    console.error("Error updating status:", error);
    voucher.isActive = !active;
    notifyError("Failed to update status");
  }
}
</script>
