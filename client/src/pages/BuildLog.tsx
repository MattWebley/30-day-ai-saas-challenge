import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUserProgress } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";
import { useDayContent } from "@/hooks/useDays";
import {
  Rocket,
  Lightbulb,
  Map,
  Hammer,
  Sparkles,
  CheckCircle2,
  Lock,
  Calendar,
  Flame,
  Zap,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

interface DayProgress {
  day: number;
  completed: boolean;
  completedAt?: string;
  userInputs?: any;
  generatedIdeas?: any[];
  shortlistedIdeas?: number[];
  microDecisionChoice?: string;
  reflectionAnswer?: string;
}

interface DayContent {
  day: number;
  title: string;
  phase: string;
}

// Phase configuration
const phases = [
  { name: "Start", icon: Rocket, days: [0] },
  { name: "Idea", icon: Lightbulb, days: [1, 2, 3, 4] },
  { name: "Plan", icon: Map, days: [5, 6, 7] },
  { name: "Build", icon: Hammer, days: [8, 9, 10, 11, 12, 13, 14] },
  { name: "Polish", icon: Sparkles, days: [15, 16, 17, 18] },
  { name: "Launch", icon: Rocket, days: [19, 20, 21] },
];

// Helper to get day progress
function getDayProgress(progress: DayProgress[], day: number): DayProgress | undefined {
  return progress.find((p) => p.day === day);
}

// Helper to format completion date
function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return "";
  }
}

