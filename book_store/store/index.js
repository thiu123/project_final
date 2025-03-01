import { createStore } from "vuex";
import auth from "./auth";
import book from "./book";
const store = createStore({
  modules: {
    auth,
    book
  },
});

export default store;
