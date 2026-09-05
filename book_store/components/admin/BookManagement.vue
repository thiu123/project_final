<template>
  <div class="book-management">
    <!-- Header Actions -->
    <div class="mb-6 rounded-2xl border border-border bg-card shadow-sm">
      <div class="p-6">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 class="mb-2 text-3xl font-bold text-foreground">Book List</h2>
            <p class="mb-0 text-base text-muted-foreground">
              Manage book information in the system
            </p>
          </div>

          <div class="flex items-center gap-3">
            <UiButton
              class="bg-customyellow text-customblack transition-transform hover:-translate-y-px hover:bg-customyellow/90"
              @click="openAddDialog"
            >
              <Plus class="h-4 w-4" />
              Add Book
            </UiButton>

            <UiButton
              variant="outline"
              class="border-waterblue text-waterblue hover:bg-waterblue/10 hover:text-waterblue"
              :loading="loading"
              @click="refreshBooks"
            >
              <RefreshCw v-if="!loading" class="h-4 w-4" />
              Refresh
            </UiButton>
          </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-12 items-center gap-4">
          <div class="col-span-12 md:col-span-4">
            <UiInput v-model="search" placeholder="Search books...">
              <template #prepend>
                <Search class="h-4 w-4" />
              </template>
              <template #append>
                <button
                  v-if="search"
                  type="button"
                  class="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                  @click="search = ''"
                >
                  <X class="h-4 w-4" />
                </button>
              </template>
            </UiInput>
          </div>

          <div class="col-span-12 md:col-span-3">
            <div class="flex items-center gap-1">
              <UiSelect
                :model-value="filterSubject"
                @update:model-value="filterSubject = ($event as string) || undefined"
              >
                <UiSelectTrigger class="w-full capitalize">
                  <UiSelectValue placeholder="Filter by category" />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem
                    v-for="subject in subjects"
                    :key="subject"
                    :value="subject"
                    class="capitalize"
                  >
                    {{ subject }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
              <UiButton
                v-if="filterSubject"
                variant="ghost"
                size="iconSm"
                aria-label="Clear category filter"
                @click="filterSubject = undefined"
              >
                <X class="h-4 w-4" />
              </UiButton>
            </div>
          </div>

          <div class="col-span-12 md:col-span-2">
            <UiSelect
              :model-value="sortBy"
              @update:model-value="sortBy = $event as BookSort"
            >
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Sort by" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <div class="col-span-12 md:col-span-3">
            <div class="flex items-center">
              <UiSwitch v-model="showThemSach" label="Add books" />

              <UiButton
                variant="ghost"
                size="icon"
                class="ml-2"
                aria-label="Advanced filter"
                @click="toggleAdvancedFilter"
              >
                <Filter class="h-5 w-5" />
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Books Table -->
    <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <UiProgress v-if="loading" indeterminate class="h-1 rounded-none" />

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/60 text-left">
            <tr>
              <th class="w-[120px] px-4 py-3 font-medium text-muted-foreground">Book ID</th>
              <th class="w-[300px] px-4 py-3 font-medium text-muted-foreground">Book Title</th>
              <th class="w-[140px] px-4 py-3 text-center font-medium text-muted-foreground">
                Publication Year
              </th>
              <th class="w-[180px] px-4 py-3 font-medium text-muted-foreground">Categories</th>
              <th class="w-[100px] px-4 py-3 text-center font-medium text-muted-foreground">Price</th>
              <th class="w-[100px] px-4 py-3 text-center font-medium text-muted-foreground">Stock</th>
              <th class="w-[100px] px-4 py-3 text-center font-medium text-muted-foreground">Sold</th>
              <th class="w-[250px] px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th class="w-[120px] px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="item in books" :key="item._id" class="hover:bg-muted/40">
              <!-- Book ID -->
              <td class="px-4 py-3">
                <UiBadge class="border-transparent bg-waterblue/15 font-mono text-waterblue">
                  {{ item._id?.slice(-8) || "N/A" }}
                </UiBadge>
              </td>

              <!-- Book Title -->
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div
                    class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      v-if="item?.cover_url"
                      :src="item?.cover_url"
                      :alt="item?.title"
                      class="h-full w-full object-cover"
                    />
                    <BookOpen v-else class="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div>
                    <div class="font-medium">{{ item.title }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ item.authors?.join(", ") || "Unknown Author" }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Publication Year -->
              <td class="px-4 py-3 text-center">
                <UiBadge :variant="getYearColor(item.first_publish_year)">
                  {{ item.first_publish_year || "N/A" }}
                </UiBadge>
              </td>

              <!-- Categories -->
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <UiBadge
                    v-for="(subject, index) in (item.subjects || []).slice(0, 2)"
                    :key="index"
                    class="border-transparent bg-darkgreen/15 capitalize text-darkgreen dark:bg-darkgreen/50 dark:text-whitesmoke"
                  >
                    {{ subject }}
                  </UiBadge>
                  <UiBadge v-if="(item.subjects || []).length > 2" variant="muted">
                    +{{ (item.subjects || []).length - 2 }}
                  </UiBadge>
                </div>
              </td>

              <!-- Price -->
              <td class="px-4 py-3 text-center">
                <div class="text-lg font-bold text-success">${{ item.price || "0" }}</div>
              </td>

              <!-- Stock -->
              <td class="px-4 py-3 text-center">
                <UiBadge :variant="getStockColor(item.stock)" class="font-bold">
                  {{ item.stock || 0 }}
                </UiBadge>
              </td>

              <!-- Sold -->
              <td class="px-4 py-3 text-center">
                <UiBadge variant="success" class="font-bold">
                  <Flame class="h-3 w-3" />
                  {{ item.sold || 0 }}
                </UiBadge>
              </td>

              <!-- Description -->
              <td class="px-4 py-3">
                <UiTooltipProvider :delay-duration="200">
                  <UiTooltip>
                    <UiTooltipTrigger as-child>
                      <div class="max-w-[200px] truncate">
                        {{ item.description || "No description" }}
                      </div>
                    </UiTooltipTrigger>
                    <UiTooltipContent side="top" class="max-w-sm">
                      {{ item.description || "No description" }}
                    </UiTooltipContent>
                  </UiTooltip>
                </UiTooltipProvider>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <UiButton
                    variant="ghost"
                    size="iconSm"
                    class="text-info hover:text-info"
                    aria-label="View book"
                    @click="viewBook(item)"
                  >
                    <Eye class="h-4 w-4" />
                  </UiButton>

                  <UiButton
                    variant="ghost"
                    size="iconSm"
                    class="text-primary hover:text-primary"
                    aria-label="Edit book"
                    @click="editBook(item)"
                  >
                    <Pencil class="h-4 w-4" />
                  </UiButton>

                  <UiButton
                    variant="ghost"
                    size="iconSm"
                    class="text-destructive hover:text-destructive"
                    aria-label="Delete book"
                    @click="confirmDelete(item)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </UiButton>
                </div>
              </td>
            </tr>

            <tr v-if="!books.length">
              <td colspan="9" class="px-4 py-8 text-center text-muted-foreground">
                {{ loading ? "Loading books..." : "No data available" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <div class="text-sm text-muted-foreground">
          Showing {{ books.length }} of {{ pagination.total }} books
        </div>

        <UiPagination
          v-slot="{ page: currentPage }"
          v-model:page="page"
          :total="pagination.total"
          :items-per-page="pagination.limit"
          :sibling-count="1"
          show-edges
          class="mx-0 w-auto justify-end"
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

    <!-- Add/Edit Book Dialog -->
    <UiDialog v-model:open="dialog">
      <UiDialogContent
        hide-close
        class="gap-0 overflow-hidden p-0 sm:max-w-4xl"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <!-- Header -->
        <div class="flex items-center justify-between bg-customblack px-6 py-4 text-white">
          <div class="flex items-center">
            <component :is="isEditing ? Pencil : Plus" class="mr-3 h-6 w-6 text-customyellow" />
            <UiDialogTitle class="text-xl font-medium">{{ dialogTitle }}</UiDialogTitle>
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
            @click="closeDialog"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="max-h-[70vh] overflow-y-auto px-6 py-6">
          <form @submit.prevent="saveBook">
            <!-- Basic Information Section -->
            <div class="mb-6">
              <h3 class="mb-4 flex items-center text-lg font-medium text-primary">
                <Info class="mr-2 h-5 w-5" />
                Basic Information
              </h3>
              <div class="grid grid-cols-12 gap-4">
                <!-- Book Key (auto-generated, readonly) -->
                <div class="col-span-12 md:col-span-6">
                  <UiInput
                    v-model="editedItem.key"
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
                    v-model="editedItem.title"
                    label="Book Title"
                    required
                    :error-message="errors.title?.[0]"
                  >
                    <template #prepend>
                      <BookOpen class="h-4 w-4" />
                    </template>
                  </UiInput>
                </div>

                <!-- Authors (multi-value combobox) -->
                <div class="col-span-12 md:col-span-6">
                  <UiLabel class="mb-1.5 block">Authors</UiLabel>
                  <div
                    class="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring"
                    :class="errors.authors?.length ? 'border-destructive' : 'border-input'"
                  >
                    <UserPen class="h-4 w-4 shrink-0 text-muted-foreground" />
                    <UiBadge
                      v-for="(author, index) in editedItem.authors"
                      :key="index"
                      variant="secondary"
                      class="gap-1"
                    >
                      {{ author }}
                      <button type="button" aria-label="Remove author" @click="removeAuthor(index)">
                        <X class="h-3 w-3" />
                      </button>
                    </UiBadge>
                    <input
                      v-model="authorInput"
                      type="text"
                      class="min-w-[100px] flex-1 bg-transparent py-0.5 outline-none placeholder:text-muted-foreground"
                      placeholder="Add author, press Enter"
                      @keydown.enter.prevent="addAuthor"
                      @blur="addAuthor"
                    />
                  </div>
                  <p v-if="errors.authors?.length" class="mt-1 text-xs text-destructive">
                    {{ errors.authors[0] }}
                  </p>
                </div>

                <!-- Cover Image -->
                <div class="col-span-12 md:col-span-6">
                  <UiLabel class="mb-1.5 flex items-center gap-1.5">
                    <Camera class="h-4 w-4 text-muted-foreground" />
                    Cover Image
                  </UiLabel>
                  <input
                    ref="coverFileInput"
                    type="file"
                    accept="image/*"
                    class="block w-full cursor-pointer rounded-md border border-input bg-background text-sm text-muted-foreground shadow-sm file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
                    @change="onCoverFileChange"
                  />
                  <p v-if="errors.cover_url?.length" class="mt-1 text-xs text-destructive">
                    {{ errors.cover_url[0] }}
                  </p>
                  <!-- Hiển thị URL ảnh hiện tại nếu có -->
                  <div v-if="editedItem.cover_url" class="mt-2">
                    <UiBadge variant="success">
                      <Check class="h-3 w-3" />
                      Image uploaded
                    </UiBadge>
                    <div class="mt-1 text-xs text-muted-foreground">
                      {{ editedItem.cover_url.substring(0, 50)
                      }}{{ editedItem.cover_url.length > 50 ? "..." : "" }}
                    </div>
                  </div>
                </div>

                <!-- Ebook File -->
                <div class="col-span-12 md:col-span-6">
                  <UiLabel class="mb-1.5 flex items-center gap-1.5">
                    <FileText class="h-4 w-4 text-muted-foreground" />
                    Ebook File (PDF, optional)
                  </UiLabel>
                  <input
                    ref="ebookFileInput"
                    type="file"
                    accept="application/pdf"
                    class="block w-full cursor-pointer rounded-md border border-input bg-background text-sm text-muted-foreground shadow-sm file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
                    @change="onEbookFileChange"
                  />
                  <p class="mt-1 text-xs text-muted-foreground">
                    PDF only, max 10MB. Only needed if this book is sold as an ebook
                  </p>
                  <div v-if="editedItem.pdf_url" class="mt-2">
                    <UiBadge variant="success">
                      <Check class="h-3 w-3" />
                      Ebook file uploaded
                    </UiBadge>
                  </div>
                </div>
              </div>
            </div>

            <UiSeparator class="mb-6" />

            <!-- Categories & Classification -->
            <div class="mb-6">
              <h3 class="mb-4 flex items-center text-lg font-medium text-secondary">
                <Tag class="mr-2 h-5 w-5" />
                Categories & Classification
              </h3>
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                  <UiLabel class="mb-1.5 block">Categories</UiLabel>
                  <div
                    class="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm capitalize shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring"
                    :class="errors.subjects?.length ? 'border-destructive' : 'border-input'"
                  >
                    <Tags class="h-4 w-4 shrink-0 text-muted-foreground" />
                    <UiBadge
                      v-for="(subject, index) in editedItem.subjects"
                      :key="index"
                      variant="secondary"
                      class="gap-1 capitalize"
                    >
                      {{ subject }}
                      <button type="button" aria-label="Remove category" @click="removeSubject(index)">
                        <X class="h-3 w-3" />
                      </button>
                    </UiBadge>
                    <input
                      v-model="subjectInput"
                      type="text"
                      list="book-subject-suggestions"
                      class="min-w-[100px] flex-1 bg-transparent py-0.5 outline-none placeholder:text-muted-foreground"
                      placeholder="Add category, press Enter"
                      @keydown.enter.prevent="addSubject"
                      @blur="addSubject"
                    />
                    <datalist id="book-subject-suggestions">
                      <option v-for="subject in subjects" :key="subject" :value="subject" />
                    </datalist>
                  </div>
                  <p v-if="errors.subjects?.length" class="mt-1 text-xs text-destructive">
                    {{ errors.subjects[0] }}
                  </p>
                </div>
              </div>
            </div>

            <UiSeparator class="mb-6" />

            <!-- Publication Details -->
            <div class="mb-6">
              <h3 class="mb-4 flex items-center text-lg font-medium text-info">
                <Calendar class="mr-2 h-5 w-5" />
                Publication Details
              </h3>
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-4">
                  <UiInput
                    v-model="editedItem.first_publish_year"
                    label="Publication Year"
                    type="number"
                    :error-message="errors.first_publish_year?.[0]"
                  >
                    <template #prepend>
                      <Calendar class="h-4 w-4" />
                    </template>
                  </UiInput>
                </div>
              </div>
            </div>

            <UiSeparator class="mb-6" />

            <!-- Pricing, Rating & Description -->
            <div class="mb-6">
              <h3 class="mb-4 flex items-center text-lg font-medium text-success">
                <DollarSign class="mr-2 h-5 w-5" />
                Pricing & Details
              </h3>
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                  <UiInput
                    v-model="editedItem.price"
                    label="Price"
                    type="number"
                    :error-message="errors.price?.[0]"
                  >
                    <template #prepend>
                      <DollarSign class="h-4 w-4" />
                    </template>
                  </UiInput>
                </div>

                <div class="col-span-12 md:col-span-6">
                  <UiInput
                    v-model="editedItem.stock"
                    label="Stock Quantity"
                    type="number"
                    min="0"
                    hint="0 = Out of stock / Ebook only"
                    :error-message="errors.stock?.[0]"
                  >
                    <template #prepend>
                      <Package class="h-4 w-4" />
                    </template>
                  </UiInput>
                </div>

                <div class="col-span-12 md:col-span-6">
                  <UiLabel class="mb-1.5 block">Rating</UiLabel>
                  <UiRating v-model="editedItem.rating" :size="26" />
                  <div class="mt-1 text-xs text-muted-foreground">
                    Rating: {{ editedItem.rating || 0 }}/5 stars
                  </div>
                </div>

                <div class="col-span-12">
                  <UiTextarea
                    v-model="editedItem.description"
                    label="Description"
                    :rows="4"
                    :error-message="errors.description?.[0]"
                  />
                  <div class="mt-1 text-right text-xs text-muted-foreground">
                    {{ (editedItem.description || "").length }} characters
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 border-t border-border bg-muted/50 px-6 py-4">
          <UiButton variant="outline" size="lg" @click="closeDialog">
            <X class="h-4 w-4" />
            Cancel
          </UiButton>
          <UiButton
            size="lg"
            class="bg-customyellow text-customblack transition-transform hover:-translate-y-px hover:bg-customyellow/90"
            :loading="saving"
            @click="saveBook"
          >
            <component :is="isEditing ? Check : Plus" v-if="!saving" class="h-4 w-4" />
            {{ isEditing ? "Update Book" : "Add Book" }}
          </UiButton>
        </div>
      </UiDialogContent>
    </UiDialog>

    <!-- Delete Confirmation Dialog -->
    <UiDialog v-model:open="deleteDialog">
      <UiDialogContent
        hide-close
        class="gap-0 p-0 sm:max-w-lg"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <div class="px-6 pb-8 pt-8 text-center">
          <!-- Icon -->
          <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive">
            <Trash2 class="h-10 w-10 text-white" />
          </div>

          <UiDialogTitle class="mb-4 text-2xl font-bold text-foreground">
            Confirm Deletion
          </UiDialogTitle>

          <!-- Content -->
          <UiDialogDescription class="mb-3 text-base text-foreground">
            Are you sure you want to delete this book?
          </UiDialogDescription>

          <UiAlert variant="warning" class="text-left">
            <div class="font-medium">{{ bookToDelete?.title }}</div>
            <div class="text-xs opacity-80">This action cannot be undone.</div>
          </UiAlert>

          <!-- Actions -->
          <div class="mt-6 flex justify-center gap-3">
            <UiButton
              variant="outline"
              size="lg"
              class="min-w-[100px]"
              @click="deleteDialog = false"
            >
              Cancel
            </UiButton>
            <UiButton
              variant="destructive"
              size="lg"
              class="min-w-[100px]"
              :loading="deleting"
              @click="deleteBookConfirmed"
            >
              <Trash2 v-if="!deleting" class="h-4 w-4" />
              Delete
            </UiButton>
          </div>
        </div>
      </UiDialogContent>
    </UiDialog>

    <!-- View Book Dialog -->
    <UiDialog v-model:open="viewDialog">
      <UiDialogContent hide-close class="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <template v-if="viewedBook">
          <!-- Header with dark background + accent overlay -->
          <div class="relative overflow-hidden bg-customblack">
            <div class="absolute inset-0 bg-gradient-to-br from-customyellow/20 to-transparent"></div>
            <div class="relative flex items-center justify-between p-6 text-white">
              <div class="flex items-center">
                <BookOpen class="mr-3 h-8 w-8" />
                <div>
                  <UiDialogTitle class="text-2xl font-bold">
                    {{ viewedBook.title }}
                  </UiDialogTitle>
                  <UiDialogDescription class="text-base text-white opacity-90">
                    by {{ viewedBook.authors?.join(", ") || "Unknown Author" }}
                  </UiDialogDescription>
                </div>
              </div>
              <button
                type="button"
                class="rounded-md p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
                @click="viewDialog = false"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="max-h-[60vh] overflow-y-auto p-6">
            <div class="grid grid-cols-12 gap-4">
              <!-- Book Cover -->
              <div v-if="viewedBook.cover_url" class="col-span-12 md:col-span-4">
                <div class="text-center">
                  <img
                    :src="viewedBook.cover_url"
                    :alt="viewedBook.title"
                    class="mx-auto aspect-[0.7] w-full max-w-[200px] rounded-lg bg-muted object-cover shadow-md"
                  />
                </div>
              </div>

              <!-- Book Details -->
              <div :class="viewedBook.cover_url ? 'col-span-12 md:col-span-8' : 'col-span-12'">
                <div class="mb-4 rounded-lg bg-waterblue/10 p-4">
                  <div class="mb-2 flex items-center">
                    <DollarSign class="mr-2 h-5 w-5 text-lightgreen" />
                    <span class="text-2xl font-bold text-lightgreen">
                      ${{ viewedBook.price?.toFixed(2) || "0.00" }}
                    </span>
                  </div>

                  <UiBadge class="border-transparent bg-lightgreen text-white">
                    <CheckCircle2 class="h-3 w-3" />
                    Available
                  </UiBadge>
                </div>

                <!-- Details List -->
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <Calendar class="h-5 w-5 shrink-0 text-waterblue" />
                    <div>
                      <div class="text-sm font-medium text-foreground">Publication Year</div>
                      <div class="text-sm text-muted-foreground">
                        {{ viewedBook.first_publish_year || "N/A" }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <Languages class="h-5 w-5 shrink-0 text-waterblue" />
                    <div>
                      <div class="text-sm font-medium text-foreground">Language</div>
                      <div class="text-sm text-muted-foreground">
                        {{ viewedBook.language || "English" }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <FileText class="h-5 w-5 shrink-0 text-waterblue" />
                    <div>
                      <div class="text-sm font-medium text-foreground">Pages</div>
                      <div class="text-sm text-muted-foreground">
                        {{ viewedBook.page_count || "N/A" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Categories Section -->
            <div v-if="viewedBook.subjects?.length" class="mt-4">
              <div class="rounded-lg border border-border p-4">
                <h4 class="mb-3 flex items-center text-base font-bold text-foreground">
                  <Tags class="mr-2 h-5 w-5 text-waterblue" />
                  Categories
                </h4>
                <div class="flex flex-wrap gap-2 capitalize">
                  <UiBadge
                    v-for="subject in viewedBook.subjects"
                    :key="subject"
                    class="border-transparent bg-darkgreen/15 capitalize text-darkgreen dark:bg-darkgreen/50 dark:text-whitesmoke"
                  >
                    {{ subject }}
                  </UiBadge>
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div v-if="viewedBook.description" class="mt-4">
              <div class="rounded-lg border border-border p-4">
                <h4 class="mb-3 flex items-center text-base font-bold text-foreground">
                  <FileText class="mr-2 h-5 w-5 text-waterblue" />
                  Description
                </h4>
                <p class="mb-0 text-sm leading-relaxed">
                  {{ viewedBook.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end border-t border-border bg-muted/50 p-4">
            <UiButton
              size="lg"
              class="min-w-[100px] bg-customblack text-white hover:bg-customblack/90"
              @click="viewDialog = false"
            >
              <Check class="h-4 w-4" />
              Close
            </UiButton>
          </div>
        </template>
      </UiDialogContent>
    </UiDialog>

    <!-- Snackbar Alert -->
    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.text"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";
import {
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Flame,
  Info,
  KeyRound,
  Languages,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Tags,
  Trash2,
  UserPen,
  X,
} from "lucide-vue-next";
import { v4 as uuidv4 } from "uuid";
import { uploadBookImage, uploadBookEbookFile } from "~/api/userApi";
import type { Book, BookSort } from "@/types";
import debounce from "lodash/debounce";

interface BookFormData {
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

type ViewedBook = Book & { language?: string; page_count?: number };

type BadgeVariant = "success" | "warning" | "info" | "destructive" | "muted";

const bookStore = useBookStore();
const { books, pagination, categories } = storeToRefs(bookStore);

// NOTE: the original component declared a local `loading` in data() which
// shadowed the store's `book/loading` state — kept local here on purpose.
const loading = ref(false);
const search = ref("");
const filterSubject = ref<string | undefined>(undefined);
const sortBy = ref<BookSort>("newest");
const showThemSach = ref(true);
const page = ref(1);
const itemsPerPage = 10;

// Dialog states
const dialog = ref(false);
const deleteDialog = ref(false);
const viewDialog = ref(false);

// Form data
const editedIndex = ref(-1);
const editedItem = ref<BookFormData>(getDefaultItem());
const bookToDelete = ref<Book | null>(null);
const viewedBook = ref<ViewedBook | null>(null);

// Combobox inputs + file input refs (replace v-combobox / v-file-input)
const authorInput = ref("");
const subjectInput = ref("");
const coverFileInput = ref<HTMLInputElement | null>(null);
const ebookFileInput = ref<HTMLInputElement | null>(null);

// Form validation
const errors = ref<Record<string, string[]>>({});

// Loading states
const saving = ref(false);
const deleting = ref(false);

const subjects = ref<string[]>([]);

// Values map straight onto the API's `sort` parameter.
const sortOptions: { label: string; value: BookSort }[] = [
  { label: "Recently added", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name A-Z", value: "title_asc" },
  { label: "Name Z-A", value: "title_desc" },
  { label: "Price Low to High", value: "price_asc" },
  { label: "Price High to Low", value: "price_desc" },
  { label: "Best selling", value: "bestselling" },
];

// Notification
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

// Filter options come from the API category tree, not from the current page.
const getSubjectsFromBook = computed(() =>
  categories.value.flatMap((category) => [
    category.subject,
    ...category.subcategories.map((sub) => sub.subject),
  ])
);

const dialogTitle = computed(() =>
  editedIndex.value === -1 ? "Add New Book" : "Edit Book"
);

const isEditing = computed(() => editedIndex.value !== -1);

// Search, category filter, sorting and paging are all resolved by the API,
// so `books` already holds exactly the rows this page renders.

function getDefaultItem(): BookFormData {
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

/**
 * Loads the current page from the API. `withDescription` is set because the
 * edit dialog prefills from the row, and descriptions are stripped by default.
 */
async function refreshBooks() {
  loading.value = true;
  try {
    await bookStore.fetchBooks({
      page: page.value,
      limit: itemsPerPage,
      search: search.value || undefined,
      subject: filterSubject.value || undefined,
      sort: sortBy.value,
      withDescription: true,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    showSnackbar("Failed to load books", "error");
  } finally {
    loading.value = false;
  }
}

function getYearColor(year?: number): BadgeVariant {
  if (!year) return "muted";
  const currentYear = new Date().getFullYear();
  if (year >= currentYear - 5) return "success";
  if (year >= currentYear - 20) return "warning";
  return "destructive";
}

function getStockColor(stock?: number): BadgeVariant {
  if (stock === 0) return "destructive";
  if ((stock ?? 0) <= 10) return "warning";
  if ((stock ?? 0) <= 50) return "info";
  return "success";
}

function openAddDialog() {
  editedIndex.value = -1;
  editedItem.value = getDefaultItem();
  errors.value = {};
  dialog.value = true;
}

function openDialog(action: "add" | "edit", item: Book | null = null) {
  if (action === "add") {
    editedIndex.value = -1;
    editedItem.value = getDefaultItem();
  } else if (action === "edit" && item) {
    editedIndex.value = books.value.findIndex((book) => book._id === item._id);
    editedItem.value = { ...item } as BookFormData;
  }
  errors.value = {};
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = getDefaultItem();
    editedIndex.value = -1;
    errors.value = {};
    authorInput.value = "";
    subjectInput.value = "";
    // Reset file inputs
    if (coverFileInput.value) coverFileInput.value.value = "";
    if (ebookFileInput.value) ebookFileInput.value.value = "";
  });
}

function validateForm() {
  errors.value = {};

  if (!editedItem.value.title?.trim()) {
    errors.value.title = ["Title is required"];
  }

  if (!editedItem.value.authors?.length) {
    errors.value.authors = ["At least one author is required"];
  }

  if (!editedItem.value.cover_url) {
    errors.value.cover_url = ["Cover image is required"];
  }

  if (editedItem.value.price < 0) {
    errors.value.price = ["Price must be non-negative"];
  }

  if (
    editedItem.value.first_publish_year &&
    (editedItem.value.first_publish_year < 1000 ||
      editedItem.value.first_publish_year > new Date().getFullYear() + 1)
  ) {
    errors.value.first_publish_year = ["Please enter a valid publication year"];
  }

  return Object.keys(errors.value).length === 0;
}

function addAuthor() {
  const value = authorInput.value.trim();
  if (value && !editedItem.value.authors.includes(value)) {
    editedItem.value.authors.push(value);
  }
  authorInput.value = "";
}

function removeAuthor(index: number) {
  editedItem.value.authors.splice(index, 1);
}

function addSubject() {
  const value = subjectInput.value.trim();
  if (value && !editedItem.value.subjects.includes(value)) {
    editedItem.value.subjects.push(value);
  }
  subjectInput.value = "";
}

function removeSubject(index: number) {
  editedItem.value.subjects.splice(index, 1);
}

function onCoverFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  handleBookUpload(file);
}

function onEbookFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  handleEbookFileUpload(file);
}

async function handleBookUpload(file: File | null) {
  if (!file) {
    console.log("No file found!");
    return;
  }

  // Validate file type
  if (!file.type || !file.type.startsWith("image/")) {
    console.log("❌ File type validation failed:", file.type);
    showSnackbar("Please select a valid image file", "error");
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showSnackbar("File size must be less than 5MB", "error");
    return;
  }

  try {
    showSnackbar("Uploading image...", "info");
    const response = await uploadBookImage(file);

    if (response.data && response.data.data && response.data.data.url) {
      editedItem.value.cover_url = response.data.data.url;
      showSnackbar("Image uploaded successfully!", "success");
    } else {
      throw new Error("No URL returned from server");
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    console.error("Error response:", error.response);
    showSnackbar(
      "Failed to upload image: " +
        (error.response?.data?.message || error.message || "Unknown error"),
      "error"
    );
  }
}

async function handleEbookFileUpload(file: File | null) {
  if (!file) return;

  if (file.type !== "application/pdf") {
    showSnackbar("Please select a PDF file", "error");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showSnackbar("Ebook file size must be less than 10MB", "error");
    return;
  }

  try {
    showSnackbar("Uploading ebook file...", "info");
    const response = await uploadBookEbookFile(file);

    if (response.data && response.data.data && response.data.data.url) {
      editedItem.value.pdf_url = response.data.data.url;
      showSnackbar("Ebook file uploaded successfully!", "success");
    } else {
      throw new Error("No URL returned from server");
    }
  } catch (error: any) {
    console.error("Ebook upload error:", error);
    showSnackbar(
      "Failed to upload ebook file: " +
        (error.response?.data?.message || error.message || "Unknown error"),
      "error"
    );
  }
}

async function saveBook() {
  if (!validateForm()) return;

  // Check if cover_url is provided
  if (!editedItem.value.cover_url) {
    errors.value.cover_url = ["Please upload a cover image"];
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      await bookStore.updateBook({
        id: editedItem.value._id as string,
        bookData: editedItem.value as Partial<Book>,
      });
      showSnackbar("Book updated successfully");
    } else {
      await bookStore.createBook(editedItem.value as Partial<Book>);
      showSnackbar("Book added successfully");
    }
    closeDialog();
    await refreshBooks();
  } catch (error: any) {
    console.error("Save book error:", error);
    showSnackbar(
      "Failed to save book: " +
        (error.response?.data?.message || error.message || "Unknown error"),
      "error"
    );
  } finally {
    saving.value = false;
  }
}

function viewBook(book: Book) {
  viewedBook.value = book as ViewedBook;
  viewDialog.value = true;
}

function editBook(book: Book) {
  openDialog("edit", book);
}

function confirmDelete(item: Book) {
  bookToDelete.value = item;
  deleteDialog.value = true;
}

async function deleteBookConfirmed() {
  if (!bookToDelete.value) return;

  deleting.value = true;
  try {
    await bookStore.deleteBookById({ id: bookToDelete.value._id });
    showSnackbar("Book deleted successfully");
    deleteDialog.value = false;
    bookToDelete.value = null;
    // Pull the next page's first row up into the gap the deletion left.
    await refreshBooks();
  } catch (error) {
    showSnackbar("Failed to delete book", "error");
  } finally {
    deleting.value = false;
  }
}

function toggleAdvancedFilter() {
  console.log("Toggle advanced filter");
}

function showSnackbar(text: string, color = "success") {
  snackbar.show = true;
  snackbar.text = text;
  snackbar.color = color;
}

watch(dialog, (val) => {
  if (!val) closeDialog();
});

// Paging refetches directly; the watcher below resets to page 1 on filter changes.
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

onMounted(async () => {
  const [categoryList] = await Promise.all([
    bookStore.fetchCategories(),
    refreshBooks(),
  ]);
  void categoryList;
  subjects.value = getSubjectsFromBook.value;
});
</script>
