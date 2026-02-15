import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp,
  GripVertical, Music, Video, Image, Timer,
} from "lucide-react";
import { toast } from "sonner";
import type { FunnelPresentation, FunnelModule, FunnelModuleVariant, FunnelSlide } from "./funnelTypes";
import SyncTool from "./SyncTool";

interface Props {
  presentationId: number;
}

export default function PresentationEditor({ presentationId }: Props) {
  const queryClient = useQueryClient();
  const [showNewModule, setShowNewModule] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());
  const [syncVariantId, setSyncVariantId] = useState<number | null>(null);

  const { data: presentation } = useQuery<FunnelPresentation>({
    queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`],
  });

  const modules = presentation?.modules || [];

  // New module
  const [newModule, setNewModule] = useState({ name: "", isSwappable: false });

  const createModule = useMutation({
    mutationFn: async () => {
      const sortOrder = modules.length;
      const res = await apiRequest("POST", "/api/admin/funnels/modules", {
        presentationId, name: newModule.name, sortOrder, isSwappable: newModule.isSwappable,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
      setShowNewModule(false);
      setNewModule({ name: "", isSwappable: false });
      toast.success("Module added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateModule = useMutation({
    mutationFn: async (data: { id: number } & Partial<FunnelModule>) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/modules/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
    },
  });

  const deleteModule = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
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
    queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
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
          queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/presentations/${presentationId}/full`] });
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{presentation.name}</h3>
        <p className="text-sm text-slate-500 mb-4">
          {modules.length} module{modules.length !== 1 ? "s" : ""}
          {" · "}Build your presentation by adding modules, then add variants and slides to each.
        </p>

        {/* Add Module */}
        <div className="mb-4">
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
              {/* Module Header */}
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
                  <button onClick={() => moveModule(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveModule(idx, 1)} disabled={idx === modules.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm("Delete module?")) deleteModule.mutate(mod.id); }} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Module Body — Variants */}
              {expandedModules.has(mod.id) && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
                  <VariantManager
                    moduleId={mod.id}
                    variants={mod.variants || []}
                    presentationId={presentationId}
                    expandedVariants={expandedVariants}
                    toggleVariant={toggleVariant}
                    onSyncVariant={setSyncVariantId}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
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
              >
                <Timer className="w-3 h-3 inline mr-0.5" />Sync
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete variant?")) deleteVariant.mutate(v.id); }} className="p-1 text-red-400 hover:text-red-600">
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
              <Input value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} placeholder="e.g. Intro A — Struggle Story" />
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
                <button onClick={() => setEditingSlide(editingSlide === slide.id ? null : slide.id)} className="text-xs text-primary hover:underline">
                  Edit
                </button>
                <button onClick={() => { if (confirm("Delete?")) deleteSlide.mutate(slide.id); }} className="text-xs text-red-500 hover:underline">
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-slate-700 text-xs">Image URL</Label>
          <Input value={merged.imageUrl || ""} onChange={(e) => setEdits({ ...edits, imageUrl: e.target.value })} />
        </div>
        <div>
          <Label className="text-slate-700 text-xs">Start Time (ms)</Label>
          <Input type="number" value={merged.startTimeMs} onChange={(e) => setEdits({ ...edits, startTimeMs: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <Button size="sm" onClick={() => { onSave(edits); setEdits({}); }}>
        <Save className="w-3 h-3 mr-0.5" /> Save
      </Button>
    </div>
  );
}
