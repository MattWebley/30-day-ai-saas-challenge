import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, X, Send, Bug } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";

interface ReportProblemProps {
  currentDay?: number;
}

export function ReportProblem({ currentDay }: ReportProblemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { user } = useAuth() as { user: any };
  const { progress } = useUserProgress();
  const { stats } = useUserStats() as { stats: any };

  const getDebugInfo = () => {
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const progressSummary = Array.isArray(progress)
      ? progress.map((p: any) => ({
          day: p.day,
          completed: p.completed,
          completedAt: p.completedAt,
        }))
      : [];

    return {
      timestamp: new Date().toISOString(),
      currentDay,
      currentUrl: window.location.href,
      user: user ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      } : null,
      stats: stats ? {
        currentStreak: stats.currentStreak,
        lastCompletedDay: stats.lastCompletedDay,
        lastActivityDate: stats.lastActivityDate,
      } : null,
      progressSummary,
      browser: browserInfo,
    };
  };

  const handleSendReport = () => {
    if (!description.trim()) return;

    setIsSending(true);

    const debugInfo = getDebugInfo();
    const debugText = JSON.stringify(debugInfo, null, 2);

    const subject = encodeURIComponent(`[21 Day Challenge Bug] Day ${currentDay ?? 'Unknown'} - Issue Report`);
    const body = encodeURIComponent(
      `PROBLEM DESCRIPTION:\n${description}\n\n` +
      `---\n\n` +
      `DEBUG INFORMATION (please don't delete this):\n\n${debugText}`
    );

    // Open mailto link
    window.location.href = `mailto:matt@mattwebley.com?subject=${subject}&body=${body}`;

    // Reset after a short delay
    setTimeout(() => {
      setIsSending(false);
      setDescription("");
      setIsOpen(false);
    }, 1000);
  };

  const handleCopyDebugInfo = () => {
    const debugInfo = getDebugInfo();
    const text = `PROBLEM: ${description}\n\nDEBUG INFO:\n${JSON.stringify(debugInfo, null, 2)}`;
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-slate-600 gap-1.5"
      >
        <Bug className="w-4 h-4" />
        <span className="hidden sm:inline">Report Problem</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6 bg-white shadow-2xl border-2 border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Report a Problem</h3>
              <p className="text-sm text-slate-500">Something not working? Let me know!</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              What's the problem?
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, what you expected to happen, and any steps to reproduce the issue..."
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              The following debug info will be included:
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Current day: {currentDay ?? 'Not on a day page'}</li>
              <li>• Your progress and stats</li>
              <li>• Browser and device info</li>
              <li>• Timestamp: {new Date().toLocaleString()}</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSendReport}
              disabled={!description.trim() || isSending}
              className="flex-1 gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Opening Email..." : "Send Report"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyDebugInfo}
              disabled={!description.trim()}
            >
              Copy Info
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            This will open your email app. If that doesn't work, use "Copy Info" and email matt@mattwebley.com directly.
          </p>
        </div>
      </Card>
    </div>
  );
}
