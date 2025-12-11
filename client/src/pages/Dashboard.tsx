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

  const handleShuffle = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setLoadingAI(false);
      toast.info("New suggestions generated!");
    }, 1000);
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

        {/* Matt's Tip */}
        {dayData.tip && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm uppercase tracking-wide mb-1">Matt's Tip</p>
                <p className="text-amber-900 font-medium">{dayData.tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Task Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Task Steps */}
          <div className="lg:col-span-2 space-y-8">
            
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

          </div>

          {/* Right Column: Progress & Info */}
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900 text-white border-none shadow-2xl rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
               
               <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-yellow-500" />
                 Next Milestone
               </h3>
               
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-inner">
                     <Trophy className="w-7 h-7 text-yellow-500" />
                   </div>
                   <div>
                     <div className="font-bold text-xl">Initiator</div>
                     <div className="text-sm text-slate-400 font-medium">Badge Reward</div>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <span>Current Progress</span>
                     <span>{stats ? Math.round(((stats as any).lastCompletedDay || 0) / 30 * 100) : 0}%</span>
                   </div>
                   <Progress value={stats ? ((stats as any).lastCompletedDay || 0) / 30 * 100 : 0} className="h-3 bg-white/10" indicatorClassName="bg-primary" />
                 </div>
               </div>
            </Card>

            <Card className="p-6 border-2 border-slate-100 shadow-none rounded-2xl">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Current Streak</h3>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-black text-slate-900 leading-none" data-testid="text-streak">{(stats as any)?.currentStreak || 0}</div>
                <div className="text-sm text-slate-500 font-bold uppercase tracking-wide mb-1">
                  Days<br/>Active
                </div>
              </div>
            </Card>

            {/* Badges Section */}
            <Card className="p-6 border-2 border-slate-100 shadow-none rounded-2xl">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Your Badges</h3>
              <div className="grid grid-cols-4 gap-2">
                {Array.isArray(allBadges) && allBadges.map((badge: any) => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  return (
                    <div 
                      key={badge.id} 
                      className={`relative group flex flex-col items-center justify-center p-2 rounded-lg transition-all ${isEarned ? 'bg-amber-50' : 'bg-slate-100 opacity-40'}`}
                      title={`${badge.name}: ${badge.description}`}
                      data-testid={`badge-${badge.id}`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      {isEarned && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                {earnedBadgeIds.size} / {Array.isArray(allBadges) ? allBadges.length : 0} earned
              </p>
            </Card>
            
            {/* Locked Future Days Preview */}
            {Array.isArray(allDays) && (
              <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 mb-3">Coming Up Next</h4>
                  <div className="space-y-2">
                      {allDays.slice(currentDay, currentDay + 3).map((nextDay: any) => (
                          <div key={nextDay.day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                              <span className="text-xs font-bold uppercase">Day {nextDay.day}</span>
                              <span className="text-sm font-medium truncate max-w-[120px]">{nextDay.title}</span>
                              <Lock className="w-3 h-3" />
                          </div>
                      ))}
                  </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}
