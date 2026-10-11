<template>
  <div class="relative rounded-3xl border border-border bg-card p-6 md:p-8">
    <span
      class="absolute -top-3 left-6 -rotate-2 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-background"
    >
      Fact sheet
    </span>

    <dl class="mt-2">
      <div
        v-for="fact in facts"
        :key="fact.label"
        class="flex items-center justify-between gap-4 border-b border-dashed border-border py-3.5 last:border-0"
      >
        <dt class="flex items-center gap-3 text-sm text-muted-foreground">
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg"
            :class="fact.tone"
          >
            <component :is="fact.icon" class="size-4" />
          </span>
          {{ fact.label }}
        </dt>
        <dd class="min-w-0 truncate text-right text-sm font-semibold" :title="fact.value">
          {{ fact.value }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { Calendar, FileText, Hash, Layers, UserPen } from "lucide-vue-next";
import type { Book } from "@/types";

const props = defineProps<{
  book: Partial<Book>;
}>();

const facts = computed(() => {
  const rows = [
    {
      label: "Author",
      value: props.book.authors?.join(", ") || "Unknown",
      icon: UserPen,
      tone: "bg-primary/15 text-primary",
    },
    {
      label: "First published",
      value: props.book.first_publish_year ? String(props.book.first_publish_year) : "—",
      icon: Calendar,
      tone: "bg-accent/60 text-accent-foreground",
    },
    {
      label: "Formats",
      value: "Hardback, Ebook",
      icon: Layers,
      tone: "bg-success/15 text-success",
    },
  ];

  if (props.book.pdf_pages) {
    rows.push({
      label: "Ebook pages",
      value: String(props.book.pdf_pages),
      icon: FileText,
      tone: "bg-muted text-foreground",
    });
  }

  rows.push({
    label: "Book ID",
    value: props.book.key?.split("/").pop() || props.book._id || "—",
    icon: Hash,
    tone: "bg-muted text-foreground",
  });

  return rows;
});
</script>
