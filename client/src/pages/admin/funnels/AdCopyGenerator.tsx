import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Sparkles, Check, X, Download, Loader2, Copy, ChevronDown, ChevronRight, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { FunnelAdCopy } from "./funnelTypes";

interface Props {
  campaignId: number;
}

const ANGLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pain: { label: "Pain", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  result: { label: "Result", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  curiosity: { label: "Curiosity", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
};

export default function AdCopyGenerator({ campaignId }: Props) {
  const queryClient = useQueryClient();
  const [persuasionLevel, setPersuasionLevel] = useState(5);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: copies = [] } = useQuery<FunnelAdCopy[]>({
    queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-copy`],
  });

  const generate = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/funnels/campaigns/${campaignId}/generate-ad-copy`, {
        persuasionLevel,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-copy`] });
      toast.success("3 ad packages generated!");
      // Scroll to results after a short delay so the new cards render first
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/funnels/ad-copy/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-copy`] });
    },
  });

  const regenerate = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/funnels/ad-copy/${id}/regenerate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-copy`] });
      toast.success("Ad package regenerated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const pendingCopies = copies.filter(c => c.status === 'pending');
  const approvedCopies = copies.filter(c => c.status === 'approved');
  const rejectedCopies = copies.filter(c => c.status === 'rejected');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Facebook Ad Generator</h3>

      {/* Generator */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-slate-900">Generate Ad Packages</h4>
        </div>
        <p className="text-slate-700 mb-4">
          Automatically pulls content from your linked VSL/webinar presentation and generates 3 complete ad packages (Pain, Result, Curiosity angles) ready for Meta Ads Manager.
        </p>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-700">Persuasion Level: {persuasionLevel}/10</Label>
            <p className="text-xs text-slate-500 mb-2">1 = soft educational, 10 = aggressive direct response</p>
            <input
              type="range"
              min={1}
              max={10}
              value={persuasionLevel}
              onChange={(e) => setPersuasionLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Soft/Educational</span>
              <span>Balanced</span>
              <span>Aggressive DR</span>
            </div>
          </div>

          <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
            {generate.isPending ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating 3 Packages...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1" /> Generate 3 Ad Packages</>
            )}
          </Button>
        </div>
      </Card>

      {/* Results section */}
      <div ref={resultsRef}>

      {/* Summary bar when ads exist */}
      {copies.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
          <span className="font-medium">Your Ad Packages:</span>
          {pendingCopies.length > 0 && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{pendingCopies.length} to review</span>}
          {approvedCopies.length > 0 && <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{approvedCopies.length} approved</span>}
          {rejectedCopies.length > 0 && <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">{rejectedCopies.length} rejected</span>}
        </div>
      )}

      {/* Review Queue */}
      {pendingCopies.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold text-slate-900 mb-3">Review Queue ({pendingCopies.length})</h4>
          <div className="space-y-4">
            {pendingCopies.map((copy) => (
              <AdPackageCard
                key={copy.id}
                copy={copy}
                onApprove={() => updateStatus.mutate({ id: copy.id, status: 'approved' })}
                onReject={() => updateStatus.mutate({ id: copy.id, status: 'rejected' })}
                onRegenerate={() => regenerate.mutate(copy.id)}
                isRegenerating={regenerate.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved */}
      {approvedCopies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900">Approved ({approvedCopies.length})</h4>
            <a href={`/api/admin/funnels/campaigns/${campaignId}/ad-copy/export-csv`} download>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </a>
          </div>
          <div className="space-y-4">
            {approvedCopies.map((copy) => (
              <AdPackageCard
                key={copy.id}
                copy={copy}
                onReject={() => updateStatus.mutate({ id: copy.id, status: 'rejected' })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejectedCopies.length > 0 && (
        <details className="text-sm mt-4">
          <summary className="text-slate-500 cursor-pointer hover:text-slate-700 font-medium">
            Rejected ({rejectedCopies.length})
          </summary>
          <div className="mt-2 space-y-4">
            {rejectedCopies.map((copy) => (
              <AdPackageCard
                key={copy.id}
                copy={copy}
                onApprove={() => updateStatus.mutate({ id: copy.id, status: 'approved' })}
              />
            ))}
          </div>
        </details>
      )}

      </div>{/* end resultsRef */}
    </div>
  );
}

// Copy text to clipboard with toast feedback
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copied!`);
  });
}

