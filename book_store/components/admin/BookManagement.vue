<template>
  <div class="book-management">
    <!-- Header Actions -->
    <v-card class="mb-6" elevation="2">
      <v-card-text class="pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h2 class="text-h4 font-weight-bold mb-2">Book List</h2>
            <p class="text-grey text-body-1 mb-0">
              Manage book information in the system
            </p>
          </div>

          <div class="d-flex align-center ga-3">
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              variant="elevated"
              @click="openAddDialog"
            >
              Add Book
            </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              variant="outlined"
              @click="refreshBooks"
              :loading="loading"
            >
              Refresh
            </v-btn>
          </div>
        </div>

        <!-- Filters -->
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Search books..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filterSubject"
              :items="subjects"
              label="Filter by category"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <div class="d-flex align-center">
              <v-switch
                v-model="showThemSach"
                label="Add books"
                color="success"
                hide-details
                inset
              ></v-switch>

              <v-btn
                icon="mdi-filter"
                variant="text"
                @click="toggleAdvancedFilter"
                class="ml-2"
              ></v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Books Table -->
    <v-card elevation="2">
      <v-data-table
        v-model:page="page"
        :headers="headers"
        :items="filteredBooks"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :search="search"
        class="elevation-0"
        item-key="_id"
      >
        <!-- Mã Sách Column -->
        <template v-slot:item.key="{ item }">
          <v-chip
            color="primary"
            variant="tonal"
            size="small"
            class="font-mono"
          >
            {{ item._id?.slice(-8) || "N/A" }}
          </v-chip>
        </template>

        <!-- Tên Sách Column -->
        <template v-slot:item.title="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="40" rounded="lg" class="mr-3">
              <v-img :src="item?.cover_url" :alt="item?.title" cover>
                <template v-slot:placeholder>
                  <v-icon>mdi-book</v-icon>
                </template>
              </v-img>
            </v-avatar>

            <div>
              <div class="font-weight-medium">{{ item.title }}</div>
              <div class="text-caption text-grey">
                {{ item.authors?.join(", ") || "Unknown Author" }}
              </div>
            </div>
          </div>
        </template>

        <!-- Năm Xuất Bản Column -->
        <template v-slot:item.first_publish_year="{ item }">
          <v-chip
            :color="getYearColor(item.first_publish_year)"
            variant="flat"
            size="small"
          >
            {{ item.first_publish_year || "N/A" }}
          </v-chip>
        </template>

        <!-- Thể Loại Column -->
        <template v-slot:item.subjects="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="(subject, index) in (item.subjects || []).slice(0, 2)"
              :key="index"
              color="info"
              variant="tonal"
              size="x-small"
              class="text-capitalize"
            >
              {{ subject }}
            </v-chip>
            <v-chip
              v-if="(item.subjects || []).length > 2"
              color="grey"
              variant="tonal"
              size="x-small"
            >
              +{{ (item.subjects || []).length - 2 }}
            </v-chip>
          </div>
        </template>

        <!-- Giá Column -->
        <template v-slot:item.price="{ item }">
          <div class="text-h6 font-weight-bold text-success">
            ${{ item.price || "0" }}
          </div>
        </template>

        <!-- Stock Column -->
        <template v-slot:item.stock="{ item }">
          <v-chip
            :color="getStockColor(item.stock)"
            variant="flat"
            size="small"
            class="font-weight-bold"
          >
            {{ item.stock || 0 }}
          </v-chip>
        </template>

        <!-- Sold Column -->
        <template v-slot:item.sold="{ item }">
          <v-chip
            color="success"
            variant="flat"
            size="small"
            class="font-weight-bold"
          >
            <v-icon start size="x-small">mdi-fire</v-icon>
            {{ item.sold || 0 }}
          </v-chip>
        </template>

        <!-- Mô Tả Column -->
        <template v-slot:item.description="{ item }">
          <div class="description-cell">
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <div
                  v-bind="props"
                  class="text-truncate"
                  style="max-width: 200px"
                >
                  {{ item.description || "No description" }}
                </div>
              </template>
              <span>{{ item.description || "No description" }}</span>
            </v-tooltip>
          </div>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center ga-1">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              color="info"
              @click="viewBook(item)"
            ></v-btn>

            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="editBook(item)"
            ></v-btn>

            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(item)"
            ></v-btn>
          </div>
        </template>

        <!-- Bottom -->
        <template v-slot:bottom>
          <div class="d-flex justify-space-between align-center pa-4">
            <div class="text-body-2 text-grey">
              Showing {{ paginatedBooks.length }} of {{ books.length }} books
            </div>

            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="5"
              variant="elevated"
              density="comfortable"
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Book Dialog -->
    <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
      <v-card class="dialog-card" elevation="8">
        <!-- Header -->
        <v-card-title class="px-6 py-4 bg-primary text-white">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-3" size="large">
                {{ isEditing ? "mdi-pencil" : "mdi-plus" }}
              </v-icon>
              <span class="text-h5 font-weight-medium">{{ dialogTitle }}</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              @click="closeDialog"
            ></v-btn>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Content -->
        <v-card-text class="pa-0" style="max-height: 70vh">
          <v-container class="py-6">
            <v-form>
              <!-- Basic Information Section -->
              <div class="mb-6">
                <h3
                  class="text-h6 font-weight-medium mb-4 text-primary d-flex align-center"
                >
                  <v-icon class="mr-2">mdi-information</v-icon>
                  Basic Information
                </h3>
                <v-row>
                  <!-- Book Key (auto-generated, readonly) -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="editedItem.key"
                      label="Book Key"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-key"
                      readonly
                      hint="Auto-generated unique identifier"
                      persistent-hint
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="editedItem.title"
                      label="Book Title"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-book"
                      :error-messages="errors.title"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-combobox
                      v-model="editedItem.authors"
                      label="Authors"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-edit"
                      multiple
                      chips
                      closable-chips
                      :error-messages="errors.authors"
                    ></v-combobox>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-file-input
                      v-model="uploadedFile"
                      label="Cover Image"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-camera"
                      accept="image/*"
                      show-size
                      @update:modelValue="handleBookUpload"
                      :error-messages="errors.cover_url"
                    ></v-file-input>
                    <!-- Hiển thị URL ảnh hiện tại nếu có -->
                    <div v-if="editedItem.cover_url" class="mt-2">
                      <v-chip color="success" size="small">
                        <v-icon start>mdi-check</v-icon>
                        Image uploaded
                      </v-chip>
                      <div class="text-caption text-grey mt-1">
                        {{ editedItem.cover_url.substring(0, 50)
                        }}{{ editedItem.cover_url.length > 50 ? "..." : "" }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-6"></v-divider>

              <!-- Categories & Classification -->
              <div class="mb-6">
                <h3
                  class="text-h6 font-weight-medium mb-4 text-secondary d-flex align-center"
                >
                  <v-icon class="mr-2">mdi-tag</v-icon>
                  Categories & Classification
                </h3>
                <v-row>
                  <v-col cols="12">
                    <v-combobox
                      v-model="editedItem.subjects"
                      class="text-capitalize"
                      label="Categories"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-tag-multiple"
                      multiple
                      chips
                      closable-chips
                      :items="subjects"
                      :error-messages="errors.subjects"
                    ></v-combobox>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-6"></v-divider>

              <!-- Publication Details -->
              <div class="mb-6">
                <h3
                  class="text-h6 font-weight-medium mb-4 text-info d-flex align-center"
                >
                  <v-icon class="mr-2">mdi-calendar</v-icon>
                  Publication Details
                </h3>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="editedItem.first_publish_year"
                      label="Publication Year"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                      type="number"
                      :error-messages="errors.first_publish_year"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="mb-6"></v-divider>

              <!-- Pricing, Rating & Description -->
              <div class="mb-6">
                <h3
                  class="text-h6 font-weight-medium mb-4 text-success d-flex align-center"
                >
                  <v-icon class="mr-2">mdi-currency-usd</v-icon>
                  Pricing & Details
                </h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="editedItem.price"
                      label="Price"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-currency-usd"
                      type="number"
                      prefix="$"
                      :error-messages="errors.price"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="editedItem.stock"
                      label="Stock Quantity"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-package-variant"
                      type="number"
                      :error-messages="errors.stock"
                      min="0"
                      hint="0 = Out of stock / Ebook only"
                      persistent-hint
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-rating
                      v-model="editedItem.rating"
                      label="Rating"
                      density="comfortable"
                      color="amber"
                      half-increments
                      hover
                      :error-messages="errors.rating"
                    ></v-rating>
                    <div class="text-caption text-grey-darken-1 mt-1">
                      Rating: {{ editedItem.rating || 0 }}/5 stars
                    </div>
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="editedItem.description"
                      label="Description"
                      variant="outlined"
                      prepend-inner-icon="mdi-text-box"
                      rows="4"
                      auto-grow
                      counter
                      :error-messages="errors.description"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </div>
            </v-form>
          </v-container>
        </v-card-text>

        <!-- Actions -->
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-2"
            variant="outlined"
            size="large"
            @click="closeDialog"
            class="mr-3"
          >
            <v-icon start>mdi-close</v-icon>
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="saveBook"
            :loading="saving"
            elevation="2"
          >
            <v-icon start>{{ isEditing ? "mdi-check" : "mdi-plus" }}</v-icon>
            {{ isEditing ? "Update Book" : "Add Book" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card class="text-center" elevation="8" rounded="xl">
        <!-- Icon -->
        <div class="pt-8 pb-4">
          <v-avatar size="80" color="error" class="mb-4">
            <v-icon size="40" color="white">mdi-delete-alert</v-icon>
          </v-avatar>

          <v-card-title class="text-h5 font-weight-bold text-center px-4">
            Confirm Deletion
          </v-card-title>
        </div>

        <!-- Content -->
        <v-card-text class="px-6 pb-4">
          <p class="text-body-1 mb-3">
            Are you sure you want to delete this book?
          </p>

          <v-alert
            type="warning"
            variant="tonal"
            class="ma-3 text-left"
            density="compact"
          >
            <div class="font-weight-medium">{{ bookToDelete?.title }}</div>
            <div class="text-caption text-grey-darken-1">
              This action cannot be undone.
            </div>
          </v-alert>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="justify-center px-6 pb-8">
          <v-btn
            color="grey"
            variant="outlined"
            size="large"
            @click="deleteDialog = false"
            class="mr-3"
            min-width="100"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            size="large"
            @click="deleteBookConfirmed"
            :loading="deleting"
            min-width="100"
            elevation="2"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Book Dialog -->
    <v-dialog v-model="viewDialog" max-width="700px" scrollable>
      <v-card v-if="viewedBook" elevation="8" rounded="lg">
        <!-- Header with Book Cover Background -->
        <div class="book-header position-relative">
          <div class="book-header-overlay"></div>
          <v-card-title class="pa-6 text-white position-relative">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-3" size="large"
                  >mdi-book-open-page-variant</v-icon
                >
                <div>
                  <div class="text-h5 font-weight-bold">
                    {{ viewedBook.title }}
                  </div>
                  <div class="text-subtitle-1 opacity-90">
                    by {{ viewedBook.authors?.join(", ") || "Unknown Author" }}
                  </div>
                </div>
              </div>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="viewDialog = false"
              ></v-btn>
            </div>
          </v-card-title>
        </div>

        <v-divider></v-divider>

        <!-- Content -->
        <v-card-text class="pa-0" style="max-height: 60vh">
          <v-container class="py-4">
            <v-row>
              <!-- Book Cover -->
              <v-col cols="12" md="4" v-if="viewedBook.cover_url">
                <div class="text-center">
                  <v-img
                    :src="viewedBook.cover_url"
                    :alt="viewedBook.title"
                    aspect-ratio="0.7"
                    max-width="200"
                    cover
                    class="rounded-lg mx-auto elevation-4"
                  >
                    <template v-slot:placeholder>
                      <v-skeleton-loader type="image"></v-skeleton-loader>
                    </template>
                  </v-img>
                </div>
              </v-col>

              <!-- Book Details -->
              <v-col :cols="viewedBook.cover_url ? 8 : 12">
                <v-card variant="tonal" color="primary" class="mb-4">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="success" class="mr-2"
                        >mdi-currency-usd</v-icon
                      >
                      <span class="text-h5 font-weight-bold text-success">
                        ${{ viewedBook.price?.toFixed(2) || "0.00" }}
                      </span>
                    </div>

                    <v-chip
                      color="success"
                      variant="flat"
                      size="small"
                      prepend-icon="mdi-check-circle"
                    >
                      Available
                    </v-chip>
                  </v-card-text>
                </v-card>

                <!-- Details List -->
                <v-list class="pa-0">
                  <v-list-item class="px-0">
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Publication Year</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ viewedBook.first_publish_year || "N/A" }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="px-0">
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-translate</v-icon>
                    </template>
                    <v-list-item-title>Language</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ viewedBook.language || "English" }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="px-0">
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-file-document</v-icon>
                    </template>
                    <v-list-item-title>Pages</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ viewedBook.page_count || "N/A" }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <!-- Categories Section -->
            <v-row v-if="viewedBook.subjects?.length" class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <h4
                    class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center"
                  >
                    <v-icon class="mr-2" color="primary"
                      >mdi-tag-multiple</v-icon
                    >
                    Categories
                  </h4>
                  <div class="d-flex text-capitalize flex-wrap ga-2">
                    <v-chip
                      v-for="subject in viewedBook.subjects"
                      :key="subject"
                      color="primary"
                      variant="tonal"
                      size="small"
                    >
                      {{ subject }}
                    </v-chip>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Description Section -->
            <v-row v-if="viewedBook.description" class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <h4
                    class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center"
                  >
                    <v-icon class="mr-2" color="primary">mdi-text-box</v-icon>
                    Description
                  </h4>
                  <p class="text-body-2 line-height-1-6 mb-0">
                    {{ viewedBook.description }}
                  </p>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <!-- Actions -->
        <v-divider></v-divider>
        <v-card-actions class="justify-end pa-4 bg-grey-lighten-5">
          <v-btn
            color="primary"
            variant="flat"
            @click="viewDialog = false"
            size="large"
            min-width="100"
          >
            <v-icon start>mdi-check</v-icon>
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Alert -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.text"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { uploadBookImage } from "~/api/userApi";
import { v4 as uuidv4 } from "uuid";
export default {
  name: "BookManagement",
  data() {
    return {
      loading: false,
      search: "",
      filterSubject: null,
      sortBy: "newest",
      showThemSach: true,
      page: 1,
      itemsPerPage: 10,

      // Dialog states
      dialog: false,
      deleteDialog: false,
      viewDialog: false,

      // Form data
      editedIndex: -1,
      editedItem: this.getDefaultItem(),
      bookToDelete: null,
      viewedBook: null,
      uploadedFile: null, // For v-file-input binding

      // Form validation
      errors: {},

      // Loading states
      saving: false,
      deleting: false,

      headers: [
        {
          title: "Book ID",
          key: "key",
          align: "start",
          sortable: false,
          width: "120px",
        },
        {
          title: "Book Title",
          key: "title",
          align: "start",
          sortable: true,
          width: "300px",
        },
        {
          title: "Publication Year",
          key: "first_publish_year",
          align: "center",
          sortable: true,
          width: "140px",
        },
        {
          title: "Categories",
          key: "subjects",
          align: "start",
          sortable: false,
          width: "180px",
        },
        {
          title: "Price",
          key: "price",
          align: "center",
          sortable: true,
          width: "100px",
        },
        {
          title: "Stock",
          key: "stock",
          align: "center",
          sortable: true,
          width: "100px",
        },
        {
          title: "Sold",
          key: "sold",
          align: "center",
          sortable: true,
          width: "100px",
        },
        {
          title: "Description",
          key: "description",
          align: "start",
          sortable: false,
          width: "250px",
        },
        {
          title: "Actions",
          key: "actions",
          align: "center",
          sortable: false,
          width: "120px",
        },
      ],

      subjects: [],

      languageOptions: [
        { title: "English", value: "en" },
        { title: "Spanish", value: "es" },
        { title: "French", value: "fr" },
        { title: "German", value: "de" },
        { title: "Italian", value: "it" },
        { title: "Portuguese", value: "pt" },
        { title: "Russian", value: "ru" },
        { title: "Japanese", value: "ja" },
        { title: "Chinese", value: "zh" },
        { title: "Korean", value: "ko" },
      ],

      sortOptions: [
        { title: "Newest", value: "newest" },
        { title: "Oldest", value: "oldest" },
        { title: "Name A-Z", value: "name-asc" },
        { title: "Name Z-A", value: "name-desc" },
        { title: "Price Low to High", value: "price-asc" },
        { title: "Price High to Low", value: "price-desc" },
      ],

      // Notification
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    ...mapState("book", ["books", "loading"]),
    getSubjectsFromBook() {
      const allSubjects = this.books.map((book) => book.subjects);
      return [...new Set(allSubjects.flat())];
    },

    dialogTitle() {
      return this.editedIndex === -1 ? "Add New Book" : "Edit Book";
    },

    isEditing() {
      return this.editedIndex !== -1;
    },

    filteredBooks() {
      let filtered = [...this.books];

      // Filter by subject
      if (this.filterSubject) {
        filtered = filtered.filter((book) =>
          book.subjects?.includes(this.filterSubject)
        );
      }

      // Sort
      switch (this.sortBy) {
        case "newest":
          filtered.sort(
            (a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0)
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) => (a.first_publish_year || 0) - (b.first_publish_year || 0)
          );
          break;
        case "name-asc":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "name-desc":
          filtered.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "price-asc":
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case "price-desc":
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
      }

      return filtered;
    },

    paginatedBooks() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredBooks.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
    },
  },

  methods: {
    ...mapActions("book", [
      "getAllBooks",
      "deleteBookById",
      "createBook",
      "updateBook",
    ]),

    getDefaultItem() {
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
      };
    },

    async refreshBooks() {
      this.loading = true;
      try {
        await this.getAllBooks({ subject: null });
      } catch (error) {
        console.error("Error fetching books:", error);
        this.showSnackbar("Failed to load books", "error");
      } finally {
        this.loading = false;
      }
    },

    getYearColor(year) {
      if (!year) return "grey";
      const currentYear = new Date().getFullYear();
      if (year >= currentYear - 5) return "success";
      if (year >= currentYear - 20) return "warning";
      return "error";
    },

    getStockColor(stock) {
      if (stock === 0) return "error";
      if (stock <= 10) return "warning";
      if (stock <= 50) return "info";
      return "success";
    },

    openAddDialog() {
      this.editedIndex = -1;
      this.editedItem = this.getDefaultItem();
      this.errors = {};
      this.dialog = true;
    },

    openDialog(action, item = null) {
      if (action === "add") {
        this.editedIndex = -1;
        this.editedItem = this.getDefaultItem();
      } else if (action === "edit" && item) {
        this.editedIndex = this.books.findIndex(
          (book) => book._id === item._id
        );
        this.editedItem = { ...item };
      }
      this.errors = {};
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = this.getDefaultItem();
        this.editedIndex = -1;
        this.errors = {};
        this.uploadedFile = null; // Reset file input
      });
    },

    validateForm() {
      this.errors = {};

      if (!this.editedItem.title?.trim()) {
        this.errors.title = ["Title is required"];
      }

      if (!this.editedItem.authors?.length) {
        this.errors.authors = ["At least one author is required"];
      }

      if (!this.editedItem.cover_url) {
        this.errors.cover_url = ["Cover image is required"];
      }

      if (this.editedItem.price < 0) {
        this.errors.price = ["Price must be non-negative"];
      }

      if (
        this.editedItem.first_publish_year &&
        (this.editedItem.first_publish_year < 1000 ||
          this.editedItem.first_publish_year > new Date().getFullYear() + 1)
      ) {
        this.errors.first_publish_year = [
          "Please enter a valid publication year",
        ];
      }

      return Object.keys(this.errors).length === 0;
    },

    async handleBookUpload(file) {
      // console.log("=== UPLOAD DEBUG START ===");
      // console.log("1. Raw file received:", file);
      // console.log("2. Type of file:", typeof file);
      // console.log("3. Is it an array?", Array.isArray(file));
      // console.log("4. Is it a File?", file instanceof File);

      if (!file) {
        console.log("No file found!");
        return;
      }

      // console.log("5. File type:", file.type);
      // console.log("6. File name:", file.name);
      // console.log("7. File size:", file.size);
      // console.log("=== UPLOAD DEBUG END ===");

      // Validate file type
      if (!file.type || !file.type.startsWith("image/")) {
        console.log("❌ File type validation failed:", file.type);
        this.showSnackbar("Please select a valid image file", "error");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showSnackbar("File size must be less than 5MB", "error");
        return;
      }

      try {
        this.showSnackbar("Uploading image...", "info");
        const response = await uploadBookImage(file);

        // console.log("Upload response:", response);
        // console.log("Response data:", response.data);

        if (response.data && response.data.data && response.data.data.url) {
          this.editedItem.cover_url = response.data.data.url;
          // console.log(
          //   "✅ Image uploaded successfully:",
          //   this.editedItem.cover_url
          // );
          this.showSnackbar("Image uploaded successfully!", "success");
        } else {
          throw new Error("No URL returned from server");
        }
      } catch (error) {
        console.error("Upload error:", error);
        console.error("Error response:", error.response);
        this.showSnackbar(
          "Failed to upload image: " +
            (error.response?.data?.message || error.message || "Unknown error"),
          "error"
        );
      }
    },

    async saveBook() {
      if (!this.validateForm()) return;

      // Check if cover_url is provided
      if (!this.editedItem.cover_url) {
        this.errors.cover_url = ["Please upload a cover image"];
        return;
      }

      this.saving = true;
      try {
        if (this.isEditing) {
          await this.updateBook({
            id: this.editedItem._id,
            bookData: this.editedItem,
          });
          this.showSnackbar("Book updated successfully");
        } else {
          await this.createBook(this.editedItem);
          this.showSnackbar("Book added successfully");
        }
        this.closeDialog();
      } catch (error) {
        console.error("Save book error:", error);
        this.showSnackbar(
          "Failed to save book: " +
            (error.response?.data?.message || error.message || "Unknown error"),
          "error"
        );
      } finally {
        this.saving = false;
      }
    },

    viewBook(book) {
      this.viewedBook = book;
      this.viewDialog = true;
    },

    editBook(book) {
      this.openDialog("edit", book);
    },

    confirmDelete(item) {
      this.bookToDelete = item;
      this.deleteDialog = true;
    },

    async deleteBookConfirmed() {
      if (!this.bookToDelete) return;

      this.deleting = true;
      try {
        await this.deleteBookById({ id: this.bookToDelete._id });
        this.showSnackbar("Book deleted successfully");
        this.deleteDialog = false;
        this.bookToDelete = null;
      } catch (error) {
        this.showSnackbar("Failed to delete book", "error");
      } finally {
        this.deleting = false;
      }
    },

    toggleAdvancedFilter() {
      console.log("Toggle advanced filter");
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },
  },

  watch: {
    dialog(val) {
      val || this.closeDialog();
    },
  },
  async mounted() {
    await this.refreshBooks();
    this.subjects = this.getSubjectsFromBook;
    console.log("Available subjects:", this.subjects);
  },
};
</script>

<style scoped>
.description-cell {
  max-width: 200px;
}

.font-mono {
  font-family: "Courier New", monospace;
}

/* Table hover effects */
.v-data-table >>> .v-data-table__tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Custom chip styles */
.v-chip.v-chip--size-small {
  font-size: 0.75rem;
}

.v-chip.v-chip--size-x-small {
  font-size: 0.625rem;
}
</style>
