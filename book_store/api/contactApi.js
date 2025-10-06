import axios from "axios";

const API_URL = "http://localhost:5000/api/contact";

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { headers: { token: `Bearer ${token}` } } : {};
};

// Create contact
export const createContact = async (message) => {
  return await axios.post(API_URL, { message }, getAuthHeader());
};

// Get user's contacts
export const getUserContacts = async () => {
  return await axios.get(`${API_URL}/user`, getAuthHeader());
};

// Get all contacts (Admin)
export const getAllContacts = async () => {
  return await axios.get(API_URL, getAuthHeader());
};

// Get contact by ID
export const getContactById = async (id) => {
  return await axios.get(`${API_URL}/${id}`, getAuthHeader());
};

// Delete contact (Admin)
export const deleteContact = async (id) => {
  return await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};
