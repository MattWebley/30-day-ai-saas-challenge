import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";

// Badge data for days that award badges
const DAY_BADGES: Record<number, { name: string; icon: string; description: string }> = {
  0: { name: "All In", icon: "🤝", description: "Made a commitment to yourself" },
  2: { name: "Ideator", icon: "💡", description: "You've picked your winning idea" },
  4: { name: "Strategist", icon: "🗺️", description: "Your product is planned and named" },
  9: { name: "Ready to Build", icon: "🎯", description: "Tools set up, PRD ready, let's build" },
  18: { name: "Builder", icon: "🏗️", description: "Your MVP is complete" },
  21: { name: "The Launcher", icon: "🚀", description: "You launched your SaaS!" },
};

interface DayCompletionModalProps {
  isOpen: boolean;
  day: number;
  title: string;
  completionMessage?: string;
  onContinue: () => void;
}

export function DayCompletionModal({
  isOpen,
  day,
  title,
  completionMessage,
  onContinue,
}: DayCompletionModalProps) {
  if (!isOpen) return null;

  const earnedBadge = DAY_BADGES[day];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="p-8 border-2 border-primary bg-white shadow-2xl">
            <div className="text-center space-y-6">
              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Day {day} Complete!
                  </h2>
                  <p className="text-lg text-slate-600">{title}</p>
                </motion.div>
              </div>

              {/* Badge Earned */}
              {earnedBadge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <div className="inline-flex flex-col items-center gap-2 px-8 py-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow-lg">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                      Badge Earned!
                    </div>
                    <span className="text-5xl mt-2">{earnedBadge.icon}</span>
                    <span className="text-lg font-bold text-slate-900">{earnedBadge.name}</span>
                    <span className="text-sm text-slate-600">{earnedBadge.description}</span>
                  </div>
                </motion.div>
              )}

              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: earnedBadge ? 0.5 : 0.4 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-full border-2 border-slate-200"
              >
                <span className="text-slate-900 font-bold text-lg">Day {day}/21 Complete</span>
              </motion.div>

              {/* Completion Message */}
              {completionMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: earnedBadge ? 0.6 : 0.5 }}
                  className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200"
                >
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {completionMessage}
                  </p>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: earnedBadge ? 0.7 : 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="w-full h-14 text-lg font-bold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                >
                  {day === 21 ? "View Your Achievement" : `Continue to Day ${day + 1}`} <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
