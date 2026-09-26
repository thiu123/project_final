<template>
  <UiDialog v-model:open="open">
    <UiDialogContent hide-close class="gap-0 overflow-hidden p-0 sm:max-w-2xl">
      <template v-if="book">
        <div class="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div class="min-w-0">
            <UiDialogTitle class="text-lg font-semibold text-foreground">
              {{ book.title }}
            </UiDialogTitle>
            <UiDialogDescription class="mt-0.5 text-sm text-muted-foreground">
              by {{ book.authors?.join(", ") || "Unknown author" }}
            </UiDialogDescription>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="max-h-[65vh] overflow-y-auto p-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-[160px_1fr]">
            <div
              class="mx-auto flex aspect-[2/3] w-40 items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-border sm:mx-0"
            >
              <img
                v-if="book.cover_url"
                :src="book.cover_url"
                :alt="book.title"
                class="h-full w-full object-cover"
              />
              <BookOpen v-else class="h-8 w-8 text-muted-foreground" />
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-2xl font-semibold tracking-tight text-foreground">
                  {{ formatUsd(book.price ?? 0) }}
                </span>
                <AdminPill :tone="(book.stock ?? 0) > 0 ? 'success' : 'destructive'">
                  {{ (book.stock ?? 0) > 0 ? `${book.stock} in stock` : "Out of stock" }}
                </AdminPill>
              </div>

              <dl class="mt-4 divide-y divide-border rounded-lg border border-border text-sm">
                <div class="flex justify-between gap-4 px-4 py-2.5">
                  <dt class="text-muted-foreground">Published</dt>
                  <dd class="text-foreground">{{ book.first_publish_year || "Unknown" }}</dd>
                </div>
                <div class="flex justify-between gap-4 px-4 py-2.5">
                  <dt class="text-muted-foreground">Copies sold</dt>
                  <dd class="tabular-nums text-foreground">{{ book.sold ?? 0 }}</dd>
                </div>
                <div class="flex justify-between gap-4 px-4 py-2.5">
                  <dt class="text-muted-foreground">Ebook file</dt>
                  <dd class="text-foreground">{{ book.pdf_url ? "Uploaded" : "None" }}</dd>
                </div>
                <div class="flex justify-between gap-4 px-4 py-2.5">
                  <dt class="shrink-0 text-muted-foreground">Book ID</dt>
                  <dd class="truncate font-mono text-xs text-foreground">{{ book._id }}</dd>
                </div>
              </dl>

              <div v-if="book.subjects?.length" class="mt-4 flex flex-wrap gap-1.5">
                <span
                  v-for="subject in book.subjects"
                  :key="subject"
                  class="rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground"
                >
                  {{ subject }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="book.description" class="mt-6">
            <h4 class="text-sm font-semibold text-foreground">Description</h4>
            <p class="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
              {{ book.description }}
            </p>
          </div>
        </div>

        <div class="flex justify-end border-t border-border bg-muted/30 px-6 py-3">
          <UiButton variant="outline" @click="open = false">Close</UiButton>
        </div>
      </template>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { BookOpen, X } from "lucide-vue-next";
import { formatUsd } from "@/utils/pricing";
import type { Book } from "@/types";

defineProps<{ book: Book | null }>();

const open = defineModel<boolean>("open", { default: false });
</script>
