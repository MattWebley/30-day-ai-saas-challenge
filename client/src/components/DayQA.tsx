import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Send,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  User
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";

interface DayQAProps {
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

export function DayQA({ day }: DayQAProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const queryClient = useQueryClient();

  // Fetch answered questions for this day
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/day", day],
    queryFn: async () => {
      const res = await fetch(`/api/questions/day/${day}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json();
    }
  });

  // Submit question mutation
  const submitQuestion = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/questions", { day, question });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Question submitted! Matt will be notified.");
      setQuestionText("");
      setShowForm(false);
    },
    onError: () => {
      toast.error("Failed to submit question");
    }
  });

  // Mark helpful mutation
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
    <Card className="p-4 border-2 border-slate-200 bg-white mt-8">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-900">Questions & Answers</h3>
          {questions.length > 0 && (
            <span className="text-sm text-slate-500">({questions.length})</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Ask a question button/form */}
          {!showForm ? (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowForm(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Ask a Question
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-700 font-medium">Ask Matt a Question</p>
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
                Matt will be notified and may answer your question. Answers will appear here for everyone to benefit.
              </p>
            </div>
          )}

          {/* Existing Q&A */}
          {isLoading ? (
            <p className="text-slate-500 text-sm text-center py-4">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">
              No questions yet. Be the first to ask!
            </p>
          ) : (
            <div className="space-y-3">
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
                      <p className="text-sm text-primary font-medium mb-1">Matt's Answer:</p>
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
        </div>
      )}
    </Card>
  );
}
