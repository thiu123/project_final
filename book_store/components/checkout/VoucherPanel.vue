<template>
  <div>
    <div
      v-if="applied"
      class="flex items-start justify-between gap-6 border-b border-foreground pb-4"
    >
      <div class="min-w-0">
        <p class="eyebrow">Applied</p>
        <p class="mt-3 text-[15px]">
          <span class="font-medium uppercase tracking-[0.08em]">{{ applied.code }}</span>
          <span class="mx-2 text-border">/</span>
          <span class="tabular-nums">You save {{ formatUsd(discount) }}</span>
        </p>
        <p v-if="applied.description" class="mt-1 text-[13px] text-muted-foreground">
          {{ applied.description }}
        </p>
      </div>
      <button
        type="button"
        class="ed-link mt-0.5 shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        @click="clear()"
      >
        Remove
      </button>
    </div>

    <div v-else class="flex items-end gap-4">
      <div class="min-w-0 flex-1">
        <label for="voucher-code" class="eyebrow mb-1 block">Promotion or gift code</label>
        <input
          id="voucher-code"
          v-model="code"
          type="text"
          class="ed-input tracking-[0.04em]"
          placeholder="Enter a code"
          autocomplete="off"
          :disabled="applied !== null"
          @focus="showList = true"
          @keyup.enter="apply()"
        />
      </div>
      <UiButton
        variant="outline"
        size="cta"
        class="shrink-0 bg-transparent px-6 shadow-none"
        :loading="applying"
        :disabled="!code.trim() || applying"
        @click="apply()"
      >
        Apply
      </UiButton>
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="mt-3 flex items-start justify-between gap-4 text-[13px] text-destructive"
    >
      <span class="inline-flex items-start gap-2">
        <span class="mt-[7px] size-1.5 shrink-0 rounded-full bg-destructive" />
        {{ errorMessage }}
      </span>
      <button
        type="button"
        class="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
        @click="errorMessage = ''"
      >
        <X class="size-4" :stroke-width="1.5" />
      </button>
    </p>

    <button
      type="button"
      class="group mt-6 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
      :aria-expanded="showList"
      @click="showList = !showList"
    >
      <span class="ed-link">{{ showList ? "Hide available codes" : "Browse available codes" }}</span>
      <ChevronDown
        class="size-4 transition-transform duration-300"
        :class="{ 'rotate-180': showList }"
        :stroke-width="1.5"
      />
    </button>

    <div v-if="showList" class="mt-4 border-t border-border">
      <div v-if="loadingList" class="divide-y divide-border">
        <div v-for="i in 2" :key="i" class="space-y-2 py-4">
          <UiSkeleton class="h-4 w-1/3 rounded-none" />
          <UiSkeleton class="h-3 w-2/3 rounded-none" />
        </div>
      </div>

      <p v-else-if="available.length === 0" class="py-5 text-[14px] text-muted-foreground">
        No codes are available right now.
      </p>

      <div v-else class="max-h-[400px] divide-y divide-border overflow-y-auto">
        <button
          v-for="voucher in available"
          :key="voucher._id"
          type="button"
          class="group flex w-full items-start justify-between gap-6 py-4 text-left"
          @click="apply(voucher.code)"
        >
          <span class="min-w-0">
            <span class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span class="text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground">
                {{ voucher.code }}
              </span>
              <span class="text-[13px] text-foreground/80">{{ discountLabel(voucher) }}</span>
            </span>
            <span v-if="voucher.description" class="mt-1 block text-[13px] text-muted-foreground">
              {{ voucher.description }}
            </span>
            <span class="mt-1 block text-[12px] tabular-nums text-muted-foreground">
              Min. order ${{ voucher.minOrderAmount }}
              <template v-if="voucher.maxDiscount">
                <span class="mx-1.5 text-border">/</span>Max. discount ${{ voucher.maxDiscount }}
              </template>
            </span>
          </span>

          <span
            v-if="applied?.code === voucher.code"
            class="inline-flex shrink-0 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em]"
          >
            <span class="size-1.5 rounded-full bg-success" />
            Applied
          </span>
          <span
            v-else
            class="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-foreground"
          >
            <span class="ed-link">Use code</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, X } from "lucide-vue-next";
import { getAvailableVouchers, validateVoucher } from "@/api/voucherApi";
import { formatUsd } from "@/utils/pricing";
import type { Voucher } from "@/types";

/** Backend voucher documents carry a description the shared type omits. */
export type CheckoutVoucher = Voucher & { description?: string };

const props = defineProps<{
  /** Order subtotal in USD, which decides whether a voucher qualifies. */
  subtotal: number;
}>();

const emit = defineEmits<{
  /** Fires with `null` when the voucher is cleared or rejected. */
  applied: [voucher: CheckoutVoucher | null, discount: number];
}>();

const code = ref("");
const applied = ref<CheckoutVoucher | null>(null);
const discount = ref(0);
const applying = ref(false);
const errorMessage = ref("");

const showList = ref(false);
const available = ref<CheckoutVoucher[]>([]);
const loadingList = ref(false);

onMounted(loadAvailable);

function discountLabel(voucher: CheckoutVoucher) {
  return voucher.discountType === "percentage"
    ? `${voucher.discountValue}% off`
    : `$${voucher.discountValue} off`;
}

async function loadAvailable() {
  loadingList.value = true;
  try {
    const response = await getAvailableVouchers();
    available.value = Array.isArray(response) ? response : response.data ?? [];
  } catch (error) {
    console.error("Error loading vouchers:", error);
    available.value = [];
  } finally {
    loadingList.value = false;
  }
}

async function apply(candidate?: string) {
  const value = (candidate ?? code.value).trim();
  if (!value || applying.value) return;
  if (applied.value?.code === value) return;

  code.value = value;
  applying.value = true;
  errorMessage.value = "";

  try {
    const response = await validateVoucher(value, props.subtotal);
    if (response.success) {
      applied.value = response.data.voucher;
      discount.value = response.data.discountAmount;
      showList.value = false;
      emit("applied", applied.value, discount.value);
    }
  } catch (error: any) {
    console.error("Voucher validation error:", error);
    errorMessage.value =
      error?.message || "Invalid voucher code. Please try again.";
    clear({ keepError: true });
  } finally {
    applying.value = false;
  }
}

function clear({ keepError = false } = {}) {
  applied.value = null;
  discount.value = 0;
  if (!keepError) {
    code.value = "";
    errorMessage.value = "";
  }
  emit("applied", null, 0);
}
</script>
