<template>
  <div class="pdf-reader">
    <div v-if="isLoading" class="loading">
      <p>Đang tải PDF...</p>
    </div>

    <template v-else>
      <div class="controls">
        <button @click="prevPage" :disabled="!hasPdf || currentPage <= 1">
          ⬅️ Trang trước
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="!hasPdf || currentPage >= totalPages"
        >
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
  name: "PdfReader",
  
  props: {
    pdfUrl: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      // ⚠️ KHÔNG lưu pdfDoc trong data() vì Vue sẽ làm nó reactive
      currentPage: 1,
      totalPages: 0,
      isLoading: true,
      hasPdf: false,
      scale: 1.25,
    };
  },

  mounted() {
    console.log("📄 Component mounted");
    console.log("📄 PDF URL:", this.pdfUrl);
    this.initPdfReader();
  },

  methods: {
    async initPdfReader() {
      console.log("🔄 Bắt đầu khởi tạo PDF Reader...");

      if (import.meta.client) {
        await this.loadPdfJsLibrary();
        await this.loadPdfDocument();
      } else {
        console.warn("⚠️ Không phải client side, bỏ qua load PDF");
      }
    },

    loadPdfJsLibrary() {
      return new Promise((resolve, reject) => {
        console.log("📚 Đang load PDF.js library...");
        
        // Kiểm tra xem đã load chưa
        if (window.pdfjsLib) {
          console.log("✅ PDF.js đã có sẵn trong window");
          this.pdfjsLib = window.pdfjsLib;
          this.configurePdfJs();
          resolve();
          return;
        }

        // Tạo script tag để load PDF.js
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.async = true;

        script.onload = () => {
          console.log("✅ PDF.js script loaded");
          
          setTimeout(() => {
            this.pdfjsLib = window.pdfjsLib;
            
            if (!this.pdfjsLib) {
              console.error("❌ pdfjsLib không tồn tại trên window");
              reject(new Error("PDF.js không load được"));
              return;
            }
            
            console.log("✅ pdfjsLib đã sẵn sàng");
            this.configurePdfJs();
            resolve();
          }, 50);
        };

        script.onerror = () => {
          console.error("❌ Không thể tải PDF.js library");
          reject(new Error("Không thể tải PDF.js library"));
        };

        document.head.appendChild(script);
      });
    },

    configurePdfJs() {
      if (this.pdfjsLib) {
        this.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        console.log("⚙️ Đã cấu hình PDF.js worker");
      }
    },

    async loadPdfDocument() {
      try {
        console.log("📖 Đang load PDF document...");
        
        if (!this.pdfjsLib) {
          throw new Error("PDF.js library chưa được load");
        }

        const loadingTask = this.pdfjsLib.getDocument(this.pdfUrl);
        console.log("⏳ Loading task created:", loadingTask);
        
        // ⚠️ Lưu vào this (không reactive) thay vì data()
        this.pdfDoc = await loadingTask.promise;
        
        console.log("✅ PDF Document loaded:", this.pdfDoc);
        console.log("📊 Total pages:", this.pdfDoc.numPages);
        console.log("📊 PDF Info:", {
          numPages: this.pdfDoc.numPages,
          fingerprints: this.pdfDoc.fingerprints,
        });

        this.totalPages = this.pdfDoc.numPages;
        this.hasPdf = true;
        this.isLoading = false;

        console.log("✅ State updated - totalPages:", this.totalPages);
        console.log("✅ State updated - hasPdf:", this.hasPdf);

        // Đợi DOM update xong trước khi render
        await this.$nextTick();
        console.log("✅ DOM đã update, canvas sẵn sàng");
        await this.renderPage(this.currentPage);
      } catch (err) {
        console.error("❌ Lỗi khi load PDF:", err);
        console.error("❌ Chi tiết lỗi:", {
          message: err.message,
          stack: err.stack,
        });
        this.isLoading = false;
      }
    },

    async renderPage(num) {
      if (!this.pdfDoc || !this.$refs.pdfCanvas) {
        console.warn("⚠️ Không thể render - pdfDoc hoặc canvas chưa sẵn sàng");
        return;
      }

      try {
        console.log(`🎨 Đang render trang ${num}...`);
        
        // ⚠️ Gọi trực tiếp this.pdfDoc.getPage (không có reactivity)
        const page = await this.pdfDoc.getPage(num);
        console.log("✅ Page object:", page);
        
        const canvas = this.$refs.pdfCanvas;
        const ctx = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: this.scale });

        console.log("📐 Viewport:", {
          width: viewport.width,
          height: viewport.height,
          scale: this.scale,
        });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        console.log(`✅ Đã render xong trang ${num}`);
      } catch (err) {
        console.error("❌ Lỗi khi render trang:", err);
        console.error("❌ Chi tiết lỗi render:", {
          page: num,
          message: err.message,
          stack: err.stack,
        });
      }
    },

    async nextPage() {
      console.log("➡️ Next page clicked");
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        console.log("📄 Moving to page:", this.currentPage);
        await this.renderPage(this.currentPage);
      }
    },

    async prevPage() {
      console.log("⬅️ Prev page clicked");
      if (this.currentPage > 1) {
        this.currentPage--;
        console.log("📄 Moving to page:", this.currentPage);
        await this.renderPage(this.currentPage);
      }
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
</style>