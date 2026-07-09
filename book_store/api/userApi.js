import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const BASE_URL = API_ENDPOINTS.USERS;

export const getAllUsers = () => {
  return axiosInstance.get(BASE_URL);
};

export const deleteUser = (userId) => {
  return axiosInstance.delete(`${BASE_URL}/${userId}`);
};

// Hàm upload avatar
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axiosInstance.post(`${BASE_URL}/upload-images?type=avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Hàm upload book image
export const uploadBookImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axiosInstance.post(`${BASE_URL}/upload-images?type=book`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Hàm upload file ebook (pdf)
export const uploadBookEbookFile = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axiosInstance.post(
    `${BASE_URL}/upload-images?type=ebook_file`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};
