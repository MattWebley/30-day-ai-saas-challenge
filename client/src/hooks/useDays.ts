import { useQuery } from "@tanstack/react-query";

export function useDayContent(day?: number) {
  const { data: dayContent, isLoading, error } = useQuery({
    queryKey: day ? ["/api/days", day.toString()] : ["/api/days"],
    retry: false,
    enabled: day === undefined || day > 0,
  });

  return {
    dayContent,
    isLoading,
    error,
  };
}
