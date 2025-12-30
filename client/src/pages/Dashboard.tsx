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
import { Day1IdeaGenerator } from "@/components/Day1IdeaGenerator";
import { Day2IdeaValidator } from "@/components/Day2IdeaValidator";
import { Day3CoreFeatures } from "@/components/Day3CoreFeatures";
import { Day4Naming } from "@/components/Day4Naming";
import { Day5TechStack } from "@/components/Day5TechStack";
import { Day6SummaryPRD } from "@/components/Day6SummaryPRD";
import { Day7ReplitBuild } from "@/components/Day7ReplitBuild";
import { Day8FirstBuild } from "@/components/Day8FirstBuild";
import { Day9Branding } from "@/components/Day9Branding";
import { Day10CoreFeature } from "@/components/Day10CoreFeature";
import { Day11BugFixer } from "@/components/Day11BugFixer";
import { Day12DesignAudit } from "@/components/Day12DesignAudit";
import { Day13FeatureTwo } from "@/components/Day13FeatureTwo";
import { Day14SafetyNet } from "@/components/Day14SafetyNet";
import { Day15SuperpowerSelector } from "@/components/Day15SuperpowerSelector";
import { Day16AIBrain } from "@/components/Day16AIBrain";
import { Day17StripeSetup } from "@/components/Day17StripeSetup";
import { Day18EmailSetup } from "@/components/Day18EmailSetup";
import { Day19AuthSetup } from "@/components/Day19AuthSetup";
import { Day20AdminDashboard } from "@/components/Day20AdminDashboard";
import { Day21LaunchPrep } from "@/components/Day21LaunchPrep";
import { Day22PremiumFeel } from "@/components/Day22PremiumFeel";
import { Day23UserDashboard } from "@/components/Day23UserDashboard";
import { Day24MobileAudit } from "@/components/Day24MobileAudit";
import { Day25SpeedBoost } from "@/components/Day25SpeedBoost";
import { Day26DataExport } from "@/components/Day26DataExport";
import { Day27LandingPage } from "@/components/Day27LandingPage";
import { Day28SecurityAudit } from "@/components/Day28SecurityAudit";
import { Day29FinalChecklist } from "@/components/Day29FinalChecklist";
import { Day30LaunchDay } from "@/components/Day30LaunchDay";
import { DayChat } from "@/components/DayChat";
import { DayInstructions } from "@/components/DayInstructions";
import { DayCompletionModal } from "@/components/DayCompletionModal";
import { toast } from "sonner";

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:day");
  const [location, setLocation] = useLocation();
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | undefined>();
  const [microDecisionChoice, setMicroDecisionChoice] = useState<string>("");
  const [reflectionAnswer, setReflectionAnswer] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Determine current day from URL or default to 1
  const currentDay = params?.day ? parseInt(params.day) : 1;
  
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
    if (!dayData) {
      console.error('handleComplete: dayData is null/undefined, returning early');
      return;
    }

    try {
      await completeDay.mutateAsync({
        day: currentDay,
        data: {
          selectedSuggestion,
          microDecisionChoice,
          reflectionAnswer,
          ...componentData,
        },
      });

      // Show completion modal
      setShowCompletionModal(true);
    } catch (error) {
      console.error("Failed to complete day:", error);
      toast.error("Failed to complete day");
    }
  };

  const handleContinueFromModal = () => {
    setShowCompletionModal(false);
    // Navigate to next day if not the last day
    if (currentDay < 30) {
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
            
            {/* Day 1 Special: Idea Generator */}
            {currentDay === 1 ? (
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
                          <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                  </div>
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
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
                {/* Day 3: Core Features & USP */}
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day3CoreFeatures
                      dayId={currentDay}
                      userIdea={previousDayProgress?.completionData?.selectedIdea || previousDayProgress?.selectedIdea || ""}
                      userPainPoints={previousDayProgress?.completionData?.selectedPainPoints || previousDayProgress?.selectedPainPoints || []}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
              </>
            ) : currentDay === 4 ? (
              <>
                {/* Day 4: Naming Your Product */}
                <div className="space-y-4">
                  <Day4Naming
                    dayId={currentDay}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                    painPoints={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedPainPoints || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedPainPoints || []}
                    features={(Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.completionData?.selectedFeatures || (Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.selectedFeatures || []}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 5 ? (
              <>
                {/* Day 5: Tech Stack Setup */}
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day5TechStack
                      dayId={currentDay}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
              </>
            ) : currentDay === 6 ? (
              <>
                {/* Day 6: Summary + PRD */}
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day6SummaryPRD
                      dayId={currentDay}
                      userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                      painPoints={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedPainPoints || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedPainPoints || []}
                      features={(Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.completionData?.selectedFeatures || (Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.selectedFeatures || []}
                      mvpFeatures={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.completionData?.selectedMvpFeatures || (Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.selectedMvpFeatures || []}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
              </>
            ) : currentDay === 7 ? (
              <>
                {/* Day 7: PRD into Replit */}
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                    <Day7ReplitBuild
                      dayId={currentDay}
                      prd={previousDayProgress?.completionData?.prd || previousDayProgress?.prd || ""}
                      onComplete={handleComplete}
                    />
                  </Card>
                </div>
              </>
            ) : currentDay === 8 ? (
              <>
                {/* Day 8: First Build - Watch the Magic */}
                <div className="space-y-4">
                  <Day8FirstBuild
                    dayId={currentDay}
                    prd={(Array.isArray(progress) ? progress.find((p: any) => p.day === 6) : null)?.completionData?.prd || (Array.isArray(progress) ? progress.find((p: any) => p.day === 6) : null)?.prd || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 9 ? (
              <>
                {/* Day 9: Branding - Make it YOURS */}
                <div className="space-y-4">
                  <Day9Branding
                    dayId={currentDay}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 10 ? (
              <>
                {/* Day 10: Core Feature - The MONEY Feature */}
                <div className="space-y-4">
                  <Day10CoreFeature
                    dayId={currentDay}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 11 ? (
              <>
                {/* Day 11: Bug Fixer - 5-Minute Fixes */}
                <div className="space-y-4">
                  <Day11BugFixer
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 12 ? (
              <>
                {/* Day 12: Design Audit - 3-Minute Audit */}
                <div className="space-y-4">
                  <Day12DesignAudit
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 13 ? (
              <>
                {/* Day 13: Feature Two - Add Stickiness */}
                <div className="space-y-4">
                  <Day13FeatureTwo
                    dayId={currentDay}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 14 ? (
              <>
                {/* Day 14: Safety Net - Git & Version Control + Week 2 Celebration */}
                <div className="space-y-4">
                  <Day14SafetyNet
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 15 ? (
              <>
                {/* Day 15: Superpower Selector - API Integrations */}
                <div className="space-y-4">
                  <Day15SuperpowerSelector
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 16 ? (
              <>
                {/* Day 16: AI Brain - OpenAI Integration */}
                <div className="space-y-4">
                  <Day16AIBrain
                    dayId={currentDay}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 17 ? (
              <>
                {/* Day 17: Stripe Setup - Payments */}
                <div className="space-y-4">
                  <Day17StripeSetup
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 18 ? (
              <>
                {/* Day 18: Email Setup - Transactional Emails */}
                <div className="space-y-4">
                  <Day18EmailSetup
                    dayId={currentDay}
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.completionData?.selectedIdea || (Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.selectedIdea || "Your App"}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 19 ? (
              <>
                {/* Day 19: Auth Setup - Authentication */}
                <div className="space-y-4">
                  <Day19AuthSetup
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 20 ? (
              <>
                {/* Day 20: Admin Dashboard Builder */}
                <div className="space-y-4">
                  <Day20AdminDashboard
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 21 ? (
              <>
                {/* Day 21: Launch Prep - Week 3 Celebration */}
                <div className="space-y-4">
                  <Day21LaunchPrep
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 22 ? (
              <>
                {/* Day 22: Premium Feel - UX Polish */}
                <div className="space-y-4">
                  <Day22PremiumFeel
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 23 ? (
              <>
                {/* Day 23: User Dashboard Builder */}
                <div className="space-y-4">
                  <Day23UserDashboard
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 24 ? (
              <>
                {/* Day 24: Mobile Audit */}
                <div className="space-y-4">
                  <Day24MobileAudit
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 25 ? (
              <>
                {/* Day 25: Speed Boost - Performance */}
                <div className="space-y-4">
                  <Day25SpeedBoost
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 26 ? (
              <>
                {/* Day 26: Data Export */}
                <div className="space-y-4">
                  <Day26DataExport
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 27 ? (
              <>
                {/* Day 27: Landing Page Generator */}
                <div className="space-y-4">
                  <Day27LandingPage
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 28 ? (
              <>
                {/* Day 28: Security Audit */}
                <div className="space-y-4">
                  <Day28SecurityAudit
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 29 ? (
              <>
                {/* Day 29: Final Checklist */}
                <div className="space-y-4">
                  <Day29FinalChecklist
                    dayId={currentDay}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 30 ? (
              <>
                {/* Day 30: Launch Day! */}
                <div className="space-y-4">
                  <Day30LaunchDay
                    dayId={currentDay}
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
                          <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
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
