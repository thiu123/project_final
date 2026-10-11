<template>
  <dl class="border-t border-border">
    <div
      v-for="fact in facts"
      :key="fact.label"
      class="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-border py-3.5"
    >
      <dt class="eyebrow self-center leading-normal">{{ fact.label }}</dt>
      <dd class="min-w-0 truncate text-right text-sm" :title="fact.value">{{ fact.value }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { Book } from "@/types";

const props = defineProps<{
  book: Partial<Book>;
}>();

const facts = computed(() => {
  const rows = [
    { label: "Author", value: props.book.authors?.join(", ") || "Unknown" },
    {
      label: "First published",
      value: props.book.first_publish_year ? String(props.book.first_publish_year) : "—",
    },
    { label: "Formats", value: "Hardback, Ebook" },
  ];

  if (props.book.pdf_pages) {
    rows.push({ label: "Ebook pages", value: String(props.book.pdf_pages) });
  }

  if (props.book.subjects?.length) {
    rows.push({
      label: "Subjects",
      value: props.book.subjects
        .map((subject) => subject.replace(/\b\w/g, (char) => char.toUpperCase()))
        .join(", "),
    });
  }

  rows.push({
    label: "Book ID",
    value: props.book.key?.split("/").pop() || props.book._id || "—",
  });

  return rows;
});
</script>
