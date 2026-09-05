<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="visible"
        class="fixed bottom-6 left-1/2 z-[100] flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg"
        :class="colorClass"
        role="status"
      >
        <CheckCircle2 v-if="color === 'success'" class="h-5 w-5 shrink-0" />
        <AlertCircle v-else class="h-5 w-5 shrink-0" />
        <span>{{ text }}</span>
        <button
          type="button"
          class="ml-2 shrink-0 rounded-full p-0.5 opacity-80 transition-opacity hover:opacity-100"
          aria-label="Close"
          @click="close"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { AlertCircle, CheckCircle2, X } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    text?: string;
    color?: string;
    timeout?: number;
  }>(),
  {
    text: "",
    color: "success",
    timeout: 2000,
  }
);

const visible = defineModel<boolean>({ default: false });

const colorClass = computed(
  () =>
    ({
      success: "bg-success",
      error: "bg-destructive",
      warning: "bg-warning",
      info: "bg-info",
    })[props.color] ?? "bg-success"
);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(visible, (isVisible) => {
  if (timer) clearTimeout(timer);
  if (isVisible && props.timeout > 0) {
    timer = setTimeout(() => {
      visible.value = false;
    }, props.timeout);
  }
});

function close() {
  visible.value = false;
}
</script>
