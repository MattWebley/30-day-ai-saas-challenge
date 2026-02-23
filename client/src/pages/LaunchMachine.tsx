import { useParams, useLocation } from "wouter";
import { LaunchMachineLayout } from "@/components/layout/LaunchMachineLayout";
import { useLaunchMachineContent, useCompleteSLMLesson } from "@/hooks/useLaunchMachine";
import { SlmCommunity } from "@/components/SlmCommunity";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseLinks, isSubheadline } from "@/lib/lessonRenderer";
import { toast } from "sonner";
import {
  CheckCircle2, Play, ChevronRight, Video, Calendar,
  BookOpen, Rocket,
} from "lucide-react";

export default function LaunchMachine() {
  const params = useParams<{ lessonId?: string }>();
  const lessonId = params.lessonId ? parseInt(params.lessonId) : null;
  const [, setLocation] = useLocation();
  const { data, isLoading } = useLaunchMachineContent();
  const completeLesson = useCompleteSLMLesson();

  if (isLoading) {
    return (
      <LaunchMachineLayout activeLessonId={lessonId || undefined}>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LaunchMachineLayout>
    );
  }

  if (!data?.hasAccess) {
    return (
      <LaunchMachineLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Required</h1>
          <p className="text-slate-600">
            {data?.reason === "Coming soon"
              ? "SaaS Launch Machine is coming soon. Stay tuned!"
              : "You need SaaS Launch Machine access to view this content."}
          </p>
        </div>
      </LaunchMachineLayout>
    );
  }

  const sections = data?.sections || [];
  const progress = data?.progress || [];
  const completedSet = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.lessonId));
  const zoomCalls = data?.zoomCalls || [];
  const nextCall = zoomCalls.find((c: any) => !c.isPast);

  // Find the lesson + its context
  let currentLesson: any = null;
  let currentWeek: any = null;
  let currentSection: any = null;
  let nextLesson: any = null;

  if (lessonId) {
    // Find lesson in the tree
    const allLessons: any[] = [];
    for (const section of sections) {
      for (const week of section.weeks || []) {
        for (const lesson of week.lessons || []) {
          allLessons.push({ lesson, week, section });
        }
      }
    }
    const idx = allLessons.findIndex(l => l.lesson.id === lessonId);
    if (idx >= 0) {
      currentLesson = allLessons[idx].lesson;
      currentWeek = allLessons[idx].week;
      currentSection = allLessons[idx].section;
      if (idx + 1 < allLessons.length) {
        nextLesson = allLessons[idx + 1].lesson;
      }
    }
  }

  const isCompleted = lessonId ? completedSet.has(lessonId) : false;

  const handleComplete = () => {
    if (!lessonId) return;
    completeLesson.mutate(lessonId, {
      onSuccess: () => {
        toast.success("Lesson completed!");
        if (nextLesson) {
          setLocation(`/launch-machine/lesson/${nextLesson.id}`);
        }
      },
      onError: (err: any) => toast.error(err.message || "Failed to mark complete"),
    });
  };

  // Detect video embed type
  const getVideoEmbed = (url: string) => {
    if (url.includes("loom.com")) {
      const embedUrl = url.replace("/share/", "/embed/");
      return (
        <div className="relative rounded-xl overflow-hidden mb-6" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
          />
        </div>
      );
    }
    if (url.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) {
        return (
          <div className="relative rounded-xl overflow-hidden mb-6" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://player.vimeo.com/video/${match[1]}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      if (match) {
        return (
          <div className="relative rounded-xl overflow-hidden mb-6" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${match[1]}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }
    }
    return null;
  };

  // ==========================================
  // LESSON VIEW
  // ==========================================
  if (lessonId && currentLesson) {
    return (
      <LaunchMachineLayout activeLessonId={lessonId}>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{currentSection?.title}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{currentWeek?.title}</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{currentLesson.title}</h1>
            {currentLesson.description && (
              <p className="text-slate-600 mt-1">{currentLesson.description}</p>
            )}
          </div>

          {/* Video */}
          {currentLesson.videoUrl && getVideoEmbed(currentLesson.videoUrl)}

          {/* Lesson Text */}
          {currentLesson.lessonText && (
            <div className="space-y-4">
              {currentLesson.lessonText.split('\n\n').map((paragraph: string, i: number) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                if (isSubheadline(trimmed)) {
                  return (
                    <h3 key={i} className="text-lg font-bold text-slate-900 mt-6">
                      {parseLinks(trimmed)}
                    </h3>
                  );
                }

                // Check for bullet points
                if (trimmed.includes('\n')) {
                  const lines = trimmed.split('\n');
                  const isBulletList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('• ') || l.trim() === '');
                  if (isBulletList) {
                    return (
                      <ul key={i} className="space-y-2 ml-1">
                        {lines.filter(l => l.trim()).map((line, j) => (
                          <li key={j} className="flex gap-3 text-slate-700">
                            <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                            <span>{parseLinks(line.replace(/^[-•]\s*/, ''))}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                }

                return (
                  <p key={i} className="text-slate-700 leading-relaxed">
                    {parseLinks(trimmed)}
                  </p>
                );
              })}
            </div>
          )}

          {/* Completion Button */}
          <div className="pt-6 border-t border-slate-200">
            {isCompleted ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">Lesson Complete!</p>
                  {nextLesson && (
                    <button
                      onClick={() => setLocation(`/launch-machine/lesson/${nextLesson.id}`)}
                      className="text-sm text-primary hover:underline mt-1"
                    >
                      Next: {nextLesson.title} →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={completeLesson.isPending}
                className="w-full py-6 text-lg font-bold gap-2"
              >
                {completeLesson.isPending ? "Saving..." : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Section Discussion */}
          {currentSection && (
            <SlmCommunity
              sectionId={currentSection.id}
              sectionTitle={currentSection.title}
            />
          )}
        </div>
      </LaunchMachineLayout>
    );
  }

  // ==========================================
  // OVERVIEW VIEW
  // ==========================================
  return (
    <LaunchMachineLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-8 h-8 text-amber-400" />
            <h1 className="text-2xl font-extrabold">SaaS Launch Machine</h1>
          </div>
          <p className="text-slate-300 max-w-2xl">
            Welcome to your ongoing marketing and sales training. Work through the content at your own pace,
            join the live calls, and connect with other members.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div>
              <p className="text-3xl font-extrabold">{data?.completedLessons || 0}</p>
              <p className="text-xs text-slate-400">Lessons Done</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{data?.totalLessons || 0}</p>
              <p className="text-xs text-slate-400">Total Lessons</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{sections.length}</p>
              <p className="text-xs text-slate-400">Sections</p>
            </div>
          </div>
        </div>

        {/* Next Call */}
        {nextCall && (
          <Card className="p-5 border-2 border-primary/20 bg-primary/5 flex items-center gap-4">
            <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-slate-900">{nextCall.title}</p>
              <p className="text-sm text-slate-600">
                {new Date(nextCall.scheduledAt).toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric", month: "long",
                })}{" at "}
                {new Date(nextCall.scheduledAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={() => setLocation("/launch-machine/calls")}
              className="text-primary font-medium text-sm hover:underline"
            >
              View →
            </button>
          </Card>
        )}

        {/* Sections Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Your Content</h2>
          {sections.map((section: any) => {
            const sectionLessons: any[] = [];
            (section.weeks || []).forEach((w: any) => {
              (w.lessons || []).forEach((l: any) => sectionLessons.push(l));
            });
            const sectionCompleted = sectionLessons.filter(l => completedSet.has(l.id)).length;
            const sectionTotal = sectionLessons.length;
            const pct = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0;

            // Find first incomplete lesson
            const firstIncomplete = sectionLessons.find(l => !completedSet.has(l.id));

            return (
              <Card key={section.id} className="p-5 border-2 border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                    {section.description && (
                      <p className="text-slate-600 text-sm mt-1">{section.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500 flex-shrink-0">{sectionCompleted}/{sectionTotal}</span>
                    </div>
                  </div>
                  {firstIncomplete && (
                    <button
                      onClick={() => setLocation(`/launch-machine/lesson/${firstIncomplete.id}`)}
                      className="flex items-center gap-1 text-primary text-sm font-medium hover:underline flex-shrink-0 mt-1"
                    >
                      {sectionCompleted > 0 ? "Continue" : "Start"} <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {!firstIncomplete && sectionTotal > 0 && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              </Card>
            );
          })}

          {sections.length === 0 && (
            <Card className="p-8 border-2 border-slate-200 text-center">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Content is being prepared. Check back soon!</p>
            </Card>
          )}
        </div>
      </div>
    </LaunchMachineLayout>
  );
}
