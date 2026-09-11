<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="gap-0 overflow-hidden p-0 sm:max-w-4xl"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between bg-customblack px-6 py-4 text-white"
      >
        <div class="flex items-center">
          <component
            :is="isEditing ? Pencil : Plus"
            class="mr-3 h-6 w-6 text-customyellow"
          />
          <UiDialogTitle class="text-xl font-medium">
            {{ isEditing ? "Edit Book" : "Add New Book" }}
          </UiDialogTitle>
          <UiDialogDescription class="sr-only">
            {{
              isEditing
                ? "Update the details of this book."
                : "Fill in the details to add a new book."
            }}
          </UiDialogDescription>
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

      <!-- Content -->
      <div class="max-h-[70vh] overflow-y-auto px-6 py-6">
        <form @submit.prevent="save">
          <!-- Basic information -->
          <AdminBooksFormSection :icon="Info" title="Basic Information" accent-class="text-primary">
            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.key"
                label="Book Key"
                readonly
                hint="Auto-generated unique identifier"
              >
                <template #prepend>
                  <KeyRound class="h-4 w-4" />
                </template>
              </UiInput>
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.title"
                label="Book Title"
                required
                :error-message="errors.title"
              >
                <template #prepend>
                  <BookOpen class="h-4 w-4" />
                </template>
              </UiInput>
            </div>

            <div class="col-span-12 md:col-span-6">
              <AdminBooksTagInput
                v-model="form.authors"
                label="Authors"
                placeholder="Add author, press Enter"
                :icon="UserPen"
                :error-message="errors.authors"
              />
            </div>

            <!-- Cover image -->
            <div class="col-span-12 md:col-span-6">
              <UiLabel class="mb-1.5 flex items-center gap-1.5">
                <Camera class="h-4 w-4 text-muted-foreground" />
                Cover Image
              </UiLabel>
              <input
                ref="coverFileInput"
                type="file"
                accept="image/*"
                :class="FILE_INPUT_CLASS"
                @change="onCoverFileChange"
              />
              <p v-if="errors.cover_url" class="mt-1 text-xs text-destructive">
                {{ errors.cover_url }}
              </p>
              <div v-if="form.cover_url" class="mt-2">
                <UiBadge variant="success">
                  <Check class="h-3 w-3" />
                  Image uploaded
                </UiBadge>
                <div class="mt-1 truncate text-xs text-muted-foreground">
                  {{ form.cover_url }}
                </div>
              </div>
            </div>

            <!-- Ebook file -->
            <div class="col-span-12 md:col-span-6">
              <UiLabel class="mb-1.5 flex items-center gap-1.5">
                <FileText class="h-4 w-4 text-muted-foreground" />
                Ebook File (PDF, optional)
              </UiLabel>
              <input
                ref="ebookFileInput"
                type="file"
                accept="application/pdf"
                :class="FILE_INPUT_CLASS"
                @change="onEbookFileChange"
              />
              <p class="mt-1 text-xs text-muted-foreground">
                PDF only, max {{ MAX_EBOOK_MB }}MB. Only needed if this book is
                sold as an ebook
              </p>
              <div v-if="form.pdf_url" class="mt-2">
                <UiBadge variant="success">
                  <Check class="h-3 w-3" />
                  Ebook file uploaded
                </UiBadge>
              </div>
            </div>
          </AdminBooksFormSection>

          <UiSeparator class="mb-6" />

          <AdminBooksFormSection
            :icon="Tag"
            title="Categories &amp; Classification"
            accent-class="text-secondary"
          >
            <div class="col-span-12">
              <AdminBooksTagInput
                v-model="form.subjects"
                label="Categories"
                placeholder="Add category, press Enter"
                :icon="Tags"
                :suggestions="subjectSuggestions"
                capitalize
                :error-message="errors.subjects"
              />
            </div>
          </AdminBooksFormSection>

          <UiSeparator class="mb-6" />

          <AdminBooksFormSection
            :icon="Calendar"
            title="Publication Details"
            accent-class="text-info"
          >
            <div class="col-span-12 md:col-span-4">
              <UiInput
                v-model="form.first_publish_year"
                label="Publication Year"
                type="number"
                :error-message="errors.first_publish_year"
              >
                <template #prepend>
                  <Calendar class="h-4 w-4" />
                </template>
              </UiInput>
            </div>
          </AdminBooksFormSection>

          <UiSeparator class="mb-6" />

          <AdminBooksFormSection
            :icon="DollarSign"
            title="Pricing &amp; Details"
            accent-class="text-success"
          >
            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.price"
                label="Price"
                type="number"
                :error-message="errors.price"
              >
                <template #prepend>
                  <DollarSign class="h-4 w-4" />
                </template>
              </UiInput>
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiInput
                v-model="form.stock"
                label="Stock Quantity"
                type="number"
                min="0"
                hint="0 = Out of stock / Ebook only"
              >
                <template #prepend>
                  <Package class="h-4 w-4" />
                </template>
              </UiInput>
            </div>

            <div class="col-span-12 md:col-span-6">
              <UiLabel class="mb-1.5 block">Rating</UiLabel>
              <UiRating v-model="form.rating" :size="26" />
              <div class="mt-1 text-xs text-muted-foreground">
                Rating: {{ form.rating || 0 }}/5 stars
              </div>
            </div>

            <div class="col-span-12">
              <UiTextarea v-model="form.description" label="Description" :rows="4" />
              <div class="mt-1 text-right text-xs text-muted-foreground">
                {{ (form.description || "").length }} characters
              </div>
            </div>
          </AdminBooksFormSection>
        </form>
      </div>

      <!-- Actions -->
      <div
        class="flex items-center justify-end gap-3 border-t border-border bg-muted/50 px-6 py-4"
      >
        <UiButton variant="outline" size="lg" @click="open = false">
          <X class="h-4 w-4" />
          Cancel
        </UiButton>
        <UiButton
          size="lg"
          class="bg-customyellow text-customblack transition-transform hover:-translate-y-px hover:bg-customyellow/90"
          :loading="saving"
          @click="save"
        >
          <component :is="isEditing ? Check : Plus" v-if="!saving" class="h-4 w-4" />
          {{ isEditing ? "Update Book" : "Add Book" }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Calendar,
  Camera,
  Check,
  DollarSign,
  FileText,
  Info,
  KeyRound,
  Package,
  Pencil,
  Plus,
  Tag,
  Tags,
  UserPen,
  X,
} from "lucide-vue-next";
import { v4 as uuidv4 } from "uuid";
import { uploadBookImage, uploadBookEbookFile } from "~/api/userApi";
import { useBookStore } from "@/stores/book";
import type { Book, SnackbarPayload } from "@/types";

