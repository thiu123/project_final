<template>
  <div class="grid gap-x-8 gap-y-8 sm:grid-cols-2">
    <div>
      <label for="ship-name" :class="LABEL_CLASS">
        Recipient name <span class="text-foreground" aria-hidden="true">*</span>
      </label>
      <input
        id="ship-name"
        v-model="shipping.fullName"
        type="text"
        class="ed-input"
        placeholder="Nguyễn Văn A"
        maxlength="100"
        autocomplete="name"
        required
      />
    </div>

    <div>
      <label for="ship-phone" :class="LABEL_CLASS">
        Phone <span class="text-foreground" aria-hidden="true">*</span>
      </label>
      <input
        id="ship-phone"
        v-model="shipping.phone"
        type="tel"
        class="ed-input tabular-nums"
        placeholder="0912345678"
        inputmode="tel"
        autocomplete="tel"
        required
      />
    </div>

    <div class="sm:col-span-2">
      <label for="ship-address" :class="LABEL_CLASS">
        Delivery address <span class="text-foreground" aria-hidden="true">*</span>
      </label>
      <textarea
        id="ship-address"
        v-model="shipping.address"
        rows="2"
        class="ed-input h-auto min-h-[3rem] resize-none py-3 leading-relaxed"
        placeholder="House number, street, ward, district, city"
        maxlength="255"
        autocomplete="street-address"
        required
      />
    </div>

    <div class="sm:col-span-2">
      <label for="ship-note" :class="LABEL_CLASS">
        Note for the courier
        <span class="normal-case tracking-normal">(optional)</span>
      </label>
      <input
        id="ship-note"
        v-model="shipping.note"
        type="text"
        class="ed-input"
        placeholder="e.g. call before arriving, leave at reception"
        maxlength="255"
      />
    </div>

    <p class="text-[13px] leading-relaxed text-muted-foreground sm:col-span-2">
      The courier calls this number before delivering, and you pay them in cash
      on arrival.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ShippingAddress } from "@/types";

const LABEL_CLASS = "eyebrow mb-1 block";

/**
 * The parent owns the address object (it persists and submits it) and this form
 * edits it in place — hence a plain prop rather than `v-model`, which would add
 * an emit round-trip per keystroke for no gain.
 */
defineProps<{ shipping: ShippingAddress }>();
</script>
