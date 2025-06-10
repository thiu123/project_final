<template>
  <v-main class="bg-grey-lighten-4">
    <v-container>
      <v-row>
        <!-- Cart Items Section -->
        <v-col cols="12" md="8">
          <v-card class="mb-4" elevation="2" rounded="lg">
            <v-card-title class="d-flex align-center py-4 px-4">
              <v-icon icon="mdi-cart" color="primary" class="mr-2"></v-icon>
              <span class="text-h5 font-weight-bold"
                >Giỏ Hàng (1 sản phẩm)</span
              >
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-0">
              <!-- Cart Header -->
              <v-row
                class="ma-0 pa-4 bg-grey-lighten-4 text-subtitle-1 font-weight-medium d-none d-sm-flex"
              >
                <v-col cols="6" class="d-flex align-center">
                  <v-checkbox
                    v-model="selectAll"
                    label="Chọn tất cả (1 sản phẩm)"
                    hide-details
                    density="compact"
                  ></v-checkbox>
                </v-col>
                <v-col cols="2" class="text-center">Number</v-col>
                <v-col cols="3" class="text-end">MO</v-col>
                <v-col cols="1"></v-col>
              </v-row>

              <!-- Cart Item -->
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  :elevation="isHovering ? 3 : 0"
                  :class="isHovering ? 'bg-grey-lighten-5' : ''"
                  rounded="0"
                >
                  <v-row class="ma-0 pa-4 align-center">
                    <!-- Checkbox and Image -->
                    <v-col cols="12" sm="6" class="d-flex align-center">
                      <v-checkbox
                        v-model="selectedItems"
                        value="1"
                        hide-details
                        density="compact"
                        class="mr-2"
                      ></v-checkbox>

                      <v-img
                        src="https://via.placeholder.com/100x150"
                        height="100"
                        width="70"
                        class="rounded-lg mr-4"
                        cover
                      ></v-img>

                      <div>
                        <div class="text-subtitle-1 font-weight-medium mb-1">
                          Sword Art Online Progressive Vol 7
                        </div>
                        <div
                          class="text-body-2 text-primary-darken-1 mb-2 d-sm-none"
                        >
                          120.000 ₫
                        </div>
                        <v-chip
                          size="small"
                          color="primary"
                          variant="outlined"
                          class="text-caption"
                          >Light Novel</v-chip
                        >
                      </div>
                    </v-col>

                    <!-- Quantity -->
                    <v-col
                      cols="6"
                      sm="2"
                      class="d-flex justify-center align-center"
                    >
                      <v-btn
                        icon="mdi-minus"
                        variant="outlined"
                        size="small"
                        color="grey"
                        density="comfortable"
                        @click="decreaseQuantity"
                      ></v-btn>

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
                        icon="mdi-plus"
                        variant="outlined"
                        size="small"
                        color="grey"
                        density="comfortable"
                        @click="increaseQuantity"
                      ></v-btn>
                    </v-col>

                    <!-- Price -->
                    <v-col cols="4" sm="3" class="text-end d-none d-sm-block">
                      <div
                        class="text-subtitle-1 font-weight-bold text-primary-darken-1"
                      >
                        120.000 ₫
                      </div>
                    </v-col>

                    <!-- Delete Button -->
                    <v-col cols="2" sm="1" class="text-end">
                      <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        color="grey-darken-1"
                        size="small"
                        @click="confirmDelete = true"
                      >
                        <v-tooltip activator="parent" location="top"
                          >Xóa</v-tooltip
                        >
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-hover>

              <v-divider></v-divider>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Order Summary Section -->
        <v-col cols="12" md="4">
          <!-- Promotions Card -->
          <v-card class="mb-4" elevation="2" rounded="lg">
            <v-card-title class="py-3 px-4 bg-primary-lighten-5">
              <v-icon
                icon="mdi-ticket-percent"
                color="primary"
                class="mr-2"
              ></v-icon>
              <span class="font-weight-bold">KHUYẾN MÃI</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                prepend-icon="mdi-chevron-right"
                class="text-caption"
              >
                Xem thêm
              </v-btn>
            </v-card-title>

            <v-card-text class="pa-0">
              <!-- Discount Code -->
              <div class="pa-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="font-weight-bold">MÃ GIẢM 20%</div>
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    density="compact"
                    class="text-caption"
                  >
                    Chi tiết
                  </v-btn>
                </div>

                <div class="text-caption text-grey-darken-1 mb-3">
                  Cho đơn hàng từ 720K - Không áp dụng cho Phiếu Quà Tặng - Hiệu
                  lực ngày 20.12.2022 - 27.12.2022
                </div>

                <div class="d-flex gap-2">
                  <v-text-field
                    placeholder="Nhập mã khuyến mãi"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="flex-grow-1"
                  ></v-text-field>

                  <v-btn color="primary" variant="elevated"> Mua Thêm </v-btn>
                </div>
              </div>

              <v-divider></v-divider>

              <!-- Free Shipping -->
              <div class="pa-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="font-weight-bold">MÃ MIỄN PHÍ GIAO HÀNG</div>
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    density="compact"
                    class="text-caption"
                  >
                    Chi tiết
                  </v-btn>
                </div>

                <div class="text-caption text-grey-darken-1 mb-3">
                  Cho đơn hàng từ 500K - Không áp dụng cho Phiếu Quà Tặng - Hiệu
                  lực ngày 21.12.2022
                </div>

                <v-progress-linear
                  model-value="80"
                  color="primary"
                  height="8"
                  rounded
                  class="mb-2"
                ></v-progress-linear>

                <div class="text-caption text-grey-darken-1 mb-3">
                  Đã thỏa mãn điều kiện áp dụng
                </div>

                <v-btn color="primary" variant="elevated" block>
                  Áp dụng
                </v-btn>

                <div
                  class="d-flex align-center mt-3 text-caption text-grey-darken-1"
                >
                  <v-icon
                    icon="mdi-information-outline"
                    size="small"
                    class="mr-1"
                  ></v-icon>
                  Có thể áp dụng đồng thời nhiều mã
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Order Summary Card -->
          <v-card elevation="2" rounded="lg">
            <v-card-title class="py-3 px-4 bg-primary-lighten-5">
              <v-icon icon="mdi-receipt" color="primary" class="mr-2"></v-icon>
              <span class="font-weight-bold">THANH TOÁN</span>
            </v-card-title>

            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between mb-3">
                <span class="text-subtitle-1">Thành tiền</span>
                <span class="text-subtitle-1 font-weight-bold">120.000 ₫</span>
              </div>

              <div class="d-flex justify-space-between mb-4">
                <span class="text-subtitle-1">Tổng số tiền (gồm VAT)</span>
                <span class="text-h6 font-weight-bold text-primary"
                  >120.000 ₫</span
                >
              </div>

              <v-btn
                color="primary"
                size="large"
                block
                elevation="2"
                class="text-h6 font-weight-bold"
              >
                THANH TOÁN
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="confirmDelete" max-width="400">
    <v-card>
      <v-card-title class="text-h5">Xóa sản phẩm</v-card-title>
      <v-card-text
        >Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?</v-card-text
      >
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="confirmDelete = false"
          >Hủy</v-btn
        >
        <v-btn color="error" variant="elevated" @click="deleteItem">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  data() {
    return {
      drawer: false,
      selectAll: true,
      selectedItems: ["1"],
      quantity: 1,
      confirmDelete: false
    }
  },
  methods: {
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    deleteItem() {
      this.confirmDelete = false;
    }
  }
}
</script>