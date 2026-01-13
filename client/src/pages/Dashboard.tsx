import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Trophy,
  ChevronRight,
  Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { useDayContent } from "@/hooks/useDays";
import { useUserProgress, useCompleteDay } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";
import { useAllBadges, useUserBadges } from "@/hooks/useBadges";
import { Day0StartHere } from "@/components/Day0StartHere";
import { Day1IdeaGenerator } from "@/components/Day1IdeaGenerator";
import { Day2IdeaValidator } from "@/components/Day2IdeaValidator";
import { Day3CoreFeatures } from "@/components/Day3CoreFeatures";
import { Day4Naming } from "@/components/Day4Naming";
import { Day5TechStack } from "@/components/Day5TechStack";
import { Day6SummaryPRD } from "@/components/Day6SummaryPRD";
import { Day7ReplitBuild } from "@/components/Day7ReplitBuild";
import { Day8ClaudeCode } from "@/components/Day8ClaudeCode";
import { Day9RealityCheck } from "@/components/Day9RealityCheck";
import { Day10AIBrain } from "@/components/Day10AIBrain";
import { Day11AddSuperpowers } from "@/components/Day11AddSuperpowers";
import { Day12LetUsersIn } from "@/components/Day12LetUsersIn";
import { Day13ReachYourUsers } from "@/components/Day13ReachYourUsers";
import { Day17Onboarding } from "@/components/Day17Onboarding";
import { Day18AdminDashboard } from "@/components/Day18AdminDashboard";
import { Day19MobileReady } from "@/components/Day19MobileReady";
import { Day20BrandBeauty } from "@/components/Day20BrandBeauty";
import { Day21LaunchDay } from "@/components/Day21LaunchDay";
import { Day17BuildItOut } from "@/components/Day17BuildItOut";
import { Day18TestEverything } from "@/components/Day18TestEverything";
import { DayChat } from "@/components/DayChat";
import { DayInstructions } from "@/components/DayInstructions";
import { DayCompletionModal } from "@/components/DayCompletionModal";
import { VideoSlides } from "@/components/VideoSlides";
import { toast } from "sonner";

