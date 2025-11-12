<template>
  <div class="contact-management">
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h4 font-weight-bold">User Feedback Management</h2>
          <p class="text-subtitle-2 text-medium-emphasis">
            View and manage customer feedback
          </p>
        </div>
        <v-chip color="primary" variant="elevated">
          {{ contacts.length }} Total
        </v-chip>
      </v-card-title>

      <!-- Filters -->
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search by username or message"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Contacts Table -->
        <v-data-table
          :headers="headers"
          :items="contacts"
          :loading="loading"
          :search="search"
          class="elevation-1"
        >
          <!-- Message Preview -->
          <template v-slot:item.username="{ item }">
            <div class="text-truncate" style="max-width: 400px">
              {{ item.username }}
            </div>
          </template>
          <template v-slot:item.message="{ item }">
            <div class="text-truncate" style="max-width: 400px">
              {{ item.message }}
            </div>
          </template>

          <!-- Created Date -->
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              size="small"
              color="primary"
              variant="text"
              @click="viewContact(item)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="error"
              variant="text"
              @click="confirmDelete(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- View Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5">Feedback Details</span>
          <v-btn icon variant="text" @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text v-if="selectedContact">
          <v-list>
            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Username
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedContact?.user?.username }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Email
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedContact.user?.email || "N/A" }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="font-weight-bold">
                Date
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(selectedContact.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">
              Feedback Message:
            </h4>
            <p class="text-body-2">{{ selectedContact.message }}</p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this feedback?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteContactMessenger"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import SnackbarAlert from "../SnackbarAlert.vue";

export default {
  name: "ContactManagement",
  components: {
    SnackbarAlert,
  },
  data() {
    return {
      search: "",
      dialog: false,
      deleteDialog: false,
      selectedContact: null,
      deleting: false,
      headers: [
        { title: "Username", key: "user.username", sortable: true },
        { title: "Message", key: "message", sortable: false },
        { title: "Date", key: "createdAt", sortable: true },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ],
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    ...mapState("contact", ["contacts", "loading"]),
  },
  methods: {
    ...mapActions("contact", [
      "fetchAllContacts",
      "deleteContact",
    ]),
    async loadContacts() {
      try {
        await this.fetchAllContacts();
      } catch (error) {
        this.showSnackbar("Failed to load feedbacks", "error");
      }
    },
    viewContact(contact) {
      this.selectedContact = { ...contact };
      this.dialog = true;
    },
    confirmDelete(contact) {
      this.selectedContact = contact;
      this.deleteDialog = true;
    },
    async deleteContactMessenger() {
      try {
        this.deleting = true;
        await this.deleteContact(this.selectedContact._id);
        this.showSnackbar("Feedback deleted successfully", "success");
        this.deleteDialog = false;
      } catch (error) {
        this.showSnackbar("Failed to delete feedback", "error");
      } finally {
        this.deleting = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  async mounted() {
    await this.loadContacts();
  },
};
</script>

<style scoped>
.contact-management {
  padding: 16px;
}
</style>
