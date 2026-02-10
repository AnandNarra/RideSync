import axiosInstance from "../axiosInstance"

export const publishRide = async (payload) =>{

    const response = await axiosInstance.post('/api/v1/rides',payload);
    return response.data;
}