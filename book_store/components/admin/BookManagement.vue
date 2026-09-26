<template>
  <div>
    <AdminPageHeader
      title="Books"
      description="Manage the catalog, pricing and inventory."
    >
      <template #actions>
        <UiButton variant="outline" :loading="loading" @click="refreshBooks">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
        <UiButton variant="ink" @click="openForm(null)">
          <Plus class="h-4 w-4" />
          Add book
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminPanel :loading="loading && books.length > 0">
      <template #toolbar>
        <AdminBooksBookToolbar
          v-model:search="search"
          v-model:subject="filterSubject"
          v-model:sort="sortBy"
          :subject-options="subjectOptions"
        />
      </template>

      <AdminBooksBookTable
        :books="books"
        :loading="loading"
        @view="openView"
        @edit="openForm"
        @delete="askToDelete"
      />

      <template #footer>
        <AdminTablePagination
          v-model:page="page"
          :total="pagination.total"
          :items-per-page="pagination.limit || ITEMS_PER_PAGE"
          noun="books"
        />
      </template>
    </AdminPanel>

    <AdminBooksBookFormDialog
      v-model:open="formDialog"
      :book="editedBook"
      :subject-suggestions="subjectOptions"
      @saved="refreshBooks"
      @show-snackbar="notifyFromPayload"
    />

    <AdminBooksBookViewDialog v-model:open="viewDialog" :book="viewedBook" />

    <AdminConfirmDeleteDialog
      v-model:open="deleteDialog"
      title="Delete book?"
      question="The book is removed from the catalog and can no longer be ordered."
      :subject="bookToDelete?.title"
      :loading="deleting"
      @confirm="deleteBook"
    />

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import debounce from "lodash/debounce";
import { Plus, RefreshCw } from "lucide-vue-next";
import { useBookStore } from "@/stores/book";
import { useSnackbar } from "@/composables/useSnackbar";
import type { Book, BookSort } from "@/types";

const ITEMS_PER_PAGE = 10;

const bookStore = useBookStore();
const { books, pagination, categories } = storeToRefs(bookStore);

const { snackbar, notify, notifyError, notifyFromPayload } = useSnackbar();

// Local to this screen: the store's own `loading` also covers the customer
// catalogue, and the two are fetched independently.
const loading = ref(false);

const search = ref("");
const filterSubject = ref<string | undefined>(undefined);
const sortBy = ref<BookSort>("newest");
const page = ref(1);

const formDialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleting = ref(false);

const editedBook = ref<Book | null>(null);
const viewedBook = ref<Book | null>(null);
const bookToDelete = ref<Book | null>(null);

/** Filter options come from the API category tree, not from the current page. */
const subjectOptions = computed(() =>
  categories.value.flatMap((category) => [
    category.subject,
    ...category.subcategories.map((sub) => sub.subject),
  ])
);

// Paging refetches directly; the debounced watcher below resets to page 1.
watch(page, refreshBooks);

/** Typing shouldn't fire a request per keystroke. */
const debouncedRefresh = debounce(() => {
  if (page.value === 1) {
    refreshBooks();
  } else {
    page.value = 1; // the `page` watcher issues the request
  }
}, 300);

watch([search, filterSubject, sortBy], debouncedRefresh);

onBeforeUnmount(() => debouncedRefresh.cancel());

onMounted(() => {
  bookStore.fetchCategories();
  refreshBooks();
});

/** Loads the current page from the API. */
async function refreshBooks() {
  loading.value = true;
  try {
    await bookStore.fetchBooks({
      page: page.value,
      limit: ITEMS_PER_PAGE,
      search: search.value || undefined,
      subject: filterSubject.value || undefined,
      sort: sortBy.value,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    notifyError("Failed to load books");
  } finally {
    loading.value = false;
  }
}

/** `null` opens the form blank, for adding. */
function openForm(book: Book | null) {
  editedBook.value = book;
  formDialog.value = true;
}

function openView(book: Book) {
  viewedBook.value = book;
  viewDialog.value = true;
}

function askToDelete(book: Book) {
  bookToDelete.value = book;
  deleteDialog.value = true;
}

async function deleteBook() {
  if (!bookToDelete.value) return;

  deleting.value = true;
  try {
    await bookStore.deleteBookById({ id: bookToDelete.value._id });
    notify("Book deleted successfully");
    deleteDialog.value = false;
    bookToDelete.value = null;
    // Pull the next page's first row up into the gap the deletion left.
    await refreshBooks();
  } catch (error) {
    console.error("Delete book error:", error);
    notifyError("Failed to delete book");
  } finally {
    deleting.value = false;
  }
}
</script>