// Render day-specific content based on what data exists
function DayDetails({ dayNum, progress }: { dayNum: number; progress: DayProgress | undefined }) {
  if (!progress || !progress.completed) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
        <Lock className="w-4 h-4" />
        <span>Not completed yet</span>
      </div>
    );
  }

  const inputs = progress.userInputs || {};

  // Day 0: Commitment
  if (dayNum === 0) {
    return (
      <div className="space-y-3 text-sm">
        {inputs.whyReasons && inputs.whyReasons.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Why I'm doing this:</p>
            <ul className="list-disc list-inside text-slate-600 ml-2">
              {inputs.whyReasons.map((reason: string, i: number) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        {inputs.incomeGoal && (
          <div>
            <p className="font-medium text-slate-700">Income goal:</p>
            <p className="text-slate-600 ml-2">
              {typeof inputs.incomeGoal === "number"
                ? `$${inputs.incomeGoal.toLocaleString()}/month`
                : inputs.incomeGoal}
            </p>
          </div>
        )}
        {inputs.accountabilityMessage && (
          <div>
            <p className="font-medium text-slate-700">My promise:</p>
            <p className="text-slate-600 ml-2 italic">"{inputs.accountabilityMessage}"</p>
          </div>
        )}
      </div>
    );
  }

  // Day 1: Ideas
  if (dayNum === 1) {
    const ideas = progress.generatedIdeas || [];
    const shortlisted = progress.shortlistedIdeas || [];
    const selectedIdeas = shortlisted.map((idx: number) => ideas[idx]).filter(Boolean);

    return (
      <div className="space-y-3 text-sm">
        {inputs.knowledge && (
          <div>
            <p className="font-medium text-slate-700">Background:</p>
            <p className="text-slate-600 ml-2">{inputs.knowledge}</p>
          </div>
        )}
        {selectedIdeas.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Shortlisted ideas:</p>
            <ul className="space-y-2 ml-2 mt-1">
              {selectedIdeas.map((idea: any, i: number) => (
                <li key={i} className="text-slate-600">
                  <span className="font-medium">{idea.title}</span>
                  {idea.desc && <span className="text-slate-500"> - {idea.desc}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Day 2: Chosen Idea & Validation
  if (dayNum === 2) {
    return (
      <div className="space-y-3 text-sm">
        {(inputs.selectedIdea || inputs.chosenIdea !== undefined) && (
          <div>
            <p className="font-medium text-slate-700">Chosen idea:</p>
            <p className="text-slate-600 ml-2 font-medium">
              {inputs.selectedIdea || inputs.selectedIdeaTitle || `Idea #${inputs.chosenIdea + 1}`}
            </p>
          </div>
        )}
        {inputs.selectedPainPoints && inputs.selectedPainPoints.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Pain points to solve:</p>
            <ul className="list-disc list-inside text-slate-600 ml-2">
              {inputs.selectedPainPoints.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Day 3: Features
  if (dayNum === 3) {
    return (
      <div className="space-y-3 text-sm">
        {inputs.bleedingNeckProblem && (
          <div>
            <p className="font-medium text-slate-700">Core problem:</p>
            <p className="text-slate-600 ml-2">{inputs.bleedingNeckProblem}</p>
          </div>
        )}
        {inputs.coreFeatures && inputs.coreFeatures.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Core features:</p>
            <ul className="list-disc list-inside text-slate-600 ml-2">
              {inputs.coreFeatures.map((feature: string, i: number) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        {inputs.uspFeatures && inputs.uspFeatures.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">USP features:</p>
            <ul className="list-disc list-inside text-slate-600 ml-2">
              {inputs.uspFeatures.map((feature: string, i: number) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        {inputs.selectedFeatures && inputs.selectedFeatures.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Selected features:</p>
            <ul className="list-disc list-inside text-slate-600 ml-2">
              {inputs.selectedFeatures.map((feature: string, i: number) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Day 4: Naming & Pitch
  if (dayNum === 4) {
    return (
      <div className="space-y-3 text-sm">
        {inputs.chosenName && (
          <div>
            <p className="font-medium text-slate-700">Product name:</p>
            <p className="text-slate-600 ml-2 font-bold text-lg">{inputs.chosenName}</p>
          </div>
        )}
        {inputs.finalPitch && (
          <div>
            <p className="font-medium text-slate-700">Pitch:</p>
            <p className="text-slate-600 ml-2 italic">"{inputs.finalPitch}"</p>
          </div>
        )}
        {inputs.domainRegistered && (
          <div>
            <p className="font-medium text-slate-700">Domain:</p>
            <p className="text-slate-600 ml-2">{inputs.domainRegistered}</p>
          </div>
        )}
      </div>
    );
  }

  // Day 5: Tech Stack
  if (dayNum === 5) {
    return (
      <div className="space-y-3 text-sm">
        {inputs.completedSetup && inputs.completedSetup.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Tools set up:</p>
            <ul className="list-disc list-inside text-slate-600 ml-2">
              {inputs.completedSetup.map((tool: string, i: number) => (
                <li key={i}>{tool}</li>
              ))}
            </ul>
          </div>
        )}
        {inputs.mustHaveFeatures && inputs.mustHaveFeatures.length > 0 && (
          <div>
            <p className="font-medium text-slate-700">Must-have features:</p>
            <ul className="list-disc list-inside text-slate-600 ml-2">
              {inputs.mustHaveFeatures.map((feature: string, i: number) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        {inputs.killerFeature && (
          <div>
            <p className="font-medium text-slate-700">Killer feature:</p>
            <p className="text-slate-600 ml-2 font-medium">{inputs.killerFeature}</p>
          </div>
        )}
      </div>
    );
  }

  // Day 6: PRD
  if (dayNum === 6) {
    return (
      <div className="space-y-3 text-sm">
        {inputs.summary && (
          <div>
            <p className="font-medium text-slate-700">Summary:</p>
            <p className="text-slate-600 ml-2">{inputs.summary}</p>
          </div>
        )}
        {inputs.prd && (
          <div>
            <p className="font-medium text-slate-700">PRD created:</p>
            <p className="text-slate-600 ml-2 text-xs">
              {inputs.prd.length > 200 ? inputs.prd.substring(0, 200) + "..." : inputs.prd}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Day 7: Replit Setup
  if (dayNum === 7) {
    return (
      <div className="space-y-3 text-sm">
        {inputs.replitUrl && (
          <div>
            <p className="font-medium text-slate-700">Replit project:</p>
            <a
              href={inputs.replitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-2"
            >
              {inputs.replitUrl}
            </a>
          </div>
        )}
        {inputs.checklist && (
          <div>
            <p className="font-medium text-slate-700">Completed steps:</p>
            <p className="text-slate-600 ml-2">{Object.keys(inputs.checklist).filter(k => inputs.checklist[k]).length} items checked</p>
          </div>
        )}
      </div>
    );
  }

  // Days 8+: Generic display of available data
  const genericContent = [];

  if (inputs.auditResults && Array.isArray(inputs.auditResults)) {
    genericContent.push(
      <div key="audit">
        <p className="font-medium text-slate-700">Audit results:</p>
        <p className="text-slate-600 ml-2">{inputs.auditResults.length} items reviewed</p>
      </div>
    );
  }

  if (inputs.checklist && typeof inputs.checklist === "object") {
    const completed = Object.values(inputs.checklist).filter(Boolean).length;
    const total = Object.keys(inputs.checklist).length;
    genericContent.push(
      <div key="checklist">
        <p className="font-medium text-slate-700">Checklist:</p>
        <p className="text-slate-600 ml-2">{completed}/{total} items completed</p>
      </div>
    );
  }

  if (inputs.authMethod) {
    genericContent.push(
      <div key="auth">
        <p className="font-medium text-slate-700">Auth method:</p>
        <p className="text-slate-600 ml-2">{inputs.authMethod}</p>
      </div>
    );
  }

  if (inputs.emailProvider) {
    genericContent.push(
      <div key="email">
        <p className="font-medium text-slate-700">Email provider:</p>
        <p className="text-slate-600 ml-2">{inputs.emailProvider}</p>
      </div>
    );
  }

  if (inputs.brandColors) {
    genericContent.push(
      <div key="brand">
        <p className="font-medium text-slate-700">Brand colors set</p>
      </div>
    );
  }

  if (inputs.launched) {
    genericContent.push(
      <div key="launched" className="flex items-center gap-2 text-green-600 font-bold">
        <Rocket className="w-4 h-4" />
        <span>LAUNCHED!</span>
      </div>
    );
  }

  // Show reflection if available
  if (progress.reflectionAnswer) {
    genericContent.push(
      <div key="reflection">
        <p className="font-medium text-slate-700">Reflection:</p>
        <p className="text-slate-600 ml-2 italic">"{progress.reflectionAnswer}"</p>
      </div>
    );
  }

  if (genericContent.length > 0) {
    return <div className="space-y-3 text-sm">{genericContent}</div>;
  }

  // Fallback: just show completed
  return (
    <div className="flex items-center gap-2 text-primary text-sm py-2">
      <CheckCircle2 className="w-4 h-4" />
      <span>Completed</span>
    </div>
  );
}

export default function BuildLog() {
  const { progress, isLoading: progressLoading } = useUserProgress();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { dayContent, isLoading: contentLoading } = useDayContent();

  const isLoading = progressLoading || statsLoading || contentLoading;

  // Type cast progress
  const typedProgress = (progress || []) as DayProgress[];
  const typedDayContent = (dayContent || []) as DayContent[];

  // Calculate stats
  const completedDays = typedProgress.filter((p) => p.completed).length;
  const totalDays = 22; // 0-21

  // Get day title from content
  const getDayTitle = (day: number): string => {
    const content = typedDayContent.find((d) => d.day === day);
    return content?.title || `Day ${day}`;
  };

  // Check if phase has any completed days
  const getPhaseProgress = (phaseDays: number[]) => {
    const completed = phaseDays.filter((d) =>
      typedProgress.find((p) => p.day === d && p.completed)
    ).length;
    return { completed, total: phaseDays.length };
  };

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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Progress</h1>
          <p className="text-muted-foreground mt-2">
            Your complete journey from idea to launch.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedDays}/{totalDays}</p>
                <p className="text-xs text-slate-500">Days Completed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{(stats as any)?.currentStreak || 0}</p>
                <p className="text-xs text-slate-500">Current Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{(stats as any)?.totalXp || 0}</p>
                <p className="text-xs text-slate-500">Total XP</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Empty State */}
        {completedDays === 0 && (
          <Card className="p-8 border-2 border-dashed border-slate-200 bg-slate-50 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-lg text-slate-700 mb-2">Your journey awaits</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Complete Day 0 to start building your log. Every decision, every milestone will be recorded here.
            </p>
          </Card>
        )}

        {/* Phase Accordions */}
        {completedDays > 0 && (
          <Accordion type="multiple" className="space-y-4">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const phaseProgress = getPhaseProgress(phase.days);
              const hasAnyProgress = phaseProgress.completed > 0;

              return (
                <AccordionItem
                  key={phase.name}
                  value={phase.name}
                  className={`border-2 rounded-lg overflow-hidden border-slate-200 ${hasAnyProgress ? "bg-white" : "bg-slate-50"}`}
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasAnyProgress ? "bg-primary/10" : "bg-slate-100"}`}>
                        <Icon className={`w-5 h-5 ${hasAnyProgress ? "text-primary" : "text-slate-400"}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-bold ${hasAnyProgress ? "text-slate-900" : "text-slate-500"}`}>
                          {phase.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Days {phase.days[0]}-{phase.days[phase.days.length - 1]} · {phaseProgress.completed}/{phaseProgress.total} complete
                        </p>
                      </div>
                      {phaseProgress.completed === phaseProgress.total && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 mt-2">
                      {phase.days.map((dayNum) => {
                        const dayProgress = getDayProgress(typedProgress, dayNum);
                        const isCompleted = dayProgress?.completed;

                        return (
                          <Accordion key={dayNum} type="single" collapsible>
                            <AccordionItem value={`day-${dayNum}`} className="border rounded-lg bg-white">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center gap-3 w-full">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isCompleted
                                      ? "bg-primary/10 text-primary"
                                      : "bg-slate-100 text-slate-400"
                                  }`}>
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : dayNum}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className={`font-medium text-sm ${isCompleted ? "text-slate-900" : "text-slate-500"}`}>
                                      Day {dayNum}: {getDayTitle(dayNum)}
                                    </p>
                                    {isCompleted && dayProgress?.completedAt && (
                                      <p className="text-xs text-slate-400">
                                        Completed {formatDate(dayProgress.completedAt)}
                                      </p>
                                    )}
                                  </div>
                                  {isCompleted && (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-0">
                                <div className="pl-11 border-l-2 border-slate-100 ml-4">
                                  <DayDetails dayNum={dayNum} progress={dayProgress} />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </Layout>
  );
}
