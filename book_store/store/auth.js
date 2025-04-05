import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    currentUser: import.meta.client
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null,
    accessToken: import.meta.client
      ? localStorage.getItem("accessToken") || ""
      : "",
    isFetching: false,
    error: false,
  }),

  mutations: {
    setAccessToken(state, token) {
      state.accessToken = token;
    },
    loginStart(state) {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess(state, user) {
      state.currentUser = user;
      state.accessToken = user.accessToken || "";
      localStorage.setItem("accessToken", state.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(user));
      state.isFetching = false;
      state.error = false;
    },
    loginFailure(state) {
      state.isFetching = false;
      state.error = true;
    },
    logout(state) {
      state.currentUser = null;
      state.accessToken = "";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
    },
    restoreSession(state) {
      state.currentUser =
        JSON.parse(localStorage.getItem("currentUser")) || null;
      state.accessToken = localStorage.getItem("accessToken") || "";
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
    logout({ commit }) {
      commit("logout");
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
    restoreSession({ commit }) {
      commit("restoreSession");
    },
  },
};
