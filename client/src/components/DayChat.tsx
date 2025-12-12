import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: number;
  day: number;
  content: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

interface DayChatProps {
  day: number;
}

export function DayChat({ day }: DayChatProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/comments/${day}`],
  });

  const postComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/comments", { day, content });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.message) {
        setPendingMessage(data.message);
        toast.info(data.message);
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/comments/${day}`] });
        toast.success("Comment posted!");
      }
      setNewComment("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postComment.mutate(newComment);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
          <MessageCircle className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-xl text-black">Discussion</h2>
        <span className="text-sm text-slate-600">({comments.length} comments)</span>
      </div>

      <Card className="p-6 border-2 border-black shadow-none bg-white">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <textarea
              className="flex-1 min-h-[80px] rounded-lg border-2 border-black bg-white p-3 text-sm font-medium shadow-none placeholder:text-slate-600 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 resize-none transition-colors"
              placeholder="Ask a question or share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              data-testid="input-comment"
            />
            <Button
              type="submit"
              disabled={postComment.isPending || !newComment.trim()}
              className="self-end gap-2"
              data-testid="button-post-comment"
            >
              {postComment.isPending ? "..." : <><Send className="w-4 h-4" /> Post</>}
            </Button>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {newComment.length}/1000 characters
          </p>
        </form>

        {pendingMessage && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">{pendingMessage}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-slate-600">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 bg-white rounded-lg"
                data-testid={`comment-${comment.id}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {comment.user?.profileImageUrl ? (
                    <img
                      src={comment.user.profileImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-bold text-sm">
                      {comment.user?.firstName?.[0] || "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-black text-sm">
                      {comment.user?.firstName || "Anonymous"}
                      {comment.user?.lastName ? ` ${comment.user.lastName[0]}.` : ""}
                    </span>
                    <span className="text-xs text-slate-600">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
