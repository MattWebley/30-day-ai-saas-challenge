import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FocusButton } from "@/components/FocusButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  ArrowRight,
  CheckCircle2,
  Trophy,
  ChevronRight,
  Lock,
  X,
  Loader2,
  Zap
} from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useRoute, useLocation, Link } from "wouter";
import { useDayContent } from "@/hooks/useDays";
import { useUserProgress, useCompleteDay } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";
import { useAllBadges, useUserBadges } from "@/hooks/useBadges";
import { DayCommunity } from "@/components/DayCommunity";
import { DayInstructions } from "@/components/DayInstructions";
import { DayCompletionModal } from "@/components/DayCompletionModal";
import { VideoSlides } from "@/components/VideoSlides";
import { toast } from "sonner";

// Lazy load Day components - only loads the component for the current day
const Day0StartHere = lazy(() => import("@/components/Day0StartHere").then(m => ({ default: m.Day0StartHere })));
const Day1IdeaGenerator = lazy(() => import("@/components/Day1IdeaGenerator").then(m => ({ default: m.Day1IdeaGenerator })));
const Day2IdeaValidator = lazy(() => import("@/components/Day2IdeaValidator").then(m => ({ default: m.Day2IdeaValidator })));
const Day3CoreFeatures = lazy(() => import("@/components/Day3CoreFeatures").then(m => ({ default: m.Day3CoreFeatures })));
const Day4Naming = lazy(() => import("@/components/Day4Naming").then(m => ({ default: m.Day4Naming })));
const Day5Logo = lazy(() => import("@/components/Day5Logo").then(m => ({ default: m.Day5Logo })));
const Day5TechStack = lazy(() => import("@/components/Day5TechStack").then(m => ({ default: m.Day5TechStack })));
const Day6SummaryPRD = lazy(() => import("@/components/Day6SummaryPRD").then(m => ({ default: m.Day6SummaryPRD })));
const Day8ClaudeCode = lazy(() => import("@/components/Day8ClaudeCode").then(m => ({ default: m.Day8ClaudeCode })));
const Day9ClaudeCodeMastery = lazy(() => import("@/components/Day9ClaudeCodeMastery").then(m => ({ default: m.Day9ClaudeCodeMastery })));
const Day10BuildLoop = lazy(() => import("@/components/Day10BuildLoop").then(m => ({ default: m.Day10BuildLoop })));
const Day10AIBrain = lazy(() => import("@/components/Day10AIBrain").then(m => ({ default: m.Day10AIBrain })));
const Day11Brand = lazy(() => import("@/components/Day11Brand").then(m => ({ default: m.Day11Brand })));
const Day11BrandDesign = lazy(() => import("@/components/Day11BrandDesign").then(m => ({ default: m.Day11BrandDesign })));
const Day12LetUsersIn = lazy(() => import("@/components/Day12LetUsersIn").then(m => ({ default: m.Day12LetUsersIn })));
const Day13ReachYourUsers = lazy(() => import("@/components/Day13ReachYourUsers").then(m => ({ default: m.Day13ReachYourUsers })));
const Day13ExternalAPIs = lazy(() => import("@/components/Day13ExternalAPIs").then(m => ({ default: m.Day13ExternalAPIs })));
const Day15Payments = lazy(() => import("@/components/Day15Payments").then(m => ({ default: m.Day15Payments })));
const Day17AutonomousTesting = lazy(() => import("@/components/Day17AutonomousTesting").then(m => ({ default: m.Day17AutonomousTesting })));
const Day17BuildItOut = lazy(() => import("@/components/Day17BuildItOut").then(m => ({ default: m.Day17BuildItOut })));
const Day18AdminDashboard = lazy(() => import("@/components/Day18AdminDashboard").then(m => ({ default: m.Day18AdminDashboard })));
const Day18BuildYourMVP = lazy(() => import("@/components/Day18BuildYourMVP").then(m => ({ default: m.Day18BuildYourMVP })));
const Day18TestEverything = lazy(() => import("@/components/Day18TestEverything").then(m => ({ default: m.Day18TestEverything })));
const Day16MobileReady = lazy(() => import("@/components/Day16MobileReady").then(m => ({ default: m.Day16MobileReady })));
const Day19TheSalesMachine = lazy(() => import("@/components/Day19TheSalesMachine").then(m => ({ default: m.Day19TheSalesMachine })));
const Day20GetFound = lazy(() => import("@/components/Day20GetFound").then(m => ({ default: m.Day20GetFound })));
const Day21LaunchDay = lazy(() => import("@/components/Day21LaunchDay").then(m => ({ default: m.Day21LaunchDay })));

