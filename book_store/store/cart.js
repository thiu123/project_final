import {
  fetchCart as fetchCartApi,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from "@/api/cartApi";

export default {
  namespaced: true,
  state: {
    cart: {},
  },
  mutations: {
    setCart(state, cart) {
      state.cart = cart;
    },
    clearCart(state) {
      state.cart = [];
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

    async addToCart({ dispatch }, { bookId, quantity }) {
      try {
        await addToCartApi(bookId, quantity);
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
  },
};
