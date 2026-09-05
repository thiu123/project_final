import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { User } from "@/types";

const BASE_URL = API_ENDPOINTS.USERS;

export const getAllUsers = () => {
  return axiosInstance.get<User[]>(BASE_URL);
};

export const deleteUser = (userId: string) => {
  return axiosInstance.delete(`${BASE_URL}/${userId}`);
};

// Upload avatar image
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return axiosInstance.post(`${BASE_URL}/upload-images?type=avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Upload book cover image
export const uploadBookImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return axiosInstance.post(`${BASE_URL}/upload-images?type=book`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Upload ebook file (pdf)
export const uploadBookEbookFile = (file: File) => {
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