// Loading fallback for lazy components
const DayComponentLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

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

// Helper to parse links inside text (used for bold content)
const parseLinksOnly = (text: string, keyPrefix: string): React.ReactNode => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const isExternal = match[2].startsWith('http');
    parts.push(
      <a
        key={`${keyPrefix}-${match.index}`}
        href={match[2]}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-primary hover:underline"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

// Helper to parse markdown-style links [text](url) and bold ***text*** and render as React elements
const parseLinks = (text: string): React.ReactNode => {
  // Combined regex for links and bold markers
  const combinedRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*\*([^*]+)\*\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // It's a link [text](url)
      const isExternal = match[2].startsWith('http');
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-primary hover:underline font-medium"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      // It's bold text ***text*** - also parse links inside
      parts.push(
        <span
          key={match.index}
          className="font-bold text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded"
        >
          {parseLinksOnly(match[3], `bold-${match.index}`)}
        </span>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

// Branded video placeholder component
const VideoPlaceholder = ({ day, title }: { day: number; title: string }) => (
  <div className="relative rounded-xl overflow-hidden mb-6" style={{ paddingBottom: '56.25%' }}>
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <div className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Video Lesson</div>
        <div className="text-primary/80 text-sm font-medium uppercase tracking-widest mb-2">Day</div>
        <div className="text-7xl md:text-8xl font-extrabold text-white mb-3">{day}</div>
        <div className="text-xl md:text-2xl font-bold text-white">{title}</div>
      </div>
    </div>
  </div>
);

// Loom video URLs by day (embed format)
// To remove a day's video, just delete or comment out the line
// Add real Loom video URLs here as you record them
// Format: dayNumber: "https://www.loom.com/embed/VIDEO_ID"
const lessonVideos: Record<number, string> = {
  0: "https://www.loom.com/embed/dac0eedf4efa4f1e83aca36cadab00ef",
  1: "https://www.loom.com/embed/a333ecd106db43d591eedb1e9fbf5f4b",
  // Add more video URLs as you record them
};

// Loom thumbnails - get from Loom share page (og:image meta tag)
// To find: go to https://www.loom.com/share/VIDEO_ID, view page source, find og:image
const lessonThumbnails: Record<number, string> = {
  0: "https://cdn.loom.com/sessions/thumbnails/420c8729c9d544c3a265ea8273fe797e-49b24f08ffb05d98.jpg",
  // Add thumbnails for other days as you record them
};

// Helper to get Loom thumbnail URL
function getLoomThumbnail(day: number): string | null {
  return lessonThumbnails[day] || null;
}

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:day");
  const [location, setLocation] = useLocation();
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | undefined>();
  const [microDecisionChoice, setMicroDecisionChoice] = useState<string>("");
  const [reflectionAnswer, setReflectionAnswer] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Determine current day from URL
  const urlDay = params?.day ? parseInt(params.day) : null;

  // Fetch data
  const { dayContent: allDays, isLoading: daysLoading } = useDayContent();
  const { progress, isLoading: progressLoading } = useUserProgress();
  const { stats, isLoading: statsLoading } = useUserStats();

  // Calculate the user's actual current task (next incomplete day)
  const lastCompletedDay = (stats as any)?.lastCompletedDay ?? -1;
  const nextDay = Math.min(lastCompletedDay + 1, 21); // Cap at Day 21

  // Redirect to current task if no day specified in URL
  useEffect(() => {
    if (urlDay === null && !statsLoading && stats) {
      setLocation(`/dashboard/${nextDay}`, { replace: true });
    }
  }, [urlDay, statsLoading, stats, nextDay, setLocation]);

  // Use URL day if provided, otherwise use calculated next day
  const currentDay = urlDay ?? nextDay;
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

      // Special handling for Day 21 - redirect to congratulations page
      if (currentDay === 21) {
        toast.success("Congratulations! You completed the challenge!");
        setLocation("/congratulations");
        return;
      }

      // Show completion modal for other days
      console.log('[Dashboard] Showing completion modal for day', currentDay);
      toast.success("Day completed!");
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
             <FocusButton />
             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
             <div className="text-right hidden md:block">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Time</div>
               <div className="font-bold text-slate-900 text-lg">5 Min</div>
             </div>
             {/* COMMENTED OUT - Video button moved to lesson section
             {lessonVideos[currentDay] && (
               <>
                 <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                 <Button
                   variant="outline"
                   className="gap-2 border-2 border-slate-200 hover:border-primary hover:text-primary font-bold"
                   onClick={() => setShowVideoModal(true)}
                 >
                   <Play className="w-4 h-4" /> Watch Lesson
                 </Button>
               </>
             )}
             */}
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
          <Suspense fallback={<DayComponentLoader />}>
            {/* Day 0: Start Here */}
            {currentDay === 0 ? (
              <>
                {/* Video Lesson Section - Day 0 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <h2 className="font-bold text-xl text-slate-900">Watch the Introduction</h2>
                  </div>
                  {lessonVideos[0] ? (
                    <div
                      className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group"
                      style={{
                        paddingBottom: '56.25%',
                        ...(getLoomThumbnail(0) && { backgroundImage: `url(${getLoomThumbnail(0)})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                      }}
                      onClick={() => setShowVideoModal(true)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                          <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <VideoPlaceholder day={0} title="Start Here" />
                  )}
                </div>
                <Day0StartHere onComplete={handleComplete} />
                {!(stats as any)?.hasCoaching && (
                  <Link href="/coaching">
                    <Card className="p-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-slate-700">Want to skip ahead? <span className="text-primary">Unlock all 21 days instantly</span></p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
              </>
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
                    {/* VIDEO SECTION - Day 1 */}
                    {lessonVideos[1] ? (
                      <div
                        className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6"
                        style={{
                          paddingBottom: '56.25%',
                          ...(getLoomThumbnail(1) && { backgroundImage: `url(${getLoomThumbnail(1)})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                        }}
                        onClick={() => setShowVideoModal(true)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                            <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <VideoPlaceholder day={1} title={dayData.title} />
                    )}
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
                {!(stats as any)?.hasCoaching && (
                  <Link href="/coaching">
                    <Card className="p-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-slate-700">Want to skip ahead? <span className="text-primary">Unlock all 21 days instantly</span></p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
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
                    {/* VIDEO SECTION - Day 2 */}
                    {lessonVideos[2] ? (
                      <div
                        className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6"
                        style={{
                          paddingBottom: '56.25%',
                          ...(getLoomThumbnail(2) && { backgroundImage: `url(${getLoomThumbnail(2)})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                        }}
                        onClick={() => setShowVideoModal(true)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                            <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <VideoPlaceholder day={2} title={dayData.title} />
                    )}
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
                      {/* VIDEO SECTION - Day 3 */}
                      {lessonVideos[3] ? (
                        <div
                          className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6"
                          style={{
                            paddingBottom: '56.25%',
                            ...(getLoomThumbnail(3) && { backgroundImage: `url(${getLoomThumbnail(3)})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                          }}
                          onClick={() => setShowVideoModal(true)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={3} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
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
                      {/* VIDEO SECTION - Day 4 */}
                      {lessonVideos[4] ? (
                        <div
                          className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6"
                          style={{
                            paddingBottom: '56.25%',
                            ...(getLoomThumbnail(4) && { backgroundImage: `url(${getLoomThumbnail(4)})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                          }}
                          onClick={() => setShowVideoModal(true)}
                        >
                          {/* GRADIENT OVERLAY - remove this div to revert */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="relative rounded-xl overflow-hidden mb-6"
                          style={{ paddingBottom: '56.25%' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                              <div className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Video Lesson</div>
                              <div className="text-primary/80 text-sm font-medium uppercase tracking-widest mb-2">Day</div>
                              <div className="text-7xl md:text-8xl font-extrabold text-white mb-3">4</div>
                              <div className="text-xl md:text-2xl font-bold text-white">{dayData.title}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
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
                      {/* VIDEO SECTION - Day 5 */}
                      {lessonVideos[5] ? (
                        <div
                          className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6"
                          style={{
                            paddingBottom: '56.25%',
                            ...(getLoomThumbnail(5) && { backgroundImage: `url(${getLoomThumbnail(5)})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                          }}
                          onClick={() => setShowVideoModal(true)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={5} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 5: Create Your Logo */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Create Your Logo</h2>
                  </div>
                  <Day5Logo
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || ""}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
                    onComplete={handleComplete}
                  />
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
                      {/* VIDEO SECTION - Day 6 */}
                      {lessonVideos[6] ? (
                        <div
                          className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6"
                          style={{
                            paddingBottom: '56.25%',
                            ...(getLoomThumbnail(6) && { backgroundImage: `url(${getLoomThumbnail(6)})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                          }}
                          onClick={() => setShowVideoModal(true)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={6} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 6: AI Toolkit Setup */}
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
                      {/* VIDEO SECTION - Day 7 */}
                      {lessonVideos[7] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(7) && { backgroundImage: `url(${getLoomThumbnail(7)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={7} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 7: Summary + PRD */}
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
                      mvpFeatures={(Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.userInputs?.selectedFeatures || []}
                      appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || ""}
                      iHelpStatement={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.iHelpStatement || ""}
                      uspFeatures={(Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.userInputs?.uspFeatures?.map((f: any) => typeof f === 'string' ? f : f.name) || []}
                      brandVibe={(Array.isArray(progress) ? progress.find((p: any) => p.day === 5) : null)?.userInputs?.brandVibe || ""}
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
                      {/* VIDEO SECTION - Day 8 */}
                      {lessonVideos[8] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(8) && { backgroundImage: `url(${getLoomThumbnail(8)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={8} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 8: Development Environment Setup */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Set Up Your Tools</h2>
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
                      {/* VIDEO SECTION - Day 9 */}
                      {lessonVideos[9] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(9) && { backgroundImage: `url(${getLoomThumbnail(9)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={9} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 9: Master Claude Code */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Master the Prompts</h2>
                  </div>
                  <Day9ClaudeCodeMastery
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
                      {/* VIDEO SECTION - Day 10 */}
                      {lessonVideos[10] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(10) && { backgroundImage: `url(${getLoomThumbnail(10)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={10} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 10: The Build Loop */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Practice The Loop</h2>
                  </div>
                  <Day10BuildLoop onComplete={handleComplete} />
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
                      {/* VIDEO SECTION - Day 11 */}
                      {lessonVideos[11] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(11) && { backgroundImage: `url(${getLoomThumbnail(11)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={11} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 11: Define Your Brand */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Define Your Brand</h2>
                  </div>
                  <Day11Brand
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || ""}
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
                      {/* VIDEO SECTION - Day 12 */}
                      {lessonVideos[12] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(12) && { backgroundImage: `url(${getLoomThumbnail(12)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={12} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 12: Add The AI Brain */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Add Your AI Brain</h2>
                  </div>
                  <Day10AIBrain
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
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
                      {/* VIDEO SECTION - Day 13 */}
                      {lessonVideos[13] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(13) && { backgroundImage: `url(${getLoomThumbnail(13)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={13} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 13: External APIs / Email Setup */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Your First External API</h2>
                  </div>
                  <Day13ExternalAPIs
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.chosenName || "your app"}
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
                      {/* VIDEO SECTION - Day 14 */}
                      {lessonVideos[14] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(14) && { backgroundImage: `url(${getLoomThumbnail(14)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={14} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 14: Add Login (Auth) */}
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
                      {/* VIDEO SECTION - Day 15 */}
                      {lessonVideos[15] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(15) && { backgroundImage: `url(${getLoomThumbnail(15)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={15} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 15: Payments Setup */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Add Payments</h2>
                  </div>
                  <Day15Payments
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || "Your App"}
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
                      {/* VIDEO SECTION - Day 16 */}
                      {lessonVideos[16] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(16) && { backgroundImage: `url(${getLoomThumbnail(16)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={16} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 16: Mobile Ready */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Test on Mobile</h2>
                  </div>
                  <Day16MobileReady
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || "Your App"}
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
                      {/* VIDEO SECTION - Day 17 */}
                      {lessonVideos[17] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(17) && { backgroundImage: `url(${getLoomThumbnail(17)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={17} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 17: Autonomous Testing */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Test Your Core Feature</h2>
                  </div>
                  <Day17AutonomousTesting
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || "Your App"}
                    onComplete={handleComplete}
                  />
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
                      {/* VIDEO SECTION - Day 18 */}
                      {lessonVideos[18] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(18) && { backgroundImage: `url(${getLoomThumbnail(18)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={18} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 18: Build Your MVP */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Build Your MVP</h2>
                  </div>
                  <Day18BuildYourMVP
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || "Your App"}
                    daysSinceStart={(stats as any)?.daysSinceStart || 0}
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
                      {/* VIDEO SECTION - Day 19 */}
                      {lessonVideos[19] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(19) && { backgroundImage: `url(${getLoomThumbnail(19)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={19} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 19: The Sales Machine */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Build Your Sales Machine</h2>
                  </div>
                  <Day19TheSalesMachine
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || "Your App"}
                    userIdea={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.chosenIdea || ""}
                    painPoints={(Array.isArray(progress) ? progress.find((p: any) => p.day === 2) : null)?.userInputs?.selectedPainPoints || []}
                    features={(Array.isArray(progress) ? progress.find((p: any) => p.day === 3) : null)?.userInputs?.coreFeatures || []}
                    aiFeature={(Array.isArray(progress) ? progress.find((p: any) => p.day === 10) : null)?.userInputs?.aiFeature || ""}
                    brandColor={(Array.isArray(progress) ? progress.find((p: any) => p.day === 11) : null)?.userInputs?.primaryColor || ""}
                    onComplete={handleComplete}
                  />
                </div>
              </>
            ) : currentDay === 20 ? (
              <>
                {/* Today's Lesson */}
                {dayData.lesson && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="font-bold text-xl text-slate-900">Today's Lesson</h2>
                      </div>
                      <VideoSlides day={20} />
                    </div>
                    <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
                      {/* VIDEO SECTION - Day 20 */}
                      {lessonVideos[20] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(20) && { backgroundImage: `url(${getLoomThumbnail(20)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={20} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 20: Get Found by Google & AI */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Get Found by Google & AI</h2>
                  </div>
                  <Day20GetFound
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || "Your App"}
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
                      {/* VIDEO SECTION - Day 21 */}
                      {lessonVideos[21] ? (
                        <div className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group mb-6" style={{ paddingBottom: '56.25%', ...(getLoomThumbnail(21) && { backgroundImage: `url(${getLoomThumbnail(21)})`, backgroundSize: 'cover', backgroundPosition: 'center' }) }} onClick={() => setShowVideoModal(true)}>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                              <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <VideoPlaceholder day={21} title={dayData.title} />
                      )}
                      <div className="prose prose-slate max-w-none">
                        {dayData.lesson.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className={`leading-relaxed mb-4 last:mb-0 whitespace-pre-line ${isSubheadline(paragraph) ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>{parseLinks(paragraph)}</p>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
                {/* Day 21: Build Your Business */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <h2 className="font-bold text-xl text-slate-900">Your Next Chapter</h2>
                  </div>
                  <Day21LaunchDay
                    appName={(Array.isArray(progress) ? progress.find((p: any) => p.day === 4) : null)?.userInputs?.finalName || "Your App"}
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

          </Suspense>

            {/* Community Section (Q&A + Discussion) */}
            <div className="pt-8 border-t border-slate-200 mt-8">
              <DayCommunity day={currentDay} />
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

      {/* Video Lesson Modal */}
      <Dialog
        open={showVideoModal}
        onOpenChange={(open) => {
          setShowVideoModal(open);
          if (open) setVideoLoading(true);
        }}
      >
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Day {currentDay}: {dayData.title}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full bg-slate-900" style={{ paddingBottom: '56.25%' }}>
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 space-y-2">
                  <div className="text-white/80 text-sm font-medium text-center">Loading video...</div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{
                        width: '90%',
                        animation: 'loadingBar 2s ease-out forwards'
                      }}
                    />
                  </div>
                </div>
                <style>{`
                  @keyframes loadingBar {
                    0% { width: 0%; }
                    100% { width: 90%; }
                  }
                `}</style>
              </div>
            )}
            {lessonVideos[currentDay] && (
              <iframe
                src={lessonVideos[currentDay]}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${videoLoading ? 'opacity-0' : 'opacity-100'}`}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                onLoad={() => setVideoLoading(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
