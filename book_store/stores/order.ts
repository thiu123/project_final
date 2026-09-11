import { defineStore } from "pinia";
import { ref } from "vue";
import orderApi from "@/api/orderApi";
import type { Order, ShippingAddress } from "@/types";

export const useOrderStore = defineStore("order", () => {
  const order = ref<Order | null>(null); // order detail
  const userOrders = ref<Order[]>([]); // all orders of user
  const purchasedEbooks = ref<Record<string, boolean>>({}); // { bookId: true/false }

  async function fetchUserOrders() {
    try {
      const orders = await orderApi.getUserOrders();
      userOrders.value = orders;
      return orders;
    } catch (error) {
      console.error("Error loading user orders:", error);
    }
  }

  async function createOrder(voucherCode: string | null = null) {
    try {
      const { paymentUrl } = await orderApi.createOrderFromCart(voucherCode);
      return paymentUrl;
    } catch (error) {
      console.error("Error creating order:", error);
    }
  }

  async function createMomoOrder(voucherCode: string | null = null) {
    try {
      const { paymentUrl } = await orderApi.createMomoOrderFromCart(voucherCode);
      return paymentUrl;
    } catch (error) {
      console.error("Error creating MoMo order:", error);
    }
  }

  /**
   * Cash on delivery. Unlike the gateway actions this rethrows: COD has real
   * rejections the buyer must see — an ebook in the cart, an expired voucher —
   * and swallowing them would leave the checkout button silently doing nothing.
   */
  async function createCodOrder(
    shipping: ShippingAddress,
    voucherCode: string | null = null
  ) {
    return orderApi.createCodOrderFromCart(shipping, voucherCode);
  }

  async function fetchOrderById(id: string) {
    try {
      const fetched = await orderApi.getOrderById(id);
      order.value = fetched;
      return fetched;
    } catch (error) {
      console.error("Error when retrieving order information:", error);
    }
  }

  async function checkEbookPurchase(bookId: string) {
    try {
      const response = await orderApi.checkEbookPurchase(bookId);
      const isPurchased = response.isPurchased;

      purchasedEbooks.value[bookId] = isPurchased;

      return isPurchased;
    } catch (error) {
      console.error("Error checking ebook purchase:", error);
      // On error, assume the ebook has not been purchased
      purchasedEbooks.value[bookId] = false;
      return false;
    }
  }

  return {
    order,
    userOrders,
    purchasedEbooks,
    fetchUserOrders,
    createOrder,
    createMomoOrder,
    createCodOrder,
    fetchOrderById,
    checkEbookPurchase,
  };
});
