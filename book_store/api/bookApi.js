import axios from "axios";

const API_URL = "http://localhost:5000/api/books";

export const getBooksBySubject = (subject) => {
  return axios.get(API_URL, {
    params: { subject },
  });
};
