import { createStore } from "vuex";
import auth from "./auth";
import book from "./book";
import cart from "./cart";
import review from "./review";
import order from "./order";
import favorite from "./favorite";

const store = createStore({
  modules: {
    auth,
    book,
    cart,
    review,
    order,
    favorite,
  },
});

export default store;
