import axios from "axios";

const BASE_URL = "http://localhost:5000/api/users";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const getAllUsers = () => {
  return axios.get(BASE_URL, {
    headers: {
      token: token(),
    },
  });
};

export const deleteUser = (userId) => {
  return axios.delete(`${BASE_URL}/${userId}`, {
    headers: {
      token: token(),
    },
  });
};

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.post(`${BASE_URL}/upload-images`, formData, {
    headers: {
      token: token(),
      "Content-Type": "multipart/form-data",
    },
  });
};
