import axios from "axios"; 
const BASE_URL = "/api/auth";

export const loginUser = (user) => {
  return axios.post(`${BASE_URL}/login`, user);
};

export const registerUser = (user) => {
  return axios.post(`${BASE_URL}/register`, user);
};