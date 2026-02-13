import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  MessageSquare,
  Video,
  Image,
  Star,
  Heart,
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Pencil,
  Trash2,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Sparkles,
  Smile,
  ArrowUpRight,
  Wand2,
  Minus,
  Plus,
  BookOpen,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type {
  PendingComment,
  AdminComment,
  AdminQuestion,
  CritiqueRequest,
  ShowcaseEntry,
  TestimonialEntry,
} from "./adminTypes";

export default function AdminContent() {
  const queryClient = useQueryClient();
  const [critiqueTab, setCritiqueTab] = useState<"pending" | "completed">("pending");
  const [showAnswered, setShowAnswered] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({});
  const [notesDrafts, setNotesDrafts] = useState<Record<number, string>>({});
  const [generatingDraft, setGeneratingDraft] = useState<Record<number, boolean>>({});
  const [refiningDraft, setRefiningDraft] = useState<Record<number, string | null>>({});

  // Data queries
  const { data: pendingComments = [] } = useQuery<PendingComment[]>({
    queryKey: ["/api/admin/pending-comments"],
  });

  const { data: allComments = [] } = useQuery<AdminComment[]>({
    queryKey: ["/api/admin/comments"],
    staleTime: 30_000,
  });

  const { data: allQuestions = [] } = useQuery<AdminQuestion[]>({
    queryKey: ["/api/admin/questions"],
    staleTime: 30_000,
  });

  const { data: critiqueRequests = [] } = useQuery<CritiqueRequest[]>({
    queryKey: ["/api/admin/critiques"],
  });

  const { data: pendingShowcase = [] } = useQuery<ShowcaseEntry[]>({
    queryKey: ["/api/admin/showcase/pending"],
  });

  const { data: testimonials = [] } = useQuery<TestimonialEntry[]>({
    queryKey: ["/api/admin/testimonials"],
  });

  const { data: moodCheckins = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/mood-checkins"],
    staleTime: 30_000,
  });

  const pendingQuestions = allQuestions.filter((q) => q.status === "pending");
  const answeredQuestions = allQuestions.filter((q) => q.status === "answered");
  const approvedComments = allComments.filter((c) => c.status === "approved");

  const pendingCritiques = critiqueRequests.filter(
    (c) => c.status === "pending" || c.status === "in_progress"
  );
  const completedCritiques = critiqueRequests.filter(
    (c) => c.status === "completed"
  );

  // Mutations
  const updateCommentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/comments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast.success(status === "approved" ? "Comment approved" : "Comment rejected");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast.success("Comment deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const answerQuestion = useMutation({
    mutationFn: async ({ id, answer }: { id: number; answer: string }) => {
      const res = await apiRequest("POST", `/api/admin/questions/${id}/answer`, { answer });
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      setAnswerDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success("Answer sent! Student will receive an email notification.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send answer");
    },
  });

  const hideQuestion = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/questions/${id}/hide`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      toast.success("Question hidden");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to hide question");
    },
  });

  const updateCritiqueStatus = useMutation({
    mutationFn: async ({ id, status, videoUrl }: { id: number; status: string; videoUrl?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/critiques/${id}`, { status, videoUrl });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/critiques"] });
      toast.success("Critique status updated");
    },
    onError: () => {
      toast.error("Failed to update critique");
    },
  });

  const deleteCritique = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/critiques/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/critiques"] });
      toast.success("Critique deleted");
    },
    onError: () => {
      toast.error("Failed to delete critique");
    },
  });

  const updateShowcaseStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/showcase/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/showcase/pending"] });
      toast.success(status === "approved" ? "App approved and added to showcase!" : "App rejected");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const toggleShowcaseFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/showcase/${id}/feature`, { featured });
      return res.json();
    },
    onSuccess: (_, { featured }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/showcase/pending"] });
      toast.success(featured ? "App marked as featured!" : "Featured status removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update featured status");
    },
  });

  const promoteMoodCheckin = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/mood-checkins/${id}/promote`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mood-checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast.success("Promoted to testimonial!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to promote");
    },
  });

  const toggleTestimonialFeatured = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/testimonials/${id}/feature`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast.success(data.featured ? "Testimonial featured!" : "Removed from featured");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle featured");
    },
  });

  return (
    <div className="space-y-8">
      {/* Student Questions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Student Questions</h2>
          {pendingQuestions.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {pendingQuestions.length} unanswered
            </span>
          )}
          {answeredQuestions.length > 0 && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              {answeredQuestions.length} answered
            </span>
          )}
        </div>

        {/* Pending questions */}
        {pendingQuestions.length === 0 && answeredQuestions.length === 0 ? (
          <Card className="p-8 border border-slate-200 text-center">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No student questions yet</p>
          </Card>
        ) : (
          <>
            {pendingQuestions.length > 0 && (
              <div className="space-y-3">
                {pendingQuestions.map((q) => {
                  const hasDraft = !!answerDrafts[q.id]?.trim();
                  const isGenerating = generatingDraft[q.id] || false;
                  const activeRefine = refiningDraft[q.id] || null;

                  const generateFromNotes = async () => {
                    const notes = notesDrafts[q.id]?.trim();
                    if (!notes) {
                      toast.error("Write some notes first");
                      return;
                    }
                    setGeneratingDraft((prev) => ({ ...prev, [q.id]: true }));
                    try {
                      const res = await fetch("/api/admin/questions/draft-answer", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ question: q.question, notes, day: q.day }),
                      });
                      const data = await res.json();
                      if (data.draft) {
                        setAnswerDrafts((prev) => ({ ...prev, [q.id]: data.draft }));
                      } else {
                        toast.error("Failed to generate draft");
                      }
                    } catch {
                      toast.error("Failed to generate draft");
                    }
                    setGeneratingDraft((prev) => ({ ...prev, [q.id]: false }));
                  };

                  const refineDraft = async (action: string) => {
                    const draft = answerDrafts[q.id]?.trim();
                    if (!draft) return;
                    setRefiningDraft((prev) => ({ ...prev, [q.id]: action }));
                    try {
                      const res = await fetch("/api/admin/questions/refine-answer", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ question: q.question, currentDraft: draft, action }),
                      });
                      const data = await res.json();
                      if (data.draft) {
                        setAnswerDrafts((prev) => ({ ...prev, [q.id]: data.draft }));
                      } else {
                        toast.error("Failed to refine");
                      }
                    } catch {
                      toast.error("Failed to refine");
                    }
                    setRefiningDraft((prev) => ({ ...prev, [q.id]: null }));
                  };

                  return (
                    <Card key={q.id} className="p-4 border border-slate-200 border-l-4 border-l-amber-400">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 text-sm">
                              {q.user?.firstName || "Anonymous"} {q.user?.lastName || ""}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                              Day {q.day}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {q.user?.email && (
                            <p className="text-xs text-slate-400 mb-2">{q.user.email}</p>
                          )}
                          <p className="text-slate-700 whitespace-pre-wrap break-words">{q.question}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-slate-400 hover:text-slate-600 border-slate-200 flex-shrink-0"
                          onClick={() => {
                            if (confirm("Hide this question? It won't be visible to students.")) {
                              hideQuestion.mutate(q.id);
                            }
                          }}
                          disabled={hideQuestion.isPending}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* AI quick suggestion (collapsed) */}
                      {q.aiSuggestedAnswer && !hasDraft && (
                        <div className="mb-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500">AI Quick Suggestion</span>
                          </div>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{q.aiSuggestedAnswer}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs border-slate-200 text-slate-600"
                            onClick={() => setAnswerDrafts((prev) => ({ ...prev, [q.id]: q.aiSuggestedAnswer! }))}
                          >
                            Use this
                          </Button>
                        </div>
                      )}

                      {/* Notes + Generate section */}
                      {!hasDraft && (
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Wand2 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium text-slate-700">Your notes (AI will draft a proper response)</span>
                          </div>
                          <textarea
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Jot quick notes on what to say... e.g. 'tell them to use the free tier of Stripe, link their account, test with test mode first'"
                            value={notesDrafts[q.id] || ""}
                            onChange={(e) => setNotesDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gap-1.5"
                              onClick={generateFromNotes}
                              disabled={isGenerating || !notesDrafts[q.id]?.trim()}
                            >
                              <Wand2 className="w-4 h-4" />
                              {isGenerating ? "Generating..." : "Generate Response"}
                            </Button>
                            <span className="text-xs text-slate-400 self-center">or type your answer directly below</span>
                          </div>
                        </div>
                      )}

                      {/* Draft / manual answer area */}
                      <div className="space-y-2">
                        <textarea
                          className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Your answer (edit freely before sending)..."
                          value={answerDrafts[q.id] || ""}
                          onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        />

                        {/* Refine buttons - only show when there's a draft */}
                        {hasDraft && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-slate-400 self-center mr-1">Adjust:</span>
                            {[
                              { action: "shorten", label: "Shorter", icon: Minus },
                              { action: "lengthen", label: "Longer", icon: Plus },
                              { action: "simplify", label: "Simpler", icon: Zap },
                              { action: "detail", label: "More Detail", icon: BookOpen },
                            ].map(({ action, label, icon: Icon }) => (
                              <Button
                                key={action}
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1 border-slate-200 text-slate-600 hover:text-slate-900 h-7 px-2"
                                onClick={() => refineDraft(action)}
                                disabled={!!activeRefine}
                              >
                                <Icon className="w-3 h-3" />
                                {activeRefine === action ? "..." : label}
                              </Button>
                            ))}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1 border-slate-200 text-red-500 hover:text-red-700 h-7 px-2 ml-auto"
                              onClick={() => {
                                setAnswerDrafts((prev) => ({ ...prev, [q.id]: "" }));
                              }}
                            >
                              Clear
                            </Button>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                              const answer = answerDrafts[q.id]?.trim();
                              if (!answer) {
                                toast.error("Please type an answer first");
                                return;
                              }
                              answerQuestion.mutate({ id: q.id, answer });
                            }}
                            disabled={answerQuestion.isPending || !hasDraft}
                          >
                            <Send className="w-4 h-4" />
                            Send Answer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Answered questions (collapsible) */}
            {answeredQuestions.length > 0 && (
              <div>
                <button
                  onClick={() => setShowAnswered(!showAnswered)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {showAnswered ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {answeredQuestions.length} answered question{answeredQuestions.length !== 1 ? "s" : ""}
                </button>

                {showAnswered && (
                  <div className="mt-3 space-y-3 max-h-[600px] overflow-y-auto">
                    {answeredQuestions.map((q) => (
                      <Card key={q.id} className="p-4 border border-slate-200 border-l-4 border-l-green-400">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 text-sm">
                            {q.user?.firstName || "Anonymous"} {q.user?.lastName || ""}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            Day {q.day}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap break-words mb-3">{q.question}</p>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-500 mb-1">Your answer:</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{q.answer}</p>
                          {q.answeredAt && (
                            <p className="text-xs text-slate-400 mt-2">
                              Answered {formatDistanceToNow(new Date(q.answeredAt), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment Approval Queue */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Comments</h2>
          {pendingComments.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {pendingComments.length} pending
            </span>
          )}
          {approvedComments.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {approvedComments.length} approved
            </span>
          )}
        </div>

        {/* Pending comments */}
        {pendingComments.length === 0 ? (
          <Card className="p-6 border border-slate-200 text-center">
            <p className="text-slate-500 text-sm">No comments pending approval</p>
          </Card>
        ) : (
          <Card className="border border-slate-200 divide-y divide-slate-100">
            {pendingComments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {comment.user?.firstName || "Anonymous"} {comment.user?.lastName || ""}
                      </span>
                      <span className="text-xs text-slate-400">Day {comment.day}</span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-2 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                    {comment.flagReason && (
                      <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded inline-flex font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        {comment.flagReason}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => updateCommentStatus.mutate({ id: comment.id, status: "approved" })}
                      disabled={updateCommentStatus.isPending}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                      onClick={() => updateCommentStatus.mutate({ id: comment.id, status: "rejected" })}
                      disabled={updateCommentStatus.isPending}
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* All approved comments (collapsible) */}
        {approvedComments.length > 0 && (
          <div>
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {showAllComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {approvedComments.length} approved comment{approvedComments.length !== 1 ? "s" : ""}
            </button>

            {showAllComments && (
              <div className="mt-3 max-h-[600px] overflow-y-auto">
                <Card className="border border-slate-200 divide-y divide-slate-100">
                  {approvedComments.map((comment) => (
                    <div key={comment.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 text-sm">
                              {comment.user?.firstName || "Anonymous"} {comment.user?.lastName || ""}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                              Day {comment.day}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-slate-400 hover:text-red-600 border-slate-200 flex-shrink-0"
                          onClick={() => {
                            if (confirm("Delete this comment permanently?")) {
                              deleteComment.mutate(comment.id);
                            }
                          }}
                          disabled={deleteComment.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Critique Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Video Critiques</h2>
          {pendingCritiques.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {pendingCritiques.length} to do
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCritiqueTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              critiqueTab === "pending"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Pending ({pendingCritiques.length})
          </button>
          <button
            onClick={() => setCritiqueTab("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              critiqueTab === "completed"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Completed ({completedCritiques.length})
          </button>
        </div>

        {(critiqueTab === "pending" ? pendingCritiques : completedCritiques).length === 0 ? (
          <Card className="p-8 border border-slate-200 text-center">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {critiqueTab === "pending" ? "No pending critique requests" : "No completed critiques yet"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {(critiqueTab === "pending" ? pendingCritiques : completedCritiques).map((critique) => (
              <Card
                key={critique.id}
                className={`p-4 border ${
                  critique.status === "pending" ? "border-slate-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          critique.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : critique.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {critique.status === "pending"
                          ? "TO DO"
                          : critique.status === "in_progress"
                          ? "IN PROGRESS"
                          : "DONE"}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDistanceToNow(new Date(critique.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900">
                      {critique.userFirstName || critique.userEmail}
                    </p>
                    <a
                      href={critique.salesPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      {critique.salesPageUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {critique.productDescription && (
                      <p className="text-sm text-slate-600 mt-2">
                        <strong>Product:</strong> {critique.productDescription}
                      </p>
                    )}
                    {critique.targetAudience && (
                      <p className="text-sm text-slate-600">
                        <strong>Audience:</strong> {critique.targetAudience}
                      </p>
                    )}
                    {critique.specificQuestions && (
                      <p className="text-sm text-slate-600">
                        <strong>Questions:</strong> {critique.specificQuestions}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {(critique.status === "pending" || critique.status === "in_progress") && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            const videoUrl = prompt("Enter the video URL to mark complete:");
                            if (videoUrl) {
                              updateCritiqueStatus.mutate({
                                id: critique.id,
                                status: "completed",
                                videoUrl,
                              });
                            }
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        {critique.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateCritiqueStatus.mutate({
                                id: critique.id,
                                status: "in_progress",
                              })
                            }
                          >
                            Start Working
                          </Button>
                        )}
                      </>
                    )}
                    {critique.status === "completed" && (
                      <>
                        {critique.videoUrl && (
                          <a href={critique.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="w-full">
                              <Video className="w-4 h-4 mr-1" />
                              View Video
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newVideoUrl = prompt("Update video URL:", critique.videoUrl || "");
                            if (newVideoUrl !== null) {
                              updateCritiqueStatus.mutate({
                                id: critique.id,
                                status: "completed",
                                videoUrl: newVideoUrl,
                              });
                            }
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit URL
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-600 hover:bg-slate-100 border-slate-200"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this critique request?")) {
                          deleteCritique.mutate(critique.id);
                        }
                      }}
                      disabled={deleteCritique.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Showcase Moderation */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Image className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Showcase Moderation</h2>
          {pendingShowcase.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {pendingShowcase.length} pending
            </span>
          )}
        </div>

        {pendingShowcase.length === 0 ? (
          <Card className="p-8 border border-slate-200 text-center">
            <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No apps pending approval</p>
            <a
              href="/showcase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline mt-2 inline-block"
            >
              View public showcase
            </a>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingShowcase.map((entry) => (
              <Card key={entry.id} className="p-0 border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100 flex-shrink-0">
                    <img
                      src={entry.screenshotUrl}
                      alt={entry.appName}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Preview";
                      }}
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{entry.appName}</h3>
                        <p className="text-sm text-slate-500">
                          by {entry.user?.firstName || "Unknown"} {entry.user?.lastName || ""} (
                          {entry.user?.email})
                        </p>
                      </div>
                      {entry.liveUrl && (
                        <a
                          href={entry.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{entry.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => updateShowcaseStatus.mutate({ id: entry.id, status: "approved" })}
                        disabled={updateShowcaseStatus.isPending}
                      >
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => updateShowcaseStatus.mutate({ id: entry.id, status: "rejected" })}
                        disabled={updateShowcaseStatus.isPending}
                      >
                        <X className="w-4 h-4" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`gap-1 ${
                          entry.featured
                            ? "border-primary text-primary bg-slate-50"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          toggleShowcaseFeatured.mutate({ id: entry.id, featured: !entry.featured })
                        }
                        disabled={toggleShowcaseFeatured.isPending}
                      >
                        <Star className={`w-4 h-4 ${entry.featured ? "fill-current" : ""}`} />
                        {entry.featured ? "Featured" : "Feature"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <a
            href="/showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View public showcase page
          </a>
        </div>
      </div>

      {/* Testimonials */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Testimonials</h2>
          {testimonials.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {testimonials.length} received
            </span>
          )}
        </div>

        {testimonials.length === 0 ? (
          <Card className="p-8 border border-slate-200 text-center">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No testimonials received yet</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((entry) => (
              <Card key={entry.id} className={`p-4 border border-slate-200 shadow-sm ${entry.featured ? "border-l-4 border-l-blue-500" : ""}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">
                        {entry.user?.firstName || "Unknown"} {entry.user?.lastName || ""}
                      </p>
                      {entry.featured && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{entry.user?.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`gap-1 ${
                      entry.featured
                        ? "border-primary text-primary bg-slate-50"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => toggleTestimonialFeatured.mutate(entry.id)}
                    disabled={toggleTestimonialFeatured.isPending}
                  >
                    <Star className={`w-4 h-4 ${entry.featured ? "fill-current" : ""}`} />
                    {entry.featured ? "Featured" : "Feature"}
                  </Button>
                </div>

                {entry.testimonial && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                    <p className="text-slate-700 whitespace-pre-wrap">{entry.testimonial}</p>
                  </div>
                )}

                {entry.videoUrl && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Video className="w-4 h-4 text-primary" />
                    <a
                      href={entry.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View video testimonial
                    </a>
                  </div>
                )}

                {(entry.appName || entry.appUrl) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ExternalLink className="w-4 h-4" />
                    {entry.appName && <span className="font-medium">{entry.appName}</span>}
                    {entry.appUrl && (
                      <a
                        href={entry.appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {entry.appUrl}
                      </a>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mood Check-ins */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Smile className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Mood Check-ins</h2>
          {moodCheckins.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {moodCheckins.length} total
            </span>
          )}
          {moodCheckins.filter((m: any) => m.consentToShare && m.text && !m.promotedToTestimonial).length > 0 && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              {moodCheckins.filter((m: any) => m.consentToShare && m.text && !m.promotedToTestimonial).length} shareable
            </span>
          )}
        </div>

        {moodCheckins.length === 0 ? (
          <Card className="p-8 border border-slate-200 text-center">
            <Smile className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No mood check-ins yet</p>
            <p className="text-sm text-slate-400 mt-1">These appear after students complete Days 0, 4, 9, 14, and 21</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {moodCheckins.map((checkin: any) => (
              <Card
                key={checkin.id}
                className={`p-4 border ${
                  checkin.consentToShare && checkin.text && !checkin.promotedToTestimonial
                    ? "border-green-200 border-l-4 border-l-green-500"
                    : checkin.promotedToTestimonial
                    ? "border-blue-200 border-l-4 border-l-blue-500"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{checkin.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900">
                          {checkin.firstName || checkin.lastName
                            ? `${checkin.firstName || ""} ${checkin.lastName || ""}`.trim()
                            : "Unknown"}
                        </span>
                        {checkin.email && (
                          <span className="text-xs text-slate-500">{checkin.email}</span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          Day {checkin.day}
                        </span>
                        <span className="text-xs text-slate-500">
                          {checkin.emojiLabel}
                        </span>
                        {checkin.promotedToTestimonial && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                            Testimonial
                          </span>
                        )}
                      </div>
                      {checkin.text && (
                        <p className="text-slate-700 mt-1">{checkin.text}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {checkin.createdAt
                          ? new Date(checkin.createdAt).toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Dubai",
                            })
                          : ""}
                        {checkin.consentToShare && checkin.text && (
                          <span className="ml-2 text-green-600 font-medium">Consented to share</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {checkin.consentToShare && checkin.text && !checkin.promotedToTestimonial && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50 shrink-0"
                      onClick={() => promoteMoodCheckin.mutate(checkin.id)}
                      disabled={promoteMoodCheckin.isPending}
                    >
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Promote
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
