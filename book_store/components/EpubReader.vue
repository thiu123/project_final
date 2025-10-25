<template>
  <v-container fluid class="pdf-reader pa-0">
    <v-overlay
      :model-value="isLoading"
      class="align-center justify-center"
      contained
    >
      <div class="text-center">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
          width="4"
        ></v-progress-circular>
        <p class="text-h6 mt-4">Loading PDF...</p>
      </div>
    </v-overlay>

    <template v-if="!isLoading">
      <!-- Purchase Overlay -->
      <v-dialog
        :model-value="!isPurchased && currentPage >= previewLimit"
        persistent
        max-width="500"
      >
        <v-card class="purchase-card" rounded="xl">
          <v-card-text class="text-center pa-8">
            <div class="lock-icon text-h1 mb-4">🔒</div>
            <h2 class="text-h4 font-weight-bold mb-3">Preview Limit Reached</h2>
            <p class="text-body-1 text-medium-emphasis mb-2">
              You've viewed all {{ previewLimit }} available preview pages
            </p>
            <p class="text-h6 text-primary font-weight-bold my-6">
              Unlock all {{ totalPages }} pages with full access
            </p>
            <v-btn
              color="primary"
              size="x-large"
              rounded="lg"
              variant="flat"
              class="purchase-btn"
              prepend-icon="mdi-credit-card"
              @click="goToPurchase"
            >
              Purchase Full Access
            </v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Controls Bar -->
      <v-toolbar color="white" elevation="1" class="controls-toolbar">
        <v-container class="d-flex align-center justify-space-between px-6">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded="lg"
            :disabled="!hasPdf || currentPage <= 1"
            prepend-icon="mdi-chevron-left"
            @click="prevPage"
            class="nav-btn"
          >
            <span class="d-none d-sm-inline">Previous</span>
          </v-btn>

          <div class="page-info-wrapper py-10 text-center">
            <div class="d-flex align-center justify-center ga-2">
              <span class="current-page text-h4 font-weight-bold text-primary">
                {{ currentPage }}
              </span>
              <span class="text-h5 text-medium-emphasis">/</span>
              <span class="text-h5 text-medium-emphasis">
                {{ isPurchased ? totalPages : previewLimit }}
              </span>
            </div>
            <div
              v-if="!isPurchased"
              class="text-red font-weight-bold"
            >
              PREVIEW
            </div>
          </div>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded="lg"
            :disabled="!hasPdf || !canGoNext"
            append-icon="mdi-chevron-right"
            @click="nextPage"
            class="nav-btn"
          >
            <span class="d-none d-sm-inline">Next</span>
          </v-btn>
        </v-container>
      </v-toolbar>

      <!-- PDF Viewer -->
      <v-main class="pdf-viewer-main">
        <v-container class="d-flex justify-center py-8">
          <v-card elevation="8" rounded="xl" class="canvas-card">
            <canvas ref="pdfCanvas" class="pdf-canvas"></canvas>
          </v-card>
        </v-container>
      </v-main>
    </template>
  </v-container>
</template>

<script>
export default {
  props: {
    pdfUrl: { type: String, required: true },
    isPurchased: { type: Boolean, default: false },
    previewLimit: { type: Number, default: 20 },
    bookId: { type: [String, Number], default: null },
  },

  data() {
    return {
      currentPage: 1,
      totalPages: 0,
      isLoading: true,
      hasPdf: false,
      scale: 1.25,
    };
  },

  computed: {
    canGoNext() {
      return this.isPurchased
        ? this.currentPage < this.totalPages
        : this.currentPage < this.previewLimit &&
            this.currentPage < this.totalPages;
    },
  },

  mounted() {
    this.initPdfReader();
  },

  methods: {
    async initPdfReader() {
      if (import.meta.client) {
        await this.loadPdfJsLibrary();
        await this.loadPdfDocument();
      }
    },

    loadPdfJsLibrary() {
      return new Promise((resolve, reject) => {
        if (window.pdfjsLib) {
          this.pdfjsLib = window.pdfjsLib;
          this.configurePdfJs();
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.async = true;

        script.onload = () => {
          this.pdfjsLib = window.pdfjsLib;
          if (!this.pdfjsLib) {
            reject(new Error("Failed to load PDF.js"));
            return;
          }
          this.configurePdfJs();
          resolve();
        };

        script.onerror = () =>
          reject(new Error("Unable to load PDF.js library"));
        document.head.appendChild(script);
      });
    },

    configurePdfJs() {
      if (this.pdfjsLib) {
        this.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
    },

    async loadPdfDocument() {
      try {
        if (!this.pdfjsLib) throw new Error("PDF.js not loaded");

        const loadingTask = this.pdfjsLib.getDocument(this.pdfUrl);
        this.pdfDoc = await loadingTask.promise;

        this.totalPages = this.pdfDoc.numPages;
        this.hasPdf = true;
        this.isLoading = false;

        await this.$nextTick();
        await this.renderPage(this.currentPage);
      } catch (err) {
        console.error("❌ Error loading PDF:", err.message);
        this.isLoading = false;
      }
    },

    async renderPage(num) {
      if (!this.pdfDoc || !this.$refs.pdfCanvas) return;
      try {
        const page = await this.pdfDoc.getPage(num);
        const canvas = this.$refs.pdfCanvas;
        const ctx = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: this.scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error(`❌ Error rendering page ${num}:`, err.message);
      }
    },

    async nextPage() {
      if (!this.isPurchased && this.currentPage >= this.previewLimit) return;
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        await this.renderPage(this.currentPage);
      }
    },

    async prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        await this.renderPage(this.currentPage);
      }
    },

    goToPurchase() {
      this.$router.push(this.bookId ? `/details/${this.bookId}` : "/");
    },
  },
};
</script>

<style scoped>
.pdf-reader {
  height: 100vh;
  background: linear-gradient(to bottom, #f5f5f5 0%, #e0e0e0 100%);
}

.controls-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.nav-btn {
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3) !important;
  transition: all 0.3s ease !important;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.4) !important;
}

.nav-btn:active:not(:disabled) {
  transform: translateY(0);
}

.page-info-wrapper {
  min-width: 150px;
}

.current-page {
  line-height: 1;
}

.pdf-viewer-main {
  height: calc(100vh - 88px);
  overflow-y: auto;
  background: linear-gradient(to bottom, #f5f5f5 0%, #e0e0e0 100%);
}

.canvas-card {
  padding: 24px;
  background: white;
  transition: all 0.3s ease;
}

.canvas-card:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
}

.pdf-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Purchase Card Animations */
.purchase-card {
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.lock-icon {
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.purchase-btn {
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4) !important;
  transition: all 0.3s ease !important;
}

.purchase-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(var(--v-theme-primary), 0.5) !important;
}

.purchase-btn:active {
  transform: translateY(-1px);
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .nav-btn {
    min-width: 48px !important;
    padding: 0 12px !important;
  }

  .canvas-card {
    padding: 16px;
  }

  .page-info-wrapper {
    min-width: 100px;
  }
}
</style>
