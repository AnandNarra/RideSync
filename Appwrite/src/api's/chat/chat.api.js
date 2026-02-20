import axiosInstance from "../axiosInstance";

export const getMessages = async (bookingId) => {
    const response = await axiosInstance.get(`/api/v1/chat/${bookingId}`);
    return response.data;
};

export const sendMessage = async ({ bookingId, text }) => {
    const response = await axiosInstance.post(`/api/v1/chat/${bookingId}`, { text });
    return response.data;
};
