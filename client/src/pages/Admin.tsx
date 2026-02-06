import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTestMode } from "@/contexts/TestModeContext";
import {
  Users,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  PoundSterling,
  Activity,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Image,
  Video,
  Flag,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AdminUser, RevenueData, PendingComment, ShowcaseEntry, CritiqueRequest, ChatMessage } from "./admin/adminTypes";
import { formatCurrency } from "./admin/adminTypes";

// Tab components
import AdminUsers from "./admin/AdminUsers";
import AdminRevenue from "./admin/AdminRevenue";
import AdminContent from "./admin/AdminContent";
import AdminMarketing from "./admin/AdminMarketing";
import AdminSettings from "./admin/AdminSettings";

type TabKey = "overview" | "users" | "revenue" | "content" | "marketing" | "settings";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "revenue", label: "Revenue" },
  { key: "content", label: "Content" },
  { key: "marketing", label: "Marketing" },
  { key: "settings", label: "Settings" },
];

export default function Admin() {
  const { testMode, setTestMode } = useTestMode();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Check if user is admin
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // If user is not admin, show access denied
  if (currentUser && !currentUser.isAdmin) {
    return (
      <Layout currentDay={1}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600">
              You don't have permission to access the admin panel.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  // Core data (fetched at shell level for Overview, shared via cache)
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
  });

  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 30_000, // Refetch admin data after 30 seconds (not Infinity)
  });

  const { data: revenueData } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue", "all"],
    queryFn: async () => {
      const res = await fetch("/api/admin/revenue?range=all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch revenue");
      return res.json();
    },
  });

  // Attention counts
  const { data: pendingComments = [] } = useQuery<PendingComment[]>({
    queryKey: ["/api/admin/pending-comments"],
  });
  const { data: pendingShowcase = [] } = useQuery<ShowcaseEntry[]>({
    queryKey: ["/api/admin/showcase/pending"],
  });
  const { data: critiqueRequests = [] } = useQuery<CritiqueRequest[]>({
    queryKey: ["/api/admin/critiques"],
  });
  const { data: flaggedMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/admin/chatbot/flagged"],
  });

  if (isLoading) {
    return (
      <Layout currentDay={1}>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const stats = adminData || {
    totalUsers: 0,
    activeUsers: 0,
    completedChallenges: 0,
    avgProgress: 0,
    userProgress: [],
    dayCompletions: {},
  };

  // Segments for overview
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const paidCount = adminUsers.filter((u) => u.challengePurchased).length;
  const stuckCount = adminUsers.filter(
    (u) =>
      u.challengePurchased &&
      u.stats.lastCompletedDay > 0 &&
      u.stats.lastCompletedDay < 21 &&
      (!u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo)
  ).length;

  // Pending critiques count
  const pendingCritiquesCount = critiqueRequests.filter(
    (c) => c.status === "pending" || c.status === "in_progress"
  ).length;

  // Attention items
  const attentionItems = [
    {
      label: "Pending comments",
      count: pendingComments.length,
      tab: "content" as TabKey,
      icon: MessageSquare,
    },
    {
      label: "Pending showcase apps",
      count: pendingShowcase.filter((s) => s.status === "pending").length,
      tab: "content" as TabKey,
      icon: Image,
    },
    {
      label: "Pending critique requests",
      count: pendingCritiquesCount,
      tab: "content" as TabKey,
      icon: Video,
    },
    {
      label: "Flagged chat messages",
      count: flaggedMessages.length,
      tab: "settings" as TabKey,
      icon: Flag,
    },
    {
      label: "Stuck users (7+ days inactive)",
      count: stuckCount,
      tab: "users" as TabKey,
      icon: Users,
    },
  ];

  const totalAttention = attentionItems.reduce((sum, item) => sum + item.count, 0);

  // Chart data: Revenue trend (last 30 days)
  const revenueTrendData = (() => {
    if (!revenueData?.recentTransactions?.length) return [];
    const dayMap: Record<string, number> = {};
    const now = new Date();
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = 0;
    }
    // Sum transactions by day
    revenueData.recentTransactions.forEach((tx) => {
      if (tx.status === "succeeded" && !tx.refunded) {
        const d = new Date(tx.created * 1000).toISOString().split("T")[0];
        if (dayMap[d] !== undefined) {
          dayMap[d] += tx.amount / 100;
        }
      }
    });
    return Object.entries(dayMap).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      amount: Math.round(amount * 100) / 100,
    }));
  })();

  // Chart data: Progress distribution (Day 0-21)
  const progressDistData = Array.from({ length: 22 }, (_, i) => ({
    day: `${i}`,
    completions: stats.dayCompletions?.[i] || 0,
  }));

  // Funnel data
  const funnelData = [
    { stage: "Signed Up", count: adminUsers.length, color: "bg-slate-400" },
    {
      stage: "Purchased",
      count: adminUsers.filter((u) => u.challengePurchased).length,
      color: "bg-blue-500",
    },
    {
      stage: "Started (Day 0)",
      count: adminUsers.filter((u) => u.stats.lastCompletedDay >= 0 && u.challengePurchased)
        .length,
      color: "bg-cyan-500",
    },
    {
      stage: "Idea Phase (1-4)",
      count: adminUsers.filter((u) => u.stats.lastCompletedDay >= 1).length,
      color: "bg-teal-500",
    },
    {
      stage: "Prepare (5-9)",
      count: adminUsers.filter((u) => u.stats.lastCompletedDay >= 5).length,
      color: "bg-green-500",
    },
    {
      stage: "Build (10-18)",
      count: adminUsers.filter((u) => u.stats.lastCompletedDay >= 10).length,
      color: "bg-amber-500",
    },
    {
      stage: "Launch (19-21)",
      count: adminUsers.filter((u) => u.stats.lastCompletedDay >= 19).length,
      color: "bg-orange-500",
    },
    {
      stage: "Completed",
      count: adminUsers.filter((u) => u.stats.lastCompletedDay >= 21).length,
      color: "bg-emerald-600",
    },
  ];
  const maxFunnelCount = Math.max(...funnelData.map((d) => d.count), 1);

  return (
    <Layout currentDay={1}>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Track student progress and engagement metrics
            </p>
          </div>
          <button
            onClick={() => setTestMode(!testMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              testMode
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title={
              testMode
                ? "All days unlocked, bypass time restrictions"
                : "Normal day unlocking rules apply"
            }
          >
            {testMode ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            Test Mode
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex gap-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary bg-slate-50 rounded-t-lg"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
                {tab.key === "content" && totalAttention > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                    {pendingComments.length + pendingShowcase.filter((s) => s.status === "pending").length + pendingCritiquesCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Students */}
              <Card className="p-5 border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Students</h3>
                </div>
                <p className="text-4xl font-extrabold text-slate-900">{stats.totalUsers}</p>
                <p className="text-slate-500 text-sm">
                  {paidCount} paid, {stats.activeUsers} active this week
                </p>
              </Card>

              {/* Revenue */}
              <Card className="p-5 border border-slate-200 border-l-4 border-l-green-500 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <PoundSterling className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Revenue</h3>
                </div>
                {revenueData?.revenueByCurrency && revenueData.revenueByCurrency.length > 0 ? (
                  <div className="space-y-1">
                    {revenueData.revenueByCurrency.map((curr) => (
                      <p key={curr.currency} className="text-3xl font-extrabold text-slate-900">
                        {formatCurrency(curr.amount, curr.currency)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-3xl font-extrabold text-slate-900">£0</p>
                )}
                <p className="text-slate-500 text-sm">
                  {revenueData?.totals.transactions || 0} total sales
                </p>
              </Card>

              {/* Completion */}
              <Card className="p-5 border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Completion</h3>
                </div>
                <p className="text-4xl font-extrabold text-slate-900">{stats.completedChallenges}</p>
                <p className="text-slate-500 text-sm">
                  {Math.round(stats.avgProgress)}% average progress
                </p>
              </Card>

              {/* Active Now */}
              <Card className="p-5 border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Active Now</h3>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-extrabold text-slate-900">{stats.activeUsers}</p>
                  {stats.activeUsers > 0 && (
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-slate-500 text-sm">active this week</p>
              </Card>
            </div>

            {/* Needs Attention Panel */}
            <Card className={`p-5 border border-slate-200 shadow-sm ${totalAttention > 0 ? "border-l-4 border-l-amber-500" : ""}`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                {totalAttention > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                <h3 className="text-lg font-bold text-slate-900">Needs Attention</h3>
              </div>
              {totalAttention === 0 ? (
                <div className="flex items-center gap-3 text-slate-500 py-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p>All clear — nothing needs attention</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attentionItems
                    .filter((item) => item.count > 0)
                    .map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setActiveTab(item.tab)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-amber-600" />
                          <span className="text-slate-700 font-medium">{item.label}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full">
                          {item.count}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </Card>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Revenue Trend */}
              <Card className="p-5 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">Revenue Trend (30 days)</h3>
                {revenueTrendData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "13px",
                          }}
                          formatter={(value: number) => [`£${value.toFixed(2)}`, "Revenue"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No revenue data yet
                  </div>
                )}
              </Card>

              {/* Progress Distribution */}
              <Card className="p-5 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
                  Progress Distribution (Day 0-21)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressDistData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip
                        contentStyle={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                        formatter={(value: number) => [value, "Completions"]}
                        labelFormatter={(label) => `Day ${label}`}
                      />
                      <Bar
                        dataKey="completions"
                        fill="hsl(var(--primary))"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* User Funnel */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-slate-900">User Funnel</h3>
              </div>
              <div className="space-y-4">
                {funnelData.map((stage, index) => {
                  const widthPercent = (stage.count / maxFunnelCount) * 100;
                  const conversionRate =
                    index > 0 && funnelData[index - 1].count > 0
                      ? ((stage.count / funnelData[index - 1].count) * 100).toFixed(0)
                      : null;
                  const overallRate =
                    funnelData[0].count > 0
                      ? ((stage.count / funnelData[0].count) * 100).toFixed(0)
                      : "0";

                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{stage.stage}</span>
                          {conversionRate && (
                            <span className="text-xs text-slate-400">
                              ({conversionRate}% from previous)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{overallRate}%</span>
                          <span className="font-bold text-slate-900 w-12 text-right">
                            {stage.count}
                          </span>
                        </div>
                      </div>
                      <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${stage.color} transition-all duration-500 rounded-lg flex items-center justify-end pr-2`}
                          style={{ width: `${Math.max(widthPercent, 2)}%` }}
                        >
                          {widthPercent > 15 && (
                            <span className="text-xs text-white font-medium">{stage.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Funnel Insights */}
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Key Metrics</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500">Conversion to Purchase</p>
                      <p className="text-lg font-bold text-slate-900">
                        {adminUsers.length > 0
                          ? ((paidCount / adminUsers.length) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500">Completion Rate</p>
                      <p className="text-lg font-bold text-slate-900">
                        {paidCount > 0
                          ? (
                              (adminUsers.filter((u) => u.stats.lastCompletedDay >= 21).length /
                                paidCount) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500">Stuck Users</p>
                      <p className="text-lg font-bold text-slate-900">
                        {stuckCount}
                        <span className="text-sm font-normal text-slate-400 ml-1">
                          ({paidCount > 0 ? ((stuckCount / paidCount) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Student Progress Table */}
            <Card className="border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Student Progress</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        App URL
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Current Day
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Referrals
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.userProgress && stats.userProgress.length > 0 ? (
                      stats.userProgress.map((user: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {user.firstName?.[0] ||
                                  user.email?.[0]?.toUpperCase() ||
                                  "?"}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {user.firstName || "Unknown"} {user.lastName || ""}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {user.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.customDomain ? (
                              <a
                                href={`https://${user.customDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                {user.customDomain}
                              </a>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">
                              Day {user.currentDay || 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${Math.round(
                                      ((user.currentDay || 0) / 21) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-slate-500">
                                {Math.round(((user.currentDay || 0) / 21) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.referralCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-primary text-sm font-medium">
                                {user.referralCount}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">0</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.currentDay >= 21 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            ) : user.isActive ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                                Inactive
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No students enrolled yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "users" && <AdminUsers />}
        {activeTab === "revenue" && <AdminRevenue />}
        {activeTab === "content" && <AdminContent />}
        {activeTab === "marketing" && <AdminMarketing />}
        {activeTab === "settings" && <AdminSettings />}
      </div>
    </Layout>
  );
}
