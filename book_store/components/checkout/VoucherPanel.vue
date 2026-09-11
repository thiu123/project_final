<template>
  <UiCard class="mb-4 overflow-hidden rounded-xl shadow md:mb-6">
    <div class="flex items-center bg-primary px-4 py-4 text-primary-foreground">
      <TicketPercent class="mr-3 h-6 w-6" />
      <span class="text-lg font-semibold">Promotion Code</span>
    </div>
    <div class="p-4 md:p-6">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row">
        <UiInput
          v-model="code"
          placeholder="Enter promotion or gift code"
          :disabled="applied !== null"
          wrapper-class="grow"
          @focus="showList = true"
          @keyup.enter="apply()"
        >
          <template #prepend>
            <Tag class="h-4 w-4" />
          </template>
        </UiInput>
        <div class="flex gap-2">
          <UiButton
            v-if="!applied"
            size="lg"
            class="shrink-0 px-6"
            :loading="applying"
            :disabled="!code.trim() || applying"
            @click="apply()"
          >
            Apply
          </UiButton>
          <UiButton
            v-else
            variant="destructive"
            size="lg"
            class="shrink-0 px-6"
            @click="clear"
          >
            Remove
          </UiButton>
          <UiButton
            variant="outline"
            size="lg"
            class="shrink-0 border-primary/50 text-primary hover:text-primary"
            @click="showList = !showList"
          >
            <Percent class="mr-2 h-4 w-4" />
            <span class="hidden sm:inline">Browse Codes</span>
            <span class="sm:hidden">Browse</span>
          </UiButton>
        </div>
      </div>

      <UiAlert v-if="applied" variant="success" class="mb-3">
        <div class="text-sm">
          <strong>{{ applied.code }}</strong> applied!
          <div v-if="applied.description" class="mt-1 text-xs">
            {{ applied.description }}
          </div>
          <div class="mt-1 text-xs font-bold">
            You saved {{ formatUsd(discount) }}!
          </div>
        </div>
      </UiAlert>

      <UiAlert
        v-if="errorMessage"
        variant="error"
        class="mb-3"
        closable
        @close="errorMessage = ''"
      >
        {{ errorMessage }}
      </UiAlert>

      <!-- Available vouchers -->
      <div v-if="showList" class="mt-4">
        <div class="mb-3 flex items-center text-sm font-bold">
          <TicketPercent class="mr-2 h-4 w-4" />
          Available Vouchers
        </div>

        <UiProgress v-if="loadingList" indeterminate class="mb-3" />

        <div
          v-else-if="available.length === 0"
          class="py-4 text-center text-muted-foreground"
        >
          <Ticket class="mx-auto h-12 w-12 text-muted-foreground/50" />
          <div class="mt-2">No vouchers available</div>
        </div>

        <div v-else class="voucher-list max-h-[400px] overflow-y-auto pr-1">
          <button
            v-for="voucher in available"
            :key="voucher._id"
            type="button"
            class="mb-3 block w-full rounded-lg border-2 bg-card p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            :class="
              applied?.code === voucher.code
                ? 'border-success bg-success/5'
                : 'border-border'
            "
            @click="apply(voucher.code)"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0 grow">
                <div class="mb-2 flex items-center">
                  <UiBadge class="mr-2 font-bold">{{ voucher.code }}</UiBadge>
                  <UiBadge
                    :variant="
                      voucher.discountType === 'percentage' ? 'success' : 'info'
                    "
                    class="text-[10px]"
                  >
                    {{
                      voucher.discountType === "percentage"
                        ? `${voucher.discountValue}% OFF`
                        : `$${voucher.discountValue} OFF`
                    }}
                  </UiBadge>
                </div>
                <div v-if="voucher.description" class="mb-1 text-sm text-muted-foreground">
                  {{ voucher.description }}
                </div>
                <div
                  class="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"
                >
                  <span class="inline-flex items-center">
                    <ShoppingCart class="mr-1 h-3 w-3" />
                    Min order: ${{ voucher.minOrderAmount }}
                  </span>
                  <span
                    v-if="voucher.maxDiscount"
                    class="ml-2 inline-flex items-center"
                  >
                    <ShieldCheck class="mr-1 h-3 w-3" />
                    Max discount: ${{ voucher.maxDiscount }}
                  </span>
                </div>
              </div>
              <span class="ml-2 shrink-0 text-primary">
                <CircleArrowRight class="h-6 w-6" />
              </span>
            </div>
          </button>
        </div>
      </div>

      <UiAlert v-else variant="info">
        Click "Browse Codes" to see available vouchers
      </UiAlert>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import {
  CircleArrowRight,
  Percent,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Ticket,
  TicketPercent,
} from "lucide-vue-next";
import { getAllVouchers, validateVoucher } from "@/api/voucherApi";
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

async function loadAvailable() {
  loadingList.value = true;
  try {
    const response = await getAllVouchers(true);
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

<style scoped>
/* Custom scrollbar for the voucher list (not expressible with Tailwind) */
.voucher-list::-webkit-scrollbar {
  width: 6px;
}

.voucher-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.voucher-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.voucher-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
