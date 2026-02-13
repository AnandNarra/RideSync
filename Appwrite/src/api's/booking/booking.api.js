import axiosInstance from "../axiosInstance";

export const bookRide = async ({ rideId, seatsRequested }) => {
    const response = await axiosInstance.post(`/api/v1/rides/${rideId}/book`, { seatsRequested });
    return response.data;
};

export const getMyBookings = async () => {
    const response = await axiosInstance.get("/api/v1/bookings/my");
    // Wait, did I implement /api/v1/bookings/my? Let me check.
    return response.data;
};

export const getBookingRequests = async (rideId) => {
    const url = rideId ? `/api/v1/driver/bookings?rideId=${rideId}` : "/api/v1/driver/bookings";
    const response = await axiosInstance.get(url);
    return response.data;
};

export const acceptBooking = async (bookingId) => {
    const response = await axiosInstance.patch(`/api/v1/driver/bookings/${bookingId}/accept`);
    return response.data;
};

export const rejectBooking = async (bookingId) => {
    const response = await axiosInstance.patch(`/api/v1/driver/bookings/${bookingId}/reject`);
    return response.data;
};

export const completeRide = async (rideId) => {
    const response = await axiosInstance.patch(`/api/v1/rides/${rideId}/complete`);
    return response.data;
};

export const updateBooking = async ({ bookingId, payload }) => {
    const response = await axiosInstance.patch(`/api/v1/bookings/${bookingId}`, payload);
    return response.data;
};

export const cancelBooking = async (bookingId) => {
    const response = await axiosInstance.patch(`/api/v1/bookings/${bookingId}/cancel`);
    return response.data;
};
