import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Trophy,
  BarChart3
} from "lucide-react";

export default function Admin() {
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
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
  };

  return (
    <Layout currentDay={1}>
      <div className="space-y-8 pb-20">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Track student progress and engagement metrics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active (7 days)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Completed 30 Days</p>
                <p className="text-2xl font-bold text-slate-900">{stats.completedChallenges}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Avg Progress</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(stats.avgProgress)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Student Progress Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Student Progress</h2>
          <Card className="border-2 border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Day</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">XP Earned</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.userProgress && stats.userProgress.length > 0 ? (
                    stats.userProgress.map((user: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50" data-testid={`admin-user-row-${i}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.firstName || "Unknown"} {user.lastName || ""}</p>
                              <p className="text-xs text-slate-500">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">Day {user.currentDay || 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${Math.round(((user.currentDay || 0) / 30) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500">{Math.round(((user.currentDay || 0) / 30) * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{user.totalXp || 0} XP</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="w-3 h-3" />
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.currentDay >= 30 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          ) : user.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No students enrolled yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Day Completion Stats */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Day-by-Day Completion</h2>
          <Card className="p-6 border-2 border-slate-100">
            <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-15 gap-2">
              {Array.from({ length: 30 }, (_, i) => {
                const dayNum = i + 1;
                const completions = stats.dayCompletions?.[dayNum] || 0;
                const percentage = stats.totalUsers > 0 ? (completions / stats.totalUsers) * 100 : 0;
                return (
                  <div
                    key={dayNum}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: percentage > 0 
                        ? `rgba(59, 130, 246, ${Math.min(percentage / 100 + 0.1, 1)})` 
                        : '#f1f5f9',
                      color: percentage > 30 ? 'white' : '#64748b'
                    }}
                    title={`Day ${dayNum}: ${completions} completions`}
                    data-testid={`admin-day-${dayNum}`}
                  >
                    <span>{dayNum}</span>
                    <span className="text-[10px] opacity-75">{completions}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
