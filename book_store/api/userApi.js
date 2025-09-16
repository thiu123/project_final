import axios from "axios";

const BASE_URL = "http://localhost:5000/api/users";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

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
