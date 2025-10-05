<template>
  <div class="pdf-reader">
    <div v-if="isLoading" class="loading">
      <p>Đang tải PDF...</p>
    </div>

    <template v-else>
      <!-- Hiển thị thông báo nếu chưa mua và đang ở giới hạn -->
      <div
        v-if="!isPurchased && currentPage >= previewLimit"
        class="purchase-overlay"
      >
        <div class="purchase-box">
          <h2>🔒 Bạn đã xem hết phần dùng thử</h2>
          <p>Chỉ có thể xem {{ previewLimit }} trang đầu tiên</p>
          <p class="highlight">
            Mua sách để đọc toàn bộ {{ totalPages }} trang
          </p>
          <button class="btn-purchase" @click="goToPurchase">
            💳 Mua ngay
          </button>
        </div>
      </div>

      <div class="controls">
        <button @click="prevPage" :disabled="!hasPdf || currentPage <= 1">
          ⬅️ Trang trước
        </button>
        <span class="page-info">
          {{ currentPage }} / {{ isPurchased ? totalPages : previewLimit }}
          <span v-if="!isPurchased" class="demo-badge">DEMO</span>
        </span>
        <button @click="nextPage" :disabled="!hasPdf || !canGoNext">
          Trang sau ➡️
        </button>
      </div>

      <div class="pdf-viewer">
        <canvas ref="pdfCanvas" class="pdf-canvas"></canvas>
      </div>
    </template>
  </div>
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
            reject(new Error("PDF.js không load được"));
            return;
          }
          this.configurePdfJs();
          resolve();
        };

        script.onerror = () =>
          reject(new Error("Không thể tải PDF.js library"));
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
        if (!this.pdfjsLib) throw new Error("PDF.js chưa được load");

        const loadingTask = this.pdfjsLib.getDocument(this.pdfUrl);
        this.pdfDoc = await loadingTask.promise;

        this.totalPages = this.pdfDoc.numPages;
        this.hasPdf = true;
        this.isLoading = false;

        await this.$nextTick();
        await this.renderPage(this.currentPage);
      } catch (err) {
        console.error("❌ Lỗi khi load PDF:", err.message);
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
        console.error(`❌ Lỗi render trang ${num}:`, err.message);
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #666;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f4f4f4;
  border-bottom: 1px solid #ddd;
}

button {
  padding: 8px 16px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #357abd;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-info {
  font-weight: 600;
  color: #333;
  min-width: 80px;
  text-align: center;
}

.pdf-viewer {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #e9ecef;
  overflow: auto;
  padding: 20px;
}

.pdf-canvas {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 100%;
  height: auto;
}

/* Purchase Overlay */
.purchase-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.purchase-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.purchase-box h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 24px;
}

.purchase-box p {
  color: #666;
  margin-bottom: 10px;
  font-size: 16px;
}

.purchase-box .highlight {
  color: #4a90e2;
  font-weight: 600;
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: 25px;
}

.btn-purchase {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-purchase:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.demo-badge {
  background: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
