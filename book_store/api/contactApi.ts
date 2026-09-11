import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Contact } from "@/types";

const API_URL = API_ENDPOINTS.CONTACT;

export interface ContactListResponse {
  data: Contact[];
}

export interface ContactResponse {
  data: Contact;
}

// Create contact
export const createContact = async (message: string) => {
  return await axiosInstance.post<ContactResponse>(API_URL, { message });
};

// Get user's contacts
export const getUserContacts = async () => {
  return await axiosInstance.get<ContactListResponse>(`${API_URL}/user`);
};

// Get all contacts (Admin)
export const getAllContacts = async () => {
  return await axiosInstance.get<ContactListResponse>(API_URL);
};

// Delete contact (Admin)
export const deleteContact = async (id: string) => {
  return await axiosInstance.delete(`${API_URL}/${id}`);
};
