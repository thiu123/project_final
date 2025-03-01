import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    currentUser: "",
    isFetching: false,
    error: false,
  }),
  mutations: {
    loginStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess(state, user) {
      state.currentUser = user;
      state.isFetching = false;
      state.error = false;
    },
    loginFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
    registerStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    registerSuccess(state) {
      state.isFetching = false;
      state.error = false;
    },
    registerFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
  },
  actions: {
    async login({ commit }, user) {
      try {
        commit("loginStart");
        const res = await axios.post(
          "http://localhost:5000/api/auth/login",
          user
        );
        commit("loginSuccess", res.data);
        return res.data;
      } catch (error) {
        commit("loginFailure");
        console.error(
          "Login error:",
          error.response ? error.response.data : error.message
        );
        throw error;
      }
    },
    async register(_, user) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/register",
          user
        );
        return res.data;
      } catch (error) {
        throw error.response.data;
      }
    },
  },
};
