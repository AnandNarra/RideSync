import { useMutation } from "@tanstack/react-query";
import { publishRide } from "./driver's.api";

export const usePublishRide = () => {
  return useMutation({
    mutationFn: publishRide
  });
};