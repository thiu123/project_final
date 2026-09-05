import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  fetchCart as fetchCartApi,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from "@/api/cartApi";
import { validateVoucher, applyVoucher } from "@/api/voucherApi";
import type { Cart, ProductType, Voucher } from "@/types";

export const useCartStore = defineStore("cart", () => {
  const cart = ref<Partial<Cart>>({});
  const appliedVoucher = ref<Voucher | null>(null);
  const voucherDiscount = ref(0);

  const cartTotal = computed(() => {
    return (
      cart.value.items?.reduce((total, item) => {
        return total + (item.bookId?.price || 0) * item.quantity;
      }, 0) || 0
    );
  });

  const finalTotal = computed(() => {
    return Math.max(0, cartTotal.value - voucherDiscount.value);
  });

  async function fetchCart() {
    try {
      // Check if user is logged in
      const token = import.meta.client
        ? localStorage.getItem("accessToken")
        : null;
      if (!token) {
        clearCart();
        return;
      }

      const response = await fetchCartApi();
      cart.value = response.data || {};
    } catch (error) {
      console.error("Failed to fetch cart", error);
      // Clear cart on error (e.g., invalid token)
      clearCart();
    }
  }

  async function addToCart({
    bookId,
    quantity,
    productType,
  }: {
    bookId: string;
    quantity: number;
    productType: ProductType;
  }) {
    try {
      await addToCartApi(bookId, quantity, productType);
      await fetchCart();
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  }

  async function updateCartItem({
    bookId,
    quantity,
  }: {
    bookId: string;
    quantity: number;
  }) {
    try {
      await updateCartItemApi(bookId, quantity);
      await fetchCart();
    } catch (error) {
      console.error("Failed to update cart item", error);
    }
  }

  async function removeCartItem(bookId: string) {
    try {
      await removeCartItemApi(bookId);
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove cart item", error);
    }
  }

  async function validateAndApplyVoucher(voucherCode: string) {
    try {
      // Calculate cart total (including ebook discount)
      const total =
        cart.value.items?.reduce((sum, item) => {
          const price =
            item.productType === "ebook"
              ? (item.bookId?.price || 0) * 0.7
              : item.bookId?.price || 0;
          return sum + price * item.quantity;
        }, 0) || 0;

      // Validate voucher
      const response = await validateVoucher(voucherCode, total);

      if (response.success) {
        appliedVoucher.value = response.data.voucher;
        voucherDiscount.value = response.data.discountAmount;
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error("Failed to validate voucher", error);
      throw error;
    }
  }

  function removeVoucher() {
    appliedVoucher.value = null;
    voucherDiscount.value = 0;
  }

  function clearCart() {
    cart.value = { items: [] };
    appliedVoucher.value = null;
    voucherDiscount.value = 0;
  }

  async function confirmVoucherUsage() {
    try {
      if (appliedVoucher.value) {
        await applyVoucher(appliedVoucher.value.code);
      }
    } catch (error) {
      console.error("Failed to confirm voucher usage", error);
    }
  }

  return {
    cart,
    appliedVoucher,
    voucherDiscount,
    cartTotal,
    finalTotal,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    validateAndApplyVoucher,
    removeVoucher,
    clearCart,
    confirmVoucherUsage,
  };
});
