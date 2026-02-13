import axiosInstance from "../axiosInstance"

export const publishRide = async (payload) => {

  const response = await axiosInstance.post('/api/v1/driver/rides', payload);
  return response.data;
}

export const getMyRides = async () => {
  const response = await axiosInstance.get("/api/v1/driver/rides/my");
  return response.data;
};
export const updateRide = async ({ rideId, payload }) => {
  const response = await axiosInstance.patch(`/api/v1/rides/${rideId}`, payload);
  return response.data;
};
export const cancelRide = async (rideId) => {
  const response = await axiosInstance.patch(`/api/v1/driver/rides/${rideId}/cancel`);
  return response.data;
};