// Collapsible section component
function CollapsibleSection({ title, children, defaultOpen = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-slate-600 font-medium text-sm hover:text-slate-900 w-full text-left"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {title}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

// Copyable text block
function CopyBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="relative group">
      <p className="text-slate-700 whitespace-pre-wrap pr-8">{text}</p>
      <button
        onClick={() => copyToClipboard(text, label)}
        className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700"
        title={`Copy ${label}`}
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}

function AdPackageCard({ copy, onApprove, onReject, onRegenerate, isRegenerating }: {
  copy: FunnelAdCopy;
  onApprove?: () => void;
  onReject?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}) {
  const angle = copy.adAngle || "pain";
  const config = ANGLE_CONFIG[angle] || ANGLE_CONFIG.pain;
  const isNewFormat = !!(copy.description || copy.primaryTextMedium || copy.adAngle);

  // Parse hooks from JSON string
  let hooks: string[] = [];
  if (copy.hooks) {
    try { hooks = JSON.parse(copy.hooks); } catch { /* old format */ }
  }

  return (
    <Card className={`p-5 border-2 ${config.border}`}>
      {/* Header with angle badge + actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-slate-400">Persuasion: {copy.persuasionLevel}/10</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-400">{new Date(copy.createdAt).toLocaleDateString('en-GB')}</span>
        </div>
        <div className="flex items-center gap-1">
          {onRegenerate && (
            <Button size="sm" variant="ghost" className="text-slate-500 hover:text-slate-700" title="Regenerate this package" onClick={onRegenerate} disabled={isRegenerating}>
              {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          )}
          {onApprove && (
            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" title="Approve" onClick={onApprove}>
              <Check className="w-4 h-4" />
            </Button>
          )}
          {onReject && (
            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" title="Reject" onClick={onReject}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Headline + Description */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-900 text-lg">{copy.headline}</p>
          <button onClick={() => copyToClipboard(copy.headline, "Headline")} className="text-slate-400 hover:text-slate-700 p-1" title="Copy headline">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {copy.description && (
          <div className="flex items-center justify-between mt-1">
            <p className="text-slate-600">{copy.description}</p>
            <button onClick={() => copyToClipboard(copy.description!, "Description")} className="text-slate-400 hover:text-slate-700 p-1" title="Copy description">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Primary Text (Short) — always visible */}
      <div className="mb-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Primary Text (Short)</p>
        <CopyBlock label="Primary Text (Short)" text={copy.primaryText} />
      </div>

      {/* New format fields — collapsible */}
      {isNewFormat && (
        <div className="space-y-1 mt-3">
          {copy.primaryTextMedium && (
            <CollapsibleSection title="Primary Text (Medium)">
              <CopyBlock label="Primary Text (Medium)" text={copy.primaryTextMedium} />
            </CollapsibleSection>
          )}

          {copy.primaryTextLong && (
            <CollapsibleSection title="Primary Text (Long)">
              <CopyBlock label="Primary Text (Long)" text={copy.primaryTextLong} />
            </CollapsibleSection>
          )}

          {copy.videoScript && (
            <CollapsibleSection title="Video Ad Script">
              <CopyBlock label="Video Script" text={copy.videoScript} />
            </CollapsibleSection>
          )}

          {hooks.length > 0 && (
            <CollapsibleSection title={`Hook Variations (${hooks.length})`}>
              <div className="space-y-2">
                {hooks.map((hook, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <span className="text-xs text-slate-400 font-mono mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                    <p className="text-slate-700 flex-1">{hook}</p>
                    <button
                      onClick={() => copyToClipboard(hook, `Hook ${i + 1}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 p-1 flex-shrink-0"
                      title={`Copy hook ${i + 1}`}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}
    </Card>
  );
}
