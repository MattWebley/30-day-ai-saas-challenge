import { useQuery } from "@tanstack/react-query";

export function useUserStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  return {
    stats,
    isLoading,
    error,
  };
}
