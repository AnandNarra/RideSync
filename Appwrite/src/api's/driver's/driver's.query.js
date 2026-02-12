import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";
import { getMyRides, publishRide, cancelRide } from "./driver's.api";
import { toast } from "sonner";

export const usePublishRide = () => {
  return useMutation({
    mutationFn: publishRide
  });
};

export const useGetMyRides = () => {
  const user = useAuthStore(state => state.user);
  return useQuery({
    queryKey: ["my-rides", user?._id],
    queryFn: getMyRides,
    enabled: !!user?._id // Only run if we have a user
  });
};

export const useCancelRide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelRide,
    onSuccess: () => {
      toast.success("Ride cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-rides"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel ride");
    }
  });
};