<template>
  <div>
    <AdminPageHeader
      title="Feedback"
      description="Messages customers send through the contact form."
    >
      <template #actions>
        <UiButton variant="outline" :loading="loading" @click="loadContacts">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminPanel :loading="loading && contacts.length > 0">
      <template #toolbar>
        <AdminSearchInput v-model="search" placeholder="Search name or message" />
        <p class="text-sm tabular-nums text-muted-foreground md:ml-auto">
          {{ contacts.length }} messages
        </p>
      </template>

      <div class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Message</th>
              <th>Received</th>
              <th class="w-px"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <AdminTableSkeleton v-if="loading && !contacts.length" :columns="4" media />
            <template v-else>
              <tr v-for="contact in paginatedContacts" :key="contact._id">
                <td class="whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <UserAvatar
                      :src="contactUser(contact)?.avatar_url"
                      :name="contactUsername(contact)"
                      class="size-8 shrink-0"
                    />
                    <div class="min-w-0">
                      <div class="max-w-[200px] truncate font-medium text-foreground">
                        {{ contactUsername(contact) }}
                      </div>
                      <div
                        v-if="contactUser(contact)?.email"
                        class="max-w-[200px] truncate text-xs text-muted-foreground"
                      >
                        {{ contactUser(contact)?.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    class="line-clamp-2 max-w-xl text-left text-foreground/90 hover:text-foreground"
                    @click="viewContact(contact)"
                  >
                    {{ contact.message }}
                  </button>
                </td>
                <td class="whitespace-nowrap text-muted-foreground">
                  {{ formatDate(contact.createdAt) }}
                </td>
                <td>
                  <div class="flex items-center justify-end gap-0.5">
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="text-muted-foreground hover:text-foreground"
                      aria-label="View feedback"
                      title="View"
                      @click="viewContact(contact)"
                    >
                      <Eye class="h-4 w-4" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete feedback"
                      title="Delete"
                      @click="confirmDelete(contact)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </UiButton>
                  </div>
                </td>
              </tr>
              <tr v-if="!paginatedContacts.length" class="hover:bg-transparent">
                <td colspan="4">
                  <AdminEmptyState
                    :icon="Inbox"
                    :title="search ? 'No messages match' : 'Inbox is empty'"
                    :description="
                      search
                        ? 'Try another name or keyword.'
                        : 'Messages from the contact form will land here.'
                    "
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <template #footer>
        <AdminTablePagination
          v-model:page="page"
          :total="filteredContacts.length"
          :items-per-page="itemsPerPage"
          noun="messages"
        />
      </template>
    </AdminPanel>

    <UiDialog v-model:open="dialog">
      <UiDialogContent class="sm:max-w-lg">
        <UiDialogHeader>
          <UiDialogTitle>Feedback</UiDialogTitle>
          <UiDialogDescription v-if="selectedContact">
            Received {{ formatDate(selectedContact.createdAt) }}
          </UiDialogDescription>
        </UiDialogHeader>

        <div v-if="selectedContact" class="space-y-4">
          <div class="flex items-center gap-3">
            <UserAvatar
              :src="contactUser(selectedContact)?.avatar_url"
              :name="contactUsername(selectedContact)"
              class="size-10 shrink-0"
            />
            <div class="min-w-0">
              <div class="truncate text-sm font-medium text-foreground">
                {{ contactUsername(selectedContact) }}
              </div>
              <a
                v-if="contactUser(selectedContact)?.email"
                :href="`mailto:${contactUser(selectedContact)?.email}`"
                class="truncate text-sm text-primary hover:underline"
              >
                {{ contactUser(selectedContact)?.email }}
              </a>
              <div v-else class="text-sm text-muted-foreground">No email on file</div>
            </div>
          </div>

          <p
            class="whitespace-pre-line rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground"
          >
            {{ selectedContact.message }}
          </p>
        </div>

        <UiDialogFooter>
          <UiButton variant="outline" @click="dialog = false">Close</UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <AdminConfirmDeleteDialog
      v-model:open="deleteDialog"
      title="Delete feedback?"
      question="The message is removed from the feedback inbox."
      :loading="deleting"
      @confirm="deleteContactMessenger"
    />

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
import { Eye, Inbox, RefreshCw, Trash2 } from "lucide-vue-next";

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
