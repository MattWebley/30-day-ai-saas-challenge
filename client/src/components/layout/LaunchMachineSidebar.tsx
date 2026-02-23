import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLaunchMachineContent } from "@/hooks/useLaunchMachine";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, CheckCircle2, Settings, LogOut, X, Video,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface LaunchMachineSidebarProps {
  activeLessonId?: number;
  onClose?: () => void;
}

export function LaunchMachineSidebar({ activeLessonId, onClose }: LaunchMachineSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data } = useLaunchMachineContent();
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const sections = data?.sections || [];
  const progress = data?.progress || [];
  const completedSet = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.lessonId));
  const totalLessons = data?.totalLessons || 0;
  const completedLessons = data?.completedLessons || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleNavClick = () => { if (onClose) onClose(); };

  const toggleSection = (id: number) => {
    const next = new Set(collapsedSections);
    next.has(id) ? next.delete(id) : next.add(id);
    setCollapsedSections(next);
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border h-full overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard" onClick={handleNavClick}>
            <span className="flex items-center gap-2 text-sm text-muted-foreground hover:text-sidebar-foreground transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to Challenge
            </span>
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <h1 className="text-lg font-extrabold text-sidebar-foreground">SaaS Launch Machine</h1>

        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{completedLessons} of {totalLessons} lessons</span>
            <span className="font-bold text-sidebar-foreground">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-4">
        <div className="space-y-6">
          {/* Overview link */}
          <Link href="/launch-machine" onClick={handleNavClick}>
            <span className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              location === "/launch-machine" && !activeLessonId
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}>
              Overview
            </span>
          </Link>

          {/* Zoom Calls link */}
          <Link href="/launch-machine/calls" onClick={handleNavClick}>
            <span className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              location === "/launch-machine/calls"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}>
              <Video className="w-4 h-4" />
              Zoom Calls
            </span>
          </Link>

          {/* Content tree */}
          {sections.map((section: any) => {
            const collapsed = collapsedSections.has(section.id);
            return (
              <div key={section.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-2 px-3 w-full text-left"
                >
                  {collapsed
                    ? <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    : <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  }
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </button>

                {!collapsed && section.weeks?.map((week: any) => (
                  <div key={week.id} className="space-y-0.5 ml-2">
                    <p className="px-3 py-1 text-xs font-medium text-muted-foreground">{week.title}</p>
                    {week.lessons?.map((lesson: any) => {
                      const isCompleted = completedSet.has(lesson.id);
                      const isActive = activeLessonId === lesson.id;

                      return (
                        <Link key={lesson.id} href={`/launch-machine/lesson/${lesson.id}`} onClick={handleNavClick}>
                          <span className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}>
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border",
                              isCompleted
                                ? "bg-primary border-primary text-white"
                                : "border-muted-foreground/30"
                            )}>
                              {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className="truncate">{lesson.title}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Settings & Logout */}
          <div className="space-y-1 pt-4 border-t border-sidebar-border">
            <Link href="/settings" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors cursor-pointer",
                "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}>
                <Settings className="w-4 h-4" />
                Settings
              </span>
            </Link>
            <a
              href="/api/logout"
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
