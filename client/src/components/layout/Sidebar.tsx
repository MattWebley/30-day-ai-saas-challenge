import { useState, useEffect } from "react";
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
  ChevronRight, 
  Trophy, 
  LayoutDashboard,
  Settings,
  LogOut
} from "lucide-react";

interface SidebarProps {
  currentDay: number;
}

export function Sidebar({ currentDay }: SidebarProps) {
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
  
  // TESTING MODE: Show all 30 days (change back to limited visibility later)
  const maxVisibleDay = 30; // Was: Math.max(lastCompleted + 3, currentDay + 2, 3);
  const visibleDays = challengeDays.filter((d: any) => d.day <= maxVisibleDay);

  // Group visible days by phase
  const phases = Array.from(new Set(visibleDays.map((d: any) => d.phase)));

  return (
    <div className="w-80 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="https://d1yei2z3i6k35z.cloudfront.net/9204972/6718ddeb1f6c8_MattCircleProfileLogo.png" 
            alt="Matt Webley" 
            className="w-10 h-10 rounded-full"
          />
          <h1 className="font-bold text-sm tracking-tight text-sidebar-foreground leading-tight">
            30 Day AI<br/>SaaS Challenge
          </h1>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-8">
          <div className="space-y-1">
             <Link href="/dashboard">
              <a className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location === "/dashboard" || location.startsWith("/dashboard/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <LayoutDashboard className="w-4 h-4" />
                Current Task
              </a>
            </Link>
             <Link href="/badges">
              <a className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location === "/badges" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Trophy className="w-4 h-4" />
                Badge Collection
              </a>
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
                    <Link key={day.day} href={`/dashboard/${day.day}`}>
                      <a
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group mb-0.5",
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
                      </a>
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
        <Link href="/settings">
          <a className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors",
            location === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          )}>
            <Settings className="w-4 h-4" />
            Settings
          </a>
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
