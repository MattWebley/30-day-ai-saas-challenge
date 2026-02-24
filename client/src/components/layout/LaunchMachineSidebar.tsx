import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLaunchMachineContent } from "@/hooks/useLaunchMachine";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, CheckCircle2, Settings, LogOut, X, Video,
  Rocket,
} from "lucide-react";

interface LaunchMachineSidebarProps {
  activeLessonId?: number;
  onClose?: () => void;
}

export function LaunchMachineSidebar({ activeLessonId, onClose }: LaunchMachineSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data } = useLaunchMachineContent();

  const sections = data?.sections || [];
  const progress = data?.progress || [];
  const completedSet = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.lessonId));
  const totalLessons = data?.totalLessons || 0;
  const completedLessons = data?.completedLessons || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleNavClick = () => { if (onClose) onClose(); };

  // Flatten all lessons for numbering
  let lessonCounter = 0;
  const lessonNumbers = new Map<number, number>();
  for (const section of sections) {
    for (const week of section.weeks || []) {
      for (const lesson of week.lessons || []) {
        lessonCounter++;
        lessonNumbers.set(lesson.id, lessonCounter);
      }
    }
  }

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border h-full overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src="/logo.png?v=3"
              alt="AI SaaS Launch Machine"
              className="h-16 w-auto object-contain"
              style={{ imageRendering: 'auto' }}
            />
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Display - matching battle pass style */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lesson</p>
              <p className="text-3xl font-black text-sidebar-foreground leading-none">
                {completedLessons}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ {totalLessons}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Remaining</p>
              <p className="text-sm font-bold text-amber-600">
                {totalLessons - completedLessons} {totalLessons - completedLessons === 1 ? "lesson" : "lessons"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</p>
              <p className="text-sm font-bold text-primary">{progressPercent}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-1.5 bg-slate-200 rounded-full" />
            <div
              className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Back to Challenge link */}
        <Link href="/dashboard" onClick={handleNavClick}>
          <span className="flex items-center gap-2 text-sm text-muted-foreground hover:text-sidebar-foreground transition-colors cursor-pointer mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Challenge
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="px-4 py-4">
        <div className="space-y-8">
          {/* Main Nav */}
          <div className="space-y-1">
            <Link href="/launch-machine" onClick={handleNavClick}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === "/launch-machine" && !activeLessonId
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Rocket className="w-4 h-4" />
                Overview
              </span>
            </Link>
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
          </div>

          {/* Lessons grouped by section (month) → week */}
          {sections.map((section: any) => {
            const sectionWeeks = section.weeks || [];
            if (sectionWeeks.length === 0) return null;

            return (
              <div key={section.id} className="space-y-4">
                {/* Month / Section header */}
                <h2 className="px-3 text-[11px] font-extrabold text-sidebar-foreground uppercase tracking-widest border-b border-sidebar-border pb-2">
                  {section.title}
                </h2>

                {sectionWeeks.map((week: any) => {
                  const weekLessons = week.lessons || [];
                  if (weekLessons.length === 0) return null;

                  return (
                    <div key={week.id} className="space-y-2">
                      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {week.title}
                      </h3>
                      <div className="space-y-0.5">
                        {weekLessons.map((lesson: any) => {
                          const isCompleted = completedSet.has(lesson.id);
                          const isActive = activeLessonId === lesson.id;
                          const num = lessonNumbers.get(lesson.id) || 0;

                          return (
                            <Link key={lesson.id} href={`/launch-machine/lesson/${lesson.id}`} onClick={handleNavClick}>
                              <span
                                title={lesson.title}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-none cursor-pointer mb-0.5",
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-colors",
                                    isCompleted
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : isActive
                                        ? "border-primary text-primary font-bold"
                                        : "border-muted-foreground/30 text-muted-foreground"
                                  )}>
                                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : num}
                                </div>
                                <span className="truncate">{lesson.title}</span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Settings & Logout */}
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
