import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  Plus, Trash2, Pencil, ChevronDown, ChevronRight, Check, X,
  Eye, EyeOff, Video, MessageSquare, Calendar, Globe,
} from "lucide-react";

type AdminTab = "content" | "zoom" | "comments";

interface Section { id: number; title: string; description: string | null; sortOrder: number; isPublished: boolean; }
interface Week { id: number; sectionId: number; title: string; description: string | null; sortOrder: number; isPublished: boolean; }
interface Lesson { id: number; weekId: number; title: string; description: string | null; videoUrl: string | null; lessonText: string | null; interactiveComponent: string | null; sortOrder: number; isPublished: boolean; }
interface ZoomCall { id: number; title: string; scheduledAt: string; joinUrl: string | null; recordingUrl: string | null; isPast: boolean; }
interface Comment { id: number; section_id: number; user_id: string; content: string; status: string; created_at: string; first_name: string | null; last_name: string | null; email: string | null; section_title: string; }

export default function AdminLaunchMachine() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTab>("content");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Settings
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/slm/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/slm/settings", { credentials: "include" });
      return res.json();
    },
  });

  const toggleLive = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", "/api/admin/slm/settings", { isLive: !settings?.isLive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/settings"] });
      toast.success(settings?.isLive ? "Set to Coming Soon" : "Set to Live!");
    },
  });

  // Sections
  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ["/api/admin/slm/sections"],
    queryFn: async () => {
      const res = await fetch("/api/admin/slm/sections", { credentials: "include" });
      return res.json();
    },
  });

  // Weeks
  const { data: weeks = [] } = useQuery<Week[]>({
    queryKey: ["/api/admin/slm/weeks"],
    queryFn: async () => {
      const res = await fetch("/api/admin/slm/weeks", { credentials: "include" });
      return res.json();
    },
  });

  // Lessons
  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ["/api/admin/slm/lessons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/slm/lessons", { credentials: "include" });
      return res.json();
    },
  });

  // Zoom calls
  const { data: zoomCalls = [] } = useQuery<ZoomCall[]>({
    queryKey: ["/api/admin/slm/zoom-calls"],
    queryFn: async () => {
      const res = await fetch("/api/admin/slm/zoom-calls", { credentials: "include" });
      return res.json();
    },
  });

  // Comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/admin/slm/comments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/slm/comments", { credentials: "include" });
      return res.json();
    },
  });

  const pendingComments = comments.filter(c => c.status === "pending");

  // CRUD mutations
  const createSection = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/admin/slm/sections", {
        title, sortOrder: sections.length, isPublished: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/sections"] });
      toast.success("Section created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSection = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/slm/sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/sections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/weeks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/lessons"] });
      toast.success("Section deleted");
    },
  });

  const toggleSectionPublished = useMutation({
    mutationFn: async (section: Section) => {
      const res = await apiRequest("PUT", `/api/admin/slm/sections/${section.id}`, {
        ...section, isPublished: !section.isPublished,
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/sections"] }),
  });

  const createWeek = useMutation({
    mutationFn: async (sectionId: number) => {
      const sectionWeeks = weeks.filter(w => w.sectionId === sectionId);
      const res = await apiRequest("POST", "/api/admin/slm/weeks", {
        sectionId, title: `Week ${sectionWeeks.length + 1}`, sortOrder: sectionWeeks.length, isPublished: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/weeks"] });
      toast.success("Week created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteWeek = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/slm/weeks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/weeks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/lessons"] });
      toast.success("Week deleted");
    },
  });

  const toggleWeekPublished = useMutation({
    mutationFn: async (week: Week) => {
      const res = await apiRequest("PUT", `/api/admin/slm/weeks/${week.id}`, {
        ...week, isPublished: !week.isPublished,
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/weeks"] }),
  });

  const createLesson = useMutation({
    mutationFn: async (weekId: number) => {
      const weekLessons = lessons.filter(l => l.weekId === weekId);
      const res = await apiRequest("POST", "/api/admin/slm/lessons", {
        weekId, title: `Lesson ${weekLessons.length + 1}`, sortOrder: weekLessons.length, isPublished: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/lessons"] });
      toast.success("Lesson created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateLesson = useMutation({
    mutationFn: async (lesson: Lesson) => {
      const res = await apiRequest("PUT", `/api/admin/slm/lessons/${lesson.id}`, lesson);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/lessons"] });
      setEditingLesson(null);
      toast.success("Lesson saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/slm/lessons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/lessons"] });
      toast.success("Lesson deleted");
    },
  });

  // Zoom CRUD
  const [newCall, setNewCall] = useState({ title: "", scheduledAt: "", joinUrl: "", recordingUrl: "", isPast: false });
  const [editingCall, setEditingCall] = useState<ZoomCall | null>(null);

  const createCall = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/slm/zoom-calls", newCall);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/zoom-calls"] });
      setNewCall({ title: "", scheduledAt: "", joinUrl: "", recordingUrl: "", isPast: false });
      toast.success("Call created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateCall = useMutation({
    mutationFn: async (call: ZoomCall) => {
      const res = await apiRequest("PUT", `/api/admin/slm/zoom-calls/${call.id}`, call);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/zoom-calls"] });
      setEditingCall(null);
      toast.success("Call updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteCall = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/slm/zoom-calls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/zoom-calls"] });
      toast.success("Call deleted");
    },
  });

  // Comment moderation
  const moderateComment = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/slm/comments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/comments"] });
      toast.success("Comment updated");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/slm/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/comments"] });
      toast.success("Comment deleted");
    },
  });

  const toggleSection = (id: number) => {
    const next = new Set(expandedSections);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSections(next);
  };

  const toggleWeek = (id: number) => {
    const next = new Set(expandedWeeks);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedWeeks(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Live Toggle */}
      <Card className="p-5 border-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">SaaS Launch Machine</h2>
            <p className="text-slate-600">
              {settings?.isLive ? "Live — members can access content" : "Coming Soon — only you can see this"}
            </p>
          </div>
          <button
            onClick={() => toggleLive.mutate()}
            disabled={toggleLive.isPending}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              settings?.isLive
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {settings?.isLive ? (
              <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Live</span>
            ) : (
              <span className="flex items-center gap-2"><EyeOff className="w-4 h-4" /> Coming Soon</span>
            )}
          </button>
        </div>
      </Card>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-slate-200">
        {([
          { key: "content" as AdminTab, label: "Content", icon: Pencil },
          { key: "zoom" as AdminTab, label: "Zoom Calls", icon: Video },
          { key: "comments" as AdminTab, label: `Comments${pendingComments.length > 0 ? ` (${pendingComments.length})` : ""}`, icon: MessageSquare },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {tab === "content" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">{sections.length} sections, {weeks.length} weeks, {lessons.length} lessons</p>
            <Button
              size="sm"
              onClick={() => {
                const title = prompt("Section title:");
                if (title) createSection.mutate(title);
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Section
            </Button>
          </div>

          {sections.map(section => {
            const sectionWeeks = weeks.filter(w => w.sectionId === section.id);
            const expanded = expandedSections.has(section.id);

            return (
              <Card key={section.id} className="border-2 border-slate-200 overflow-hidden">
                <div className="p-4 flex items-center gap-3 bg-slate-50 border-b border-slate-200">
                  <button onClick={() => toggleSection(section.id)} className="p-1">
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{section.title}</h3>
                    {section.description && <p className="text-sm text-slate-600">{section.description}</p>}
                  </div>
                  <button
                    onClick={() => toggleSectionPublished.mutate(section)}
                    className={`px-2 py-1 rounded text-xs font-bold ${section.isPublished ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}
                  >
                    {section.isPublished ? <><Eye className="w-3 h-3 inline mr-1" />Published</> : <><EyeOff className="w-3 h-3 inline mr-1" />Draft</>}
                  </button>
                  <button
                    onClick={() => {
                      const title = prompt("Edit section title:", section.title);
                      if (title) {
                        apiRequest("PUT", `/api/admin/slm/sections/${section.id}`, { ...section, title })
                          .then(() => {
                            queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/sections"] });
                            toast.success("Section updated");
                          });
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this section and all its content?")) deleteSection.mutate(section.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {expanded && (
                  <div className="p-4 space-y-3">
                    {sectionWeeks.map(week => {
                      const weekLessons = lessons.filter(l => l.weekId === week.id);
                      const weekExpanded = expandedWeeks.has(week.id);

                      return (
                        <div key={week.id} className="border border-slate-200 rounded-lg">
                          <div className="p-3 flex items-center gap-2 bg-white">
                            <button onClick={() => toggleWeek(week.id)} className="p-1">
                              {weekExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                            <span className="font-medium text-slate-900 flex-1">{week.title}</span>
                            <span className="text-xs text-slate-400">{weekLessons.length} lessons</span>
                            <button
                              onClick={() => toggleWeekPublished.mutate(week)}
                              className={`px-2 py-0.5 rounded text-xs font-bold ${week.isPublished ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}
                            >
                              {week.isPublished ? "Published" : "Draft"}
                            </button>
                            <button
                              onClick={() => {
                                const title = prompt("Edit week title:", week.title);
                                if (title) {
                                  apiRequest("PUT", `/api/admin/slm/weeks/${week.id}`, { ...week, title })
                                    .then(() => {
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/slm/weeks"] });
                                      toast.success("Week updated");
                                    });
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this week?")) deleteWeek.mutate(week.id); }}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {weekExpanded && (
                            <div className="p-3 pt-0 space-y-2">
                              {weekLessons.map(lesson => (
                                <div key={lesson.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  {editingLesson?.id === lesson.id ? (
                                    <LessonEditor
                                      lesson={editingLesson}
                                      onChange={setEditingLesson}
                                      onSave={() => updateLesson.mutate(editingLesson)}
                                      onCancel={() => setEditingLesson(null)}
                                      saving={updateLesson.isPending}
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900">{lesson.title}</p>
                                        <div className="flex gap-2 mt-1">
                                          {lesson.videoUrl && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Video</span>}
                                          {lesson.lessonText && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Text</span>}
                                          {lesson.interactiveComponent && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Interactive</span>}
                                        </div>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${lesson.isPublished ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                                        {lesson.isPublished ? "Published" : "Draft"}
                                      </span>
                                      <button onClick={() => setEditingLesson({ ...lesson })} className="p-1 text-slate-400 hover:text-slate-700">
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => { if (confirm("Delete this lesson?")) deleteLesson.mutate(lesson.id); }}
                                        className="p-1 text-slate-400 hover:text-red-500"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={() => createLesson.mutate(week.id)}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Plus className="w-3 h-3" /> Add Lesson
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => createWeek.mutate(section.id)}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Week
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Zoom Calls Tab */}
      {tab === "zoom" && (
        <div className="space-y-4">
          <Card className="p-4 border-2 border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900">Add New Call</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Call title" value={newCall.title} onChange={e => setNewCall({ ...newCall, title: e.target.value })} />
              <Input type="datetime-local" value={newCall.scheduledAt} onChange={e => setNewCall({ ...newCall, scheduledAt: e.target.value })} />
              <Input placeholder="Zoom join URL" value={newCall.joinUrl} onChange={e => setNewCall({ ...newCall, joinUrl: e.target.value })} />
              <Input placeholder="Recording URL (after call)" value={newCall.recordingUrl} onChange={e => setNewCall({ ...newCall, recordingUrl: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={newCall.isPast} onChange={e => setNewCall({ ...newCall, isPast: e.target.checked })} />
                Past recording
              </label>
              <Button size="sm" onClick={() => createCall.mutate()} disabled={!newCall.title || !newCall.scheduledAt}>
                <Plus className="w-4 h-4 mr-1" /> Add Call
              </Button>
            </div>
          </Card>

          {zoomCalls.map(call => (
            <Card key={call.id} className="p-4 border-2 border-slate-200">
              {editingCall?.id === call.id ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input value={editingCall.title} onChange={e => setEditingCall({ ...editingCall, title: e.target.value })} />
                    <Input type="datetime-local" value={editingCall.scheduledAt?.slice(0, 16)} onChange={e => setEditingCall({ ...editingCall, scheduledAt: e.target.value })} />
                    <Input placeholder="Join URL" value={editingCall.joinUrl || ""} onChange={e => setEditingCall({ ...editingCall, joinUrl: e.target.value })} />
                    <Input placeholder="Recording URL" value={editingCall.recordingUrl || ""} onChange={e => setEditingCall({ ...editingCall, recordingUrl: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={editingCall.isPast} onChange={e => setEditingCall({ ...editingCall, isPast: e.target.checked })} />
                      Past recording
                    </label>
                    <Button size="sm" onClick={() => updateCall.mutate(editingCall)}><Check className="w-4 h-4 mr-1" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCall(null)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{call.title}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(call.scheduledAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      {call.isPast && <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Past</span>}
                    </p>
                  </div>
                  <button onClick={() => setEditingCall({ ...call })} className="p-1.5 text-slate-400 hover:text-slate-700"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm("Delete?")) deleteCall.mutate(call.id); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </Card>
          ))}
          {zoomCalls.length === 0 && <p className="text-slate-500 text-center py-8">No zoom calls scheduled yet.</p>}
        </div>
      )}

      {/* Comments Tab */}
      {tab === "comments" && (
        <div className="space-y-4">
          {pendingComments.length > 0 && (
            <>
              <h3 className="font-bold text-slate-900">Pending Approval ({pendingComments.length})</h3>
              {pendingComments.map(c => (
                <CommentCard key={c.id} comment={c} onApprove={() => moderateComment.mutate({ id: c.id, status: "approved" })} onReject={() => moderateComment.mutate({ id: c.id, status: "rejected" })} onDelete={() => deleteComment.mutate(c.id)} />
              ))}
            </>
          )}

          <h3 className="font-bold text-slate-900">All Comments ({comments.length})</h3>
          {comments.map(c => (
            <CommentCard key={c.id} comment={c} onDelete={() => deleteComment.mutate(c.id)} />
          ))}
          {comments.length === 0 && <p className="text-slate-500 text-center py-8">No comments yet.</p>}
        </div>
      )}
    </div>
  );
}

// Lesson editor inline form
function LessonEditor({
  lesson,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  lesson: Lesson;
  onChange: (l: Lesson) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Lesson title"
        value={lesson.title}
        onChange={e => onChange({ ...lesson, title: e.target.value })}
      />
      <Input
        placeholder="Description (optional)"
        value={lesson.description || ""}
        onChange={e => onChange({ ...lesson, description: e.target.value })}
      />
      <Input
        placeholder="Video URL (Loom/Vimeo/YouTube)"
        value={lesson.videoUrl || ""}
        onChange={e => onChange({ ...lesson, videoUrl: e.target.value })}
      />
      <textarea
        className="w-full min-h-[120px] rounded-lg border-2 border-slate-200 bg-white p-3 text-sm text-slate-700 focus:border-primary focus:outline-none resize-y"
        placeholder="Lesson text (supports markdown links and bold)"
        value={lesson.lessonText || ""}
        onChange={e => onChange({ ...lesson, lessonText: e.target.value })}
      />
      <div className="flex items-center gap-3">
        <Input
          placeholder="Interactive component key (optional)"
          value={lesson.interactiveComponent || ""}
          onChange={e => onChange({ ...lesson, interactiveComponent: e.target.value })}
          className="flex-1"
        />
        <Input
          type="number"
          placeholder="Sort order"
          value={lesson.sortOrder}
          onChange={e => onChange({ ...lesson, sortOrder: parseInt(e.target.value) || 0 })}
          className="w-24"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
          <input type="checkbox" checked={lesson.isPublished} onChange={e => onChange({ ...lesson, isPublished: e.target.checked })} />
          Published
        </label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={saving}>
          <Check className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-1" /> Cancel</Button>
      </div>
    </div>
  );
}

// Comment card
function CommentCard({
  comment,
  onApprove,
  onReject,
  onDelete,
}: {
  comment: Comment;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4 border border-slate-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-sm">
            {comment.first_name?.[0] || "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900 text-sm">
              {comment.first_name || "Anonymous"} {comment.last_name ? `${comment.last_name[0]}.` : ""}
            </span>
            <span className="text-xs text-slate-500">{comment.section_title}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
              comment.status === "approved" ? "bg-green-100 text-green-700" :
              comment.status === "pending" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>{comment.status}</span>
          </div>
          <p className="text-slate-700 text-sm whitespace-pre-wrap">{comment.content}</p>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(comment.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {onApprove && comment.status === "pending" && (
            <button onClick={onApprove} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><Check className="w-4 h-4" /></button>
          )}
          {onReject && comment.status === "pending" && (
            <button onClick={onReject} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Reject"><X className="w-4 h-4" /></button>
          )}
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </Card>
  );
}
