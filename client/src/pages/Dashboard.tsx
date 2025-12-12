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
import { Day3FeatureBuilder } from "@/components/Day3FeatureBuilder";
import { Day4WorkflowBuilder } from "@/components/Day4WorkflowBuilder";
import { Day5MVPPrioritizer } from "@/components/Day5MVPPrioritizer";
import { DayChat } from "@/components/DayChat";
import { DayInstructions } from "@/components/DayInstructions";
import { toast } from "sonner";

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:day");
  const [location, setLocation] = useLocation();
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | undefined>();
  const [microDecisionChoice, setMicroDecisionChoice] = useState<string>("");
  const [reflectionAnswer, setReflectionAnswer] = useState<string>("");

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
  const handleComplete = async () => {
    if (!dayData) return;
    
    try {
      await completeDay.mutateAsync({
        day: currentDay,
        data: {
          selectedSuggestion,
          microDecisionChoice,
          reflectionAnswer,
        },
      });
      
      toast.success(`Day ${currentDay} completed! 🎉`, {
        description: "+100 XP earned",
      });

      // Navigate to next day if not the last day
      setTimeout(() => {
        if (currentDay < 30) {
          setLocation(`/dashboard/${currentDay + 1}`);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to complete day:", error);
    }
  };


  if (daysLoading || progressLoading || !dayData) {
    return (
      <Layout currentDay={currentDay}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">Loading day content...</p>
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
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-black pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                Day {dayData.day}
              </span>
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{dayData.phase}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-black">{dayData.title}</h1>
            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              {dayData.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <div className="text-right hidden md:block">
               <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Est. Time</div>
               <div className="font-bold text-black text-lg">5 Min</div>
             </div>
             <div className="h-10 w-px bg-black hidden md:block"></div>
             <Button variant="outline" className="gap-2 border-2 border-black hover:border-primary hover:text-primary font-bold">
               <Play className="w-4 h-4" /> Watch Lesson
             </Button>
          </div>
        </div>

        {/* Matt Webley's Tip */}
        {dayData.tip && (
          <div className="bg-white border border-black p-5 rounded-lg">
            <div className="flex items-start gap-4">
              <img 
                src="/matt-webley.png" 
                alt="Matt Webley"
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="font-bold text-black text-sm uppercase tracking-wide mb-1">Matt Webley's Tip</p>
                <p className="text-black font-medium leading-relaxed">{dayData.tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <DayInstructions day={currentDay} />

        {/* Main Task Area */}
        <div className="space-y-8">
            
            {/* Day 1 Special: Idea Generator */}
            {currentDay === 1 ? (
              <>
                {/* Step 1: Today's Lesson */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h2 className="font-bold text-xl text-black">Today's Lesson</h2>
                  </div>
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-black leading-relaxed mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">{dayData.description}</p>
                    )}
                  </Card>
                </div>

                {/* Step 2: Idea Generator */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-black">Find Your Winning Idea</h2>
                  </div>
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
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
                    <h2 className="font-bold text-xl text-black">Today's Lesson</h2>
                  </div>
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-black leading-relaxed mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">{dayData.description}</p>
                    )}
                  </Card>
                </div>

                {/* Step 2: Idea Validator */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-black">Validate & Choose Your Idea</h2>
                  </div>
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    <Day2IdeaValidator onComplete={handleComplete} />
                  </Card>
                </div>
              </>
            ) : currentDay === 3 ? (
              <>
                {/* Step 1: Today's Lesson */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h2 className="font-bold text-xl text-black">Today's Lesson</h2>
                  </div>
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-black leading-relaxed mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">{dayData.description}</p>
                    )}
                  </Card>
                </div>

                {/* Step 2: Feature Builder */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-black">Define Your Features</h2>
                  </div>
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    <Day3FeatureBuilder onComplete={handleComplete} />
                  </Card>
                </div>
              </>
            ) : currentDay === 4 ? (
              <>
                {/* Day 4: Workflow Builder */}
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    <Day4WorkflowBuilder onComplete={handleComplete} />
                  </Card>
                </div>
              </>
            ) : currentDay === 5 ? (
              <>
                {/* Day 5: MVP Prioritizer */}
                <div className="space-y-4">
                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    <Day5MVPPrioritizer onComplete={handleComplete} />
                  </Card>
                </div>
              </>
            ) : (
              <>
                {/* Step 1: Today's Lesson */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h2 className="font-bold text-xl text-black">Today's Lesson</h2>
                  </div>

                  <Card className="p-6 border-2 border-black shadow-none bg-white">
                    {dayData.lesson ? (
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-black leading-relaxed mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">{dayData.description}</p>
                    )}
                  </Card>
                </div>

            {/* Step 2: Micro Decision */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black text-slate-600 flex items-center justify-center font-bold">2</div>
                <h2 className="font-bold text-xl text-black">Micro Decision</h2>
              </div>
              <Card className="p-6 border-2 border-black shadow-none bg-white">
                <p className="text-slate-600 font-medium mb-4">
                  {dayData.microDecisionQuestion || "Make a decision to move forward. Don't overthink it."}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                   {(microDecisionOptions || ["Option A", "Option B"]).map((opt: string) => (
                     <Button 
                       key={opt} 
                       variant="outline" 
                       className={`justify-start h-14 border-2 text-base font-semibold ${microDecisionChoice === opt ? 'border-primary text-primary bg-blue-50' : 'text-slate-600 border-black hover:border-primary hover:text-primary hover:bg-blue-50/50'}`}
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
                <div className="w-8 h-8 rounded-lg bg-black text-slate-600 flex items-center justify-center font-bold">3</div>
                <h2 className="font-bold text-xl text-black">Reflection</h2>
              </div>
              <Card className="p-6 border-2 border-black shadow-none bg-white">
                <label className="font-semibold text-black block mb-3">
                  {dayData.reflectionQuestion || "One sentence takeaway from today:"}
                </label>
                <textarea 
                  className="w-full min-h-[120px] rounded-lg border-2 border-black bg-white p-4 text-base font-medium shadow-none placeholder:text-slate-600 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 resize-none transition-colors"
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
                className={`rounded-xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 gap-2 hover:translate-y-[-2px] transition-all ${dayProgress?.completed ? "bg-green-500 hover:bg-green-600" : ""}`} 
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
            <div className="pt-8 border-t border-black mt-8">
              <DayChat day={currentDay} />
            </div>

        </div>
      </div>
    </Layout>
  );
}
