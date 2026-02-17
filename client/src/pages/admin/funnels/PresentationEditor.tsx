import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getServerErrorMessage } from "@/lib/queryClient";
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp,
  GripVertical, Music, Video, Image, Timer,
  Wand2, Eye, Pencil, Loader2, ExternalLink, Presentation, AlignLeft,
  Mic, Sparkles, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import type { FunnelPresentation, FunnelModule, FunnelModuleVariant, FunnelSlide } from "./funnelTypes";
import { PRESENTATION_THEMES, getTheme } from "@/lib/presentationThemes";
import SyncTool from "./SyncTool";

// Upload an image file and return the URL
async function uploadSlideImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/admin/funnels/upload-image", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || "Upload failed");
  }
  const data = await res.json();
  return data.url;
}

// Reusable drop zone for slide images
function SlideImageDropZone({ imageUrl, onUploaded, onRemove }: {
  imageUrl: string | null;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadSlideImage(file);
      onUploaded(url);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  if (imageUrl) {
    return (
      <div className="relative group mt-1.5">
        <img src={imageUrl} alt="" className="w-full max-h-32 object-contain rounded border border-slate-200 bg-slate-50" />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full shadow text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove image"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`mt-1.5 border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => { if (input.files?.[0]) handleFile(input.files[0]); };
        input.click();
      }}
    >
      {uploading ? (
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 py-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 py-1">
          <Upload className="w-3.5 h-3.5" /> Drop image or click
        </div>
      )}
    </div>
  );
}

interface Props {
  presentationId: number;
}

