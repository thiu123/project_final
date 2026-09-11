<template>
  <UiCard class="mb-4 overflow-hidden rounded-xl shadow md:mb-6">
    <div class="flex items-center bg-primary px-4 py-4 text-primary-foreground">
      <Truck class="mr-3 h-6 w-6" />
      <span class="text-lg font-semibold">Delivery Details</span>
    </div>
    <div class="grid gap-4 p-4 md:p-6">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="ship-name" class="mb-1 block text-sm font-medium">
            Recipient name <span class="text-destructive">*</span>
          </label>
          <UiInput
            id="ship-name"
            v-model="shipping.fullName"
            placeholder="Nguyễn Văn A"
            maxlength="100"
          />
        </div>
        <div>
          <label for="ship-phone" class="mb-1 block text-sm font-medium">
            Phone <span class="text-destructive">*</span>
          </label>
          <UiInput
            id="ship-phone"
            v-model="shipping.phone"
            placeholder="0912345678"
            inputmode="tel"
          />
        </div>
      </div>

      <div>
        <label for="ship-address" class="mb-1 block text-sm font-medium">
          Delivery address <span class="text-destructive">*</span>
        </label>
        <UiTextarea
          id="ship-address"
          v-model="shipping.address"
          :rows="2"
          class="resize-none"
          placeholder="House number, street, ward, district, city"
          maxlength="255"
        />
      </div>

      <div>
        <label for="ship-note" class="mb-1 block text-sm font-medium">
          Note for the courier
          <span class="text-muted-foreground">(optional)</span>
        </label>
        <UiInput
          id="ship-note"
          v-model="shipping.note"
          placeholder="e.g. call before arriving, leave at reception"
          maxlength="255"
        />
      </div>

      <p class="text-xs text-muted-foreground">
        The courier calls this number before delivering, and you pay them in
        cash on arrival.
      </p>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { Truck } from "lucide-vue-next";
import type { ShippingAddress } from "@/types";

/**
 * The parent owns the address object (it persists and submits it) and this form
 * edits it in place — hence a plain prop rather than `v-model`, which would add
 * an emit round-trip per keystroke for no gain.
 */
defineProps<{ shipping: ShippingAddress }>();
</script>
