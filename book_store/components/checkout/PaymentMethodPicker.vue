<template>
  <UiCard class="mb-4 overflow-hidden rounded-xl shadow md:mb-6">
    <div class="flex items-center bg-primary px-4 py-4 text-primary-foreground">
      <CreditCard class="mr-3 h-6 w-6" />
      <span class="text-lg font-semibold">Payment Method</span>
    </div>
    <div class="p-4 md:p-6">
      <div role="radiogroup" class="flex flex-col gap-3">
        <button
          v-for="method in PAYMENT_METHODS"
          :key="method.id"
          type="button"
          role="radio"
          :aria-checked="modelValue === method.id"
          :disabled="isDisabled(method.id)"
          class="rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :class="
            modelValue === method.id
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-border bg-card'
          "
          @click="emit('update:modelValue', method.id)"
        >
          <div class="flex items-center">
            <!-- Radio dot -->
            <span
              class="mr-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
              :class="modelValue === method.id ? 'border-primary' : 'border-input'"
            >
              <span
                v-if="modelValue === method.id"
                class="h-2 w-2 rounded-full bg-primary"
              />
            </span>

            <!-- Logo -->
            <span
              class="mr-3 flex shrink-0 items-center justify-center overflow-hidden rounded"
              :class="method.logoClass"
            >
              <img
                v-if="method.logo"
                :src="method.logo"
                :alt="method.label"
                class="h-full w-full object-contain"
              />
              <Banknote v-else class="h-6 w-6 text-success" />
            </span>

            <span>
              <span class="block text-base font-medium">{{ method.label }}</span>
              <span
                v-if="descriptionFor(method.id)"
                class="block text-xs text-muted-foreground"
              >
                {{ descriptionFor(method.id) }}
              </span>
            </span>
          </div>
        </button>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { Banknote, CreditCard } from "lucide-vue-next";
import vnpayLogo from "~/assets/vnpay-logo-inkythuatso.svg";
import momoLogo from "~/assets/Logo-MoMo-Square-300x300.png";

export type PaymentChoice = "vnpay" | "momo" | "cod";

const props = defineProps<{
  modelValue: PaymentChoice;
  /**
   * Ebooks have nothing to hand over on the doorstep and the backend rejects
   * them for COD, so the option is disabled rather than failing after a click.
   */
  hasEbook: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: PaymentChoice];
}>();

const PAYMENT_METHODS: {
  id: PaymentChoice;
  label: string;
  logo?: string;
  logoClass: string;
}[] = [
  {
    id: "vnpay",
    label: "VNPay Wallet",
    logo: vnpayLogo,
    logoClass: "h-[60px] w-[60px] bg-white",
  },
  {
    id: "momo",
    label: "Momo Wallet",
    logo: momoLogo,
    logoClass: "h-10 w-10",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    logoClass: "h-10 w-10 bg-success/10",
  },
];

function isDisabled(id: PaymentChoice) {
  return id === "cod" && props.hasEbook;
}

function descriptionFor(id: PaymentChoice) {
  if (id !== "cod") return "";
  return props.hasEbook
    ? "Not available for ebooks — remove them or pay online"
    : "Pay the courier when your books arrive";
}
</script>
