import axiosInstance from "../axiosInstance"

export const publishRide = async (payload) =>{

    const response = await axiosInstance.post('/api/v1/rides',payload);
    return response.data;
}

export const getMyRides = async () => {
  const response = await axiosInstance.get("/api/v1/rides/my");
  return response.data;
};