// src/store/modules/order.js

import orderApi from "@/api/orderApi";

export default {
  namespaced: true,
  state: {
    cartItems: [],
    total: 0,
    orderStatus: "",
    order: null
  },
  mutations: {
    setCart(state, { items, total }) {
      state.cartItems = items;
      state.total = total;
    },
    setOrder(state, order) {
      state.order = order;
    } 
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

    async createOrder() {
      try {
        const { paymentUrl } = await orderApi.createOrderFromCart();
        return paymentUrl;
      } catch (error) {
        console.error("Error creating order:", error);
      }
    },

    async fetchOrderById({ commit }, id) {
      try {
        const order = await orderApi.getOrderById(id);
        commit("setOrder", order.data);
        return order;
      } catch (error) {
        console.error("Error when retrieving order information:", error);
      }
    },
  },
};
