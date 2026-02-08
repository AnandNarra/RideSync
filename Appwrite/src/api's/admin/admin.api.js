import axios from "axios";
import axiosInstance from "../axiosInstance";

const URL = `${import.meta.env.VITE_API_BASE_URL}`;


export const getAllDriverRequests = async () => {
  const response = await axiosInstance.get('/api/v1/drivers')
  return response.data;
}


export const updateDriverRequestStatus = async ({ driverId, status, rejectedReason }) => {
  const payload = { status };
  if (rejectedReason) {
    payload.rejectedReason = rejectedReason;
  }

  const response = await axiosInstance.patch(`/api/v1/drivers/${driverId}`, payload)
  return response.data
}


