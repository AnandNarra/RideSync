import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";
import * as bookingApi from "./booking.api";
import { toast } from "sonner";

export const useBookRide = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bookingApi.bookRide,
        onSuccess: (data) => {
            toast.success(data.message || "Booking request sent! 🚗");
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to book ride");
        }
    });
};

export const useGetMyBookings = () => {
    const user = useAuthStore(state => state.user);
    return useQuery({
        queryKey: ["my-bookings", user?._id],
        queryFn: bookingApi.getMyBookings,
        enabled: !!user?._id
    });
};

export const useGetBookingRequests = (rideId) => {
    const user = useAuthStore(state => state.user);
    return useQuery({
        queryKey: ["booking-requests", rideId, user?._id],
        queryFn: () => bookingApi.getBookingRequests(rideId),
        enabled: !!user?._id
    });
};

export const useAcceptBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bookingApi.acceptBooking,
        onSuccess: (data) => {
            toast.success(data.message || "Booking accepted! ✅");
            queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
            queryClient.invalidateQueries({ queryKey: ["my-rides"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to accept booking");
        }
    });
};

export const useRejectBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bookingApi.rejectBooking,
        onSuccess: (data) => {
            toast.warning(data.message || "Booking rejected ❌");
            queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to reject booking");
        }
    });
};

export const useCompleteRide = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bookingApi.completeRide,
        onSuccess: (data) => {
            toast.success(data.message || "Ride completed! 🏁");
            queryClient.invalidateQueries({ queryKey: ["my-rides"] });
            queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to complete ride");
        }
    });
};

export const useUpdateBooking = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: bookingApi.updateBooking,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["my-bookings", user?._id] });
            toast.success(data.message || "Booking updated successfully! 🚀");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update booking ❌");
        }
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: bookingApi.cancelBooking,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["my-bookings", user?._id] });
            toast.success(data.message || "Booking cancelled successfully! 👋");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to cancel booking ❌");
        }
    });
};
