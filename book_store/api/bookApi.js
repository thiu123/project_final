import axios from "axios";

const API_URL = "http://localhost:5000/api/books";

export const getBooksBySubject = (subject, half = false) => {
  return axios.get(API_URL, {
    params: {
      subject,
      half: half ? "true" : undefined,
    },
  });
};

export const searchBooksByTitle = (title) => {
  return axios.get(`${API_URL}/search`, {
    params: { title },
  });
};
