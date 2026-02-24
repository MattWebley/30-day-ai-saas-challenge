import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { LaunchMachineLayout } from "@/components/layout/LaunchMachineLayout";
import { useLaunchMachineContent, useCompleteSLMLesson } from "@/hooks/useLaunchMachine";
import { SlmCommunity } from "@/components/SlmCommunity";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseLinks, isSubheadline } from "@/lib/lessonRenderer";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  CheckCircle2, Play, ChevronRight, Calendar,
  BookOpen, Rocket, X,
} from "lucide-react";

export default function LaunchMachine() {
  const params = useParams<{ lessonId?: string }>();
  const lessonId = params.lessonId ? parseInt(params.lessonId) : null;
  const [, setLocation] = useLocation();
  const { data, isLoading } = useLaunchMachineContent();
  const completeLesson = useCompleteSLMLesson();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  if (isLoading) {
    return (
      <LaunchMachineLayout activeLessonId={lessonId || undefined}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 font-medium">Loading content...</p>
          </div>
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
              ? "AI SaaS Launch Machine is coming soon. Stay tuned!"
              : "You need AI SaaS Launch Machine access to view this content."}
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

  // Get video embed URL for modal
  const getVideoEmbedUrl = (url: string): string | null => {
    if (url.includes("loom.com")) {
      return url.replace("/share/", "/embed/");
    }
    if (url.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  // Get Loom thumbnail from share URL
  const getLoomThumbnail = (url: string): string | null => {
    if (!url.includes("loom.com")) return null;
    const match = url.match(/loom\.com\/(?:share|embed)\/([a-z0-9]+)/i);
    if (match) return `https://cdn.loom.com/sessions/thumbnails/${match[1]}-with-play.gif`;
    return null;
  };

  // ==========================================
  // LESSON VIEW
  // ==========================================
  if (lessonId && currentLesson) {
    const embedUrl = currentLesson.videoUrl ? getVideoEmbedUrl(currentLesson.videoUrl) : null;
    const thumbnail = currentLesson.videoUrl ? getLoomThumbnail(currentLesson.videoUrl) : null;

    return (
      <LaunchMachineLayout activeLessonId={lessonId}>
        <div className="space-y-8 pb-20 font-sans">
          {/* Header - matching Dashboard exactly */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                  {currentWeek?.title || "Lesson"}
                </span>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {currentSection?.title}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{currentLesson.title}</h1>
              {currentLesson.description && (
                <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
                  {currentLesson.description}
                </p>
              )}
            </div>
          </div>

          {/* Step 1: Video Lesson (if video exists) */}
          {currentLesson.videoUrl && embedUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</div>
                <h2 className="font-bold text-xl text-slate-900">Watch the Lesson</h2>
              </div>
              <div
                className="relative rounded-lg overflow-hidden bg-slate-200 cursor-pointer group"
                style={{
                  paddingBottom: '56.25%',
                  ...(thumbnail && { backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                }}
                onClick={() => { setVideoLoading(true); setShowVideoModal(true); }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-lg">
                    <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 (or 1 if no video): Lesson Content */}
          {currentLesson.lessonText && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                  {currentLesson.videoUrl ? 2 : 1}
                </div>
                <h2 className="font-bold text-xl text-slate-900">
                  {currentLesson.videoUrl ? "Read the Details" : "Today's Lesson"}
                </h2>
              </div>
              <Card className="p-6 border-2 border-slate-100 shadow-none bg-white">
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
              </Card>
            </div>
          )}

          {/* Completion Button */}
          <div className="pt-2">
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

        {/* Video Modal - matching Dashboard pattern */}
        {embedUrl && (
          <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0">
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  onLoad={() => setVideoLoading(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </LaunchMachineLayout>
    );
  }

  // ==========================================
  // OVERVIEW VIEW
  // ==========================================
  return (
    <LaunchMachineLayout>
      <div className="space-y-8 pb-20 font-sans">
        {/* Header - matching Dashboard header style */}
        <div className="border-b border-slate-200 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                Overview
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">AI SaaS Launch Machine</h1>
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
              Your marketing and sales training. Work through the content at your own pace,
              join the live calls, and connect with other members.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-6">
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{data?.completedLessons || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lessons Done</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{data?.totalLessons || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Lessons</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{sections.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sections</p>
            </div>
          </div>
        </div>

        {/* Next Call */}
        {nextCall && (
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-slate-900">{nextCall.title}</p>
                <p className="text-slate-700 font-medium mt-1">
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
                className="text-primary font-bold text-sm hover:underline flex-shrink-0"
              >
                View →
              </button>
            </div>
          </div>
        )}

        {/* Sections Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-xl text-slate-900">Your Content</h2>
          </div>

          {sections.map((section: any) => {
            const sectionWeeks = section.weeks || [];
            const sectionLessons: any[] = [];
            sectionWeeks.forEach((w: any) => {
              (w.lessons || []).forEach((l: any) => sectionLessons.push(l));
            });
            const sectionCompleted = sectionLessons.filter(l => completedSet.has(l.id)).length;
            const sectionTotal = sectionLessons.length;
            const pct = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0;

            return (
              <div key={section.id} className="space-y-4">
                {/* Month header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{section.title}</h3>
                      {section.description && (
                        <p className="text-slate-600 mt-0.5">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-500">{sectionCompleted}/{sectionTotal} lessons</span>
                </div>

                {/* Month progress bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Weeks inside this month */}
                <div className="space-y-3 pl-2">
                  {sectionWeeks.map((week: any) => {
                    const weekLessons = week.lessons || [];
                    const weekCompleted = weekLessons.filter((l: any) => completedSet.has(l.id)).length;
                    const weekTotal = weekLessons.length;
                    const firstIncomplete = weekLessons.find((l: any) => !completedSet.has(l.id));
                    const allDone = weekTotal > 0 && weekCompleted === weekTotal;

                    return (
                      <Card key={week.id} className="p-4 border-2 border-slate-100 shadow-none bg-white">
                        <div className="flex items-center gap-3">
                          {allDone ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900">{week.title}</p>
                            <p className="text-slate-600 text-sm mt-0.5">{weekCompleted}/{weekTotal} lessons complete</p>
                          </div>
                          {firstIncomplete && (
                            <button
                              onClick={() => setLocation(`/launch-machine/lesson/${firstIncomplete.id}`)}
                              className="flex items-center gap-1 text-primary text-sm font-bold hover:underline flex-shrink-0"
                            >
                              {weekCompleted > 0 ? "Continue" : "Start"} <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {sections.length === 0 && (
            <Card className="p-8 border-2 border-slate-100 shadow-none bg-white text-center">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Content is being prepared. Check back soon!</p>
            </Card>
          )}
        </div>
      </div>
    </LaunchMachineLayout>
  );
}