// Helper to detect subheadlines in lessons (short lines ending with ":" or all-caps patterns)
const isSubheadline = (paragraph: string): boolean => {
  const trimmed = paragraph.trim();
  // Short lines ending with colon are subheadlines
  if (trimmed.length < 80 && trimmed.endsWith(':')) return true;
  // Known patterns
  if (trimmed.startsWith('STEP ')) return true;
  if (trimmed.startsWith('PART ')) return true;
  if (trimmed.startsWith('THE ') && trimmed.length < 50) return true;
  if (trimmed.startsWith('BUILD →')) return true;
  if (trimmed === 'The WINNING FORMULA') return true;
  // Short all-caps lines
  const upperRatio = (trimmed.match(/[A-Z]/g) || []).length / trimmed.length;
  if (trimmed.length < 60 && upperRatio > 0.6) return true;
  return false;
};

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:day");
  const [location, setLocation] = useLocation();
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | undefined>();
  const [microDecisionChoice, setMicroDecisionChoice] = useState<string>("");
  const [reflectionAnswer, setReflectionAnswer] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Determine current day from URL or default to 0 (Start Here)
  const currentDay = params?.day ? parseInt(params.day) : 0;
  
  // Fetch data
  const { dayContent: allDays, isLoading: daysLoading } = useDayContent();
  const { progress, isLoading: progressLoading } = useUserProgress();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { badges: allBadges } = useAllBadges();
  const { userBadges } = useUserBadges();
  const completeDay = useCompleteDay();

  // Get earned badge IDs
  const earnedBadgeIds = new Set((userBadges as any[])?.map((ub: any) => ub.badgeId) || []);

  const dayData = Array.isArray(allDays) ? allDays.find((d: any) => d.day === currentDay) : null;
  const dayProgress = Array.isArray(progress) ? progress.find((p: any) => p.day === currentDay) : null;
  const previousDayProgress = Array.isArray(progress) ? progress.find((p: any) => p.day === currentDay - 1) : null;

  // Reset form when day changes
  useEffect(() => {
    if (dayProgress) {
      setSelectedSuggestion(dayProgress.selectedSuggestion || undefined);
      setMicroDecisionChoice(dayProgress.microDecisionChoice || "");
      setReflectionAnswer(dayProgress.reflectionAnswer || "");
    } else {
      setSelectedSuggestion(undefined);
      setMicroDecisionChoice("");
      setReflectionAnswer("");
    }
  }, [currentDay, dayProgress]);

  // Handle completion
  const handleComplete = async (componentData?: any) => {
    console.log('[Dashboard] handleComplete called', { currentDay, componentData });

    if (!dayData) {
      console.error('handleComplete: dayData is null/undefined, returning early');
      toast.error("Day content not loaded. Please refresh the page.");
      return;
    }

    console.log('[Dashboard] dayData exists, calling API...');

    try {
      const result = await completeDay.mutateAsync({
        day: currentDay,
        data: {
          selectedSuggestion,
          microDecisionChoice,
          reflectionAnswer,
          ...componentData,
        },
      });
      console.log('[Dashboard] API success:', result);

      // Special handling for Day 0 (Start Here)
      if (currentDay === 0) {
        // Post commitment to discussion if user opted in
        if (componentData?.shareToDiscussion && componentData?.accountabilityMessage) {
          try {
            const response = await fetch("/api/comments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                day: 0,
                content: `🎯 My Commitment: ${componentData.accountabilityMessage}`
              })
            });
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || "Failed to post comment");
            }
          } catch (error) {
            console.error("Failed to post commitment to discussion:", error);
          }
        }

        if (componentData?.startDay1Now) {
          // User chose to start Day 1 immediately
          toast.success("Let's do this! Starting Day 1...");
          setLocation("/dashboard/1");
        } else {
          // User chose to start tomorrow
          toast.success("See you tomorrow! Your commitment is locked in.");
          setLocation("/dashboard/1");
        }
        return;
      }

      // Show completion modal for other days
      console.log('[Dashboard] Showing completion modal for day', currentDay);
      setShowCompletionModal(true);
    } catch (error) {
      console.error("[Dashboard] Failed to complete day:", error);
      toast.error("Failed to complete day");
    }
  };

  const handleContinueFromModal = () => {
    setShowCompletionModal(false);
    // Navigate to next day if not the last day
    if (currentDay < 21) {
      setLocation(`/dashboard/${currentDay + 1}`);
    }
  };


  if (daysLoading || progressLoading || !dayData) {
    return (
      <Layout currentDay={currentDay}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium">Loading day content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const suggestions = dayData.suggestions || null;
  const microDecisionOptions = dayData.microDecisionOptions || null;

  return (
    <Layout currentDay={currentDay}>
      <div className="space-y-8 pb-20 font-sans">
        {/* Header - Clean & Sharp */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                Day {dayData.day}
              </span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{dayData.phase}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{dayData.title}</h1>
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
              {dayData.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <div className="text-right hidden md:block">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Time</div>
               <div className="font-bold text-slate-900 text-lg">5 Min</div>
             </div>
             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
             <Button variant="outline" className="gap-2 border-2 border-slate-200 hover:border-primary hover:text-primary font-bold">
               <Play className="w-4 h-4" /> Watch Lesson
             </Button>
          </div>
        </div>

        {/* Matt Webley's Tip */}
        {dayData.tip && (
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg">
            <div className="flex items-start gap-4">
              <img 
                src="/matt-webley.png" 
                alt="Matt Webley"
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="font-bold text-black text-sm uppercase tracking-wide mb-1">Matt Webley's Tip</p>
                <p className="text-slate-700 font-medium leading-relaxed">{dayData.tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <DayInstructions day={currentDay} outcome={dayData.outcome} />

        {/* Main Task Area */}
        <div className="space-y-8">

            {/* Day 0: Start Here */}
            {currentDay === 0 ? (
              <Day0StartHere onComplete={handleComplete} />
            ) : currentDay === 1 ? (
              <>
                {/* Step 1: Today's Lesson */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                      <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                    </div>
                    <VideoSlides day={1} />
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0 whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">{dayData.description}</p>
                    )}
                  </Card>
                </div>

                {/* Step 2: Idea Generator */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Find Your Winning Idea</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day1IdeaGenerator 
                      existingProgress={dayProgress}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
              </>
            ) : currentDay === 2 ? (
              <>
                {/* Step 1: Today's Lesson */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                      <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                    </div>
                    <VideoSlides day={2} />
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0 whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">{dayData.description}</p>
                    )}
                  </Card>
                </div>

                {/* Step 2: Idea Validator */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Validate & Choose Your Idea</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day2IdeaValidator onComplete={handleComplete} />
                  </Card>
                </div>
              </>
            ) : currentDay === 3 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={3} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 3: Core Features & USP */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Build Your Feature List</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day3CoreFeatures
                      dayId={currentDay}
                      userIdea={previousDayProgress?.userInputs?.chosenIdea || previousDayProgress?.selectedIdea || ""}
                      userPainPoints={previousDayProgress?.userInputs?.selectedPainPoints || previousDayProgress?.selectedPainPoints || []}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
              </>
            ) : currentDay === 4 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={4} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 4: Naming Your Product */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Name & Claim Your Brand</h2>
                  </div>
                  <Day4Naming
                    dayId={currentDay}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                    painPoints={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.selectedPainPoints || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedPainPoints || []}
                    features={(Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.userInputs?.selectedFeatures || (Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.selectedFeatures || []}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 5 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={5} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 5: Tech Stack Setup */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Set Up Your AI Toolkit</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day5TechStack
                      dayId={currentDay}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
                {/* Your $500/hr Business Advisor */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">3</div>
                    <h2 className="font-bold text-xl text-slate-900">Your $500/hr Business Advisor</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-200 shadow-none bg-white">
                    <div className="space-y-4">
                      <p className="text-slate-700 font-medium">
                        Here's what most people miss: These aren't just coding tools. You now have access to a business advisor that would cost $500/hour - available 24/7 for $20/month.
                      </p>
                      <div className="space-y-2">
                        <p className="text-slate-900 font-bold">USE IT FOR EVERYTHING:</p>
                        <ul className="space-y-1 text-slate-700">
                          <li>• <span className="font-medium">Pricing:</span> "Should I charge $29 or $49/month?"</li>
                          <li>• <span className="font-medium">Features:</span> "Which 3 features should I build first?"</li>
                          <li>• <span className="font-medium">Copy:</span> "Write me 5 taglines for my SaaS"</li>
                          <li>• <span className="font-medium">User perspective:</span> "Act as my target customer and critique this"</li>
                          <li>• <span className="font-medium">Strategy:</span> "I'm stuck between two approaches, help me decide"</li>
                        </ul>
                      </div>
                      <p className="text-slate-700">
                        The founders who WIN treat AI as a <span className="font-bold">THINKING PARTNER</span>, not just a code generator.
                      </p>
                      <p className="text-slate-900 font-bold text-lg">
                        From now on: STUCK? ASK. UNSURE? ASK. WANT VALIDATION? ASK.
                      </p>
                    </div>
                  </Card>
                </div>
              </>
            ) : currentDay === 6 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={6} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 6: Summary + PRD */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Generate Your PRD</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day6SummaryPRD
                      dayId={currentDay}
                      userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                      painPoints={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.selectedPainPoints || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedPainPoints || []}
                      features={(Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.userInputs?.selectedFeatures || (Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.selectedFeatures || []}
                      mvpFeatures={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.selectedMvpFeatures || (Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.selectedMvpFeatures || []}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
                {/* Replit Cost Warning */}
                <div className="space-y-4 pt-4">
                  <Card className="p-6 border-2 border-slate-200 shadow-none bg-white">
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900">Heads Up About Replit Costs</h3>
                      <p className="text-slate-700">
                        Replit Agent is AMAZING but the fees add up FAST. You'll burn through credits quicker than you think.
                      </p>
                      <p className="text-slate-700 font-medium">
                        DON'T PANIC. Tomorrow I'll show you how to drop your build costs to almost ZERO using Claude Code. Same power, fraction of the price.
                      </p>
                      <p className="text-slate-500 text-sm">
                        For now, just get your PRD in and let Replit do its thing. We'll fix the money bleed tomorrow.
                      </p>
                    </div>
                  </Card>
                </div>
              </>
            ) : currentDay === 7 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={7} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 7: PRD into Replit */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Start Building</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day7ReplitBuild
                      dayId={currentDay}
                      prd={previousDayProgress?.userInputs?.prd || previousDayProgress?.prd || ""}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
              </>
            ) : currentDay === 8 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={8} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 8: Master Claude Code */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Get Your First Win</h2>
                  </div>
                  <Day8ClaudeCode
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 9 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={9} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 9: The Build Loop */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Practice The Loop</h2>
                  </div>
                  <Day9RealityCheck
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 10 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={10} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 10: Add AI Brain */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Add AI Power</h2>
                  </div>
                  <Day10AIBrain
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 11 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={11} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 11: Add Superpowers (APIs) */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Add Your Superpowers</h2>
                  </div>
                  <Day11AddSuperpowers
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 12 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={12} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 12: Let Users In (Auth) */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Set Up Authentication</h2>
                  </div>
                  <Day12LetUsersIn
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 13 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={13} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 13: Reach Your Users (Email) */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Set Up Email</h2>
                  </div>
                  <Day13ReachYourUsers
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.chosenName || "Your App"}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 14 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={14} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 14: Mobile Ready */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Test on Mobile</h2>
                  </div>
                  <Day19MobileReady
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.chosenName || "Your App"}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 15 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={15} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 15: User Onboarding */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Build Onboarding</h2>
                  </div>
                  <Day17Onboarding
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.chosenName || "Your App"}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 16 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={16} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 16: Admin Dashboard */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Build Your Dashboard</h2>
                  </div>
                  <Day18AdminDashboard
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.chosenName || "Your App"}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 17 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={17} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 17: Build It Out - THE PAUSE POINT */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Build Mode</h2>
                  </div>
                  <Day17BuildItOut onComplete={handleComplete} />
                </div>
              </>
            ) : currentDay === 18 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={18} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 18: Test Everything */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Test Everything</h2>
                  </div>
                  <Day18TestEverything
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 19 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={19} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 19: Brand & Beauty */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Polish Your Brand</h2>
                  </div>
                  <Day20BrandBeauty
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.chosenName || "Your App"}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 21 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={21} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{paragraph}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 21: Launch Day! */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Launch Your SaaS</h2>
                  </div>
                  <Day21LaunchDay
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.chosenName || "Your App"}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Step 1: Today's Lesson */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                  </div>

                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0 whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">{dayData.description}</p>
                    )}
                  </Card>
                </div>

            {/* Step 2: Micro Decision */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold">2</div>
                <h2 className="font-bold text-xl text-slate-900">Micro Decision</h2>
              </div>
              <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                <p className="text-slate-600 font-medium mb-4">
                  {dayData.microDecisionQuestion || "Make a decision to move forward. Don't overthink it."}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                   {(microDecisionOptions || ["Option A", "Option B"]).map((opt: string) => (
                     <Button 
                       key={opt} 
                       variant="outline" 
                       className={`justify-start h-14 border-2 text-base font-semibold ${microDecisionChoice === opt ? 'border-primary text-primary bg-blue-50' : 'text-slate-600 border-slate-100 hover:border-primary hover:text-primary hover:bg-blue-50/50'}`}
                       onClick={() => setMicroDecisionChoice(opt)}
                       data-testid={`micro-decision-${opt}`}
                     >
                       {opt}
                     </Button>
                   ))}
                </div>
              </Card>
            </div>

             {/* Step 3: Reflection */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold">3</div>
                <h2 className="font-bold text-xl text-slate-900">Reflection</h2>
              </div>
              <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                <label className="font-semibold text-slate-900 block mb-3">
                  {dayData.reflectionQuestion || "One sentence takeaway from today:"}
                </label>
                <textarea 
                  className="w-full min-h-[120px] rounded-lg border-2 border-slate-200 bg-slate-50 p-4 text-base font-medium shadow-none placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 resize-none transition-colors"
                  placeholder="I realized that..."
                  value={reflectionAnswer}
                  onChange={(e) => setReflectionAnswer(e.target.value)}
                  data-testid="input-reflection"
                />
              </Card>
            </div>

            <div className="flex justify-end pt-8">
              <Button 
                size="lg" 
                className={`rounded-xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 gap-2 hover:translate-y-[-2px] transition-none ${dayProgress?.completed ? "bg-green-500 hover:bg-green-600" : ""}`} 
                onClick={handleComplete}
                disabled={completeDay.isPending}
                data-testid="button-complete-day"
              >
                {completeDay.isPending ? (
                    <>
                        Saving... <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                ) : dayProgress?.completed ? (
                    <>
                        Completed! <CheckCircle2 className="w-5 h-5" />
                    </>
                ) : (
                    <>
                        Complete Day {dayData.day} <ArrowRight className="w-5 h-5" />
                    </>
                )}
              </Button>
            </div>
              </>
            )}

            {/* Discussion Section */}
            <div className="pt-8 border-t border-slate-200 mt-8">
              <DayChat day={currentDay} />
            </div>

        </div>
      </div>

      {/* Completion Modal */}
      <DayCompletionModal
        isOpen={showCompletionModal}
        day={currentDay}
        title={dayData.title}
        completionMessage={dayData.completionMessage}
        onContinue={handleContinueFromModal}
      />
    </Layout>
  );
}
