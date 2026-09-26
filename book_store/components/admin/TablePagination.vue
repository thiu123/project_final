<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <p class="text-sm tabular-nums text-muted-foreground">
      <template v-if="total">
        Showing
        <span class="font-medium text-foreground">{{ from }}-{{ to }}</span>
        of
        <span class="font-medium text-foreground">{{ total }}</span>
        {{ noun }}
      </template>
      <template v-else>No {{ noun }}</template>
    </p>

    <UiPagination
      v-if="total > itemsPerPage"
      v-slot="{ page: currentPage }"
      v-model:page="page"
      :total="total"
      :items-per-page="itemsPerPage"
      :sibling-count="1"
      show-edges
      class="mx-0 w-auto justify-end"
    >
      <UiPaginationContent v-slot="{ items }" class="gap-1">
        <UiPaginationPrevious />
        <template v-for="(item, index) in items">
          <UiPaginationItem
            v-if="item.type === 'page'"
            :key="index"
            :value="item.value"
            :is-active="item.value === currentPage"
            size="icon-sm"
            class="tabular-nums"
          >
            {{ item.value }}
          </UiPaginationItem>
          <UiPaginationEllipsis v-else :key="item.type" :index="index" />
        </template>
        <UiPaginationNext />
      </UiPaginationContent>
    </UiPagination>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number;
  itemsPerPage: number;
  noun: string;
}>();

const page = defineModel<number>("page", { required: true });

const from = computed(() =>
  props.total ? (page.value - 1) * props.itemsPerPage + 1 : 0
);
const to = computed(() =>
  Math.min(page.value * props.itemsPerPage, props.total)
);
</script>
