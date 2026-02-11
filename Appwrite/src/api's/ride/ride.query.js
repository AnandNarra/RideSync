import { useQuery } from "@tanstack/react-query";
import { searchRides } from "./ride.api";

export const useSearchRides = (params) => {
    return useQuery({
        queryKey: ["searchRides", params],
        queryFn: () => searchRides(params),
        enabled: false, // Don't run automatically, wait for search button click
    });
};
