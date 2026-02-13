import axios from "axios";
import axiosInstance from "../axiosInstance";

const URL = `${import.meta.env.VITE_API_BASE_URL}`;

export const registerUser = async (payload) => {
  const { data } = await axios.post(`${URL}/api/v1/register`, payload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
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

export const logout = async () => {
  const response = await axiosInstance.post('/api/v1/logout');
  return response.data
}

export const getMyDriverStatus = async () => {
  const response = await axiosInstance('/api/v1/myDriverStatus');
  return response.data;
};

export const getMyProfile = async () => {
  const response = await axiosInstance.get('/api/v1/my-profile');
  return response.data;
};

export const updateUserProfile = async (payload) => {
  const { data } = await axiosInstance.patch('/api/v1/update-profile', payload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};
