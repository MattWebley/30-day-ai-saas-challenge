import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus, Trash2, Settings, ExternalLink, BarChart3,
  Presentation, ChevronLeft, Eye, EyeOff, Pencil,
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
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCampaign.mutate({ id: c.id, isActive: !c.isActive })}
                    className={`p-1.5 rounded-lg ${c.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                    title={c.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                  >
                    {c.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <div>
                    <span className="font-medium text-slate-900">{c.name}</span>
                    <span className="text-sm text-slate-400 ml-2">/c/{c.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedCampaignId(c.id); setView("campaign"); }}>
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedCampaignId(c.id); setView("analytics"); }}>
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedCampaignId(c.id); setView("adcopy"); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <a href={`/c/${c.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                  </a>
                  <Button
                    size="sm" variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => { if (confirm("Delete this campaign and all its data?")) deleteCampaign.mutate(c.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
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
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedPresentationId(p.id); setView("presentation"); }}>
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="text-red-500 hover:text-red-700"
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
