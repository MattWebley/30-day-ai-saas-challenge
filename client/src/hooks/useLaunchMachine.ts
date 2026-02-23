import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useLaunchMachineContent() {
  return useQuery({
    queryKey: ["/api/slm/content"],
    queryFn: async () => {
      const res = await fetch("/api/slm/content", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch SLM content");
      }
      return res.json();
    },
    retry: false,
  });
}

export function useCompleteSLMLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: number) => {
      const res = await apiRequest("POST", `/api/slm/lessons/${lessonId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slm/content"] });
    },
  });
}

export function useSLMComments(sectionId: number | null) {
  return useQuery({
    queryKey: ["/api/slm/comments", sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      const res = await fetch(`/api/slm/comments/${sectionId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sectionId,
  });
}

export function usePostSLMComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: number; content: string }) => {
      const res = await apiRequest("POST", "/api/slm/comments", { sectionId, content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slm/comments"] });
    },
  });
}

export function useDeleteSLMComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/slm/comments/${commentId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slm/comments"] });
    },
  });
}
