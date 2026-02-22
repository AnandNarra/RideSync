import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDriverRequests, updateDriverRequestStatus, getAdminStats } from "./admin.api";
import { toast } from "sonner";


export const useGetAllDriverRequests = () => {
  return useQuery({
    queryKey: ["driver-requests"],
    queryFn: getAllDriverRequests,
  });
};

export const useGetAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });
};


export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDriverRequestStatus,

    onSuccess: (data, variables) => {
      const statusText = variables.status === "approved" ? "approved" : "rejected";
      toast.success(`Driver request ${statusText} successfully! ✅`);

      // Invalidate and refetch driver requests
      queryClient.invalidateQueries({ queryKey: ["driver-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-driver-status"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },

    onError: (error) => {
      toast.error("Failed to update driver status ❌", {
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });
};
