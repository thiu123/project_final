import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const BASE_URL = API_ENDPOINTS.AUTH;

export const loginUser = (user) => {
  return axiosInstance.post(`${BASE_URL}/login`, user);
};

export const registerUser = (user) => {
  return axiosInstance.post(`${BASE_URL}/register`, user);
};

export const loginWithGoogle = (googleToken) => {
  return axiosInstance.post(`${BASE_URL}/google`, {
    token: googleToken,
  });
};

export const changePassword = (passwordData) => {
  return axiosInstance.put(`${BASE_URL}/change-password`, passwordData);
};

export const forgotPassword = (email) => {
  return axiosInstance.post(`${BASE_URL}/forgot-password`, { email });
};

export const resetPassword = (resetToken, newPassword) => {
  return axiosInstance.post(`${BASE_URL}/reset-password`, {
    token: resetToken,
    newPassword,
  });
};
