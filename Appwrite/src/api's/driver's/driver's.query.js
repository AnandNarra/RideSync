import { useMutation, useQuery } from "@tanstack/react-query";
import { getMyRides, publishRide } from "./driver's.api";

export const usePublishRide = () => {
  return useMutation({
    mutationFn: publishRide
  });
};

export const useGetMyRides = () => {
  return useQuery({
    queryKey: ["my-rides"],
    queryFn: getMyRides
  });
};