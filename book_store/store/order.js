// src/store/modules/order.js

import orderApi from "@/api/orderApi";

export default {
  namespaced: true,
  state: {
    cartItems: [],
    total: 0,
    orderStatus: "",
    order: null, // order detail
    userOrders: [], // all orders of user
    purchasedEbooks: {}, // { bookId: true/false }
  },
  mutations: {
    setCart(state, { items, total }) {
      state.cartItems = items;
      state.total = total;
    },
    setOrder(state, order) {
      state.order = order;
    },
    setUserOrders(state, orders) {
      state.userOrders = orders;
    },
    setEbookPurchaseStatus(state, { bookId, isPurchased }) {
      state.purchasedEbooks[bookId] = isPurchased;
    },
  },
  actions: {
    async fetchCartPreview({ commit }) {
      try {
        const { items, total } = await orderApi.getCartPreview();
        commit("setCart", { items, total });
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    },

    async fetchUserOrders({ commit }) {
      try {
        const orders = await orderApi.getUserOrders();
        commit("setUserOrders", orders);
        return orders;
      } catch (error) {
        console.error("Error loading user orders:", error);
      }
    },

    async createOrder(_, voucherCode = null) {
      try {
        const { paymentUrl } = await orderApi.createOrderFromCart(voucherCode);
        return paymentUrl;
      } catch (error) {
        console.error("Error creating order:", error);
      }
    },

    async createMomoOrder(_, voucherCode = null) {
      try {
        const { paymentUrl } = await orderApi.createMomoOrderFromCart(
          voucherCode
        );
        return paymentUrl;
      } catch (error) {
        console.error("Error creating MoMo order:", error);
      }
    },

    async fetchOrderById({ commit }, id) {
      try {
        const order = await orderApi.getOrderById(id);
        commit("setOrder", order);
        return order;
      } catch (error) {
        console.error("Error when retrieving order information:", error);
      }
    },

    async checkEbookPurchase({ commit }, bookId) {
      try {
        const response = await orderApi.checkEbookPurchase(bookId);
        const isPurchased = response.isPurchased;

        // Lưu vào state
        commit("setEbookPurchaseStatus", { bookId, isPurchased });

        return isPurchased;
      } catch (error) {
        console.error("Error checking ebook purchase:", error);
        // Nếu lỗi, mặc định là chưa mua
        commit("setEbookPurchaseStatus", { bookId, isPurchased: false });
        return false;
      }
    },
  },
};
