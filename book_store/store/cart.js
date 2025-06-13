import axios from "axios";
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
        const response = await axios.get("http://localhost:5000/api/carts", {
            headers: {
                token: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        commit("setCart", response.data);
        // console.log("Cart fetched successfully:", response.data);
      } catch (error) {
        console.error("Failed to fetch cart", error);
      }
    },
    addToCart({ dispatch }, { bookId, quantity }) {
      const token = localStorage.getItem("accessToken");
    //   console.log("Adding to cart:", bookId, quantity, "with token:", token);
      return axios
        .post(
          "http://localhost:5000/api/carts/add",
          { bookId, quantity },
          {
            headers: {
              token: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          dispatch("fetchCart");
        })
        .catch((error) => {
          console.error("Add to cart failed:", error);
          throw error;
        });
    },

    async updateCartItem({ dispatch }, { bookId, quantity }) {
      try {
        await axios.put("http://localhost:5000/api/carts/update", {
          bookId,
          quantity,
        });
        dispatch("fetchCart");
      } catch (error) {
        console.error("Failed to update cart item", error);
      }
    },
  },
};
