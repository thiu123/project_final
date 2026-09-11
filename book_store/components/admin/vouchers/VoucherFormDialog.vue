<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="gap-0 overflow-hidden p-0 sm:max-w-2xl"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <div class="bg-customblack p-6">
        <UiDialogTitle class="text-2xl font-bold text-white">
          {{ isEditing ? "Edit Voucher" : "Create New Voucher" }}
        </UiDialogTitle>
        <UiDialogDescription class="sr-only">
          {{
            isEditing
              ? "Update the details of this discount voucher."
              : "Fill in the details to create a new discount voucher."
          }}
        </UiDialogDescription>
      </div>

      <div class="max-h-[70vh] overflow-y-auto p-6">
        <form @submit.prevent="save">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.code"
                label="Voucher Code *"
                :disabled="isEditing"
                hint="e.g., SUMMER2024"
                :error-message="errors.code"
              />
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiLabel class="mb-1.5 block">Discount Type *</UiLabel>
              <UiSelect
                :model-value="form.discountType"
                @update:model-value="form.discountType = $event as DiscountType"
              >
                <UiSelectTrigger class="w-full">
                  <UiSelectValue placeholder="Discount Type *" />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem
                    v-for="option in DISCOUNT_TYPES"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.discountValue"
                :label="
                  isPercentage ? 'Discount (%) *' : 'Discount Amount ($) *'
                "
                type="number"
                :error-message="errors.discountValue"
              >
                <template v-if="!isPercentage" #prepend>
                  <span class="text-sm">$</span>
                </template>
                <template v-if="isPercentage" #append>
                  <span class="text-sm">%</span>
                </template>
              </UiInput>
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.minOrderAmount"
                label="Minimum Order Amount ($)"
                type="number"
                hint="0 = no minimum"
              >
                <template #prepend>
                  <span class="text-sm">$</span>
                </template>
              </UiInput>
            </div>

            <!-- A cap only makes sense on a percentage discount. -->
            <div v-if="isPercentage" class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.maxDiscount"
                label="Max Discount Amount ($)"
                type="number"
                hint="Leave empty for no limit"
              >
                <template #prepend>
                  <span class="text-sm">$</span>
                </template>
                <template #append>
                  <button
                    v-if="hasValue(form.maxDiscount)"
                    type="button"
                    class="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear max discount"
                    @click="form.maxDiscount = null"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </template>
              </UiInput>
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.usageLimit"
                label="Usage Limit"
                type="number"
                hint="Leave empty for unlimited"
              >
                <template #append>
                  <button
                    v-if="hasValue(form.usageLimit)"
                    type="button"
                    class="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear usage limit"
                    @click="form.usageLimit = null"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </template>
              </UiInput>
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.expiryDate"
                label="Expiry Date *"
                type="date"
                :error-message="errors.expiryDate"
              />
            </div>

            <div class="col-span-12 flex items-end pb-1 md:col-span-6">
              <UiSwitch v-model="form.isActive" label="Active" />
            </div>

            <div class="col-span-12">
              <UiTextarea
                v-model="form.description"
                label="Description"
                :rows="3"
                hint="Optional description for this voucher"
              />
            </div>
          </div>
        </form>
      </div>

      <div class="flex items-center justify-end gap-2 p-6 pt-0">
        <UiButton variant="ghost" @click="open = false">Cancel</UiButton>
        <UiButton
          class="bg-customyellow text-customblack transition-transform hover:-translate-y-px hover:bg-customyellow/90"
          :loading="saving"
          :disabled="!isValid"
          @click="save"
        >
          {{ isEditing ? "Update" : "Create" }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import {
  createVoucher as createVoucherApi,
  updateVoucher as updateVoucherApi,
} from "~/api/voucherApi";
import { toDateInputValue } from "@/utils/vouchers";
import type { DiscountType, SnackbarPayload, Voucher } from "@/types";

const DISCOUNT_TYPES: { label: string; value: DiscountType }[] = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed Amount ($)", value: "fixed" },
];

interface VoucherForm {
  _id?: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  description?: string;
}

const props = defineProps<{
  /** The voucher being edited, or `null` to create a new one. */
  voucher: Voucher | null;
}>();

const emit = defineEmits<{
  saved: [];
  "show-snackbar": [payload: SnackbarPayload];
}>();

const open = defineModel<boolean>("open", { default: false });

const form = ref<VoucherForm>(emptyForm());
const errors = ref<Partial<Record<keyof VoucherForm, string>>>({});
const saving = ref(false);

const isEditing = computed(() => !!props.voucher);

const isPercentage = computed(() => form.value.discountType === "percentage");

/** Mirrors `validate()` so the submit button reflects the form's state live. */
const isValid = computed(
  () =>
    !!form.value.code &&
    !!form.value.discountType &&
    Number(form.value.discountValue) > 0 &&
    !!form.value.expiryDate
);

// Re-seed each time the dialog opens, so a cancelled edit leaves nothing behind.
watch(open, (isOpen) => {
  if (!isOpen) return;
  form.value = props.voucher
    ? {
        ...(props.voucher as VoucherForm),
        expiryDate: toDateInputValue(props.voucher.expiryDate),
      }
    : emptyForm();
  errors.value = {};
});

function emptyForm(): VoucherForm {
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

/** `0` is a real value here, so a plain truthiness check would be wrong. */
function hasValue(value: number | null | undefined) {
  return value !== null && value !== undefined && String(value) !== "";
}

function validate(): boolean {
  const next: Partial<Record<keyof VoucherForm, string>> = {};

  if (!form.value.code) next.code = "This field is required";
  if (!form.value.expiryDate) next.expiryDate = "This field is required";

  if (!form.value.discountValue) {
    next.discountValue = "This field is required";
  } else if (Number(form.value.discountValue) <= 0) {
    next.discountValue = "Value must be greater than 0";
  }

  errors.value = next;
  return Object.keys(next).length === 0;
}

async function save() {
  if (!validate()) return;

  saving.value = true;
  try {
    if (isEditing.value) {
      await updateVoucherApi(
        form.value._id as string,
        form.value as Partial<Voucher>
      );
      emit("show-snackbar", {
        message: "Voucher updated successfully",
        color: "success",
      });
    } else {
      await createVoucherApi(form.value as Partial<Voucher>);
      emit("show-snackbar", {
        message: "Voucher created successfully",
        color: "success",
      });
    }

    open.value = false;
    emit("saved");
  } catch (error: any) {
    console.error("Error saving voucher:", error);
    emit("show-snackbar", {
      message: error.message || "Failed to save voucher",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}
</script>
