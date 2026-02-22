import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";
import { getMyRides, publishRide, cancelRide, updateRide } from "./driver's.api";
import { toast } from "sonner";

export const usePublishRide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishRide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
    }
  });
};

export const useGetMyRides = () => {
  const user = useAuthStore(state => state.user);
  return useQuery({
    queryKey: ["my-rides", user?._id],
    queryFn: getMyRides,
    enabled: !!user?._id && user?.role === 'driver' // Only run if we have a user and they are a driver
  });
};

export const useUpdateRide = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  return useMutation({
    mutationFn: updateRide,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-rides", user?._id] });
      toast.success("Ride updated successfully! 🚀", {
        description: data.message
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update ride ❌");
    }
  });
};

export const useCancelRide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelRide,
    onSuccess: () => {
      toast.success("Ride cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
      queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel ride");
    }
  });
};