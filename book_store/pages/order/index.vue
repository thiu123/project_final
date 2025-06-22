<template>
  <v-app>
    <v-main>
      <v-container class="pa-4">
        <!-- Login Alert -->
        <!-- <v-alert
          type="warning"
          variant="tonal"
          class="mb-6"
          icon="mdi-account-alert"
        >
          <template v-slot:text>
            Bạn đã là thành viên? 
            <a href="#" class="text-decoration-underline">Đăng nhập ngay</a>
          </template>
        </v-alert> -->

        <!-- Delivery Information -->
        <v-card class="mb-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-map-marker</v-icon>
            ĐỊA CHỈ GIAO HÀNG
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.fullName"
                  label="Họ và tên người nhận"
                  placeholder="Nhập họ và tên người nhận"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  placeholder="Nhập email"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.phone"
                  label="Số điện thoại"
                  placeholder="Ví dụ: 0979123xxx (10 chữ số)"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.country"
                  label="Quốc gia"
                  :items="['Việt Nam']"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.city"
                  label="Tỉnh/Thành phố"
                  placeholder="Chọn tỉnh/thành phố"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.district"
                  label="Quận/Huyện"
                  placeholder="Chọn quận/huyện"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.ward"
                  label="Phường/Xã"
                  placeholder="Chọn phường/xã"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.address"
                  label="Địa chỉ nhận hàng"
                  placeholder="Nhập địa chỉ giao hàng"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Shipping Method -->
        <v-card class="mb-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-truck</v-icon>
            PHƯƠNG THỨC VẬN CHUYỂN
          </v-card-title>
          <v-card-text class="pa-4">
            <v-radio-group v-model="selectedShipping" hide-details>
              <v-radio
                value="standard"
                color="primary"
              >
                <template v-slot:label>
                  <div>
                    <div class="font-weight-medium">Giao hàng tiêu chuẩn: 22.000 Đ</div>
                    <div class="text-caption text-grey">Dự kiến giao hàng: Thứ sáu 23/12</div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- Payment Methods -->
        <v-card class="mb-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-credit-card</v-icon>
            PHƯƠNG THỨC THANH TOÁN
          </v-card-title>
          <v-card-text class="pa-4">
            <v-radio-group v-model="selectedPayment" hide-details>
              <v-radio value="zalopay" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-img src="" width="24" height="24" class="mr-2"></v-img>
                    <span>Ví ZaloPay</span>
                    <a href="#" class="ml-2 text-primary text-decoration-underline">Chi tiết</a>
                  </div>
                </template>
              </v-radio>
              
              <v-radio value="moca" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-img src="" width="24" height="24" class="mr-2"></v-img>
                    <span>Ví Moca trên ứng dụng Grab</span>
                  </div>
                </template>
              </v-radio>
              
              <v-radio value="shopeepay" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-img src="" width="24" height="24" class="mr-2"></v-img>
                    <span>Ví ShopeePay</span>
                  </div>
                </template>
              </v-radio>
              
              <v-radio value="vnpay" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-img src="" width="24" height="24" class="mr-2"></v-img>
                    <span>VNPay</span>
                    <a href="#" class="ml-2 text-primary text-decoration-underline">Chi tiết</a>
                  </div>
                </template>
              </v-radio>
              
              <v-radio value="momo" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-img src="" width="24" height="24" class="mr-2"></v-img>
                    <span>Ví Momo</span>
                  </div>
                </template>
              </v-radio>
              
              <v-radio value="banking" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-img src="" width="24" height="24" class="mr-2"></v-img>
                    <span>ATM / Internet Banking</span>
                  </div>
                </template>
              </v-radio>
              
              <v-radio value="cash" color="primary">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-img src="" width="24" height="24" class="mr-2"></v-img>
                    <span>Thanh toán bằng tiền mặt khi nhận hàng</span>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- Promotion Code -->
        <v-card class="mb-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-tag</v-icon>
            MÃ KHUYẾN MÃI/MÃ QUÀ TẶNG
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="d-flex gap-2 mb-2">
              <v-text-field
                v-model="promoCode"
                placeholder="Nhập mã khuyến mãi/quà tặng"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
              ></v-text-field>
              <v-btn color="primary" variant="flat">Áp dụng</v-btn>
              <v-btn variant="outlined" color="primary">Chọn mã khuyến mãi</v-btn>
            </div>
            <div class="text-caption text-grey">
              <v-icon size="small" class="mr-1">mdi-information</v-icon>
              Có thể áp dụng đồng thời nhiều mã
            </div>
          </v-card-text>
        </v-card>

        <!-- Additional Options -->
        <v-card class="mb-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-information</v-icon>
            THÔNG TIN KHÁC
          </v-card-title>
          <v-card-text class="pa-4">
            <v-checkbox
              v-model="giftNote"
              label="Ghi chú"
              color="primary"
              hide-details
              class="mb-2"
            ></v-checkbox>
            <v-checkbox
              v-model="invoice"
              label="Xuất hóa đơn GTGT"
              color="primary"
              hide-details
              class="mb-3"
            ></v-checkbox>
            <div class="text-caption">
              <v-icon size="small" class="mr-1">mdi-check</v-icon>
              Bằng việc tiến hành đặt mua, khách hàng đồng ý với các 
              <a href="#" class="text-primary">Điều khoản Giao Dịch Chung</a> được ban hành bởi Sách50: 
              <a href="#" class="text-primary">Điều khoản sử dụng</a> |
              <a href="#" class="text-primary">Chính sách bảo mật thành toán</a> |
              <a href="#" class="text-primary">Chính sách bảo mật thông tin cá nhân</a> |
              <a href="#" class="text-primary">Chính sách vận chuyển</a> |
              <a href="#" class="text-primary">Chính sách Đổi trả - hoàn tiền</a>.
            </div>
          </v-card-text>
        </v-card>

        <!-- Order Review -->
        <v-card class="mb-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-cart</v-icon>
            KIỂM TRA LẠI ĐƠN HÀNG
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="d-flex align-center gap-4 mb-4">
              <v-img
                width="80"
                height="100"
                class="flex-shrink-0"
              ></v-img>
              <div class="flex-grow-1">
                <div class="font-weight-medium mb-1">Sword Art Online Progressive Vol 7</div>
                <div class="d-flex align-center justify-space-between">
                  <span class="text-h6 text-primary">120.000 Đ</span>
                  <div class="d-flex align-center gap-2">
                    <v-btn size="small" variant="outlined" icon="mdi-minus"></v-btn>
                    <span class="px-3">1</span>
                    <v-btn size="small" variant="outlined" icon="mdi-plus"></v-btn>
                  </div>
                  <span class="text-h6">120.000 Đ</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Order Summary -->
        <v-card class="mb-6" elevation="1">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between mb-2">
              <span>Thành tiền</span>
              <span>120.000 Đ</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Phí vận chuyển (Giao hàng tiêu chuẩn)</span>
              <span>22.000 Đ</span>
            </div>
            <v-divider class="my-3"></v-divider>
            <div class="d-flex justify-space-between text-h6 font-weight-bold">
              <span>Tổng số tiền (gồm VAT)</span>
              <span class="text-primary">142.000 Đ</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <div class="d-flex ga-3">
          <v-btn
            variant="outlined"
            size="large"
            prepend-icon="mdi-arrow-left"
            class="flex-grow-1"
          >
            Quay về đơn hàng
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            class="flex-grow-1"
          >
            XÁC NHẬN THANH TOÁN
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  country: 'Việt Nam',
  city: '',
  district: '',
  ward: '',
  address: ''
})

const selectedShipping = ref('standard')
const selectedPayment = ref('cash')
const promoCode = ref('')
const giftNote = ref(false)
const invoice = ref(false)
</script>

<style scoped>
.v-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 16px;
}

.v-radio :deep(.v-selection-control__wrapper) {
  margin-right: 8px;
}

.v-img {
  border-radius: 4px;
}
</style>