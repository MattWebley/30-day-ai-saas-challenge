import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useDayContent } from "@/hooks/useDays";
import { useUserProgress } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";
import { useTestMode } from "@/contexts/TestModeContext";
import {
  CheckCircle2,
  Lock,
  Trophy,
  LayoutDashboard,
  Settings,
  LogOut,
  X,
  Shield,
  FileText,
  Lightbulb,
  Target,
  Rocket,
  Map,
  Hammer,
  Sparkles,
  Zap,
  BookOpen
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
    
    const chosenIdeaIndex = day2?.userInputs?.chosenIdea;
    const chosenIdea = chosenIdeaIndex !== undefined && shortlistedIdeas[chosenIdeaIndex]
      ? shortlistedIdeas[chosenIdeaIndex]
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
      className="mt-4 p-3 rounded-md relative cursor-pointer transition-none"
      style={{ backgroundColor: '#E8F4F0', border: '1px solid #B8D4CA' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Rocket className="w-4 h-4" style={{ color: '#2D6A4F' }} />
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2D6A4F' }}>My Journey</p>
      </div>
      
      {journey.chosenIdea ? (
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Target className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#40916C' }} />
            <div>
              <p className="text-xs" style={{ color: '#52796F' }}>Building:</p>
              <p className="text-sm font-semibold leading-tight" style={{ color: '#1B4332' }}>{journey.chosenIdea.title}</p>
            </div>
          </div>
        </div>
      ) : journey.hasShortlist ? (
        <div className="flex items-start gap-2">
          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#40916C' }} />
          <div>
            <p className="text-xs" style={{ color: '#52796F' }}>Shortlisted:</p>
            <p className="text-sm font-medium" style={{ color: '#1B4332' }}>{journey.shortlistCount} ideas</p>
          </div>
        </div>
      ) : null}

      {isHovered && (
        <div className="absolute left-full top-0 ml-2 w-64 p-4 bg-white rounded-md shadow-xl border border-slate-200 z-50">
          <h4 className="font-bold text-sm text-black mb-3">Journey Notes</h4>
          <div className="space-y-3 text-xs">
            {journey.userInputs && (
              <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                <p className="font-semibold text-black mb-1">Day 1: About You</p>
                <p className="text-slate-600">Skills: {journey.userInputs.skills || 'Not set'}</p>
                <p className="text-slate-600">Interests: {journey.userInputs.interests || 'Not set'}</p>
              </div>
            )}
            {journey.hasShortlist && (
              <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                <p className="font-semibold text-black mb-1">Day 1: Top 5 Ideas</p>
                <ul className="text-slate-600 space-y-0.5">
                  {journey.shortlistedIdeas.slice(0, 5).map((idea: any, i: number) => (
                    <li key={i} className="truncate">• {idea.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {journey.chosenIdea && (
              <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                <p className="font-semibold text-black mb-1">Day 2: Final Choice</p>
                <p className="text-black font-medium">{journey.chosenIdea.title}</p>
                <p className="text-slate-500 text-[10px] mt-1">{journey.chosenIdea.desc}</p>
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
  const { testMode, setTestMode } = useTestMode();

  const challengeDays = Array.isArray(allDays) ? allDays : [];
  const completedDays = new Set(
    Array.isArray(userProgress) 
      ? userProgress.filter((p: any) => p.completed).map((p: any) => p.day)
      : []
  );

  const totalDays = 21;
  const progress = stats ? Math.round((((stats as any).lastCompletedDay || 0) / totalDays) * 100) : 0;
  const lastCompleted = (stats as any)?.lastCompletedDay || 0;

  const maxVisibleDay = testMode ? totalDays : Math.max(lastCompleted + 3, currentDay + 2, 3);

  // Milestone definitions for battle pass style progress
  const milestones = [
    { day: 2, label: "Idea", icon: Lightbulb, percentage: (2 / totalDays) * 100 },
    { day: 4, label: "Plan", icon: Map, percentage: (4 / totalDays) * 100 },
    { day: 7, label: "Prepare", icon: Target, percentage: (7 / totalDays) * 100 },
    { day: 14, label: "Build", icon: Hammer, percentage: (14 / totalDays) * 100 },
    { day: 18, label: "Polish", icon: Sparkles, percentage: (18 / totalDays) * 100 },
    { day: 21, label: "Launch", icon: Rocket, percentage: 100 },
  ];

  // Find current milestone
  const currentMilestone = milestones.find(m => lastCompleted < m.day) || milestones[milestones.length - 1];
  const currentMilestoneIndex = milestones.findIndex(m => m === currentMilestone);
  const visibleDays = challengeDays.filter((d: any) => d.day <= maxVisibleDay);

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border h-full overflow-y-auto">
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
              21 Day AI<br/>SaaS Challenge
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

        {/* Battle Pass Style Progress */}
        <div className="space-y-4">
          {/* Current Level Display */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Level</p>
              <p className="text-3xl font-black text-sidebar-foreground leading-none">
                {lastCompleted}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ 21</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next</p>
              <p className="text-sm font-bold text-primary">{currentMilestone.label}</p>
            </div>
          </div>

          {/* Progress Track */}
          <div className="relative pt-2 pb-1">
            {/* Track background */}
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 rounded-full -translate-y-1/2" />

            {/* Filled track */}
            <div
              className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full -translate-y-1/2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

            {/* Milestone nodes */}
            <div className="relative flex justify-between">
              {milestones.map((milestone, index) => {
                const isCompleted = lastCompleted >= milestone.day;
                const isCurrent = currentMilestoneIndex === index;
                const MilestoneIcon = milestone.icon;

                return (
                  <div key={milestone.day} className="flex flex-col items-center">
                    {/* Node */}
                    <div
                      className={cn(
                        "relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                        isCompleted
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : isCurrent
                            ? "bg-white border-2 border-primary text-primary shadow-lg shadow-primary/20"
                            : "bg-slate-100 border-2 border-slate-200 text-slate-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <MilestoneIcon className="w-4 h-4" />
                      )}

                      {/* Current indicator pulse */}
                      {isCurrent && !isCompleted && (
                        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "text-[10px] font-bold mt-1.5 uppercase tracking-wide",
                        isCompleted
                          ? "text-primary"
                          : isCurrent
                            ? "text-sidebar-foreground"
                            : "text-muted-foreground/50"
                      )}
                    >
                      {milestone.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XP to next milestone */}
          {currentMilestoneIndex >= 0 && lastCompleted < 21 && (
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-600">
                  <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
                  {currentMilestone.day - lastCompleted} days to {currentMilestone.label}
                </span>
                <span className="font-bold text-slate-900">
                  {Math.round(((lastCompleted - (milestones[currentMilestoneIndex - 1]?.day || 0)) / (currentMilestone.day - (milestones[currentMilestoneIndex - 1]?.day || 0))) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{
                    width: `${((lastCompleted - (milestones[currentMilestoneIndex - 1]?.day || 0)) / (currentMilestone.day - (milestones[currentMilestoneIndex - 1]?.day || 0))) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Streak Display */}
        <div className="mt-4 flex items-center gap-3 p-3 rounded-md" style={{ backgroundColor: '#FFF8E7', border: '1px solid #E8DCC8' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4A574' }}>
            <span className="text-white font-black text-lg">{(stats as any)?.currentStreak || 0}</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#8B6914' }}>Day Streak</p>
            <p className="text-xs" style={{ color: '#A67C52' }}>Keep it going!</p>
          </div>
        </div>

        {/* My Journey Section */}
        <MyJourneySection userProgress={userProgress as any} />

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
      <div className="px-4 py-4">
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
            <Link href="/build-log" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === "/build-log"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <FileText className="w-4 h-4" />
                My Progress
              </span>
            </Link>
            {completedDays.has(8) ? (
              <Link href="/claude-code" onClick={handleNavClick}>
                <span className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === "/claude-code"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}>
                  <BookOpen className="w-4 h-4" />
                  Claude Code Guide
                </span>
              </Link>
            ) : testMode ? (
              <Link href="/claude-code" onClick={handleNavClick}>
                <span className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/50 hover:bg-sidebar-accent/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4" />
                    Claude Code Guide
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Lock className="w-3 h-3" />
                    <span>Day 8</span>
                  </div>
                </span>
              </Link>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  Claude Code Guide
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Lock className="w-3 h-3" />
                  <span>Day 8</span>
                </div>
              </div>
            )}
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

          {/* Days grouped by milestone sections */}
          {[
            { label: "Idea", minDay: 0, maxDay: 2 },
            { label: "Plan", minDay: 3, maxDay: 4 },
            { label: "Prepare", minDay: 5, maxDay: 7 },
            { label: "Build", minDay: 8, maxDay: 14 },
            { label: "Polish", minDay: 15, maxDay: 18 },
            { label: "Launch", minDay: 19, maxDay: 21 },
          ].map((section) => {
            const sectionDays = visibleDays.filter((d: any) => d.day >= section.minDay && d.day <= section.maxDay);
            if (sectionDays.length === 0) return null;

            return (
              <div key={section.label} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.label}
                </h3>
                <div className="space-y-0.5">
                  {sectionDays.map((day: any) => {
                    const isCompleted = completedDays.has(day.day);
                    // Day 0 is never locked, Day 1+ requires Day 0 completion first
                    const hasCompletedDay0 = completedDays.has(0);
                    const isLocked = day.day === 0
                      ? false
                      : (day.day > ((stats as any)?.lastCompletedDay || 0) + 1 && !isCompleted) || (!hasCompletedDay0 && day.day > 0);
                    const daysAhead = day.day - currentDay;
                    const fadeOpacity = daysAhead <= 0 || isCompleted ? 1 : daysAhead === 1 ? 0.7 : daysAhead === 2 ? 0.5 : daysAhead >= 3 ? 0.35 : 1;

                    return (
                      <Link key={day.day} href={`/dashboard/${day.day}`} onClick={handleNavClick}>
                        <span
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-none group mb-0.5 cursor-pointer",
                            currentDay === day.day
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                          style={{ opacity: currentDay === day.day ? 1 : fadeOpacity }}
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
                              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : day.day === 0 ? <Rocket className="w-3.5 h-3.5" /> : day.day}
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
            );
          })}

          {/* Settings & Logout - scrolls with content */}
          <div className="space-y-1 pt-4 border-t border-sidebar-border">
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
      </div>
    </div>
  );
}
