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

// Hàm upload avatar
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.post(`${BASE_URL}/upload-images?type=avatar`, formData, {
    headers: {
      token: token(),
      "Content-Type": "multipart/form-data",
    },
  });
};

// Hàm upload book image
export const uploadBookImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.post(`${BASE_URL}/upload-images?type=book`, formData, {
    headers: {
      token: token(),
      "Content-Type": "multipart/form-data",
    },
  });
};
