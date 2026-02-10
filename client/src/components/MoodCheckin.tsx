import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

const MOOD_OPTIONS = [
  { emoji: "😬", label: "Nervous", color: "border-amber-300 bg-amber-50" },
  { emoji: "🤔", label: "Curious", color: "border-blue-300 bg-blue-50" },
  { emoji: "😊", label: "Good", color: "border-green-300 bg-green-50" },
  { emoji: "🤩", label: "Excited", color: "border-purple-300 bg-purple-50" },
  { emoji: "🔥", label: "On Fire", color: "border-orange-300 bg-orange-50" },
];

const DAY_PROMPTS: Record<number, string> = {
  0: "You just took the first step! What's going through your mind?",
  4: "You've named your product! How does it feel to make it real?",
  9: "Dev tools are set up — you're ready to build. How are you feeling?",
  14: "Your MVP is taking shape! What's on your mind right now?",
  21: "You did it — 21 days, start to finish. How do you feel?",
};

interface MoodCheckinProps {
  isOpen: boolean;
  day: number;
  onClose: () => void;
}

export function MoodCheckin({ isOpen, day, onClose }: MoodCheckinProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [consentToShare, setConsentToShare] = useState(true);
  const [step, setStep] = useState<"emoji" | "text" | "done">("emoji");

  // Reset state every time the popup opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMood(null);
      setText("");
      setConsentToShare(true);
      setStep("emoji");
    }
  }, [isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: { day: number; emoji: string; emojiLabel: string; text: string; consentToShare: boolean }) => {
      const res = await apiRequest("POST", "/api/mood-checkin", data);
      return res.json();
    },
    onSuccess: () => {
      setStep("done");
      setTimeout(onClose, 1500);
    },
  });

  const handleEmojiSelect = (index: number) => {
    setSelectedMood(index);
    setStep("text");
  };

  const handleSubmit = () => {
    if (selectedMood === null) return;
    const mood = MOOD_OPTIONS[selectedMood];
    saveMutation.mutate({
      day,
      emoji: mood.emoji,
      emojiLabel: mood.label,
      text: text.trim(),
      consentToShare: text.trim().length > 0 ? consentToShare : false,
    });
  };

  const handleSkipText = () => {
    if (selectedMood === null) return;
    const mood = MOOD_OPTIONS[selectedMood];
    saveMutation.mutate({
      day,
      emoji: mood.emoji,
      emojiLabel: mood.label,
      text: "",
      consentToShare: false,
    });
  };

  if (!isOpen) return null;

  const prompt = DAY_PROMPTS[day] || "How are you feeling right now?";
  const isPositiveMood = selectedMood !== null && selectedMood >= 2; // Good, Excited, or On Fire

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 border-2 border-slate-200 bg-white shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {step === "emoji" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-5"
              >
                <div>
                  <p className="text-lg font-bold text-slate-900 mb-1">Quick check-in</p>
                  <p className="text-slate-600">How are you feeling right now?</p>
                </div>

                <div className="flex justify-center gap-3">
                  {MOOD_OPTIONS.map((mood, i) => (
                    <motion.button
                      key={mood.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => handleEmojiSelect(i)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-110 ${
                        selectedMood === i
                          ? mood.color + " scale-110"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-xs font-medium text-slate-600">{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "text" && selectedMood !== null && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <span className="text-4xl">{MOOD_OPTIONS[selectedMood].emoji}</span>
                  <p className="text-slate-700 mt-2 font-medium">{prompt}</p>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Totally optional — but we'd love to hear..."
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
                  rows={3}
                  maxLength={500}
                  autoFocus
                />

                {text.trim().length > 0 && isPositiveMood && (
                  <motion.label
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={consentToShare}
                      onChange={(e) => setConsentToShare(e.target.checked)}
                      className="mt-1 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">
                      Happy for others to see this? It might inspire someone just starting out.
                    </span>
                  </motion.label>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSkipText}
                    disabled={saveMutation.isPending}
                  >
                    Skip
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                    onClick={handleSubmit}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? "Saving..." : "Submit"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-2"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-5xl block"
                >
                  {selectedMood !== null ? MOOD_OPTIONS[selectedMood].emoji : "✅"}
                </motion.span>
                <p className="text-lg font-bold text-slate-900">Thanks!</p>
                <p className="text-slate-600">Keep going — you're doing great.</p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Days that trigger a mood check-in after completion
export const MOOD_CHECKIN_DAYS = [0, 4, 9, 14, 21];