const MAX_COVER_MB = 5;
const MAX_EBOOK_MB = 10;
const MB = 1024 * 1024;

const FILE_INPUT_CLASS =
  "block w-full cursor-pointer rounded-md border border-input bg-background text-sm text-muted-foreground shadow-sm file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70";

export interface BookFormData {
  _id?: string;
  key: string;
  title: string;
  cover_url: string;
  first_publish_year?: number;
  authors: string[];
  price: number;
  stock: number;
  sold?: number;
  subjects: string[];
  description: string;
  pdf_url: string | null;
  rating?: number;
}

const props = defineProps<{
  /** The book being edited, or `null` to add a new one. */
  book: Book | null;
  /** Category names offered as autocomplete for the categories field. */
  subjectSuggestions: string[];
}>();

const emit = defineEmits<{
  saved: [];
  "show-snackbar": [payload: SnackbarPayload];
}>();

const open = defineModel<boolean>("open", { default: false });

const bookStore = useBookStore();

const form = ref<BookFormData>(emptyForm());
const errors = ref<Partial<Record<keyof BookFormData, string>>>({});
const saving = ref(false);
const coverFileInput = ref<HTMLInputElement | null>(null);
const ebookFileInput = ref<HTMLInputElement | null>(null);

const isEditing = computed(() => !!props.book);

