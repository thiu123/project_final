<template>
  <div role="radiogroup" aria-label="Payment method" class="grid gap-3">
    <button
      v-for="method in PAYMENT_METHODS"
      :key="method.id"
      type="button"
      role="radio"
      :aria-checked="modelValue === method.id"
      :disabled="isDisabled(method.id)"
      class="flex w-full items-center gap-4 border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:gap-5 md:px-5"
      :class="
        modelValue === method.id
          ? 'border-foreground'
          : 'border-border hover:border-foreground/40'
      "
      @click="emit('update:modelValue', method.id)"
    >
      <span
        class="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-background dark:bg-foreground"
      >
        <img
          v-if="method.logo"
          :src="method.logo"
          :alt="method.label"
          :class="method.logoClass"
        />
        <Banknote
          v-else
          class="size-5 text-foreground dark:text-background"
          :stroke-width="1.5"
        />
      </span>

      <span class="min-w-0 flex-1">
        <span class="block text-[15px] font-medium text-foreground">{{ method.label }}</span>
        <span class="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
          {{ descriptionFor(method.id) }}
        </span>
      </span>

      <span
        class="flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors"
        :class="
          modelValue === method.id
            ? 'border-foreground bg-foreground text-background'
            : 'border-input'
        "
        aria-hidden="true"
      >
        <Check v-if="modelValue === method.id" class="size-3" :stroke-width="2.5" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Banknote, Check } from "lucide-vue-next";
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
  description: string;
}[] = [
  {
    id: "vnpay",
    label: "VNPay",
    logo: vnpayLogo,
    logoClass: "h-full w-full object-cover",
    description: "Bank card, banking app or QR code",
  },
  {
    id: "momo",
    label: "MoMo",
    logo: momoLogo,
    logoClass: "size-9 object-contain",
    description: "Pay in the MoMo app",
  },
  {
    id: "cod",
    label: "Cash on delivery",
    logoClass: "",
    description: "Pay the courier when your books arrive",
  },
];

function isDisabled(id: PaymentChoice) {
  return id === "cod" && props.hasEbook;
}

function descriptionFor(id: PaymentChoice) {
  if (id === "cod" && props.hasEbook) {
    return "Not available for ebooks — remove them or pay online";
  }
  return PAYMENT_METHODS.find((method) => method.id === id)?.description ?? "";
}
</script>
