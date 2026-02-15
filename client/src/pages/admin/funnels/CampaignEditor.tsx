import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Save, Globe, Layers } from "lucide-react";
import { toast } from "sonner";
import type { FunnelCampaign, FunnelOptinPage, FunnelVariationSet, FunnelPresentation } from "./funnelTypes";

interface Props {
  campaignId: number;
  presentations: FunnelPresentation[];
}

export default function CampaignEditor({ campaignId, presentations }: Props) {
  const queryClient = useQueryClient();
  const [showNewOptin, setShowNewOptin] = useState(false);
  const [showNewVariation, setShowNewVariation] = useState(false);
  const [editingOptin, setEditingOptin] = useState<number | null>(null);

  const { data: campaign } = useQuery<FunnelCampaign>({
    queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`],
  });

  const optinPages = campaign?.optinPages || [];
  const variationSets = campaign?.variationSets || [];

  // Campaign settings
  const [settings, setSettings] = useState<Partial<FunnelCampaign>>({});
  const mergedSettings = { ...campaign, ...settings };

  const updateCampaign = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/admin/funnels/campaigns/${campaignId}`, {
        name: mergedSettings.name,
        slug: mergedSettings.slug,
        presentationId: mergedSettings.presentationId,
        watchHeadline: mergedSettings.watchHeadline,
        watchSubheadline: mergedSettings.watchSubheadline,
        ctaText: mergedSettings.ctaText,
        ctaUrl: mergedSettings.ctaUrl,
        ctaAppearTime: mergedSettings.ctaAppearTime,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funnels/campaigns"] });
      setSettings({});
      toast.success("Campaign updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Optin pages
  const [newOptin, setNewOptin] = useState({ name: "", headline: "", subheadline: "", ctaButtonText: "Watch Now", heroImageUrl: "" });

  const createOptin = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/funnels/optin-pages", {
        campaignId, ...newOptin,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`] });
      setShowNewOptin(false);
      setNewOptin({ name: "", headline: "", subheadline: "", ctaButtonText: "Watch Now", heroImageUrl: "" });
      toast.success("Opt-in page created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateOptin = useMutation({
    mutationFn: async (data: Partial<FunnelOptinPage> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/optin-pages/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`] });
      setEditingOptin(null);
      toast.success("Opt-in page updated");
    },
  });

  const deleteOptin = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/optin-pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`] });
      toast.success("Opt-in page deleted");
    },
  });

  // Variation sets
  const [newVariation, setNewVariation] = useState({ name: "", optinPageId: 0, weight: 1 });

  const createVariation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/funnels/variation-sets", {
        campaignId,
        name: newVariation.name,
        optinPageId: newVariation.optinPageId,
        weight: newVariation.weight,
        moduleVariantIds: {},
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`] });
      setShowNewVariation(false);
      setNewVariation({ name: "", optinPageId: 0, weight: 1 });
      toast.success("Variation set created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateVariation = useMutation({
    mutationFn: async (data: Partial<FunnelVariationSet> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/variation-sets/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`] });
      toast.success("Updated");
    },
  });

  const deleteVariation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/variation-sets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/full`] });
      toast.success("Variation set deleted");
    },
  });

  if (!campaign) return <div className="py-8 text-center text-slate-400">Loading...</div>;

  const hasChanges = Object.keys(settings).length > 0;

  return (
    <div className="space-y-6">
      {/* Campaign Settings */}
      <Card className="p-6 border-2 border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
          Campaign Settings - {campaign.name}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-700">Campaign Name</Label>
            <Input
              value={mergedSettings.name || ""}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-slate-700">URL Slug</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-400">/c/</span>
              <Input
                value={mergedSettings.slug || ""}
                onChange={(e) => setSettings({ ...settings, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-700">Linked Presentation</Label>
            <select
              value={mergedSettings.presentationId || ""}
              onChange={(e) => setSettings({ ...settings, presentationId: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="">- None -</option>
              {presentations.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-slate-700">Watch Page Headline</Label>
            <Input
              value={mergedSettings.watchHeadline || ""}
              onChange={(e) => setSettings({ ...settings, watchHeadline: e.target.value })}
              placeholder="Discover How To 10x Your Business With AI"
            />
            <p className="text-xs text-slate-400 mt-1">Big headline shown above the video on the watch page</p>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-slate-700">Watch Page Subheadline</Label>
            <Input
              value={mergedSettings.watchSubheadline || ""}
              onChange={(e) => setSettings({ ...settings, watchSubheadline: e.target.value })}
              placeholder="Watch this free training to learn the exact system..."
            />
          </div>
          <div>
            <Label className="text-slate-700">CTA Button Text</Label>
            <Input
              value={mergedSettings.ctaText || ""}
              onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
              placeholder="Book Your Free Call"
            />
          </div>
          <div>
            <Label className="text-slate-700">CTA URL</Label>
            <Input
              value={mergedSettings.ctaUrl || ""}
              onChange={(e) => setSettings({ ...settings, ctaUrl: e.target.value })}
              placeholder="https://cal.com/..."
            />
          </div>
          <div>
            <Label className="text-slate-700">CTA Appear Time (seconds)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={mergedSettings.ctaAppearTime ?? 0}
                onChange={(e) => setSettings({ ...settings, ctaAppearTime: parseInt(e.target.value) || 0 })}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await apiRequest("POST", `/api/admin/funnels/campaigns/${campaignId}/detect-cta-time`);
                    const data = await res.json();
                    if (data.suggestedTime) {
                      setSettings({ ...settings, ctaAppearTime: data.suggestedTime });
                      toast.success(`AI suggests showing CTA at ${Math.floor(data.suggestedTime / 60)}:${String(data.suggestedTime % 60).padStart(2, '0')} - ${data.reason}`);
                    }
                  } catch {
                    toast.error("Could not detect - make sure slides have script notes");
                  }
                }}
                className="whitespace-nowrap"
              >
                AI Detect
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Seconds into the presentation before the CTA button appears. Use AI Detect to auto-suggest.</p>
          </div>
        </div>
        {hasChanges && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <Button onClick={() => updateCampaign.mutate()} disabled={updateCampaign.isPending}>
              <Save className="w-4 h-4 mr-1" /> Save Changes
            </Button>
          </div>
        )}
      </Card>

      {/* Opt-in Pages */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900">Opt-in Page Variations</h3>
          </div>
          <Button size="sm" onClick={() => setShowNewOptin(!showNewOptin)}>
            <Plus className="w-4 h-4 mr-1" /> Add Page
          </Button>
        </div>

        {showNewOptin && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-700">Variation Name</Label>
                <Input value={newOptin.name} onChange={(e) => setNewOptin({ ...newOptin, name: e.target.value })} placeholder="e.g. Fear angle" />
              </div>
              <div>
                <Label className="text-slate-700">CTA Button Text</Label>
                <Input value={newOptin.ctaButtonText} onChange={(e) => setNewOptin({ ...newOptin, ctaButtonText: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-slate-700">Headline</Label>
              <Textarea value={newOptin.headline} onChange={(e) => setNewOptin({ ...newOptin, headline: e.target.value })} placeholder="Main headline..." rows={2} />
            </div>
            <div>
              <Label className="text-slate-700">Subheadline</Label>
              <Input value={newOptin.subheadline} onChange={(e) => setNewOptin({ ...newOptin, subheadline: e.target.value })} placeholder="Optional subheadline" />
            </div>
            <div>
              <Label className="text-slate-700">Hero Image URL</Label>
              <Input value={newOptin.heroImageUrl} onChange={(e) => setNewOptin({ ...newOptin, heroImageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createOptin.mutate()} disabled={!newOptin.name || !newOptin.headline}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewOptin(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {optinPages.length === 0 ? (
          <p className="text-slate-500 py-4 text-center">No opt-in pages yet.</p>
        ) : (
          <div className="space-y-3">
            {optinPages.map((page) => (
              <OptinPageCard
                key={page.id}
                page={page}
                isEditing={editingOptin === page.id}
                onEdit={() => setEditingOptin(editingOptin === page.id ? null : page.id)}
                onSave={(data) => updateOptin.mutate({ id: page.id, ...data })}
                onDelete={() => { if (confirm("Delete?")) deleteOptin.mutate(page.id); }}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Variation Sets */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-900">Variation Sets</h3>
          </div>
          <Button size="sm" onClick={() => setShowNewVariation(!showNewVariation)} disabled={optinPages.length === 0}>
            <Plus className="w-4 h-4 mr-1" /> Add Variation
          </Button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Each variation set = one opt-in page + specific module variant choices. Visitors are randomly assigned to one variation set.
        </p>

        {showNewVariation && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4 space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-slate-700">Name</Label>
                <Input value={newVariation.name} onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })} placeholder="Headline A + Intro B" />
              </div>
              <div>
                <Label className="text-slate-700">Opt-in Page</Label>
                <select
                  value={newVariation.optinPageId}
                  onChange={(e) => setNewVariation({ ...newVariation, optinPageId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  <option value={0}>Select...</option>
                  {optinPages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-700">Weight</Label>
                <Input type="number" min={1} value={newVariation.weight} onChange={(e) => setNewVariation({ ...newVariation, weight: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createVariation.mutate()} disabled={!newVariation.name || !newVariation.optinPageId}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewVariation(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {variationSets.length === 0 ? (
          <p className="text-slate-500 py-4 text-center">No variation sets yet. Create opt-in pages first, then create variation sets.</p>
        ) : (
          <div className="space-y-2">
            {variationSets.map((vs) => (
              <div key={vs.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="font-medium text-slate-900">{vs.name}</span>
                  <span className="text-sm text-slate-400 ml-2">
                    Page: {optinPages.find(p => p.id === vs.optinPageId)?.name || "?"}
                    {" · "}Weight: {vs.weight}
                  </span>
                  {!vs.isActive && <span className="ml-2 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded">Paused</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => updateVariation.mutate({ id: vs.id, isActive: !vs.isActive })}
                  >
                    {vs.isActive ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-red-500"
                    title="Delete variation set"
                    onClick={() => { if (confirm("Delete?")) deleteVariation.mutate(vs.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// Opt-in page card with inline editing
function OptinPageCard({ page, isEditing, onEdit, onSave, onDelete }: {
  page: FunnelOptinPage;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<FunnelOptinPage>) => void;
  onDelete: () => void;
}) {
  const [edits, setEdits] = useState<Partial<FunnelOptinPage>>({});
  const merged = { ...page, ...edits };

  return (
    <div className="p-4 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-900">{page.name}</span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>{isEditing ? "Close" : "Edit"}</Button>
          <Button size="sm" variant="ghost" className="text-red-500" title="Delete opt-in page" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isEditing ? (
        <div className="space-y-1">
          <p className="text-slate-700 font-bold">{page.headline}</p>
          {page.subheadline && <p className="text-slate-500 text-sm">{page.subheadline}</p>}
          <p className="text-xs text-slate-400">CTA: "{page.ctaButtonText}"</p>
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          <div>
            <Label className="text-slate-700">Name</Label>
            <Input value={merged.name} onChange={(e) => setEdits({ ...edits, name: e.target.value })} />
          </div>
          <div>
            <Label className="text-slate-700">Headline</Label>
            <Textarea value={merged.headline} onChange={(e) => setEdits({ ...edits, headline: e.target.value })} rows={2} />
          </div>
          <div>
            <Label className="text-slate-700">Subheadline</Label>
            <Input value={merged.subheadline || ""} onChange={(e) => setEdits({ ...edits, subheadline: e.target.value })} />
          </div>
          <div>
            <Label className="text-slate-700">CTA Button Text</Label>
            <Input value={merged.ctaButtonText || ""} onChange={(e) => setEdits({ ...edits, ctaButtonText: e.target.value })} />
          </div>
          <div>
            <Label className="text-slate-700">Hero Image URL</Label>
            <Input value={merged.heroImageUrl || ""} onChange={(e) => setEdits({ ...edits, heroImageUrl: e.target.value })} />
          </div>
          <Button size="sm" onClick={() => { onSave(edits); setEdits({}); }}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      )}
    </div>
  );
}
