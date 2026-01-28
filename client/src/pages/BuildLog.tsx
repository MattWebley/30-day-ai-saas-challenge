import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useUserProgress } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";
import { useDayContent } from "@/hooks/useDays";
import { useUserBadges } from "@/hooks/useBadges";
import {
  Rocket,
  Lightbulb,
  Map,
  Wrench,
  Hammer,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface DayProgress {
  day: number;
  completed: boolean;
  completedAt?: string;
  userInputs?: any;
  generatedIdeas?: any[];
  shortlistedIdeas?: number[];
}

interface DayContent {
  day: number;
  title: string;
  phase: string;
}

// Correct phase configuration matching the actual challenge
const phases = [
  { name: "Start", icon: Rocket, days: [0], color: "text-purple-600", bg: "bg-purple-100" },
  { name: "Idea", icon: Lightbulb, days: [1, 2], color: "text-amber-600", bg: "bg-amber-100" },
  { name: "Plan", icon: Map, days: [3, 4], color: "text-blue-600", bg: "bg-blue-100" },
  { name: "Prepare", icon: Wrench, days: [5, 6, 7, 8, 9], color: "text-cyan-600", bg: "bg-cyan-100" },
  { name: "Build", icon: Hammer, days: [10, 11, 12, 13, 14, 15, 16, 17, 18], color: "text-orange-600", bg: "bg-orange-100" },
  { name: "Launch", icon: Sparkles, days: [19, 20, 21], color: "text-green-600", bg: "bg-green-100" },
];

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "MMM d");
  } catch {
    return "";
  }
}

// Extract key highlights from day progress
function getHighlight(dayNum: number, progress: DayProgress | undefined): string | null {
  if (!progress?.completed || !progress.userInputs) return null;
  const inputs = progress.userInputs;

  switch (dayNum) {
    case 0:
      return inputs.incomeGoal ? `Goal: $${inputs.incomeGoal.toLocaleString()}/mo` : null;
    case 1:
      const ideas = progress.generatedIdeas || [];
      const shortlisted = progress.shortlistedIdeas || [];
      if (shortlisted.length > 0 && ideas[shortlisted[0]]) {
        return ideas[shortlisted[0]].title;
      }
      return shortlisted.length > 0 ? `${shortlisted.length} ideas shortlisted` : null;
    case 2:
      return inputs.selectedIdea || inputs.selectedIdeaTitle || null;
    case 3:
      const featureCount = (inputs.selectedFeatures?.length || 0) + (inputs.coreFeatures?.length || 0);
      return featureCount > 0 ? `${featureCount} features selected` : null;
    case 4:
      return inputs.chosenName || null;
    case 5:
      return inputs.logoStyle || inputs.brandVibe || null;
    case 6:
      const toolCount = inputs.completedSetup?.length || 0;
      return toolCount > 0 ? `${toolCount} tools ready` : null;
    case 7:
      return inputs.prd ? "PRD created" : null;
    default:
      return null;
  }
}

