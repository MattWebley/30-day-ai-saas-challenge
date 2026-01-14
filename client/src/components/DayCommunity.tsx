import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Send,
  ThumbsUp,
  HelpCircle,
  User,
  AlertCircle,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface DayCommunityProps {
  day: number;
}

interface Question {
  id: number;
  day: number;
  userId: string;
  question: string;
  answer: string | null;
  helpful: number;
  createdAt: string;
  answeredAt: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
}

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

export function DayCommunity({ day }: DayCommunityProps) {
  const { user } = useAuth();
  const isAdmin = (user as any)?.isAdmin === true;

  return (
    <div className="space-y-8">
      {/* Q&A Section */}
      <QASection day={day} />

      {/* Discussion Section */}
      <DiscussionSection day={day} isAdmin={isAdmin} />
    </div>
  );
}

// Q&A Section Component
function QASection({ day }: { day: number }) {
  const [showForm, setShowForm] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/day", day],
    queryFn: async () => {
      const res = await fetch(`/api/questions/day/${day}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json();
    }
  });

  const submitQuestion = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/questions", { day, question });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Question submitted!");
      setQuestionText("");
      setShowForm(false);
    },
    onError: () => {
      toast.error("Failed to submit question");
    }
  });

  const markHelpful = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/questions/${id}/helpful`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions/day", day] });
    }
  });

  const handleSubmit = () => {
    if (questionText.trim().length < 10) {
      toast.error("Please write a more detailed question");
      return;
    }
    submitQuestion.mutate(questionText.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-xl text-slate-900">Q&A</h2>
        {questions.length > 0 && (
          <span className="text-sm text-slate-400">({questions.length})</span>
        )}
      </div>

      <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
        {/* Ask a question button/form */}
        {!showForm ? (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowForm(true)}
          >
            <HelpCircle className="w-4 h-4" />
            Ask a Question
          </Button>
        ) : (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-700 font-medium">Ask a Question</p>
            <Textarea
              placeholder="What would you like to know about this day's content?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitQuestion.isPending || questionText.length < 10}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {submitQuestion.isPending ? "Submitting..." : "Submit Question"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Your question will be reviewed and answered. Answers appear here for everyone.
            </p>
          </div>
        )}

        {/* Existing Q&A */}
        {isLoading ? (
          <p className="text-slate-500 text-sm text-center py-4 mt-4">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4 mt-4">
            No questions yet. Be the first to ask!
          </p>
        ) : (
          <div className="space-y-3 mt-4">
            {questions.map((q) => (
              <div key={q.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                {/* Question */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">
                      {q.user.firstName || "User"} asked:
                    </p>
                    <p className="text-slate-900 font-medium">{q.question}</p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer && (
                  <div className="ml-11 p-3 bg-white rounded border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">Answer:</p>
                    </div>
                    <p className="text-slate-700 whitespace-pre-line">{q.answer}</p>
                  </div>
                )}

                {/* Helpful button */}
                <div className="mt-3 ml-11 flex items-center gap-2">
                  <button
                    onClick={() => markHelpful.mutate(q.id)}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful {q.helpful > 0 && `(${q.helpful})`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// Discussion Section Component
function DiscussionSection({ day, isAdmin }: { day: number; isAdmin: boolean }) {
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

  const deleteComment = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments/${day}`] });
      toast.success("Comment deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
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
        <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
          <MessageCircle className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-xl text-slate-900">Discussion</h2>
        <span className="text-sm text-slate-400">({comments.length})</span>
      </div>

      <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <textarea
              className="flex-1 min-h-[80px] rounded-lg border-2 border-slate-200 bg-slate-50 p-3 text-sm font-medium shadow-none placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 resize-none transition-colors"
              placeholder="Share your thoughts with other challengers..."
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
          <p className="text-xs text-slate-400 mt-2">
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
          <div className="text-center py-8 text-slate-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 bg-slate-50 rounded-lg"
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
                    <span className="font-semibold text-slate-900 text-sm">
                      {comment.user?.firstName || "Anonymous"}
                      {comment.user?.lastName ? ` ${comment.user.lastName[0]}.` : ""}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {isAdmin && (
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
