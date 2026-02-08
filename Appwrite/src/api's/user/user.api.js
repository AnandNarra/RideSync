import axios from "axios";
import axiosInstance from "../axiosInstance";

const URL = `${import.meta.env.VITE_API_BASE_URL}`;

export const registerUser = async (payload) => {
  const { data } = await axios.post(`${URL}/api/v1/register`, payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await axios.post(`${URL}/api/v1/login`, payload, { withCredentials: true });
  return data;
};

export const submitDriverRequest = async (payload) => {
  const { data } = await axiosInstance.post('/api/v1/driverRequest', payload, {
    headers: {
      "Content-Type": undefined
    }
  });
  return data;
};



export const getMyDriverStatus = async () => {
  const response = await axiosInstance('/api/v1/myDriverStatus');
  return response.data
}


