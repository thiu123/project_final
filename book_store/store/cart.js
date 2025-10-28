import {
  fetchCart as fetchCartApi,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from "@/api/cartApi";
import { validateVoucher, applyVoucher } from "@/api/voucherApi";

export default {
  namespaced: true,
  state: {
    cart: {},
    appliedVoucher: null,
    voucherDiscount: 0,
  },
  mutations: {
    setCart(state, cart) {
      state.cart = cart;
    },
    clearCart(state) {
      state.cart = [];
      state.appliedVoucher = null;
      state.voucherDiscount = 0;
    },
    setVoucher(state, { voucher, discount }) {
      state.appliedVoucher = voucher;
      state.voucherDiscount = discount;
    },
    clearVoucher(state) {
      state.appliedVoucher = null;
      state.voucherDiscount = 0;
    },
  },
  actions: {
    async fetchCart({ commit }) {
      try {
        const response = await fetchCartApi();
        commit("setCart", response.data);
      } catch (error) {
        console.error("Failed to fetch cart", error);
      }
    },

    async addToCart({ dispatch }, { bookId, quantity, productType }) {
      try {
        await addToCartApi(bookId, quantity, productType);
        dispatch("fetchCart");
      } catch (error) {
        console.error("Add to cart failed:", error);
      }
    },
    async updateCartItem({ dispatch }, { bookId, quantity }) {
      try {
        await updateCartItemApi(bookId, quantity);
        dispatch("fetchCart");
      } catch (error) {
        console.error("Failed to update cart item", error);
      }
    },

    async removeCartItem({ dispatch }, bookId) {
      try {
        await removeCartItemApi(bookId);
        dispatch("fetchCart");
      } catch (error) {
        console.error("Failed to remove cart item", error);
      }
    },

    async validateAndApplyVoucher({ commit, state }, voucherCode) {
      try {
        // Calculate cart total (including ebook discount)
        const cartTotal =
          state.cart.items?.reduce((total, item) => {
            const price =
              item.productType === "ebook"
                ? (item.bookId?.price || 0) * 0.7
                : item.bookId?.price || 0;
            return total + price * item.quantity;
          }, 0) || 0;

        console.log("Cart total for voucher:", cartTotal);
        console.log("Voucher code:", voucherCode);

        // Validate voucher
        const response = await validateVoucher(voucherCode, cartTotal);

        console.log("Voucher response:", response);

        if (response.success) {
          commit("setVoucher", {
            voucher: response.data.voucher,
            discount: response.data.discountAmount,
          });
          return { success: true, data: response.data };
        }
      } catch (error) {
        console.error("Failed to validate voucher", error);
        throw error;
      }
    },

    removeVoucher({ commit }) {
      commit("clearVoucher");
    },

    async confirmVoucherUsage({ state }) {
      try {
        if (state.appliedVoucher) {
          await applyVoucher(state.appliedVoucher.code);
        }
      } catch (error) {
        console.error("Failed to confirm voucher usage", error);
      }
    },
  },
  getters: {
    cartTotal: (state) => {
      return (
        state.cart.items?.reduce((total, item) => {
          return total + (item.bookId?.price || 0) * item.quantity;
        }, 0) || 0
      );
    },
    finalTotal: (state, getters) => {
      return Math.max(0, getters.cartTotal - state.voucherDiscount);
    },
  },
};
