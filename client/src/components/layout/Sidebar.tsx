import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useDayContent } from "@/hooks/useDays";
import { useUserProgress } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";
import { 
  CheckCircle2, 
  Lock, 
  Trophy, 
  LayoutDashboard,
  Settings,
  LogOut,
  X,
  Shield,
  Lightbulb,
  Target,
  Rocket
} from "lucide-react";

interface SidebarProps {
  currentDay: number;
  onClose?: () => void;
}

function MyJourneySection({ userProgress }: { userProgress: any[] | undefined }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const journey = useMemo(() => {
    if (!Array.isArray(userProgress)) return null;
    
    const day1 = userProgress.find((p: any) => p.day === 1);
    const day2 = userProgress.find((p: any) => p.day === 2);
    
    const shortlistedIdeas = day1?.generatedIdeas?.filter((_: any, i: number) => 
      day1?.shortlistedIdeas?.includes(i)
    ) || [];
    
    const chosenIdea = day2?.chosenIdea !== undefined && shortlistedIdeas[day2.chosenIdea]
      ? shortlistedIdeas[day2.chosenIdea]
      : null;
    
    const userInputs = day1?.userInputs;
    
    return {
      hasShortlist: shortlistedIdeas.length > 0,
      shortlistCount: shortlistedIdeas.length,
      chosenIdea,
      shortlistedIdeas,
      userInputs,
    };
  }, [userProgress]);

  if (!journey || (!journey.hasShortlist && !journey.chosenIdea)) {
    return null;
  }

  return (
    <div 
      className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 relative cursor-pointer transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Rocket className="w-4 h-4 text-blue-600" />
        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">My Journey</p>
      </div>
      
      {journey.chosenIdea ? (
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Target className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Building:</p>
              <p className="text-sm font-semibold text-slate-900 leading-tight">{journey.chosenIdea.title}</p>
            </div>
          </div>
        </div>
      ) : journey.hasShortlist ? (
        <div className="flex items-start gap-2">
          <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Shortlisted:</p>
            <p className="text-sm font-medium text-slate-700">{journey.shortlistCount} ideas</p>
          </div>
        </div>
      ) : null}

      {isHovered && (
        <div className="absolute left-full top-0 ml-2 w-64 p-4 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
          <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-lg">📝</span> Journey Notes
          </h4>
          <div className="space-y-3 text-xs">
            {journey.userInputs && (
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-700 mb-1">Day 1: About You</p>
                <p className="text-slate-600">Skills: {journey.userInputs.skills || 'Not set'}</p>
                <p className="text-slate-600">Interests: {journey.userInputs.interests || 'Not set'}</p>
              </div>
            )}
            {journey.hasShortlist && (
              <div className="p-2 bg-amber-50 rounded-lg">
                <p className="font-semibold text-amber-800 mb-1">Day 1: Top 5 Ideas</p>
                <ul className="text-amber-700 space-y-0.5">
                  {journey.shortlistedIdeas.slice(0, 5).map((idea: any, i: number) => (
                    <li key={i} className="truncate">• {idea.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {journey.chosenIdea && (
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-800 mb-1">Day 2: Final Choice</p>
                <p className="text-green-700 font-medium">{journey.chosenIdea.title}</p>
                <p className="text-green-600 text-[10px] mt-1">{journey.chosenIdea.desc}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ currentDay, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { dayContent: allDays } = useDayContent();
  const { progress: userProgress } = useUserProgress();
  const { stats } = useUserStats();

  const challengeDays = Array.isArray(allDays) ? allDays : [];
  const completedDays = new Set(
    Array.isArray(userProgress) 
      ? userProgress.filter((p: any) => p.completed).map((p: any) => p.day)
      : []
  );

  const progress = stats ? Math.round(((stats.lastCompletedDay || 0) / 30) * 100) : 0;
  const lastCompleted = (stats as any)?.lastCompletedDay || 0;
  
  const [testMode, setTestMode] = useState(false);
  
  const maxVisibleDay = testMode ? 30 : Math.max(lastCompleted + 3, currentDay + 2, 3);
  const visibleDays = challengeDays.filter((d: any) => d.day <= maxVisibleDay);

  const phases = Array.from(new Set(visibleDays.map((d: any) => d.phase)));

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-80 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png" 
              alt="Matt Webley" 
              className="w-10 h-10 rounded-full"
            />
            <h1 className="font-bold text-sm tracking-tight text-sidebar-foreground leading-tight">
              30 Day AI<br/>SaaS Challenge
            </h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-muted"
              data-testid="button-close-sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Streak Display */}
        <div className="mt-4 flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg">{(stats as any)?.currentStreak || 0}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Day Streak</p>
            <p className="text-xs text-amber-600">Keep it going!</p>
          </div>
        </div>

        {/* My Journey Section */}
        <MyJourneySection userProgress={userProgress} />

        <button
          onClick={() => setTestMode(!testMode)}
          className={cn(
            "mt-4 w-full text-xs py-1.5 px-3 rounded-md transition-colors",
            testMode 
              ? "bg-blue-500 text-white" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          data-testid="button-test-mode"
        >
          {testMode ? "Test Mode: ON" : "Test Mode: OFF"}
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-8">
          <div className="space-y-1">
            <Link href="/dashboard" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === "/dashboard" || location.startsWith("/dashboard/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <LayoutDashboard className="w-4 h-4" />
                Current Task
              </span>
            </Link>
            <Link href="/badges" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === "/badges" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Trophy className="w-4 h-4" />
                Badge Collection
              </span>
            </Link>
            <Link href="/admin" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === "/admin" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Shield className="w-4 h-4" />
                Admin Panel
              </span>
            </Link>
          </div>

          {phases.map((phase) => (
            <div key={phase} className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {phase}
              </h3>
              <div className="space-y-0.5">
                {visibleDays.filter((d: any) => d.phase === phase).map((day: any) => {
                  const isCompleted = completedDays.has(day.day);
                  const isLocked = day.day > (stats?.lastCompletedDay || 0) + 1 && !isCompleted;
                  
                  return (
                    <Link key={day.day} href={`/dashboard/${day.day}`} onClick={handleNavClick}>
                      <span
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group mb-0.5 cursor-pointer",
                          currentDay === day.day 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                        data-testid={`nav-day-${day.day}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-colors",
                            isCompleted 
                              ? "bg-primary border-primary text-primary-foreground"
                              : currentDay === day.day 
                                ? "border-primary text-primary font-bold"
                                : "border-muted-foreground/30 text-muted-foreground"
                          )}>
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : day.day}
                          </div>
                          <span className="truncate">{day.title}</span>
                        </div>
                        {isLocked && currentDay !== day.day && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link href="/settings" onClick={handleNavClick}>
          <span className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors cursor-pointer",
            location === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          )}>
            <Settings className="w-4 h-4" />
            Settings
          </span>
        </Link>
        <a 
          href="/api/logout"
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </a>
      </div>
    </div>
  );
}
