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

export const submitDriverRequest = async (payload) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.post(`${URL}/api/v1/driverRequest`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getMyDriverStatus = async () => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(`${URL}/api/v1/myDriverStatus`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
