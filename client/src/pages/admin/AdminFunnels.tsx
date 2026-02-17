import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus, Trash2, Settings, ExternalLink, BarChart3, Play, Sparkles,
  Presentation, ChevronLeft, Eye, EyeOff, Pencil, HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { FunnelCampaign, FunnelPresentation } from "./funnels/funnelTypes";
import CampaignEditor from "./funnels/CampaignEditor";
import PresentationEditor from "./funnels/PresentationEditor";
import FunnelAnalytics from "./funnels/FunnelAnalytics";
import AdCopyGenerator from "./funnels/AdCopyGenerator";

type FunnelView = "list" | "campaign" | "presentation" | "analytics" | "adcopy";

export default function AdminFunnels() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<FunnelView>("list");
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [selectedPresentationId, setSelectedPresentationId] = useState<number | null>(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showNewPresentation, setShowNewPresentation] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", slug: "" });
  const [newPresentation, setNewPresentation] = useState({ name: "", description: "" });

  const { data: campaigns = [] } = useQuery<FunnelCampaign[]>({
    queryKey: ["/api/admin/funnels/campaigns"],
  });

  const { data: presentations = [] } = useQuery<FunnelPresentation[]>({
    queryKey: ["/api/admin/funnels/presentations"],
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/funnels/campaigns", newCampaign);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funnels/campaigns"] });
      setShowNewCampaign(false);
      setNewCampaign({ name: "", slug: "" });
      toast.success("Campaign created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createPresentation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/funnels/presentations", newPresentation);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funnels/presentations"] });
      setShowNewPresentation(false);
      setNewPresentation({ name: "", description: "" });
      toast.success("Presentation created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleCampaign = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/campaigns/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funnels/campaigns"] });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funnels/campaigns"] });
      toast.success("Campaign deleted");
    },
  });

  const deletePresentation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/presentations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funnels/presentations"] });
      toast.success("Presentation deleted");
    },
  });

  // Sub-views
  if (view === "campaign" && selectedCampaignId) {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("list")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Back to Funnels
        </button>
        <CampaignEditor campaignId={selectedCampaignId} presentations={presentations} />
      </div>
    );
  }

  if (view === "presentation" && selectedPresentationId) {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("list")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Back to Funnels
        </button>
        <PresentationEditor presentationId={selectedPresentationId} />
      </div>
    );
  }

  if (view === "analytics" && selectedCampaignId) {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("list")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Back to Funnels
        </button>
        <FunnelAnalytics campaignId={selectedCampaignId} />
      </div>
    );
  }

  if (view === "adcopy" && selectedCampaignId) {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("list")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Back to Funnels
        </button>
        <AdCopyGenerator campaignId={selectedCampaignId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* How It Works Guide */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700 select-none">
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">How Funnels Work - Step-by-Step Guide</span>
        </summary>
        <Card className="mt-3 p-6 border-2 border-slate-200 bg-slate-50">
          <div className="space-y-5 text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Step 1: Create a Presentation</h4>
              <p>A presentation is the webinar or VSL that people watch. Scroll down to the <strong>Presentations</strong> section and click <strong>"New Presentation"</strong>.</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Step 2: Paste Your Script</h4>
              <p>Click <strong>"Edit"</strong> on your presentation. Paste your full script into the text box and click <strong>"Generate Slides"</strong>. AI will break it into slides with headlines and body text. You can edit, delete, or add slides after.</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Step 3: Preview</h4>
              <p>Click the <strong>"Preview"</strong> button to see your slides as a click-through slideshow. Use arrow keys or click to navigate. This is how your audience will see each slide.</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Step 4: Add Audio & Sync</h4>
              <p>Paste your audio URL (e.g. from Cloudflare R2 or any CDN), then click <strong>"Sync Slides to Audio"</strong>. Play the audio and tap to mark when each slide should appear. Preview again to see slides sync with audio.</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Step 5: Connect to a Campaign</h4>
              <p>Create a <strong>Campaign</strong> above - this gives your funnel a public URL (<code className="bg-white px-1 py-0.5 rounded text-sm border border-slate-200">/c/your-slug</code>). Link your presentation, set a CTA button, add opt-in page variations, then toggle it live.</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Step 6: Track & Optimise</h4>
              <p>Click the <strong>chart icon</strong> for analytics (visitors, registrations, play starts, CTA clicks, sales). Use the <strong>pencil icon</strong> for AI ad copy generation. For split testing, use the <strong>Advanced: Modules & Variants</strong> section inside your presentation editor.</p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-500"><strong>Quick icon reference:</strong> <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Active/Inactive</span> · <span className="inline-flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> Settings</span> · <span className="inline-flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Analytics</span> · <span className="inline-flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Open Page</span> · <span className="inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</span></p>
            </div>
          </div>
        </Card>
      </details>

      {/* Campaigns Section */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Campaigns</h3>
          <Button size="sm" onClick={() => setShowNewCampaign(!showNewCampaign)}>
            <Plus className="w-4 h-4 mr-1" /> New Campaign
          </Button>
        </div>

        {showNewCampaign && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-700">Campaign Name</Label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Business Opportunity Angle"
                />
              </div>
              <div>
                <Label className="text-slate-700">URL Slug</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-400">/c/</span>
                  <Input
                    value={newCampaign.slug}
                    onChange={(e) => setNewCampaign({ ...newCampaign, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="biz-opp"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createCampaign.mutate()} disabled={!newCampaign.name || !newCampaign.slug}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewCampaign(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {campaigns.length === 0 ? (
          <p className="text-slate-500 py-4 text-center">No campaigns yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCampaign.mutate({ id: c.id, isActive: !c.isActive })}
                      className={`p-1.5 rounded-lg ${c.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                      title={c.isActive ? "Active - click to deactivate" : "Inactive - click to activate"}
                    >
                      {c.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                      <span className="text-sm text-slate-400 ml-2">/c/{c.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" title="Campaign settings" onClick={() => { setSelectedCampaignId(c.id); setView("campaign"); }}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Analytics" onClick={() => { setSelectedCampaignId(c.id); setView("analytics"); }}>
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <a href={`/c/${c.slug}`} target="_blank" rel="noopener noreferrer" title="Open campaign page">
                      <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                    </a>
                    <Button
                      size="sm" variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      title="Delete campaign"
                      onClick={() => { if (confirm("Delete this campaign and all its data?")) deleteCampaign.mutate(c.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 pl-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    onClick={() => { setSelectedCampaignId(c.id); setView("adcopy"); }}
                  >
                    <Sparkles className="w-4 h-4 mr-1" /> Generate Facebook Ads
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Presentations Section */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Presentations</h3>
            <p className="text-sm text-slate-500">Webinars/VSLs that campaigns link to. One presentation can be shared by multiple campaigns.</p>
          </div>
          <Button size="sm" onClick={() => setShowNewPresentation(!showNewPresentation)}>
            <Plus className="w-4 h-4 mr-1" /> New Presentation
          </Button>
        </div>

        {showNewPresentation && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4 space-y-3">
            <div>
              <Label className="text-slate-700">Presentation Name</Label>
              <Input
                value={newPresentation.name}
                onChange={(e) => setNewPresentation({ ...newPresentation, name: e.target.value })}
                placeholder="e.g. Main Webinar v1"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createPresentation.mutate()} disabled={!newPresentation.name}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewPresentation(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {presentations.length === 0 ? (
          <p className="text-slate-500 py-4 text-center">No presentations yet.</p>
        ) : (
          <div className="space-y-2">
            {presentations.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Presentation className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-900">{p.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" title="Edit presentation" onClick={() => { setSelectedPresentationId(p.id); setView("presentation"); }}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <a href={`/preview/${p.id}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" title="Preview presentation">
                      <Play className="w-4 h-4 mr-1" /> Preview
                    </Button>
                  </a>
                  <Button
                    size="sm" variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    title="Delete presentation"
                    onClick={() => { if (confirm("Delete this presentation and all its modules?")) deletePresentation.mutate(p.id); }}
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
