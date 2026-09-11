import { defineStore } from "pinia";
import { ref } from "vue";
import {
  createContact as createContactApi,
  getUserContacts,
  getAllContacts,
  deleteContact as deleteContactApi,
} from "@/api/contactApi";
import type { Contact } from "@/types";

export const useContactStore = defineStore("contact", () => {
  const contacts = ref<Contact[]>([]);
  const userContacts = ref<Contact[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function createContact(message: string) {
    try {
      loading.value = true;
      error.value = null;
      const res = await createContactApi(message);
      userContacts.value.unshift(res.data.data);
      return res.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserContacts() {
    try {
      loading.value = true;
      error.value = null;
      const res = await getUserContacts();
      userContacts.value = res.data.data;
      return res.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllContacts() {
    try {
      loading.value = true;
      error.value = null;
      const res = await getAllContacts();
      contacts.value = res.data.data;
      return res.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteContact(id: string) {
    try {
      loading.value = true;
      error.value = null;
      const res = await deleteContactApi(id);
      contacts.value = contacts.value.filter((c) => c._id !== id);
      return res.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    contacts,
    userContacts,
    loading,
    error,
    createContact,
    fetchUserContacts,
    fetchAllContacts,
    deleteContact,
  };
});
