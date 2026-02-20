import axiosInstance from "../axiosInstance";

export const searchRides = async ({ from, to, seats, date } = {}) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (seats) params.append("seats", seats);
    if (date) params.append("date", date);

    const response = await axiosInstance.get(`/api/v1/rides/search?${params.toString()}`);
    return response.data;
};

