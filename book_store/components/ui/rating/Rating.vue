<template>
  <div
    :class="cn('inline-flex items-center gap-0.5', $attrs.class as string)"
    role="img"
    :aria-label="`Rating: ${model} of ${length}`"
  >
    <button
      v-for="star in length"
      :key="star"
      type="button"
      :disabled="props.readonly"
      :class="cn('transition-transform', !props.readonly && 'cursor-pointer hover:scale-110')"
      :tabindex="props.readonly ? -1 : 0"
      @click="!props.readonly && (model = star)"
    >
      <Star
        :style="{ width: `${size}px`, height: `${size}px` }"
        :class="
          star <= Math.round(model)
            ? 'fill-amber-400 text-amber-400'
            : 'fill-transparent text-muted-foreground/40'
        "
      />
    </button>
    <span v-if="showValue" class="ml-1 text-sm text-muted-foreground">
      {{ Number(model).toFixed(1) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Star } from "lucide-vue-next";
import { cn } from "@/lib/utils";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    length?: number;
    size?: number;
    readonly?: boolean;
    showValue?: boolean;
  }>(),
  { length: 5, size: 20, readonly: false, showValue: false }
);
const model = defineModel<number>({ default: 0 });
</script>
