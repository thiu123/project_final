import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const API_URL = API_ENDPOINTS.CONTACT;

// Create contact
export const createContact = async (message) => {
  return await axiosInstance.post(API_URL, { message });
};

// Get user's contacts
export const getUserContacts = async () => {
  return await axiosInstance.get(`${API_URL}/user`);
};

// Get all contacts (Admin)
export const getAllContacts = async () => {
  return await axiosInstance.get(API_URL);
};

// Get contact by ID
export const getContactById = async (id) => {
  return await axiosInstance.get(`${API_URL}/${id}`);
};

// Delete contact (Admin)
export const deleteContact = async (id) => {
  return await axiosInstance.delete(`${API_URL}/${id}`);
};