// Get detailed content for expanded view
function DayDetails({ dayNum, progress }: { dayNum: number; progress: DayProgress | undefined }) {
  if (!progress?.completed) return null;
  const inputs = progress.userInputs || {};

  const details: { label: string; value: string }[] = [];

  // Day 0: Commitment
  if (dayNum === 0) {
    if (inputs.whyReasons?.length > 0) {
      details.push({ label: "Why", value: inputs.whyReasons.join(", ") });
    }
    if (inputs.incomeGoal) {
      details.push({ label: "Goal", value: `$${inputs.incomeGoal.toLocaleString()}/month` });
    }
    if (inputs.accountabilityMessage) {
      details.push({ label: "Promise", value: `"${inputs.accountabilityMessage}"` });
    }
  }

  // Day 1: Ideas
  if (dayNum === 1) {
    if (inputs.knowledge) {
      details.push({ label: "Background", value: inputs.knowledge });
    }
    const ideas = progress.generatedIdeas || [];
    const shortlisted = progress.shortlistedIdeas || [];
    if (shortlisted.length > 0) {
      const selectedIdeas = shortlisted.map((idx: number) => ideas[idx]?.title).filter(Boolean);
      details.push({ label: "Shortlisted", value: selectedIdeas.join(", ") });
    }
  }

  // Day 2: Validation
  if (dayNum === 2) {
    if (inputs.selectedIdea || inputs.selectedIdeaTitle) {
      details.push({ label: "Chosen idea", value: inputs.selectedIdea || inputs.selectedIdeaTitle });
    }
    if (inputs.selectedPainPoints?.length > 0) {
      details.push({ label: "Pain points", value: inputs.selectedPainPoints.join(", ") });
    }
    if (inputs.iHelpStatement) {
      details.push({ label: "I help statement", value: inputs.iHelpStatement });
    }
  }

  // Day 3: Features
  if (dayNum === 3) {
    if (inputs.coreFeatures?.length > 0) {
      details.push({ label: "Core features", value: inputs.coreFeatures.slice(0, 3).join(", ") + (inputs.coreFeatures.length > 3 ? "..." : "") });
    }
    if (inputs.uspFeatures?.length > 0) {
      details.push({ label: "USP features", value: inputs.uspFeatures.join(", ") });
    }
  }

  // Day 4: Naming
  if (dayNum === 4) {
    if (inputs.chosenName) {
      details.push({ label: "Product name", value: inputs.chosenName });
    }
    if (inputs.domainRegistered) {
      details.push({ label: "Domain", value: inputs.domainRegistered });
    }
  }

  // Day 5: Logo
  if (dayNum === 5) {
    if (inputs.brandVibe) {
      details.push({ label: "Brand vibe", value: inputs.brandVibe });
    }
    if (inputs.primaryColor) {
      details.push({ label: "Primary color", value: inputs.primaryColor });
    }
  }

  // Day 6: Tech Stack
  if (dayNum === 6) {
    if (inputs.completedSetup?.length > 0) {
      details.push({ label: "Tools set up", value: inputs.completedSetup.join(", ") });
    }
  }

  // Day 7: PRD
  if (dayNum === 7) {
    if (inputs.prd) {
      details.push({ label: "PRD", value: inputs.prd.substring(0, 100) + "..." });
    }
  }

  if (details.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
      {details.map((detail, i) => (
        <div key={i} className="text-sm">
          <span className="font-medium text-slate-700">{detail.label}:</span>{" "}
          <span className="text-slate-600">{detail.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function BuildLog() {
  const { progress, isLoading: progressLoading } = useUserProgress();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { dayContent, isLoading: contentLoading } = useDayContent();
  const { userBadges, isLoading: badgesLoading } = useUserBadges();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const isLoading = progressLoading || statsLoading || contentLoading || badgesLoading;

  const typedProgress = (progress || []) as DayProgress[];
  const typedDayContent = (dayContent || []) as DayContent[];

  // Count only Days 1-21 (not Day 0 "Start Here") for the 21-day challenge stats
  const completedDays = typedProgress.filter((p) => p.completed && p.day >= 1).length;
  const totalDays = 21;

  // Check if user has started at all (including Day 0) for showing timeline vs empty state
  const hasStarted = typedProgress.some((p) => p.completed);

  const getDayTitle = (day: number): string => {
    const content = typedDayContent.find((d) => d.day === day);
    return content?.title || `Day ${day}`;
  };

  const getDayProgress = (day: number): DayProgress | undefined => {
    return typedProgress.find((p) => p.day === day);
  };

  const getPhaseCompletion = (phaseDays: number[]) => {
    const completed = phaseDays.filter((d) =>
      typedProgress.find((p) => p.day === d && p.completed)
    ).length;
    return { completed, total: phaseDays.length, isComplete: completed === phaseDays.length };
  };

  // Find current phase (first incomplete phase)
  const currentPhaseIndex = phases.findIndex((phase) => {
    const { isComplete } = getPhaseCompletion(phase.days);
    return !isComplete;
  });

  // Get key decisions for hero section
  const productName = typedProgress.find(p => p.day === 4)?.userInputs?.chosenName;
  const chosenIdea = typedProgress.find(p => p.day === 2)?.userInputs?.selectedIdea ||
                     typedProgress.find(p => p.day === 2)?.userInputs?.selectedIdeaTitle;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Progress</h1>
          <p className="text-slate-600 mt-1">Your journey from idea to launch</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 border-2 border-slate-200 text-center">
            <p className="text-2xl font-bold text-slate-900">{completedDays}<span className="text-slate-400">/{totalDays}</span></p>
            <p className="text-sm text-slate-600">Days Complete</p>
          </Card>

          <Card className="p-4 border-2 border-slate-200 text-center">
            <p className="text-2xl font-bold text-slate-900">{(stats as any)?.currentStreak || 0}</p>
            <p className="text-sm text-slate-600">Day Streak</p>
          </Card>

          <Card className="p-4 border-2 border-slate-200 text-center">
            <p className="text-2xl font-bold text-slate-900">{Array.isArray(userBadges) ? userBadges.length : 0}</p>
            <p className="text-sm text-slate-600">Badges</p>
          </Card>
        </div>

        {/* Key Decisions Card - only show if user has made progress */}
        {(productName || chosenIdea) && (
          <Card className="p-5 border-2 border-primary/20 bg-primary/5">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">Your SaaS</p>
            {productName && (
              <p className="text-2xl font-bold text-slate-900 mb-1">{productName}</p>
            )}
            {chosenIdea && (
              <p className="text-slate-600">{chosenIdea}</p>
            )}
          </Card>
        )}

        {/* Empty State */}
        {!hasStarted && (
          <Card className="p-8 border-2 border-dashed border-slate-200 bg-slate-50 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-lg text-slate-700 mb-2">Your journey awaits</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Complete Day 0 to start building. Every decision you make will be recorded here.
            </p>
          </Card>
        )}

        {/* Timeline */}
        {hasStarted && (
          <div className="space-y-6">
            {phases.map((phase, phaseIndex) => {
              const Icon = phase.icon;
              const { completed, total, isComplete } = getPhaseCompletion(phase.days);
              const isCurrentPhase = phaseIndex === currentPhaseIndex;
              const isPastPhase = phaseIndex < currentPhaseIndex;
              const isFuturePhase = phaseIndex > currentPhaseIndex && currentPhaseIndex !== -1;

              return (
                <div key={phase.name} className={isFuturePhase ? "opacity-40" : ""}>
                  {/* Phase Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete ? "bg-green-100" : isCurrentPhase ? phase.bg : "bg-slate-100"
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isCurrentPhase ? phase.color : "text-slate-400"}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${isComplete || isCurrentPhase ? "text-slate-900" : "text-slate-400"}`}>
                        {phase.name}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${isComplete ? "text-green-600" : "text-slate-400"}`}>
                      {completed}/{total}
                    </span>
                  </div>

                  {/* Days in Phase */}
                  <div className="ml-4 border-l-2 border-slate-200 pl-6 space-y-2">
                    {phase.days.map((dayNum, dayIndex) => {
                      const dayProgress = getDayProgress(dayNum);
                      const isCompleted = dayProgress?.completed;
                      const highlight = getHighlight(dayNum, dayProgress);
                      const isExpanded = expandedDay === dayNum;
                      const isLast = dayIndex === phase.days.length - 1;

                      return (
                        <div
                          key={dayNum}
                          className={`relative ${isLast ? "" : "pb-2"}`}
                        >
                          {/* Timeline dot */}
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${
                            isCompleted
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-slate-300"
                          }`}>
                            {isCompleted && (
                              <CheckCircle2 className="w-3 h-3 text-white absolute top-0.5 left-0.5" style={{ width: '10px', height: '10px' }} />
                            )}
                          </div>

                          {/* Day Card */}
                          <div
                            className={`rounded-lg border-2 p-3 cursor-pointer transition-all ${
                              isCompleted
                                ? "bg-white border-slate-200 hover:border-primary/50"
                                : "bg-slate-50 border-slate-100"
                            }`}
                            onClick={() => isCompleted && setExpandedDay(isExpanded ? null : dayNum)}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold ${isCompleted ? "text-primary" : "text-slate-400"}`}>
                                Day {dayNum}
                              </span>
                              <span className={`flex-1 font-medium ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                                {getDayTitle(dayNum)}
                              </span>
                              {isCompleted && dayProgress?.completedAt && (
                                <span className="text-xs text-slate-400">
                                  {formatDate(dayProgress.completedAt)}
                                </span>
                              )}
                              {isCompleted && (
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              )}
                            </div>

                            {/* Highlight - always visible for completed days */}
                            {highlight && !isExpanded && (
                              <p className="text-sm text-slate-600 mt-1 ml-10">{highlight}</p>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                              <DayDetails dayNum={dayNum} progress={dayProgress} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Completion Celebration */}
        {completedDays === totalDays && (
          <Card className="p-6 border-2 border-green-200 bg-green-50 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-xl text-green-800 mb-2">Challenge Complete!</h3>
            <p className="text-green-700">
              You did it! Your SaaS journey is just beginning.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
