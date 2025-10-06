import { createStore } from "vuex";
import auth from "./auth";
import book from "./book";
import cart from "./cart";
import review from "./review";
import order from "./order";
import favorite from "./favorite";
import contact from "./contact";

const store = createStore({
  modules: {
    auth,
    book,
    cart,
    review,
    order,
    favorite,
    contact,
  },
});

export default store;
