import { createStore } from "vuex";
import auth from "./auth";
import movies from "./movies";
import info from "./info";
import movieDetails from "./movieDetails";
const store = createStore({
  modules: {
    auth,
    movies,
    info,
    movieDetails
  },
});

export default store;
