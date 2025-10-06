import {
  createContact,
  getUserContacts,
  getAllContacts,
  getContactById,
  deleteContact,
} from "@/api/contactApi";

export default {
  namespaced: true,
  state: () => ({
    contacts: [],
    userContacts: [],
    currentContact: null,
    loading: false,
    error: null,
  }),

  mutations: {
    setLoading(state, loading) {
      state.loading = loading;
    },
    setError(state, error) {
      state.error = error;
    },
    setContacts(state, contacts) {
      state.contacts = contacts;
    },
    setUserContacts(state, contacts) {
      state.userContacts = contacts;
    },
    setCurrentContact(state, contact) {
      state.currentContact = contact;
    },
    addContact(state, contact) {
      state.userContacts.unshift(contact);
    },
    updateContact(state, updatedContact) {
      const index = state.contacts.findIndex(
        (c) => c._id === updatedContact._id
      );
      if (index !== -1) {
        state.contacts.splice(index, 1, updatedContact);
      }
    },
    removeContact(state, id) {
      state.contacts = state.contacts.filter((c) => c._id !== id);
    },
  },

  actions: {
    async createContact({ commit }, message) {
      try {
        commit("setLoading", true);
        commit("setError", null);
        const res = await createContact(message);
        commit("addContact", res.data.data);
        return res.data;
      } catch (error) {
        commit("setError", error.response?.data?.message || error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async fetchUserContacts({ commit }) {
      try {
        commit("setLoading", true);
        commit("setError", null);
        const res = await getUserContacts();
        commit("setUserContacts", res.data.data);
        return res.data;
      } catch (error) {
        commit("setError", error.response?.data?.message || error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async fetchAllContacts({ commit }) {
      try {
        commit("setLoading", true);
        commit("setError", null);
        const res = await getAllContacts();
        commit("setContacts", res.data.data);
        return res.data;
      } catch (error) {
        commit("setError", error.response?.data?.message || error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async fetchContactById({ commit }, id) {
      try {
        commit("setLoading", true);
        commit("setError", null);
        const res = await getContactById(id);
        commit("setCurrentContact", res.data.data);
        return res.data;
      } catch (error) {
        commit("setError", error.response?.data?.message || error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async deleteContact({ commit }, id) {
      try {
        commit("setLoading", true);
        commit("setError", null);
        const res = await deleteContact(id);
        commit("removeContact", id);
        return res.data;
      } catch (error) {
        commit("setError", error.response?.data?.message || error.message);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
  },

  getters: {},
};
