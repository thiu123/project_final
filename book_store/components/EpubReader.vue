<template>
  <div class="epub-reader">
    <!-- Thanh điều khiển -->
    <div class="controls">
      <button @click="prevPage">⬅️ Prev</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage">Next ➡️</button>
    </div>

    <!-- Viewer hiển thị sách -->
    <div ref="viewer" class="epub-viewer"></div>
  </div>
</template>

<script>
export default {
  name: "EpubReader",
  props: {
    epubUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      book: null,
      rendition: null,
      currentPage: 1,
      totalPages: 1,
    };
  },
  async mounted() {
    if (process.client) {
      const ePub = (await import("epubjs")).default;
      this.book = ePub(this.epubUrl);

      // render book vào viewer
      this.rendition = this.book.renderTo(this.$refs.viewer, {
        width: "100%",
        height: "90vh",
        spread: "none",
      });

      await this.rendition.display();

      // chờ book load
      await this.book.ready;

      // log metadata & spine
      console.log("📘 Metadata:", this.book.package?.metadata);
      console.log("📚 Spine:", this.book.spine);

      // tạo locations (mỗi location ~ 600 ký tự)
      await this.book.locations.generate(1000);

      // ✅ tổng số trang đúng
      this.totalPages = this.book.locations.total;
      console.log("📑 Tổng số trang:", this.totalPages);

      // khi lật trang
      this.rendition.on("relocated", (location) => {
        const page = this.book.locations.locationFromCfi(location.start.cfi);
        this.currentPage = page;
        console.log("👉 Đang ở page:", page, "/", this.totalPages);
      });
    }
  },
  beforeDestroy() {
    if (this.rendition) this.rendition.destroy();
    if (this.book) this.book.destroy();
  },
  methods: {
    nextPage() {
      if (this.rendition) this.rendition.next();
    },
    prevPage() {
      if (this.rendition) this.rendition.prev();
    },
  },
};
</script>

<style scoped>
.epub-reader {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f4f4f4;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.epub-viewer {
  flex: 1;
  background: #fff;
}
</style>