export default function PresentationEditor({ presentationId }: Props) {
  const queryClient = useQueryClient();
  const [syncVariantId, setSyncVariantId] = useState<number | null>(null);
  const [script, setScript] = useState("");
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioUrlDirty, setAudioUrlDirty] = useState(false);

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const { data: presentation } = useQuery<FunnelPresentation>({
    queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`],
    select: (data) => {
      // Sync audioUrl from first variant when data loads
      const firstVariant = data?.modules?.[0]?.variants?.[0];
      if (firstVariant && audioUrl === null) {
        setAudioUrl(firstVariant.audioUrl || "");
      }
      return data;
    },
  });

  const modules = presentation?.modules || [];
  const allSlides = modules.flatMap(m => (m.variants || []).flatMap(v => v.slides || []));
  const firstVariant = modules[0]?.variants?.[0];
  const firstVariantId = firstVariant?.id;
  const hasSlides = allSlides.length > 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });

  // Generate slides from script
  const generateSlides = useMutation({
    mutationFn: async ({ scriptText, simple }: { scriptText: string; simple?: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/funnels/presentations/${presentationId}/generate-slides`, { script: scriptText, simple });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setScript("");
      setShowRegenerate(false);
      toast.success(isTextMode ? "Script split into sentences" : "Slides generated from script");
    },
    onError: (e: any) => toast.error(getServerErrorMessage(e, "Failed to generate slides. Please try again.")),
  });

  // Update presentation name
  const updateName = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/presentations/${presentationId}`, { name });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setEditingName(false);
      toast.success("Name updated");
    },
  });

  // Update presentation theme
  const updateTheme = useMutation({
    mutationFn: async (theme: string) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/presentations/${presentationId}`, { theme });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast.success("Theme updated");
    },
  });

  // Local display mode state — so the toggle works instantly without waiting for DB
  const [localDisplayMode, setLocalDisplayMode] = useState<string | null>(null);

  // Update display mode
  const updateDisplayMode = useMutation({
    mutationFn: async (mode: string) => {
      setLocalDisplayMode(mode); // instant UI update
      const res = await apiRequest("PUT", `/api/admin/funnels/presentations/${presentationId}`, { displayMode: mode });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
    },
  });

  const isTextMode = localDisplayMode === "text" || (localDisplayMode === null && presentation?.displayMode === "text");

  // Update variant audio URL
  const updateVariantAudio = useMutation({
    mutationFn: async (url: string) => {
      if (!firstVariantId) throw new Error("No variant exists yet");
      const res = await apiRequest("PUT", `/api/admin/funnels/variants/${firstVariantId}`, { audioUrl: url });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setAudioUrlDirty(false);
      toast.success("Audio URL saved");
    },
  });

  // Update a slide inline
  const updateSlide = useMutation({
    mutationFn: async (data: { id: number } & Partial<FunnelSlide>) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/slides/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setEditingSlideId(null);
      toast.success("Slide updated");
    },
  });

  // Delete a slide
  const deleteSlide = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/slides/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Slide deleted");
    },
  });

  // Quick-add slide at a specific position
  const [quickAddAfter, setQuickAddAfter] = useState<number | null>(null); // index to insert after (-1 = beginning)
  const [quickAddText, setQuickAddText] = useState("");

  const quickAddSlide = useMutation({
    mutationFn: async ({ body, afterIndex }: { body: string; afterIndex: number }) => {
      if (!firstVariantId) throw new Error("No variant exists");
      const insertAt = afterIndex + 1;
      // Bump sort orders of slides after the insert point
      for (let i = allSlides.length - 1; i >= insertAt; i--) {
        await apiRequest("PUT", `/api/admin/funnels/slides/${allSlides[i].id}`, { sortOrder: i + 1 });
      }
      const res = await apiRequest("POST", "/api/admin/funnels/slides", {
        variantId: firstVariantId, sortOrder: insertAt, headline: "", body, scriptNotes: "", startTimeMs: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setQuickAddAfter(null);
      setQuickAddText("");
      toast.success("Slide added");
    },
  });

  // Add a slide manually (at end)
  const [newSlide, setNewSlide] = useState({ headline: "", body: "", scriptNotes: "" });
  const addSlide = useMutation({
    mutationFn: async () => {
      if (!firstVariantId) throw new Error("No variant exists");
      const sortOrder = allSlides.length;
      const res = await apiRequest("POST", "/api/admin/funnels/slides", {
        variantId: firstVariantId, sortOrder, headline: newSlide.headline, body: newSlide.body, scriptNotes: newSlide.scriptNotes, startTimeMs: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowAddSlide(false);
      setNewSlide({ headline: "", body: "", scriptNotes: "" });
      toast.success("Slide added");
    },
  });

  if (!presentation) return <div className="py-8 text-center text-slate-400">Loading...</div>;

  // Show sync tool if selected
  if (syncVariantId) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSyncVariantId(null)} className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to Presentation Editor
        </button>
        <SyncTool variantId={syncVariantId} onDone={() => {
          setSyncVariantId(null);
          invalidate();
        }} />
      </div>
    );
  }

  // =============================================
  // STATE 1: No slides yet - show script paste UI
  // =============================================
  if (!hasSlides) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-2 border-slate-200">
          {/* Name */}
          <div className="mb-6">
            <Label className="text-slate-700 font-medium">Presentation Name</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={editingName ? nameValue : presentation.name}
                onChange={(e) => { setNameValue(e.target.value); setEditingName(true); }}
                onFocus={() => { if (!editingName) { setNameValue(presentation.name); setEditingName(true); } }}
              />
              {editingName && (
                <Button size="sm" onClick={() => updateName.mutate(nameValue)} disabled={!nameValue.trim()}>
                  <Save className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* VSL Script Generator */}
          <VslGenerator onGenerated={(s) => setScript(s)} />

          {/* Script paste */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">{script ? "Your Script" : "Paste Your Script"}</Label>
            {!script && (
              <p className="text-slate-600">
                Generate a script above, or paste your own below.
              </p>
            )}
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={12}
              placeholder="Paste your script here..."
              className="text-slate-700"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => generateSlides.mutate({ scriptText: script, simple: true })}
                disabled={script.trim().length < 20 || generateSlides.isPending}
                className="w-full sm:w-auto"
              >
                {generateSlides.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Splitting...</>
                ) : (
                  <><AlignLeft className="w-4 h-4 mr-2" /> Split into Sentences</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => generateSlides.mutate({ scriptText: script, simple: false })}
                disabled={script.trim().length < 20 || generateSlides.isPending}
                className="w-full sm:w-auto"
              >
                {generateSlides.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> AI Slides (headlines + body)</>
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-500">
              <strong>Split into Sentences</strong> — plain text, white background, no formatting.
              <br />
              <strong>AI Slides</strong> — creates themed slides with headlines and body text.
            </p>
            {script.trim().length > 0 && script.trim().length < 20 && (
              <p className="text-sm text-slate-500">Script needs at least 20 characters.</p>
            )}
          </div>

          {/* Manual add option */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setShowAddSlide(!showAddSlide)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              <Plus className="w-3 h-3 inline mr-1" /> Or add slides manually
            </button>
            {showAddSlide && (
              <ManualSlideAdd
                presentationId={presentationId}
                onDone={() => { setShowAddSlide(false); invalidate(); }}
              />
            )}
          </div>
        </Card>
      </div>
    );
  }

  // =============================================
  // STATE 2: Slides exist - show slide list + tools
  // =============================================
  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-slate-200">
        {/* Header with name + preview */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {editingName ? (
              <div className="flex gap-2 flex-1">
                <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={() => updateName.mutate(nameValue)} disabled={!nameValue.trim()}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate">{presentation.name}</h3>
                <button onClick={() => { setNameValue(presentation.name); setEditingName(true); }} className="text-slate-400 hover:text-slate-600">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <a href={`/preview/${presentationId}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-1" /> Preview
            </Button>
          </a>
        </div>

        {/* Theme picker — only in slides mode */}
        {!isTextMode && (
          <div className="mb-4">
            <ThemePicker currentTheme={presentation.theme} onSelect={(t) => updateTheme.mutate(t)} />
          </div>
        )}

        {/* Audio URL */}
        <div className="mb-4">
          <Label className="text-slate-700 font-medium">Audio URL</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={audioUrl || ""}
              onChange={(e) => { setAudioUrl(e.target.value); setAudioUrlDirty(true); }}
              placeholder="https://cdn.example.com/audio.mp3"
              className="flex-1"
            />
            {audioUrlDirty && (
              <Button size="sm" onClick={() => updateVariantAudio.mutate(audioUrl || "")}>
                <Save className="w-4 h-4" />
              </Button>
            )}
          </div>
          {firstVariantId && audioUrl && (
            <button
              onClick={() => setSyncVariantId(firstVariantId)}
              className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Timer className="w-3.5 h-3.5" /> Sync Slides to Audio
            </button>
          )}
        </div>

        {/* Slide List with time estimates */}
        {(() => {
          // Calculate cumulative read times (~150 words per minute speaking pace)
          const WPM = 150;
          const slideTimes = allSlides.map(s => {
            const text = s.scriptNotes || s.body || s.headline || "";
            const words = text.split(/\s+/).filter(Boolean).length;
            return (words / WPM) * 60; // seconds
          });
          const cumulativeStart = slideTimes.map((_, i) =>
            slideTimes.slice(0, i).reduce((a, b) => a + b, 0)
          );
          const totalSeconds = slideTimes.reduce((a, b) => a + b, 0);
          const fmtTime = (secs: number) => {
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return `${m}:${s.toString().padStart(2, '0')}`;
          };

          return (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900">{allSlides.length} Slide{allSlides.length !== 1 ? "s" : ""}</h4>
                <span className="text-sm text-slate-500">~{fmtTime(totalSeconds)} total read time</span>
              </div>
              <div className="space-y-0">
                {allSlides.map((slide, idx) => (
                  <div key={slide.id}>
                    {/* Quick add button between slides */}
                    {idx === 0 && (
                      <div className="flex justify-center py-1">
                        {quickAddAfter === -1 ? (
                          <div className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                            <Input
                              value={quickAddText}
                              onChange={(e) => setQuickAddText(e.target.value)}
                              placeholder="Type sentence text..."
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter' && quickAddText.trim()) quickAddSlide.mutate({ body: quickAddText.trim(), afterIndex: -1 }); if (e.key === 'Escape') { setQuickAddAfter(null); setQuickAddText(""); } }}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => quickAddSlide.mutate({ body: quickAddText.trim(), afterIndex: -1 })} disabled={!quickAddText.trim() || quickAddSlide.isPending}>Add</Button>
                              <Button size="sm" variant="ghost" onClick={() => { setQuickAddAfter(null); setQuickAddText(""); }}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setQuickAddAfter(-1); setQuickAddText(""); }} className="text-slate-300 hover:text-primary transition-colors" title="Add slide here">
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      {editingSlideId === slide.id ? (
                        <InlineSlideEditor
                          slide={slide}
                          onSave={(data) => updateSlide.mutate({ id: slide.id, ...data })}
                          onCancel={() => setEditingSlideId(null)}
                        />
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center flex-shrink-0 w-14 pt-0.5">
                            <span className="text-sm font-bold text-slate-400">{idx + 1}</span>
                            <span className="text-xs text-slate-400">{fmtTime(cumulativeStart[idx])}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {slide.headline && (
                              <p className="font-bold text-slate-900">{slide.headline}</p>
                            )}
                            {slide.body && (
                              <p className="text-slate-700 mt-0.5 line-clamp-2">{slide.body}</p>
                            )}
                            {!slide.headline && !slide.body && (
                              <p className="text-slate-400">(empty slide)</p>
                            )}
                            {slide.scriptNotes && (
                              <p className="text-xs text-amber-600 mt-1 line-clamp-1">Script: {slide.scriptNotes}</p>
                            )}
                            <SlideImageDropZone
                              imageUrl={slide.imageUrl}
                              onUploaded={(url) => updateSlide.mutate({ id: slide.id, imageUrl: url })}
                              onRemove={() => updateSlide.mutate({ id: slide.id, imageUrl: "" })}
                            />
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => setEditingSlideId(slide.id)} className="p-1 text-slate-400 hover:text-slate-600" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { if (confirm("Delete this slide?")) deleteSlide.mutate(slide.id); }} className="p-1 text-red-400 hover:text-red-600" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick add button after each slide */}
                    <div className="flex justify-center py-1">
                      {quickAddAfter === idx ? (
                        <div className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                          <Input
                            value={quickAddText}
                            onChange={(e) => setQuickAddText(e.target.value)}
                            placeholder="Type sentence text..."
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter' && quickAddText.trim()) quickAddSlide.mutate({ body: quickAddText.trim(), afterIndex: idx }); if (e.key === 'Escape') { setQuickAddAfter(null); setQuickAddText(""); } }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => quickAddSlide.mutate({ body: quickAddText.trim(), afterIndex: idx })} disabled={!quickAddText.trim() || quickAddSlide.isPending}>Add</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setQuickAddAfter(null); setQuickAddText(""); }}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setQuickAddAfter(idx); setQuickAddText(""); }} className="text-slate-300 hover:text-primary transition-colors" title="Add slide here">
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

          {/* Add slide (full form, at end) */}
          {showAddSlide ? (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div>
                <Label className="text-slate-700">Headline</Label>
                <Input value={newSlide.headline} onChange={(e) => setNewSlide({ ...newSlide, headline: e.target.value })} placeholder="Slide headline" />
              </div>
              <div>
                <Label className="text-slate-700">Body</Label>
                <Textarea value={newSlide.body} onChange={(e) => setNewSlide({ ...newSlide, body: e.target.value })} rows={2} placeholder="Slide body text" />
              </div>
              <div>
                <Label className="text-slate-700">Script Notes <span className="font-normal text-slate-400">(what you say)</span></Label>
                <Textarea value={newSlide.scriptNotes} onChange={(e) => setNewSlide({ ...newSlide, scriptNotes: e.target.value })} rows={2} placeholder="What you'll say during this slide..." className="bg-amber-50/50 border-amber-200" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => addSlide.mutate()}>Add Slide</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddSlide(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowAddSlide(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Slide
            </Button>
          )}
            </div>
          );
        })()}

        {/* Replace from Script (collapsible) */}
        <details className="mb-4" open={showRegenerate} onToggle={(e) => setShowRegenerate((e.target as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 select-none">
            <Wand2 className="w-3.5 h-3.5 inline mr-1" /> Replace from Script
          </summary>
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
            <p className="text-sm text-amber-800">
              This will replace all existing slides. Choose how to process your script.
            </p>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={6}
              placeholder="Paste your updated script..."
              className="text-slate-700"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (confirm("This will delete all current slides and split into plain sentences. Continue?")) {
                    generateSlides.mutate({ scriptText: script, simple: true });
                  }
                }}
                disabled={script.trim().length < 20 || generateSlides.isPending}
              >
                <AlignLeft className="w-4 h-4 mr-1" /> Split into Sentences
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm("This will delete all current slides and regenerate with AI formatting. Continue?")) {
                    generateSlides.mutate({ scriptText: script, simple: false });
                  }
                }}
                disabled={script.trim().length < 20 || generateSlides.isPending}
              >
                <Wand2 className="w-4 h-4 mr-1" /> AI Slides
              </Button>
            </div>
          </div>
        </details>

        {/* Advanced: Modules & Variants (collapsible) */}
        <details>
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 select-none">
            Advanced: Modules & Variants
          </summary>
          <div className="mt-3">
            <AdvancedModuleView
              presentationId={presentationId}
              modules={modules}
              onSyncVariant={setSyncVariantId}
            />
          </div>
        </details>
      </Card>
    </div>
  );
}

// Inline slide editor
function InlineSlideEditor({ slide, onSave, onCancel }: {
  slide: FunnelSlide;
  onSave: (data: Partial<FunnelSlide>) => void;
  onCancel: () => void;
}) {
  const [headline, setHeadline] = useState(slide.headline || "");
  const [body, setBody] = useState(slide.body || "");
  const [scriptNotes, setScriptNotes] = useState(slide.scriptNotes || "");
  const [imageUrl, setImageUrl] = useState(slide.imageUrl || "");

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-slate-700">Headline</Label>
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </div>
      <div>
        <Label className="text-slate-700">Body</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} />
      </div>
      <div>
        <Label className="text-slate-700">Script Notes <span className="font-normal text-slate-400">(what you say - not shown to viewers)</span></Label>
        <Textarea
          value={scriptNotes}
          onChange={(e) => setScriptNotes(e.target.value)}
          rows={3}
          placeholder="What you'll say during this slide..."
          className="text-slate-600 bg-amber-50/50 border-amber-200"
        />
      </div>
      <div>
        <Label className="text-slate-700">Image</Label>
        <SlideImageDropZone
          imageUrl={imageUrl || null}
          onUploaded={(url) => setImageUrl(url)}
          onRemove={() => setImageUrl("")}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ headline, body, scriptNotes, imageUrl: imageUrl || null })}>
          <Save className="w-3 h-3 mr-0.5" /> Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// Manual slide add (for empty state)
function ManualSlideAdd({ presentationId, onDone }: { presentationId: number; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");

  const addSlide = useMutation({
    mutationFn: async () => {
      // Need to ensure module + variant exist first
      const fullRes = await fetch(`/api/admin/funnels/presentations/${presentationId}/full`, { credentials: "include" });
      const full = await fullRes.json();
      let variantId: number;

      if (full.modules?.length > 0 && full.modules[0].variants?.length > 0) {
        variantId = full.modules[0].variants[0].id;
      } else {
        // Create module + variant
        const modRes = await apiRequest("POST", "/api/admin/funnels/modules", {
          presentationId, name: "Main", sortOrder: 0, isSwappable: false,
        });
        const mod = await modRes.json();
        const varRes = await apiRequest("POST", "/api/admin/funnels/variants", {
          moduleId: mod.id, name: "Default", mediaType: "audio_slides",
        });
        const variant = await varRes.json();
        variantId = variant.id;
      }

      const res = await apiRequest("POST", "/api/admin/funnels/slides", {
        variantId, sortOrder: 0, headline, body, startTimeMs: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
      onDone();
      toast.success("Slide added");
    },
  });

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
      <div>
        <Label className="text-slate-700">Headline</Label>
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Slide headline" />
      </div>
      <div>
        <Label className="text-slate-700">Body</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Slide body text" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => addSlide.mutate()} disabled={!headline.trim()}>Add Slide</Button>
      </div>
    </div>
  );
}

// Advanced module/variant view (preserves original power-user UI)
function AdvancedModuleView({ presentationId, modules, onSyncVariant }: {
  presentationId: number;
  modules: FunnelModule[];
  onSyncVariant: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [showNewModule, setShowNewModule] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());
  const [newModule, setNewModule] = useState({ name: "", isSwappable: false });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });

  const createModule = useMutation({
    mutationFn: async () => {
      const sortOrder = modules.length;
      const res = await apiRequest("POST", "/api/admin/funnels/modules", {
        presentationId, name: newModule.name, sortOrder, isSwappable: newModule.isSwappable,
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowNewModule(false);
      setNewModule({ name: "", isSwappable: false });
      toast.success("Module added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteModule = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/modules/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Module deleted");
    },
  });

  const moveModule = async (index: number, direction: -1 | 1) => {
    const newModules = [...modules];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newModules.length) return;
    [newModules[index], newModules[swapIdx]] = [newModules[swapIdx], newModules[index]];
    const orders = newModules.map((m, i) => ({ id: m.id, sortOrder: i }));
    await apiRequest("PUT", "/api/admin/funnels/modules/reorder", { orders });
    invalidate();
  };

  const toggleModule = (id: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleVariant = (id: number) => {
    setExpandedVariants(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        {modules.length} module{modules.length !== 1 ? "s" : ""}. Use this for split testing with multiple variants per module.
      </p>

      {/* Add Module */}
      <div>
        {showNewModule ? (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-700">Module Name</Label>
                <Input value={newModule.name} onChange={(e) => setNewModule({ ...newModule, name: e.target.value })} placeholder="e.g. Intro, Core Story, Close" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModule.isSwappable}
                    onChange={(e) => setNewModule({ ...newModule, isSwappable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">Swappable (has test variants)</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createModule.mutate()} disabled={!newModule.name}>Add Module</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewModule(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setShowNewModule(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Module
          </Button>
        )}
      </div>

      {/* Module List */}
      <div className="space-y-3">
        {modules.map((mod, idx) => (
          <div key={mod.id} className="border border-slate-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center gap-2 p-3 bg-white hover:bg-slate-50 cursor-pointer"
              onClick={() => toggleModule(mod.id)}
            >
              <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-400 w-6">{idx + 1}</span>
              <span className="font-medium text-slate-900 flex-1">{mod.name}</span>
              {mod.isSwappable && (
                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">Swappable</span>
              )}
              <span className="text-xs text-slate-400">{mod.variants?.length || 0} variant{(mod.variants?.length || 0) !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => moveModule(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move module up">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveModule(idx, 1)} disabled={idx === modules.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move module down">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm("Delete module?")) deleteModule.mutate(mod.id); }} className="p-1 text-red-400 hover:text-red-600" title="Delete module">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedModules.has(mod.id) && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
                <VariantManager
                  moduleId={mod.id}
                  variants={mod.variants || []}
                  presentationId={presentationId}
                  expandedVariants={expandedVariants}
                  toggleVariant={toggleVariant}
                  onSyncVariant={onSyncVariant}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Variant manager within a module
function VariantManager({ moduleId, variants, presentationId, expandedVariants, toggleVariant, onSyncVariant }: {
  moduleId: number;
  variants: FunnelModuleVariant[];
  presentationId: number;
  expandedVariants: Set<number>;
  toggleVariant: (id: number) => void;
  onSyncVariant: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newVariant, setNewVariant] = useState({ name: "", mediaType: "audio_slides" });

  const createVariant = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/funnels/variants", {
        moduleId, name: newVariant.name, mediaType: newVariant.mediaType,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
      setShowNew(false);
      setNewVariant({ name: "", mediaType: "audio_slides" });
      toast.success("Variant added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateVariant = useMutation({
    mutationFn: async (data: { id: number } & Partial<FunnelModuleVariant>) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/variants/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
      toast.success("Variant updated");
    },
  });

  const deleteVariant = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/variants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
      toast.success("Variant deleted");
    },
  });

  return (
    <div>
      {variants.map((v) => (
        <div key={v.id} className="mb-3 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => toggleVariant(v.id)}>
            {v.mediaType === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <Music className="w-4 h-4 text-green-500" />}
            <span className="font-medium text-slate-700 flex-1">{v.name}</span>
            <span className="text-xs text-slate-400">{v.slides?.length || 0} slides</span>
            {v.mediaType === 'audio_slides' && (
              <button
                onClick={(e) => { e.stopPropagation(); onSyncVariant(v.id); }}
                className="text-xs text-primary hover:underline"
                title="Sync slides to audio timestamps"
              >
                <Timer className="w-3 h-3 inline mr-0.5" />Sync
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete variant?")) deleteVariant.mutate(v.id); }} className="p-1 text-red-400 hover:text-red-600" title="Delete variant">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {expandedVariants.has(v.id) && (
            <div className="p-3 border-t border-slate-100 space-y-3">
              <VariantDetailEditor variant={v} onUpdate={(data) => updateVariant.mutate({ id: v.id, ...data })} />
              <SlideManager variantId={v.id} slides={v.slides || []} presentationId={presentationId} />
            </div>
          )}
        </div>
      ))}

      {showNew ? (
        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-700">Variant Name</Label>
              <Input value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} placeholder="e.g. Intro A - Struggle Story" />
            </div>
            <div>
              <Label className="text-slate-700">Media Type</Label>
              <select
                value={newVariant.mediaType}
                onChange={(e) => setNewVariant({ ...newVariant, mediaType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
              >
                <option value="audio_slides">Audio + Slides</option>
                <option value="video">Video (Vimeo)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createVariant.mutate()} disabled={!newVariant.name}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="w-full" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Variant
        </Button>
      )}
    </div>
  );
}

// Variant detail editor (audio/video URLs, script)
function VariantDetailEditor({ variant, onUpdate }: {
  variant: FunnelModuleVariant;
  onUpdate: (data: Partial<FunnelModuleVariant>) => void;
}) {
  const [edits, setEdits] = useState<Partial<FunnelModuleVariant>>({});
  const merged = { ...variant, ...edits };
  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="space-y-3">
      {variant.mediaType === 'audio_slides' ? (
        <div>
          <Label className="text-slate-700">Audio URL</Label>
          <Input value={merged.audioUrl || ""} onChange={(e) => setEdits({ ...edits, audioUrl: e.target.value })} placeholder="https://cdn.example.com/audio.mp3" />
        </div>
      ) : (
        <div>
          <Label className="text-slate-700">Vimeo Video URL/ID</Label>
          <Input value={merged.videoUrl || ""} onChange={(e) => setEdits({ ...edits, videoUrl: e.target.value })} placeholder="https://vimeo.com/123456 or 123456" />
        </div>
      )}
      <div>
        <Label className="text-slate-700">Duration (ms)</Label>
        <Input type="number" value={merged.durationMs || ""} onChange={(e) => setEdits({ ...edits, durationMs: parseInt(e.target.value) || undefined })} placeholder="Total duration in milliseconds" />
      </div>
      <div>
        <Label className="text-slate-700">Script/Transcript (for AI ad copy)</Label>
        <Textarea value={merged.scriptText || ""} onChange={(e) => setEdits({ ...edits, scriptText: e.target.value })} rows={3} placeholder="Paste transcript here..." />
      </div>
      {hasChanges && (
        <Button size="sm" onClick={() => { onUpdate(edits); setEdits({}); }}>
          <Save className="w-4 h-4 mr-1" /> Save
        </Button>
      )}
    </div>
  );
}

// Slide manager within a variant
function SlideManager({ variantId, slides, presentationId }: {
  variantId: number;
  slides: FunnelSlide[];
  presentationId: number;
}) {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newSlide, setNewSlide] = useState({ headline: "", body: "", imageUrl: "", startTimeMs: 0 });
  const [editingSlide, setEditingSlide] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });

  const createSlide = useMutation({
    mutationFn: async () => {
      const sortOrder = slides.length;
      const res = await apiRequest("POST", "/api/admin/funnels/slides", {
        variantId, sortOrder, ...newSlide,
      });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowNew(false);
      setNewSlide({ headline: "", body: "", imageUrl: "", startTimeMs: 0 });
      toast.success("Slide added");
    },
  });

  const updateSlide = useMutation({
    mutationFn: async (data: { id: number } & Partial<FunnelSlide>) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/slides/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setEditingSlide(null);
      toast.success("Slide updated");
    },
  });

  const deleteSlide = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/slides/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Slide deleted");
    },
  });

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-bold text-slate-700 flex items-center gap-1">
          <Image className="w-3 h-3" /> Slides
        </h5>
        <Button size="sm" variant="ghost" onClick={() => setShowNew(!showNew)}>
          <Plus className="w-3 h-3 mr-0.5" /> Add Slide
        </Button>
      </div>

      {slides.length === 0 && !showNew && (
        <p className="text-xs text-slate-400 py-2">No slides yet. Add slides and sync them to audio timestamps.</p>
      )}

      <div className="space-y-2">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="p-2 bg-slate-50 rounded border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                <span className="text-xs text-slate-500 bg-white px-1.5 py-0.5 rounded">{formatTime(slide.startTimeMs)}</span>
                <span className="text-sm text-slate-700 truncate max-w-[200px]">{slide.headline || slide.body || "(empty slide)"}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingSlide(editingSlide === slide.id ? null : slide.id)} className="text-xs text-primary hover:underline" title="Edit slide">
                  Edit
                </button>
                <button onClick={() => { if (confirm("Delete?")) deleteSlide.mutate(slide.id); }} className="text-xs text-red-500 hover:underline" title="Delete slide">
                  Del
                </button>
              </div>
            </div>

            {editingSlide === slide.id && (
              <SlideEditor slide={slide} onSave={(data) => updateSlide.mutate({ id: slide.id, ...data })} />
            )}
          </div>
        ))}
      </div>

      {showNew && (
        <div className="p-3 bg-white rounded border border-slate-200 mt-2 space-y-2">
          <div>
            <Label className="text-slate-700 text-xs">Headline</Label>
            <Input value={newSlide.headline} onChange={(e) => setNewSlide({ ...newSlide, headline: e.target.value })} placeholder="Slide headline" />
          </div>
          <div>
            <Label className="text-slate-700 text-xs">Body Text</Label>
            <Textarea value={newSlide.body} onChange={(e) => setNewSlide({ ...newSlide, body: e.target.value })} rows={2} placeholder="Optional body text" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-slate-700 text-xs">Image URL</Label>
              <Input value={newSlide.imageUrl} onChange={(e) => setNewSlide({ ...newSlide, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-slate-700 text-xs">Start Time (ms)</Label>
              <Input type="number" value={newSlide.startTimeMs} onChange={(e) => setNewSlide({ ...newSlide, startTimeMs: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createSlide.mutate()}>Add Slide</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SlideEditor({ slide, onSave }: { slide: FunnelSlide; onSave: (data: Partial<FunnelSlide>) => void }) {
  const [edits, setEdits] = useState<Partial<FunnelSlide>>({});
  const merged = { ...slide, ...edits };

  return (
    <div className="mt-2 space-y-2">
      <div>
        <Label className="text-slate-700 text-xs">Headline</Label>
        <Input value={merged.headline || ""} onChange={(e) => setEdits({ ...edits, headline: e.target.value })} />
      </div>
      <div>
        <Label className="text-slate-700 text-xs">Body</Label>
        <Textarea value={merged.body || ""} onChange={(e) => setEdits({ ...edits, body: e.target.value })} rows={2} />
      </div>
      <div>
        <Label className="text-slate-700 text-xs">Script Notes <span className="font-normal text-slate-400">(what you say)</span></Label>
        <Textarea value={merged.scriptNotes || ""} onChange={(e) => setEdits({ ...edits, scriptNotes: e.target.value })} rows={2} placeholder="What you'll say during this slide..." className="bg-amber-50/50 border-amber-200" />
      </div>
      <div>
        <Label className="text-slate-700 text-xs">Image</Label>
        <SlideImageDropZone
          imageUrl={merged.imageUrl || null}
          onUploaded={(url) => setEdits({ ...edits, imageUrl: url })}
          onRemove={() => setEdits({ ...edits, imageUrl: "" })}
        />
      </div>
      <div>
        <Label className="text-slate-700 text-xs">Start Time (ms)</Label>
        <Input type="number" value={merged.startTimeMs} onChange={(e) => setEdits({ ...edits, startTimeMs: parseInt(e.target.value) || 0 })} />
      </div>
      <Button size="sm" onClick={() => { onSave(edits); setEdits({}); }}>
        <Save className="w-3 h-3 mr-0.5" /> Save
      </Button>
    </div>
  );
}

// VSL Script Generator
const VSL_FORMULAS = [
  { value: 1, label: "Nathan's High-Converting", desc: "Full 24-step framework. Call out viewer, authority, proof, future pace, close." },
  { value: 2, label: "Perfect Webinar", desc: "3 secrets structure. Big promise, origin story, stack, close." },
  { value: 3, label: "The Confrontation", desc: "Lead with enemy frame. Call out fake gurus, pivot to the real truth." },
  { value: 4, label: "The Underdog Story", desc: "Lead with Matt's origin. Council estate to $23M. Rags to riches." },
  { value: 5, label: "The Wealth Divide", desc: "Lead with assets vs income. Bigger picture, wealth gap, opportunity." },
  { value: 6, label: "Jon Benson's 5-Step VSL", desc: "From the inventor of the VSL. Snap suggestion, reluctant hero, mechanism reveal." },
  { value: 7, label: "Stefan Georgi's RMBC", desc: "Research-driven. Mirror their pain, reveal the mechanism, proof in bite-sized chunks." },
  { value: 8, label: "Hormozi Proof-Promise-Plan", desc: "Lead with proof wall, value equation, make the offer so good they feel stupid saying no." },
];

const VSL_ANGLES = [
  { value: "A", label: "Escape", desc: "Pain of 9-5, freedom of the alternative" },
  { value: "B", label: "Prove Them Wrong", desc: "Girlfriend story, emotional revenge" },
  { value: "C", label: "Early Mover", desc: "Window of opportunity, urgency, FOMO" },
  { value: "D", label: "Anti-Guru", desc: "Scepticism, vulnerability, honesty" },
  { value: "E", label: "Asset Builder", desc: "Wealth divide, assets vs income, legacy" },
  { value: "F", label: "Second Chance", desc: "For people who've tried and failed" },
];

function VslGenerator({ onGenerated }: { onGenerated: (script: string) => void }) {
  const [open, setOpen] = useState(false);
  const [formula, setFormula] = useState(1);
  const [angle, setAngle] = useState("A");
  const [hook, setHook] = useState("");
  const [hookOptions, setHookOptions] = useState<string[]>([]);
  const [generatingHooks, setGeneratingHooks] = useState(false);
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/admin/funnels/generate-vsl", { formula, angle, hook, context });
      const data = await res.json();
      if (data.script) {
        onGenerated(data.script);
        toast.success(`VSL script generated (~${data.script.split(/\s+/).length} words)`);
        setOpen(false);
      } else {
        toast.error("No script returned. Try again.");
      }
    } catch (e: any) {
      toast.error(getServerErrorMessage(e, "Failed to generate VSL script."));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-slate-700 font-medium hover:text-slate-900 transition-colors"
      >
        <Sparkles className="w-4 h-4 text-amber-500" />
        Generate VSL Script with AI
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg space-y-4">
          {/* Formula */}
          <div>
            <Label className="text-slate-700 font-medium">Formula</Label>
            <div className="mt-2 space-y-1.5">
              {VSL_FORMULAS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormula(f.value)}
                  className={`w-full text-left p-2.5 rounded-lg border-2 transition-colors ${
                    formula === f.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="font-medium text-slate-900">{f.value}. {f.label}</span>
                  <span className="block text-sm text-slate-500 mt-0.5">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Angle */}
          <div>
            <Label className="text-slate-700 font-medium">Angle</Label>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {VSL_ANGLES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAngle(a.value)}
                  className={`text-left p-2.5 rounded-lg border-2 transition-colors ${
                    angle === a.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="font-medium text-slate-900">{a.value}. {a.label}</span>
                  <span className="block text-sm text-slate-500 mt-0.5">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hook */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-700 font-medium">Opening Hook <span className="font-normal text-slate-400">(optional)</span></Label>
              <button
                onClick={async () => {
                  setGeneratingHooks(true);
                  try {
                    const res = await apiRequest("POST", "/api/admin/funnels/generate-hooks", { formula, angle, context });
                    const data = await res.json();
                    if (data.hooks?.length) {
                      setHookOptions(data.hooks);
                    } else {
                      toast.error("No hooks returned. Try again.");
                    }
                  } catch (e: any) {
                    toast.error(getServerErrorMessage(e, "Failed to generate hooks."));
                  } finally {
                    setGeneratingHooks(false);
                  }
                }}
                disabled={generatingHooks}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {generatingHooks ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</> : <><Sparkles className="w-3 h-3" /> Generate Hooks</>}
              </button>
            </div>
            <Input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Type your own or generate options above..."
              className="mt-1"
            />
            {hookOptions.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <p className="text-xs text-slate-500 font-medium">Click to use:</p>
                {hookOptions.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => { setHook(h); setHookOptions([]); }}
                    className={`w-full text-left p-2.5 rounded-lg border-2 transition-colors text-sm text-slate-700 ${
                      hook === h ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Context (optional) */}
          <div>
            <Label className="text-slate-700 font-medium">Extra Context <span className="font-normal text-slate-400">(optional)</span></Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              placeholder="Any extra facts, new testimonials, specific audience, or things you want included..."
              className="mt-1 text-slate-700"
            />
          </div>

          {/* Generate */}
          <Button
            onClick={generate}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating VSL Script...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate VSL Script</>
            )}
          </Button>
          {generating && (
            <p className="text-sm text-slate-500 text-center">This takes 30-60 seconds. Writing ~2,500 words in Matt's voice...</p>
          )}
        </div>
      )}
    </div>
  );
}

// Theme picker - row of mini-preview swatches
function ThemePicker({ currentTheme, onSelect }: { currentTheme?: string | null; onSelect: (key: string) => void }) {
  const active = currentTheme || "dark";
  return (
    <div className="mb-4">
      <Label className="text-slate-700 font-medium">Visual Theme</Label>
      <div className="flex gap-3 mt-2">
        {Object.values(PRESENTATION_THEMES).map((t) => (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-colors ${
              active === t.key ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className={`w-16 h-10 rounded ${t.previewBg} flex flex-col items-center justify-center gap-1 border border-slate-200`}>
              <div className={`w-8 h-1.5 rounded-full ${t.previewAccent}`} />
              <div className={`w-5 h-0.5 rounded-full ${t.previewText}`} />
            </div>
            <span className="text-xs text-slate-600">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
