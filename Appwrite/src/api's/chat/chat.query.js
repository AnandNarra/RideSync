import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "./chat.api";

export const useGetMessages = (bookingId) => {
    return useQuery({
        queryKey: ["chat-messages", bookingId],
        queryFn: () => chatApi.getMessages(bookingId),
        enabled: !!bookingId,
        refetchInterval: 3000, // Poll every 3 seconds
        refetchIntervalInBackground: true, // Keep polling even when tab is not focused
        staleTime: 0, // Always consider data stale so refetch works
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: chatApi.sendMessage,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.bookingId] });
        },
    });
};
