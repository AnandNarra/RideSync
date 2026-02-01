import axios from "axios";

const URL = "http://localhost:5000";

export const registerUser = async (payload) => {
  const { data } = await axios.post(`${URL}/api/v1/register`, payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await axios.post(`${URL}/api/v1/login`, payload);
  return data;
};
