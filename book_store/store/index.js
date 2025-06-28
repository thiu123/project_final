import { createStore } from "vuex";
import auth from "./auth";
import book from "./book";
import cart from "./cart";
import review from "./review";
const store = createStore({
  modules: {
    auth,
    book,
    cart,
    review,
    
  },
});

export default store;
