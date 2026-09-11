<template>
  <UiDialog v-model:open="open">
    <UiDialogContent hide-close class="gap-0 overflow-hidden p-0 sm:max-w-2xl">
      <template v-if="book">
        <!-- Header -->
        <div class="relative overflow-hidden bg-customblack">
          <div
            class="absolute inset-0 bg-gradient-to-br from-customyellow/20 to-transparent"
          />
          <div class="relative flex items-center justify-between p-6 text-white">
            <div class="flex items-center">
              <BookOpen class="mr-3 h-8 w-8" />
              <div>
                <UiDialogTitle class="text-2xl font-bold">
                  {{ book.title }}
                </UiDialogTitle>
                <UiDialogDescription class="text-base text-white opacity-90">
                  by {{ book.authors?.join(", ") || "Unknown Author" }}
                </UiDialogDescription>
              </div>
            </div>
            <button
              type="button"
              class="rounded-md p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
              @click="open = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="max-h-[60vh] overflow-y-auto p-6">
          <div class="grid grid-cols-12 gap-4">
            <div v-if="book.cover_url" class="col-span-12 md:col-span-4">
              <img
                :src="book.cover_url"
                :alt="book.title"
                class="mx-auto aspect-[0.7] w-full max-w-[200px] rounded-lg bg-muted object-cover shadow-md"
              />
            </div>

            <div
              :class="book.cover_url ? 'col-span-12 md:col-span-8' : 'col-span-12'"
            >
              <div class="mb-4 rounded-lg bg-waterblue/10 p-4">
                <div class="mb-2 flex items-center">
                  <DollarSign class="mr-2 h-5 w-5 text-lightgreen" />
                  <span class="text-2xl font-bold text-lightgreen">
                    {{ formatUsd(book.price ?? 0) }}
                  </span>
                </div>

                <!-- Reports real stock; the old dialog always read "Available". -->
                <UiBadge :variant="(book.stock ?? 0) > 0 ? 'success' : 'destructive'">
                  <component
                    :is="(book.stock ?? 0) > 0 ? CheckCircle2 : XCircle"
                    class="h-3 w-3"
                  />
                  {{
                    (book.stock ?? 0) > 0
                      ? `In stock (${book.stock})`
                      : "Out of stock"
                  }}
                </UiBadge>
              </div>

              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <Calendar class="h-5 w-5 shrink-0 text-waterblue" />
                  <div>
                    <div class="text-sm font-medium text-foreground">
                      Publication Year
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ book.first_publish_year || "N/A" }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <Flame class="h-5 w-5 shrink-0 text-waterblue" />
                  <div>
                    <div class="text-sm font-medium text-foreground">Sold</div>
                    <div class="text-sm text-muted-foreground">
                      {{ book.sold ?? 0 }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <FileText class="h-5 w-5 shrink-0 text-waterblue" />
                  <div>
                    <div class="text-sm font-medium text-foreground">
                      Ebook file
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ book.pdf_url ? "Uploaded" : "None" }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="book.subjects?.length" class="mt-4">
            <div class="rounded-lg border border-border p-4">
              <h4 class="mb-3 flex items-center text-base font-bold text-foreground">
                <Tags class="mr-2 h-5 w-5 text-waterblue" />
                Categories
              </h4>
              <div class="flex flex-wrap gap-2">
                <UiBadge
                  v-for="subject in book.subjects"
                  :key="subject"
                  class="border-transparent bg-darkgreen/15 capitalize text-darkgreen dark:bg-darkgreen/50 dark:text-whitesmoke"
                >
                  {{ subject }}
                </UiBadge>
              </div>
            </div>
          </div>

          <div v-if="book.description" class="mt-4">
            <div class="rounded-lg border border-border p-4">
              <h4 class="mb-3 flex items-center text-base font-bold text-foreground">
                <FileText class="mr-2 h-5 w-5 text-waterblue" />
                Description
              </h4>
              <p class="text-sm leading-relaxed">{{ book.description }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end border-t border-border bg-muted/50 p-4">
          <UiButton
            size="lg"
            class="min-w-[100px] bg-customblack text-white hover:bg-customblack/90"
            @click="open = false"
          >
            <Check class="h-4 w-4" />
            Close
          </UiButton>
        </div>
      </template>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  FileText,
  Flame,
  Tags,
  X,
  XCircle,
} from "lucide-vue-next";
import { formatUsd } from "@/utils/pricing";
import type { Book } from "@/types";

/**
 * The previous version of this dialog listed "Language" and "Pages" — neither
 * exists on the Book model, so they always rendered "English" and "N/A".
 * Replaced with fields the model actually carries.
 */
defineProps<{ book: Book | null }>();

const open = defineModel<boolean>("open", { default: false });
</script>
