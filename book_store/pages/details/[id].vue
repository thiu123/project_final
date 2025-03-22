<template>
  <div>
    <!-- Main content area -->
    <v-container class="py-4" v-if="!isLoading">
      <div class="d-flex" style="gap: 20px">
        <!-- Left side - Book image -->
        <div
          class="book-image-container"
          style="min-width: 260px; max-width: 260px"
        >
          <v-img
            :src="
              detailsBooks.cover_url || '/placeholder.svg?height=400&width=260'
            "
            alt="Book Cover"
            class="mx-auto rounded-lg"
            height="400"
            width="260"
            cover
          ></v-img>
        </div>

        <!-- Right side - Book details -->
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold mb-2">
            {{ detailsBooks.title }}
          </h1>

          <!-- Author -->
          <div class="mb-1">
            <span class="text-body-1">Tác Giả: </span>
            <v-btn
              variant="text"
              color="primary"
              class="px-1 text-body-1 font-weight-medium"
              density="comfortable"
            >
              {{ detailsBooks.authors?.[0] || "REKI KAWAHARA" }}
            </v-btn>
          </div>

          <!-- Rating -->
          <div class="d-flex align-center mb-2">
            <v-rating
              :model-value="4"
              color="amber"
              density="compact"
              readonly
              size="small"
            ></v-rating>
            <span class="ml-2 text-body-2"
              >({{ detailsBooks.rating_count || 24 }})</span
            >
          </div>

          <!-- Price -->
          <div class="text-h4 font-weight-bold text-primary mb-6">
            {{ detailsBooks.price || "120.000" }} $
          </div>

          <!-- Quantity selector -->
          <div class="d-flex align-center mb-6">
            <v-btn
              icon
              variant="outlined"
              color="primary"
              size="small"
              @click="quantity > 1 ? quantity-- : 1"
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>

            <v-text-field
              v-model="quantity"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              class="mx-2"
              style="max-width: 60px"
              min="1"
            ></v-text-field>

            <v-btn
              icon
              variant="outlined"
              color="primary"
              size="small"
              @click="quantity++"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>

          <!-- Action buttons -->
          <div class="d-flex gap-4 mb-8">
            <v-btn
              color="darkgreen"
              variant="elevated"
              size="large"
              width="180"
              class="text-none mr-2"
            >
              <v-icon start>mdi-cart</v-icon>
              Add to cart
            </v-btn>

            <v-btn
              color="red"
              variant="outlined"
              size="large"
              width="180"
              class="text-none"
            >
              Buy now
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Book details section -->
      <v-sheet class="mt-8 pa-4 rounded-lg" color="darkgreen" elevation="1">
        <h2 class="text-h6 font-weight-bold text-white mb-0">
          THÔNG TIN CHI TIẾT
        </h2>
      </v-sheet>

      <v-sheet class="pa-4">
        <div class="d-flex py-2 border-b">
          <div class="text-body-1 min-width-200">Mã Sách:</div>
          <div class="text-body-1">
            {{ detailsBooks.key?.split("/").pop() || "8935250707640" }}
          </div>
        </div>

        <div class="d-flex py-2 border-b">
          <div class="text-body-1 min-width-200">Nhà Xuất Bản:</div>
          <div class="text-body-1">
            <v-btn
              variant="text"
              color="primary"
              class="px-1 text-body-1"
              density="comfortable"
            >
              {{ detailsBooks.publishers?.[0] || "IPM" }}
            </v-btn>
            <span>, </span>
            <v-btn
              variant="text"
              color="primary"
              class="px-1 text-body-1"
              density="comfortable"
            >
              Hà Nội
            </v-btn>
          </div>
        </div>

        <div class="d-flex py-2 border-b">
          <div class="text-body-1 min-width-200">Tác Giả:</div>
          <div class="text-body-1">
            <v-btn
              variant="text"
              color="primary"
              class="px-1 text-body-1"
              density="comfortable"
            >
              {{ detailsBooks.authors?.[0] || "REKI KAWAHARA" }}
            </v-btn>
          </div>
        </div>

        <div class="d-flex py-2 border-b">
          <div class="text-body-1 min-width-200">Năm Xuất Bản:</div>
          <div class="text-body-1">
            {{ detailsBooks.first_publish_year }}
          </div>
        </div>

        <div class="d-flex py-2 border-b">
          <div class="text-body-1 min-width-200">Ngôn Ngữ:</div>
          <div class="text-body-1">
            <v-btn
              variant="text"
              color="primary"
              class="px-1 text-body-1"
              density="comfortable"
            >
              Tiếng Việt
            </v-btn>
          </div>
        </div>

        <div class="d-flex py-2 border-b">
          <div class="text-body-1 min-width-200">Số Trang:</div>
          <div class="text-body-1">{{ detailsBooks.page_count || "360" }}</div>
        </div>
      </v-sheet>

      <!-- Book description -->
      <div class="mt-4 pa-4">
        <p class="text-body-1" v-if="detailsBooks.description">
          {{
            typeof detailsBooks.description === "object"
              ? detailsBooks.description.value
              : detailsBooks.description
          }}
        </p>
        <p class="text-body-1" v-else>
          Để Thấy Sword Art Online Có Không Gian Kể Chuyện Rất Rộng, Lại Tì Mì
          Đi Theo Từng Tầng, Tạo Cảm Giác Tận Hưởng Rõ Rệt Cho Người Chơi Và Cả
          Người Đọc. Câu Chuyện Hiện Đã Đến Tầng 7, Vẫn Là Tầng Tưng Trải Nghiệm
          Trong Giai Đoạn Chạy Thử Của SAO, Nói Cách Khác, Cho Đến Đây, Kirito
          Vẫn Biết Nhiều Hiểu Rộng Hơn Asuna. Thành Ra Theo Thói Quen, Vừa Tới
          Nơi Asuna Đã Lập Tức Hỏi Cậu Lúc Chơi Nào Ngon. Số Vô Cách Lần Trước,
          Lần Này Kirito Tỏ Ra Thông Thạo Rõ Ràng. Không Phải Cậu Không Muốn Cho
          Cô Biết, Mà Là Tầng Này Dù Để Lại Cho Cậu Vì Cay Đắng Đến Nỗi Tiếm
          Thần Luôn Muốn Chôn Bỏ Hết Thông Tin. Cho Dù Lúc Sắp Ra Bản Đến Ngoài,
          Nhìn Thấy Có Tên Hai Công Đồ Dì, Kirito Mới Khởi Phục Kí Ức. Một Công
          Là Người Ăn Mặc Lam Lũ Mình Đi Dưới Gió Tập Mưa Sa, Hứa Hẹn Hành Trình
          Gặp Chính. Sau Khi Nghe Giải Thích, Asuna Chọn Đường Gió Tập Mưa Sa...
          Tập 7 Chưa Dừng Đôi Chút Suy Luận Điều Tra Dựa Trên Một Manh Mối Vô
          Lý, Gợi Nhớ Không Khí Tập Lắm Thám Tử Của Kirito Khi Gặp Án Mạng Trong
          Khu Vực An Toàn Ở Sword Art Online 008 "Early And Late".
        </p>
      </div>

      <!-- Rating section -->
      <v-sheet class="mt-8 pa-4 rounded-lg" color="darkgreen" elevation="1">
        <h2 class="text-h6 font-weight-bold text-white mb-0">Reviews</h2>
      </v-sheet>

      <v-sheet class="pa-4 d-flex align-center">
        <div class="text-h3 font-weight-bold mr-4">
          4.0<span class="text-h5">/5</span>
        </div>

        <div class="d-flex flex-column gap-1 flex-grow-1">
          <div class="d-flex align-center">
            <v-rating
              :model-value="5"
              color="amber"
              density="compact"
              readonly
              size="small"
            ></v-rating>
            <div class="ml-2">(20)</div>
          </div>
          <div class="d-flex align-center">
            <v-rating
              :model-value="4"
              color="amber"
              density="compact"
              readonly
              size="small"
            ></v-rating>
            <div class="ml-2">(2)</div>
          </div>
          <div class="d-flex align-center">
            <v-rating
              :model-value="3"
              color="amber"
              density="compact"
              readonly
              size="small"
            ></v-rating>
            <div class="ml-2">(2)</div>
          </div>
          <div class="d-flex align-center">
            <v-rating
              :model-value="2"
              color="amber"
              density="compact"
              readonly
              size="small"
            ></v-rating>
            <div class="ml-2">(0)</div>
          </div>
          <div class="d-flex align-center">
            <v-rating
              :model-value="1"
              color="amber"
              density="compact"
              readonly
              size="small"
            ></v-rating>
            <div class="ml-2">(0)</div>
          </div>
        </div>

        <v-btn color="primary" prepend-icon="mdi-pencil"> Viết Đánh Giá </v-btn>
      </v-sheet>
    </v-container>

    <!-- Loading state -->
    <v-container
      v-else
      class="d-flex justify-center align-center"
      style="min-height: 400px"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      detailsBooks: {},
      isLoading: false,
      quantity: 1,
      authors: [],
    };
  },
  methods: {
    async getDetailsBooks() {
      try {
        this.isLoading = true;
        const bookId = this.$route.params.id; // Lấy ID từ URL
        console.log("Book ID:", bookId);

        if (!bookId) {
          throw new Error("Invalid book ID");
        }

        const response = await axios.get(
          `http://localhost:5000/api/books/${bookId}`
        );
        this.detailsBooks = response.data;
        console.log("Fetched Data:", response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        this.isLoading = false;
      }
    },
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    buyNow() {
      // Your existing buy now logic
      console.log("Buy now clicked");
    },
  },
  async mounted() {
    await this.getDetailsBooks();
  },
};
</script>

<style scoped>
.min-width-200 {
  min-width: 200px;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Make sure the rating stars are properly sized */
:deep(.v-rating .v-icon) {
  padding: 0;
}
</style>
