import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Plus,
  Trash2
} from "lucide-react";

interface Day9RealityCheckProps {
  prd: string;
  onComplete: (data: { auditResults: AuditItem[] }) => void;
}

interface AuditItem {
  id: string;
  feature: string;
  status: "works" | "partial" | "missing";
  priority: "critical" | "important" | "nice";
  notes: string;
}

export function Day9RealityCheck({ prd, onComplete }: Day9RealityCheckProps) {
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setAuditItems([
      ...auditItems,
      {
        id: Date.now().toString(),
        feature: newFeature.trim(),
        status: "works",
        priority: "important",
        notes: "",
      },
    ]);
    setNewFeature("");
  };

  const updateItem = (id: string, updates: Partial<AuditItem>) => {
    setAuditItems(auditItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: string) => {
    setAuditItems(auditItems.filter((item) => item.id !== id));
  };

  const statusIcon = (status: AuditItem["status"]) => {
    switch (status) {
      case "works":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "partial":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "missing":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const issueCount = auditItems.filter((i) => i.status !== "works").length;
  const criticalCount = auditItems.filter((i) => i.status !== "works" && i.priority === "critical").length;

  const canComplete = auditItems.length >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-2 border-primary bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
            <ClipboardCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">The Reality Check</h3>
            <p className="text-slate-600 mt-1">Audit what Replit built vs your PRD. Document every gap.</p>
          </div>
        </div>
      </Card>

      {/* PRD Reference */}
      {prd && (
        <Card className="p-4 border-2 border-slate-200">
          <h4 className="font-bold text-sm mb-2 text-slate-700">Your PRD (Reference)</h4>
          <div className="max-h-40 overflow-y-auto text-xs text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
            {prd.substring(0, 1000)}{prd.length > 1000 ? "..." : ""}
          </div>
        </Card>
      )}

      {/* Add Feature */}
      <Card className="p-4 border-2 border-slate-200">
        <h4 className="font-bold text-sm mb-3 text-slate-900">Add Features to Audit</h4>
        <div className="flex gap-2">
          <Textarea
            placeholder="Enter a feature from your PRD (e.g., 'User login', 'Dashboard', 'AI generation')"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            className="min-h-[60px]"
          />
          <Button onClick={addFeature} className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Audit Items */}
      {auditItems.length > 0 && (
        <Card className="p-4 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900">Feature Audit ({auditItems.length} features)</h4>
            {issueCount > 0 && (
              <span className="text-sm text-amber-600 font-medium">
                {issueCount} issues ({criticalCount} critical)
              </span>
            )}
          </div>
          <div className="space-y-4">
            {auditItems.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {statusIcon(item.status)}
                    <span className="font-medium text-slate-900">{item.feature}</span>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Status</label>
                    <select
                      value={item.status}
                      onChange={(e) => updateItem(item.id, { status: e.target.value as AuditItem["status"] })}
                      className="w-full text-sm border border-slate-200 rounded px-2 py-1.5"
                    >
                      <option value="works">Works</option>
                      <option value="partial">Partial / Buggy</option>
                      <option value="missing">Missing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Priority</label>
                    <select
                      value={item.priority}
                      onChange={(e) => updateItem(item.id, { priority: e.target.value as AuditItem["priority"] })}
                      className="w-full text-sm border border-slate-200 rounded px-2 py-1.5"
                    >
                      <option value="critical">Critical</option>
                      <option value="important">Important</option>
                      <option value="nice">Nice to Have</option>
                    </select>
                  </div>
                </div>
                {item.status !== "works" && (
                  <Textarea
                    placeholder="Notes: What's wrong? What should it do?"
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                    className="text-sm min-h-[60px]"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Complete Button */}
      {canComplete && (
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold gap-2"
          onClick={() => onComplete({ auditResults: auditItems })}
        >
          Save Audit & Continue <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {!canComplete && auditItems.length > 0 && (
        <p className="text-sm text-slate-500 text-center">Add at least 3 features to audit</p>
      )}
    </div>
  );
}
