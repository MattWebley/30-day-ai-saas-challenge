import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Sparkles, Check, X, Download, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { FunnelAdCopy } from "./funnelTypes";

interface Props {
  campaignId: number;
}

export default function AdCopyGenerator({ campaignId }: Props) {
  const queryClient = useQueryClient();
  const [persuasionLevel, setPersuasionLevel] = useState(5);
  const [scriptContext, setScriptContext] = useState("");

  const { data: copies = [] } = useQuery<FunnelAdCopy[]>({
    queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-copy`],
  });

  const generate = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/funnels/campaigns/${campaignId}/generate-ad-copy`, {
        persuasionLevel,
        scriptContext,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-copy`] });
      toast.success("Ad copy generated!");
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

  const pendingCopies = copies.filter(c => c.status === 'pending');
  const approvedCopies = copies.filter(c => c.status === 'approved');
  const rejectedCopies = copies.filter(c => c.status === 'rejected');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">AI Ad Copy Generator</h3>

      {/* Generator */}
      <Card className="p-6 border-2 border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-slate-900">Generate New Copy</h4>
        </div>

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

          <div>
            <Label className="text-slate-700">Script Context (optional)</Label>
            <p className="text-xs text-slate-500 mb-1">Paste key points from your presentation for more relevant copy</p>
            <Textarea
              value={scriptContext}
              onChange={(e) => setScriptContext(e.target.value)}
              rows={4}
              placeholder="Key pain points, transformation story, offer details..."
            />
          </div>

          <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
            {generate.isPending ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1" /> Generate 3 Variations</>
            )}
          </Button>
        </div>
      </Card>

      {/* Review Queue */}
      {pendingCopies.length > 0 && (
        <Card className="p-6 border-2 border-slate-200">
          <h4 className="font-bold text-slate-900 mb-4">Review Queue ({pendingCopies.length})</h4>
          <div className="space-y-4">
            {pendingCopies.map((copy) => (
              <CopyCard
                key={copy.id}
                copy={copy}
                onApprove={() => updateStatus.mutate({ id: copy.id, status: 'approved' })}
                onReject={() => updateStatus.mutate({ id: copy.id, status: 'rejected' })}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Approved */}
      {approvedCopies.length > 0 && (
        <Card className="p-6 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900">Approved Copy ({approvedCopies.length})</h4>
            <a href={`/api/admin/funnels/campaigns/${campaignId}/ad-copy/export-csv`} download title="Export approved ad copy as CSV">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </a>
          </div>
          <div className="space-y-4">
            {approvedCopies.map((copy) => (
              <CopyCard
                key={copy.id}
                copy={copy}
                onReject={() => updateStatus.mutate({ id: copy.id, status: 'rejected' })}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Rejected */}
      {rejectedCopies.length > 0 && (
        <details className="text-sm">
          <summary className="text-slate-500 cursor-pointer hover:text-slate-700 font-medium">
            Rejected ({rejectedCopies.length})
          </summary>
          <div className="mt-2 space-y-3">
            {rejectedCopies.map((copy) => (
              <CopyCard
                key={copy.id}
                copy={copy}
                onApprove={() => updateStatus.mutate({ id: copy.id, status: 'approved' })}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function CopyCard({ copy, onApprove, onReject }: {
  copy: FunnelAdCopy;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-bold text-slate-900 text-lg">{copy.headline}</p>
          <p className="text-slate-700 mt-2 whitespace-pre-wrap">{copy.primaryText}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-400">Persuasion: {copy.persuasionLevel}/10</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">{new Date(copy.createdAt).toLocaleDateString('en-GB')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onApprove && (
            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" title="Approve ad copy" onClick={onApprove}>
              <Check className="w-4 h-4" />
            </Button>
          )}
          {onReject && (
            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" title="Reject ad copy" onClick={onReject}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
