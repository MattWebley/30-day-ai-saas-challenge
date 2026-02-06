import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getServerErrorMessage } from "@/lib/queryClient";
import { toast } from "sonner";
import { isUnauthorizedError } from "@/lib/authUtils";

export function useUserProgress() {
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  return {
    progress: progress || [],
    isLoading,
    error,
  };
}

export function useCompleteDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      day,
      data,
    }: {
      day: number;
      data: {
        selectedSuggestion?: number;
        microDecisionChoice?: string;
        reflectionAnswer?: string;
      };
    }) => {
      const res = await apiRequest("POST", `/api/progress/complete/${day}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/badges/user"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("You are logged out. Logging in again...");
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast.error(getServerErrorMessage(error, "Failed to complete day. Please try again."));
    },
  });
}
