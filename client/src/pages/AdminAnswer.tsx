import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Copy,
  Sparkles,
  Send,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  day: number;
  question: string;
  answer: string | null;
  aiSuggestedAnswer: string | null;
  status: string;
  createdAt: string;
}

export default function AdminAnswer() {
  const [, params] = useRoute("/admin/answer/:token");
  const token = params?.token;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (token) {
      fetchQuestion();
    }
  }, [token]);

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/questions/token/${token}`);
      if (!res.ok) throw new Error("Question not found");
      const data = await res.json();
      setQuestion(data);
      if (data.answer) {
        setAnswer(data.answer);
        setIsAnswered(true);
      } else if (data.aiSuggestedAnswer) {
        setAnswer(data.aiSuggestedAnswer);
      }
    } catch (error) {
      toast.error("Failed to load question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Please write an answer");
      return;
    }

    if (!token) {
      toast.error("Missing answer token");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/questions/token/${token}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answer: answer.trim() })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit (${res.status})`);
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Answer published!");
        setIsAnswered(true);
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAiAnswer = () => {
    if (question?.aiSuggestedAnswer) {
      setAnswer(question.aiSuggestedAnswer);
      toast.success("AI answer copied to editor");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Question Not Found</h1>
          <p className="text-slate-600">
            This answer link may have expired or the question was already answered.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <a href="/admin" className="text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </a>
          <h1 className="text-2xl font-extrabold text-slate-900">Answer Question</h1>
          <p className="text-slate-600">Day {question.day}</p>
        </div>

        {/* Question Card */}
        <Card className="p-6 border-2 border-slate-200 bg-white mb-6">
          <div className="flex items-start gap-3 mb-4">
            <MessageCircle className="w-5 h-5 text-slate-500 mt-1" />
            <div>
              <p className="text-sm text-slate-500 mb-1">Question:</p>
              <p className="text-lg text-slate-900 font-medium">{question.question}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Asked {new Date(question.createdAt).toLocaleDateString()}
          </p>
        </Card>

        {/* AI Suggested Answer */}
        {question.aiSuggestedAnswer && !isAnswered && (
          <Card className="p-6 border-2 border-slate-200 bg-slate-50 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900">AI Suggested Answer</h3>
              </div>
              <Button variant="outline" size="sm" onClick={copyAiAnswer} className="gap-1">
                <Copy className="w-4 h-4" />
                Use This
              </Button>
            </div>
            <p className="text-slate-700 whitespace-pre-line">{question.aiSuggestedAnswer}</p>
            <p className="text-xs text-slate-600 mt-3">
              Review and edit as needed before publishing.
            </p>
          </Card>
        )}

        {/* Answer Form / Display */}
        {isAnswered ? (
          <Card className="p-6 border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-green-600">Answer Published</h3>
            </div>
            <p className="text-slate-700 whitespace-pre-line">{answer}</p>
          </Card>
        ) : (
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <h3 className="font-bold text-slate-900 mb-4">Your Answer</h3>
            <Textarea
              placeholder="Write your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px] mb-4"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {answer.length} characters
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || answer.length < 10}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Publishing..." : "Publish Answer"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
