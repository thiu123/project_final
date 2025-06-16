import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getBooksBySubject = (subject) => {
  return axios.get(`${API_URL}/books`, {
    params: { subject },
  });
};
