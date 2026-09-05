import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { User } from "@/types";

const BASE_URL = API_ENDPOINTS.AUTH;

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const loginUser = (user: LoginPayload) => {
  return axiosInstance.post<User>(`${BASE_URL}/login`, user);
};

export const registerUser = (user: RegisterPayload) => {
  return axiosInstance.post<User>(`${BASE_URL}/register`, user);
};

export const loginWithGoogle = (googleToken: string) => {
  return axiosInstance.post<User>(`${BASE_URL}/google`, {
    token: googleToken,
  });
};

export const changePassword = (passwordData: ChangePasswordPayload) => {
  return axiosInstance.put(`${BASE_URL}/change-password`, passwordData);
};

export const forgotPassword = (email: string) => {
  return axiosInstance.post(`${BASE_URL}/forgot-password`, { email });
};

export const resetPassword = (resetToken: string, newPassword: string) => {
  return axiosInstance.post(`${BASE_URL}/reset-password`, {
    token: resetToken,
    newPassword,
  });
};
