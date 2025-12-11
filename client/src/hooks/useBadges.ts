import { useQuery } from "@tanstack/react-query";

export function useAllBadges() {
  const { data: badges, isLoading, error } = useQuery({
    queryKey: ["/api/badges"],
    retry: false,
  });

  return {
    badges: badges || [],
    isLoading,
    error,
  };
}

export function useUserBadges() {
  const { data: userBadges, isLoading, error } = useQuery({
    queryKey: ["/api/badges/user"],
    retry: false,
  });

  return {
    userBadges: userBadges || [],
    isLoading,
    error,
  };
}
