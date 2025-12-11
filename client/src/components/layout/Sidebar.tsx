import { useState } from "react";
import { Link, useLocation } from "wouter";
import { challengeDays, badges } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  Trophy, 
  LayoutDashboard,
  Settings,
  LogOut
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const progress = 3; // Mock progress percentage (1 day done out of 30)

  // Group days by phase
  const phases = Array.from(new Set(challengeDays.map(d => d.phase)));

  return (
    <div className="w-80 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono">
            30
          </div>
          <h1 className="font-bold text-lg tracking-tight text-sidebar-foreground">
            SaaS Challenge
          </h1>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Overall Progress</span>
            <span>3%</span>
          </div>
          <Progress value={3} className="h-2" />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-8">
          <div className="space-y-1">
             <Link href="/dashboard">
              <a className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location === "/dashboard" 
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
                {challengeDays.filter(d => d.phase === phase).map((day) => (
                  <button
                    key={day.day}
                    disabled={day.locked}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group",
                      day.locked 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      // Highlight active day if relevant (mock logic)
                      day.day === 1 && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] border",
                        day.completed 
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {day.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : day.day}
                      </div>
                      <span className="truncate">{day.title}</span>
                    </div>
                    {day.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
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
      </div>
    </div>
  );
}
