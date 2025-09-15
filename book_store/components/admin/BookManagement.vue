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
            {{ item.key?.slice(-8) || "N/A" }}
          </v-chip>
        </template>

        <!-- Tên Sách Column -->
        <template v-slot:item.title="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="40" rounded="lg" class="mr-3">
              <v-img :src="item.cover_url" :alt="item.title" cover>
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
              @click="deleteBook(item)"
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
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

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

      subjects: [
        "fiction",
        "romance",
        "manga",
        "history",
        "science",
        "biography",
      ],

      sortOptions: [
        { title: "Newest", value: "newest" },
        { title: "Oldest", value: "oldest" },
        { title: "Name A-Z", value: "name-asc" },
        { title: "Name Z-A", value: "name-desc" },
        { title: "Price Low to High", value: "price-asc" },
        { title: "Price High to Low", value: "price-desc" },
      ],
    };
  },

  computed: {
    ...mapState("book", ["books"]),

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
    ...mapActions("book", ["getAllBooks"]),

    async refreshBooks() {
      this.loading = true;
      try {
        await this.getAllBooks({ subject: null, half: false });
      } catch (error) {
        console.error("Error fetching books:", error);
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

    openAddDialog() {
      // Handle add book
      console.log("Open add book dialog");
    },

    viewBook(book) {
      // Handle view book
      console.log("View book:", book.title);
    },

    editBook(book) {
      // Handle edit book
      console.log("Edit book:", book.title);
    },

    deleteBook(book) {
      // Handle delete book
      console.log("Delete book:", book.title);
    },

    toggleAdvancedFilter() {
      // Handle advanced filter
      console.log("Toggle advanced filter");
    },
  },

  async mounted() {
    await this.refreshBooks();
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
