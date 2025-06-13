import { createStore } from "vuex";
import auth from "./auth";
import book from "./book";
import cart from "./cart";
const store = createStore({
  modules: {
    auth,
    book,
    cart
  },
});

export default store;
