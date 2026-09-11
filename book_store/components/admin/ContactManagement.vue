<template>
  <div class="p-4">
    <UiCard class="rounded-2xl p-4">
      <div class="flex flex-wrap items-center justify-between gap-3 p-2">
        <div>
          <h2 class="text-3xl font-bold text-foreground">
            User Feedback Management
          </h2>
          <p class="text-sm font-medium text-muted-foreground">
            View and manage customer feedback
          </p>
        </div>
        <span
          class="inline-flex items-center rounded-full bg-customyellow px-3 py-1 text-xs font-semibold text-customblack shadow-sm"
        >
          {{ contacts.length }} Total
        </span>
      </div>

      <!-- Filters -->
      <div class="p-2 pt-4">
        <div class="mb-4">
          <UiInput
            v-model="search"
            placeholder="Search by username or message"
          >
            <template #prepend>
              <Search class="h-4 w-4" />
            </template>
            <template #append>
              <button
                v-if="search"
                type="button"
                class="pointer-events-auto rounded-full p-0.5 hover:text-foreground"
                aria-label="Clear search"
                @click="search = ''"
              >
                <X class="h-4 w-4" />
              </button>
            </template>
          </UiInput>
        </div>

        <!-- Contacts Table -->
        <div class="overflow-x-auto rounded-lg border border-border">
          <table class="w-full text-sm">
            <thead class="bg-muted/60 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Username
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Message
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="loading">
                <td colspan="4" class="px-4 py-8 text-center">
                  <UiSpinner size="lg" class="mx-auto text-waterblue" />
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="contact in paginatedContacts"
                  :key="contact._id"
                  class="hover:bg-muted/40"
                >
                  <td class="px-4 py-3">
                    <div class="max-w-[400px] truncate">
                      {{ contactUsername(contact) }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="max-w-[400px] truncate">
                      {{ contact.message }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    {{ formatDate(contact.createdAt) }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-1">
                      <UiButton
                        variant="ghost"
                        size="iconSm"
                        class="text-waterblue hover:text-waterblue"
                        aria-label="View feedback"
                        @click="viewContact(contact)"
                      >
                        <Eye class="h-5 w-5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="iconSm"
                        class="text-destructive hover:text-destructive"
                        aria-label="Delete feedback"
                        @click="confirmDelete(contact)"
                      >
                        <Trash2 class="h-5 w-5" />
                      </UiButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="!paginatedContacts.length">
                  <td
                    colspan="4"
                    class="px-4 py-8 text-center text-muted-foreground"
                  >
                    No feedback found
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div v-if="pageCount > 1" class="flex justify-center pt-3">
          <UiPagination
            v-slot="{ page: currentPage }"
            v-model:page="page"
            :total="filteredContacts.length"
            :items-per-page="itemsPerPage"
            :sibling-count="1"
            show-edges
          >
            <UiPaginationContent v-slot="{ items }">
              <UiPaginationPrevious />
              <template v-for="(item, index) in items">
                <UiPaginationItem
                  v-if="item.type === 'page'"
                  :key="index"
                  :value="item.value"
                  :is-active="item.value === currentPage"
                >
                  {{ item.value }}
                </UiPaginationItem>
                <UiPaginationEllipsis v-else :key="item.type" :index="index" />
              </template>
              <UiPaginationNext />
            </UiPaginationContent>
          </UiPagination>
        </div>
      </div>
    </UiCard>

    <!-- View Dialog -->
    <UiDialog v-model:open="dialog">
      <UiDialogContent class="sm:max-w-xl">
        <UiDialogHeader>
          <UiDialogTitle>Feedback Details</UiDialogTitle>
        </UiDialogHeader>

        <div v-if="selectedContact">
          <div class="space-y-3">
            <div>
              <p class="text-sm font-bold">Username</p>
              <p class="text-sm text-muted-foreground">
                {{ contactUser(selectedContact)?.username }}
              </p>
            </div>
            <div>
              <p class="text-sm font-bold">Email</p>
              <p class="text-sm text-muted-foreground">
                {{ contactUser(selectedContact)?.email || "N/A" }}
              </p>
            </div>
            <div>
              <p class="text-sm font-bold">Date</p>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(selectedContact.createdAt) }}
              </p>
            </div>
          </div>

          <UiSeparator class="my-4" />

          <div class="mb-4">
            <h4 class="mb-2 text-base font-bold">Feedback Message:</h4>
            <p class="text-sm">{{ selectedContact.message }}</p>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton
            variant="ghost"
            class="text-muted-foreground"
            @click="dialog = false"
          >
            Close
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <!-- Delete Confirmation Dialog -->
    <AdminConfirmDeleteDialog
      v-model:open="deleteDialog"
      question="Are you sure you want to delete this feedback?"
      :loading="deleting"
      @confirm="deleteContactMessenger"
    />

    <!-- Snackbar -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContactStore } from "@/stores/contact";
import type { Contact, User } from "@/types";
import { Eye, Search, Trash2, X } from "lucide-vue-next";

const contactStore = useContactStore();
const { contacts, loading } = storeToRefs(contactStore);

const search = ref("");
const dialog = ref(false);
const deleteDialog = ref(false);
const selectedContact = ref<Contact | null>(null);
const deleting = ref(false);

const page = ref(1);
const itemsPerPage = 10;

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

function contactUser(contact: Contact): User | null {
  return typeof contact.user === "object" && contact.user !== null
    ? contact.user
    : null;
}

function contactUsername(contact: Contact): string {
  return contactUser(contact)?.username || contact.username || "N/A";
}

const filteredContacts = computed<Contact[]>(() => {
  if (!search.value) return contacts.value;
  const searchLower = search.value.toLowerCase();
  return contacts.value.filter(
    (contact) =>
      contactUsername(contact).toLowerCase().includes(searchLower) ||
      contact.message?.toLowerCase().includes(searchLower)
  );
});

const pageCount = computed(() =>
  Math.ceil(filteredContacts.value.length / itemsPerPage)
);

const paginatedContacts = computed<Contact[]>(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredContacts.value.slice(start, start + itemsPerPage);
});

watch(search, () => {
  page.value = 1;
});

async function loadContacts() {
  try {
    await contactStore.fetchAllContacts();
  } catch (error: any) {
    showSnackbar("Failed to load feedbacks", "error");
  }
}

function viewContact(contact: Contact) {
  selectedContact.value = { ...contact };
  dialog.value = true;
}

function confirmDelete(contact: Contact) {
  selectedContact.value = contact;
  deleteDialog.value = true;
}

async function deleteContactMessenger() {
  try {
    deleting.value = true;
    await contactStore.deleteContact(selectedContact.value!._id);
    showSnackbar("Feedback deleted successfully", "success");
    deleteDialog.value = false;
  } catch (error: any) {
    showSnackbar("Failed to delete feedback", "error");
  } finally {
    deleting.value = false;
  }
}

function formatDate(date?: string): string {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showSnackbar(message: string, color = "success") {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
}

onMounted(async () => {
  await loadContacts();
});
</script>