// Re-seed the form each time the dialog opens, so a cancelled edit leaves
// nothing behind for the next one.
watch(open, (isOpen) => {
  if (!isOpen) return;
  form.value = props.book ? ({ ...props.book } as BookFormData) : emptyForm();
  errors.value = {};
  if (coverFileInput.value) coverFileInput.value.value = "";
  if (ebookFileInput.value) ebookFileInput.value.value = "";
});

function emptyForm(): BookFormData {
  return {
    key: uuidv4(),
    title: "",
    cover_url: "",
    first_publish_year: new Date().getFullYear(),
    authors: [],
    price: 0,
    stock: 0,
    subjects: [],
    description: "",
    pdf_url: null,
  };
}

function validate(): boolean {
  const next: Partial<Record<keyof BookFormData, string>> = {};
  const currentYear = new Date().getFullYear();

  if (!form.value.title?.trim()) next.title = "Title is required";
  if (!form.value.authors?.length) {
    next.authors = "At least one author is required";
  }
  if (!form.value.cover_url) next.cover_url = "Cover image is required";
  if (form.value.price < 0) next.price = "Price must be non-negative";

  const year = form.value.first_publish_year;
  if (year && (year < 1000 || year > currentYear + 1)) {
    next.first_publish_year = "Please enter a valid publication year";
  }

  errors.value = next;
  return Object.keys(next).length === 0;
}

function notify(message: string, color: SnackbarPayload["color"] = "success") {
  emit("show-snackbar", { message, color });
}

function onCoverFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  if (!file) return;

  if (!file.type?.startsWith("image/")) {
    notify("Please select a valid image file", "error");
    return;
  }
  if (file.size > MAX_COVER_MB * MB) {
    notify(`File size must be less than ${MAX_COVER_MB}MB`, "error");
    return;
  }
  void upload("image", file);
}

function onEbookFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  if (!file) return;

  if (file.type !== "application/pdf") {
    notify("Please select a PDF file", "error");
    return;
  }
  if (file.size > MAX_EBOOK_MB * MB) {
    notify(`Ebook file size must be less than ${MAX_EBOOK_MB}MB`, "error");
    return;
  }
  void upload("ebook", file);
}

async function upload(kind: "image" | "ebook", file: File) {
  const label = kind === "image" ? "image" : "ebook file";
  notify(`Uploading ${label}...`, "info");
  try {
    const response =
      kind === "image"
        ? await uploadBookImage(file)
        : await uploadBookEbookFile(file);

    const url = response.data?.data?.url;
    if (!url) throw new Error("No URL returned from server");

    if (kind === "image") {
      form.value.cover_url = url;
      errors.value.cover_url = undefined;
    } else {
      form.value.pdf_url = url;
    }
    notify(`${label[0].toUpperCase()}${label.slice(1)} uploaded successfully!`);
  } catch (error: any) {
    console.error(`${kind} upload error:`, error);
    notify(
      `Failed to upload ${label}: ` +
        (error.response?.data?.message || error.message || "Unknown error"),
      "error"
    );
  }
}

async function save() {
  if (!validate()) return;

  saving.value = true;
  try {
    if (isEditing.value) {
      await bookStore.updateBook({
        id: form.value._id as string,
        bookData: form.value as Partial<Book>,
      });
      notify("Book updated successfully");
    } else {
      await bookStore.createBook(form.value as Partial<Book>);
      notify("Book added successfully");
    }
    open.value = false;
    emit("saved");
  } catch (error: any) {
    console.error("Save book error:", error);
    notify(
      "Failed to save book: " +
        (error.response?.data?.message || error.message || "Unknown error"),
      "error"
    );
  } finally {
    saving.value = false;
  }
}
</script>
