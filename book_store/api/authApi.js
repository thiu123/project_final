import axios from "axios";
const BASE_URL = "http://localhost:5000/api/auth";

const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const loginUser = (user) => {
  return axios.post(`${BASE_URL}/login`, user);
};

export const registerUser = (user) => {
  return axios.post(`${BASE_URL}/register`, user);
};

export const loginWithGoogle = (googleToken) => {
  return axios.post(`${BASE_URL}/google`, {
    token: googleToken,
  });
};

export const changePassword = (passwordData) => {
  return axios.put(`${BASE_URL}/change-password`, passwordData, {
    headers: {
      token: token(),
    },
  });
};

export const forgotPassword = (email) => {
  return axios.post(`${BASE_URL}/forgot-password`, { email });
};

export const resetPassword = (resetToken, newPassword) => {
  return axios.post(`${BASE_URL}/reset-password`, {
    token: resetToken,
    newPassword,
  });
};
