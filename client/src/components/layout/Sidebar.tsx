import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useDayContent } from "@/hooks/useDays";
import { useUserProgress } from "@/hooks/useProgress";
import { useUserStats } from "@/hooks/useStats";
import { useTestMode } from "@/contexts/TestModeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle2,
  Lock,
  Unlock,
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
  BookOpen,
  PenTool,
  Video
} from "lucide-react";

interface SidebarProps {
  currentDay: number;
  onClose?: () => void;
}

export function Sidebar({ currentDay, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { dayContent: allDays } = useDayContent();
  const { progress: userProgress } = useUserProgress();
  const { stats } = useUserStats();
  const { testMode, setTestMode } = useTestMode();
  const { user } = useAuth();
  const hasLaunchPack = (user as any)?.launchPackPurchased === true;

  const challengeDays = Array.isArray(allDays) ? allDays : [];
  const completedDays = new Set(
    Array.isArray(userProgress) 
      ? userProgress.filter((p: any) => p.completed).map((p: any) => p.day)
      : []
  );

  const totalDays = 21;
  const lastCompleted = (stats as any)?.lastCompletedDay ?? -1; // -1 means no days completed yet
  const daysCompleted = lastCompleted + 1; // Day 0 completed = 1 day done
  const progress = stats ? Math.round((daysCompleted / (totalDays + 1)) * 100) : 0; // +1 because Day 0-21 = 22 days
  const daysToLaunch = totalDays - Math.max(0, lastCompleted); // Days remaining until Day 21 (capped at 21)
  const daysSinceStart = (stats as any)?.daysSinceStart || 0;

  const maxVisibleDay = testMode ? totalDays : Math.max(lastCompleted + 3, currentDay + 2, daysSinceStart + 3, 3);

  // Milestone definitions for battle pass style progress
  // Day number shows the LAST day of each phase (when you complete that phase)
  // Phases: Start (0), Idea (1-2), Plan (3-4), Prepare (5-9), Build (10-18), Launch (19-21)
  const milestones = [
    { day: 0, label: "Start", icon: Rocket, percentage: 0 },
    { day: 2, label: "Idea", icon: Lightbulb, percentage: (2 / totalDays) * 100 },
    { day: 4, label: "Plan", icon: Map, percentage: (4 / totalDays) * 100 },
    { day: 9, label: "Prepare", icon: Sparkles, percentage: (9 / totalDays) * 100 },
    { day: 18, label: "Build", icon: Hammer, percentage: (18 / totalDays) * 100 },
    { day: 21, label: "Launch", icon: Target, percentage: (21 / totalDays) * 100 },
  ];

  // Find current milestone (the next phase you're working towards)
  const currentMilestone = milestones.find(m => lastCompleted < m.day) || milestones[milestones.length - 1];
  const currentMilestoneIndex = milestones.findIndex(m => m === currentMilestone);

  // Determine current phase based on what day you're working on
  const getCurrentPhase = (day: number) => {
    if (day === 0) return "Start";
    if (day <= 2) return "Idea";
    if (day <= 4) return "Plan";
    if (day <= 9) return "Prepare";
    if (day <= 18) return "Build";
    return "Launch";
  };
  const currentPhase = getCurrentPhase(Math.max(lastCompleted + 1, currentDay));
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
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Day</p>
              <p className="text-3xl font-black text-sidebar-foreground leading-none">
                {Math.min(lastCompleted + 1, 21)}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ 21</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">To Launch</p>
              <p className="text-sm font-bold text-amber-600">
                {daysToLaunch} {daysToLaunch === 1 ? "day" : "days"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phase</p>
              <p className="text-sm font-bold text-primary">{currentPhase}</p>
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
            {lastCompleted >= 18 || testMode ? (
              <Link href="/critique" onClick={handleNavClick}>
                <span className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === "/critique"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}>
                  <div className="flex items-center gap-3">
                    <PenTool className="w-4 h-4" />
                    Sales Letter Critique
                  </div>
                  <Unlock className="w-3 h-3 text-muted-foreground" />
                </span>
              </Link>
            ) : (
              <span className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer">
                <div className="flex items-center gap-3">
                  <PenTool className="w-4 h-4" />
                  Sales Letter Critique
                </div>
                <Lock className="w-3 h-3 text-muted-foreground" />
              </span>
            )}
            <Link href="/launch-pack" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === "/launch-pack"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <div className="flex items-center gap-3">
                  <Rocket className="w-4 h-4" />
                  Launch Pack
                </div>
                {hasLaunchPack ? (
                  <Unlock className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </span>
            </Link>
            <Link href="/coaching" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === "/coaching"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Video className="w-4 h-4" />
                1:1 Coaching Calls
              </span>
            </Link>
            {!(stats as any)?.hasCoaching && (
              <Link href="/coaching" onClick={handleNavClick}>
                <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                  <Zap className="w-4 h-4" />
                  Unlock All Days Instantly
                </span>
              </Link>
            )}
            {completedDays.has(8) || testMode ? (
              <Link href="/claude-code" onClick={handleNavClick}>
                <span className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === "/claude-code"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4" />
                    Claude Code Guide
                  </div>
                  <Unlock className="w-3 h-3 text-muted-foreground" />
                </span>
              </Link>
            ) : (
              <span className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  Claude Code Guide
                </div>
                <Lock className="w-3 h-3 text-muted-foreground" />
              </span>
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
            { label: "Start", minDay: 0, maxDay: 0 },
            { label: "Idea", minDay: 1, maxDay: 2 },
            { label: "Plan", minDay: 3, maxDay: 4 },
            { label: "Prepare", minDay: 5, maxDay: 9 },
            { label: "Build", minDay: 10, maxDay: 18 },
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
                    // Day unlocking logic:
                    // - Day 0: always unlocked
                    // - Day 1: unlocked when Day 0 is completed (both available on signup)
                    // - Day 2+: unlocked when previous day completed AND enough time has passed
                    // Test mode OR coaching purchase bypasses all locking
                    const hasCompletedDay0 = completedDays.has(0);
                    const hasCoaching = (stats as any)?.hasCoaching || false;
                    const previousDayCompleted = day.day === 0 || completedDays.has(day.day - 1);
                    const timeUnlocked = day.day <= daysSinceStart + 1; // Day 0 & 1 on signup, then one more each day

                    const isLocked = (testMode || hasCoaching)
                      ? false
                      : day.day === 0
                        ? false
                        : day.day === 1
                          ? !hasCompletedDay0 // Day 1 just needs Day 0 completed
                          : !previousDayCompleted || !timeUnlocked; // Day 2+ needs both completion AND time
                    const daysAhead = day.day - currentDay;
                    const fadeOpacity = daysAhead <= 0 || isCompleted ? 1 : daysAhead === 1 ? 0.7 : daysAhead === 2 ? 0.5 : daysAhead >= 3 ? 0.35 : 1;

                    return (
                      <Link
                        key={day.day}
                        href={isLocked ? "#" : `/dashboard/${day.day}`}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            return;
                          }
                          handleNavClick();
                        }}
                      >
                        <span
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-none group mb-0.5",
                            isLocked
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer",
                            currentDay === day.day
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : !isLocked && "hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                          style={{ opacity: isLocked ? 0.4 : currentDay === day.day ? 1 : fadeOpacity }}
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
