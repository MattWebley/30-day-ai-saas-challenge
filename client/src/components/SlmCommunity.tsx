import { useState } from "react";
import { useSLMComments, usePostSLMComment, useDeleteSLMComment } from "@/hooks/useLaunchMachine";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SlmCommunityProps {
  sectionId: number;
  sectionTitle?: string;
}

export function SlmCommunity({ sectionId, sectionTitle }: SlmCommunityProps) {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useSLMComments(sectionId);
  const postComment = usePostSLMComment();
  const deleteComment = useDeleteSLMComment();
  const [newComment, setNewComment] = useState("");
  const isAdmin = (user as any)?.isAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postComment.mutate(
      { sectionId, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment posted");
        },
        onError: (err: any) => toast.error(err.message || "Failed to post"),
      }
    );
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        Discussion{sectionTitle ? ` — ${sectionTitle}` : ""}
      </h3>

      {/* Post form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <textarea
            className="flex-1 min-h-[80px] rounded-lg border-2 border-slate-200 bg-slate-50 p-3 text-sm font-medium shadow-none placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 resize-none transition-colors"
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={postComment.isPending || !newComment.trim()}
            className="self-end gap-2"
          >
            {postComment.isPending ? "..." : <><Send className="w-4 h-4" /> Post</>}
          </Button>
        </div>
        <p className="text-xs text-slate-600 mt-2">{newComment.length}/1000 characters</p>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {isLoading && <p className="text-slate-500 text-sm">Loading comments...</p>}
        {!isLoading && comments.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No comments yet. Be the first!</p>
        )}
        {comments.map((comment: any) => (
          <div key={comment.id} className="flex gap-3 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {comment.profile_image_url ? (
                <img src={comment.profile_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">
                  {comment.first_name?.[0] || "?"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-900 text-sm">
                  {comment.first_name || "Anonymous"}
                  {comment.last_name ? ` ${comment.last_name[0]}.` : ""}
                </span>
                {comment.is_admin && (
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                    Coach
                  </span>
                )}
                <span className="text-xs text-slate-500">{formatTime(comment.created_at)}</span>
                {(isAdmin || comment.user_id === (user as any)?.id) && (
                  <button
                    onClick={() => deleteComment.mutate(comment.id)}
                    disabled={deleteComment.isPending}
                    className="ml-auto p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-slate-700 whitespace-pre-wrap break-words">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
