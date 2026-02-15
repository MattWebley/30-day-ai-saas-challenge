import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart3, Users, MousePointer, Play, PhoneCall,
  DollarSign, Download, TrendingUp, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { FunnelAnalytics as AnalyticsType, DropOffData, FunnelAdSpend } from "./funnelTypes";

interface Props {
  campaignId: number;
}

export default function FunnelAnalytics({ campaignId }: Props) {
  const queryClient = useQueryClient();
  const [showAddSpend, setShowAddSpend] = useState(false);
  const [showRecordSale, setShowRecordSale] = useState(false);
  const [newSpend, setNewSpend] = useState({ date: new Date().toISOString().split('T')[0], amount: "", currency: "gbp", platform: "meta", notes: "" });
  const [saleEmail, setSaleEmail] = useState("");
  const [saleAmount, setSaleAmount] = useState("");

  const { data: analytics } = useQuery<AnalyticsType>({
    queryKey: [`/api/admin/funnels/campaigns/${campaignId}/analytics`],
  });

  const { data: dropOff = [] } = useQuery<DropOffData[]>({
    queryKey: [`/api/admin/funnels/campaigns/${campaignId}/drop-off`],
  });

  const { data: adSpendEntries = [] } = useQuery<FunnelAdSpend[]>({
    queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-spend`],
  });

  const addAdSpend = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/funnels/ad-spend", {
        campaignId,
        date: newSpend.date,
        amount: Math.round(parseFloat(newSpend.amount) * 100), // convert to cents
        currency: newSpend.currency,
        platform: newSpend.platform,
        notes: newSpend.notes,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/analytics`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-spend`] });
      setShowAddSpend(false);
      setNewSpend({ date: new Date().toISOString().split('T')[0], amount: "", currency: "gbp", platform: "meta", notes: "" });
      toast.success("Ad spend recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSpend = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/funnels/ad-spend/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/analytics`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/ad-spend`] });
      toast.success("Deleted");
    },
  });

  const recordSale = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/funnels/campaigns/${campaignId}/record-sale`, {
        email: saleEmail,
        amount: saleAmount ? Math.round(parseFloat(saleAmount) * 100) : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/funnels/campaigns/${campaignId}/analytics`] });
      setShowRecordSale(false);
      setSaleEmail("");
      setSaleAmount("");
      toast.success("Sale recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!analytics) return <div className="py-8 text-center text-slate-400">Loading analytics...</div>;

  const formatCurrency = (cents: number) => `£${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">
        Analytics — {analytics.campaign.name}
      </h3>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard icon={Users} label="Visitors" value={analytics.totalVisitors} color="blue" />
        <KPICard icon={MousePointer} label="Registrations" value={analytics.totalRegistrations} color="green"
          subtitle={analytics.totalVisitors > 0 ? `${((analytics.totalRegistrations / analytics.totalVisitors) * 100).toFixed(1)}%` : undefined} />
        <KPICard icon={Play} label="Play Starts" value={analytics.totalPlayStarts} color="purple" />
        <KPICard icon={TrendingUp} label="CTA Clicks" value={analytics.totalCtaClicks} color="amber" />
        <KPICard icon={PhoneCall} label="Calls Booked" value={analytics.totalCallsBooked} color="teal" />
        <KPICard icon={DollarSign} label="Sales" value={analytics.totalSales} color="emerald" />
      </div>

      {/* Cost Metrics */}
      {analytics.totalAdSpend > 0 && (
        <div className="grid sm:grid-cols-3 gap-3">
          <Card className="p-4 border border-slate-200">
            <p className="text-xs text-slate-500">Total Ad Spend</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(analytics.totalAdSpend)}</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-xs text-slate-500">Cost per Registration</p>
            <p className="text-xl font-bold text-slate-900">
              {analytics.costPerRegistration ? formatCurrency(analytics.costPerRegistration) : "—"}
            </p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-xs text-slate-500">Cost per Sale</p>
            <p className="text-xl font-bold text-slate-900">
              {analytics.costPerSale ? formatCurrency(analytics.costPerSale) : "—"}
            </p>
          </Card>
        </div>
      )}

      {/* Per-Variation Table */}
      {analytics.variations.length > 0 && (
        <Card className="p-6 border-2 border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-4">Variation Performance</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-slate-500">Variation</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-500">Visitors</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-500">Reg. Rate</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-500">CTA Rate</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-500">Sales</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-500">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.variations.map((v) => (
                  <tr key={v.variationSet.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{v.variationSet.name}</td>
                    <td className="text-right px-3 py-2 text-slate-700">{v.visitors}</td>
                    <td className="text-right px-3 py-2 text-slate-700">{v.registrationRate.toFixed(1)}%</td>
                    <td className="text-right px-3 py-2 text-slate-700">{v.ctaClickRate.toFixed(1)}%</td>
                    <td className="text-right px-3 py-2 text-slate-700">{v.sales}</td>
                    <td className="text-right px-3 py-2">
                      <ConfidenceBadge confidence={v.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Drop-off Chart */}
      {dropOff.length > 0 && (
        <Card className="p-6 border-2 border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-4">Watch-Time Drop-off</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dropOff}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="timeSeconds"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `${Math.floor(v / 60)}:${(v % 60).toString().padStart(2, '0')}`}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(0)}%`, "Still watching"]}
                  labelFormatter={(v) => `${Math.floor(Number(v) / 60)}:${(Number(v) % 60).toString().padStart(2, '0')}`}
                />
                <Area type="monotone" dataKey="percentage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Ad Spend + Manual Sale */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900">Ad Spend</h4>
            <Button size="sm" variant="outline" onClick={() => setShowAddSpend(!showAddSpend)}>
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>

          {showAddSpend && (
            <div className="bg-slate-50 rounded p-3 border border-slate-200 mb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-700">Date</Label>
                  <Input type="date" value={newSpend.date} onChange={(e) => setNewSpend({ ...newSpend, date: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Amount (£)</Label>
                  <Input type="number" step="0.01" value={newSpend.amount} onChange={(e) => setNewSpend({ ...newSpend, amount: e.target.value })} placeholder="50.00" />
                </div>
              </div>
              <Input value={newSpend.notes} onChange={(e) => setNewSpend({ ...newSpend, notes: e.target.value })} placeholder="Notes (optional)" />
              <Button size="sm" onClick={() => addAdSpend.mutate()} disabled={!newSpend.amount}>Save</Button>
            </div>
          )}

          <div className="space-y-1 max-h-40 overflow-y-auto">
            {adSpendEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-slate-600">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">£{(entry.amount / 100).toFixed(2)}</span>
                  <button onClick={() => deleteSpend.mutate(entry.id)} className="text-red-400 hover:text-red-600" title="Delete spend entry">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {adSpendEntries.length === 0 && <p className="text-xs text-slate-400">No spend recorded yet.</p>}
          </div>
        </Card>

        <Card className="p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900">Record Sale</h4>
            <Button size="sm" variant="outline" onClick={() => setShowRecordSale(!showRecordSale)}>
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>
          <p className="text-xs text-slate-500 mb-2">Manually record a sale and match it to a funnel visitor by email.</p>

          {showRecordSale && (
            <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-2">
              <div>
                <Label className="text-xs text-slate-700">Customer Email</Label>
                <Input value={saleEmail} onChange={(e) => setSaleEmail(e.target.value)} placeholder="customer@example.com" />
              </div>
              <div>
                <Label className="text-xs text-slate-700">Amount (£, optional)</Label>
                <Input type="number" step="0.01" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} placeholder="497.00" />
              </div>
              <Button size="sm" onClick={() => recordSale.mutate()} disabled={!saleEmail}>Record Sale</Button>
            </div>
          )}
        </Card>
      </div>

      {/* Export */}
      <div className="flex gap-2">
        <a href={`/api/admin/funnels/campaigns/${campaignId}/export-csv`} download title="Export analytics data as CSV">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </a>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color, subtitle }: {
  icon: any; label: string; value: number; color: string; subtitle?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    teal: "bg-teal-50 text-teal-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Card className="p-3 border border-slate-200">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-green-600 font-medium">{subtitle}</p>}
    </Card>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  switch (confidence) {
    case 'winner':
      return <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">95% confident</span>;
    case 'trending':
      return <span className="px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">Trending</span>;
    default:
      return <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-500 rounded-full">Need more data</span>;
  }
}
