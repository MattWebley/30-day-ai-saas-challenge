import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  currentDay?: number;
}

export function ChatWidget({ currentDay = 1 }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user progress for context
  const { data: progress } = useQuery<any[]>({
    queryKey: ["/api/progress"],
  });

  // Fetch user data
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      // Build context from progress
      const day2 = progress?.find((p: any) => p.day === 2);
      const day3 = progress?.find((p: any) => p.day === 3);
      const day4 = progress?.find((p: any) => p.day === 4);
      const day6 = progress?.find((p: any) => p.day === 6);

      const context = {
        currentDay,
        completedDays: progress?.filter((p: any) => p.completed).map((p: any) => p.day) || [],
        userIdea: day2?.userInputs?.chosenIdea || day2?.selectedIdea || null,
        painPoints: day2?.userInputs?.selectedPainPoints || day2?.selectedPainPoints || [],
        features: day3?.userInputs?.selectedFeatures || day3?.selectedFeatures || [],
        mvpFeatures: day4?.userInputs?.selectedMvpFeatures || day4?.selectedMvpFeatures || [],
        prd: day6?.userInputs?.prd || day6?.prd || null,
        userName: user?.firstName || null,
      };

      // Use fetch directly to handle errors better
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message,
          context,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Return error data so onSuccess can handle rate limits
        return { error: data.error || "server_error", message: data.message || "Something went wrong" };
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.error === "rate_limit") {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${data.message}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      }
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Please check your internet and try again." }]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    sendMessage.mutate(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open AI Mentor"
        >
          <div className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-slate-200 pl-4 pr-2 py-2 hover:shadow-xl transition-all">
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
              Need help?
            </span>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
              <img
                src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                alt="AI Mentor"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img
                  src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                  alt="AI Mentor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Your AI SaaS Mentor</h3>
                <p className="text-xs text-white/70">Trained by Matt Webley</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-2 border-primary/20">
                  <img
                    src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png"
                    alt="AI Mentor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">I'm Your AI SaaS Mentor</h4>
                <p className="text-sm text-slate-500 mb-2">
                  Not just a chatbot - I know YOUR idea, YOUR features, and exactly where you are in the challenge.
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Ask me anything: strategy, tech help, motivation, or "what should I do next?"
                </p>
                <div className="space-y-2">
                  {[
                    "What should I focus on today?",
                    "I'm stuck - help me get unstuck",
                    "Give me feedback on my idea",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="block w-full text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-xl px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[40px] max-h-[100px]"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sendMessage.isPending}
                className="flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
