import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";

interface DayCompletionModalProps {
  isOpen: boolean;
  day: number;
  title: string;
  completionMessage?: string;
  xpEarned: number;
  onContinue: () => void;
}

export function DayCompletionModal({
  isOpen,
  day,
  title,
  completionMessage,
  xpEarned,
  onContinue,
}: DayCompletionModalProps) {
  if (!isOpen) return null;

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

              {/* XP Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">+{xpEarned} XP</span>
              </motion.div>

              {/* Completion Message */}
              {completionMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
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
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="w-full h-14 text-lg font-bold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                >
                  Continue to Day {day + 1} <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
