import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Trophy,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Check,
  X,
  Palette,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PendingComment {
  id: number;
  day: number;
  content: string;
  flagReason: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface BrandSettings {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: number;
  logoUrl?: string;
  appName: string;
}

const FONT_OPTIONS = [
  "Poppins",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Nunito",
  "Source Sans Pro",
];

export default function Admin() {
  const queryClient = useQueryClient();
  
  const { data: brandSettings } = useQuery<BrandSettings>({
    queryKey: ["/api/brand-settings"],
  });

  const [brand, setBrand] = useState<BrandSettings>({
    primaryColor: "#007BFF",
    textColor: "#000000",
    backgroundColor: "#FFFFFF",
    accentColor: "#007BFF",
    fontFamily: "Poppins",
    borderRadius: 6,
    appName: "30 Day AI SaaS Challenge",
  });

  useEffect(() => {
    if (brandSettings) {
      setBrand({
        primaryColor: brandSettings.primaryColor || "#007BFF",
        textColor: brandSettings.textColor || "#000000",
        backgroundColor: brandSettings.backgroundColor || "#FFFFFF",
        accentColor: brandSettings.accentColor || "#007BFF",
        fontFamily: brandSettings.fontFamily || "Poppins",
        borderRadius: brandSettings.borderRadius || 6,
        logoUrl: brandSettings.logoUrl || "",
        appName: brandSettings.appName || "30 Day AI SaaS Challenge",
      });
    }
  }, [brandSettings]);

  const saveBrandSettings = useMutation({
    mutationFn: async (settings: BrandSettings) => {
      const res = await apiRequest("POST", "/api/admin/brand-settings", settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-settings"] });
      toast.success("Brand settings saved! Refresh to see changes.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save brand settings");
    },
  });

  const { data: adminData, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
  });

  const { data: pendingComments = [] } = useQuery<PendingComment[]>({
    queryKey: ["/api/admin/pending-comments"],
  });

  const updateCommentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/comments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-comments"] });
      toast.success(status === "approved" ? "Comment approved" : "Comment rejected");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
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
        <div className="border-b border-black pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-black">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Track student progress and engagement metrics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-2 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="text-2xl font-bold text-black">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active (7 days)</p>
                <p className="text-2xl font-bold text-black">{stats.activeUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Completed 30 Days</p>
                <p className="text-2xl font-bold text-black">{stats.completedChallenges}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Progress</p>
                <p className="text-2xl font-bold text-black">{Math.round(stats.avgProgress)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Comment Approval Queue */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-black">Comment Approval Queue</h2>
            {pendingComments.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {pendingComments.length} pending
              </span>
            )}
          </div>
          
          {pendingComments.length === 0 ? (
            <Card className="p-8 border-2 border-black text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600">No comments pending approval</p>
            </Card>
          ) : (
            <Card className="border-2 border-black divide-y divide-black">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="p-4" data-testid={`pending-comment-${comment.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-black text-sm">
                          {comment.user?.firstName || "Anonymous"} {comment.user?.lastName || ""}
                        </span>
                        <span className="text-xs text-slate-600">
                          Day {comment.day}
                        </span>
                        <span className="text-xs text-slate-600">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-2 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      
                      {comment.flagReason && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex">
                          <AlertTriangle className="w-3 h-3" />
                          {comment.flagReason}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => updateCommentStatus.mutate({ id: comment.id, status: "approved" })}
                        disabled={updateCommentStatus.isPending}
                        data-testid={`approve-comment-${comment.id}`}
                      >
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => updateCommentStatus.mutate({ id: comment.id, status: "rejected" })}
                        disabled={updateCommentStatus.isPending}
                        data-testid={`reject-comment-${comment.id}`}
                      >
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Brand Pack */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-black">Brand Pack</h2>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              App-wide
            </span>
          </div>
          
          <Card className="p-6 border-2 border-black">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  value={brand.appName}
                  onChange={(e) => setBrand({ ...brand, appName: e.target.value })}
                  data-testid="input-app-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={brand.primaryColor}
                    onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded border border-black cursor-pointer"
                  />
                  <Input
                    value={brand.primaryColor}
                    onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={brand.accentColor}
                    onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                    className="w-12 h-10 rounded border border-black cursor-pointer"
                  />
                  <Input
                    value={brand.accentColor}
                    onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="textColor"
                    value={brand.textColor}
                    onChange={(e) => setBrand({ ...brand, textColor: e.target.value })}
                    className="w-12 h-10 rounded border border-black cursor-pointer"
                  />
                  <Input
                    value={brand.textColor}
                    onChange={(e) => setBrand({ ...brand, textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="backgroundColor"
                    value={brand.backgroundColor}
                    onChange={(e) => setBrand({ ...brand, backgroundColor: e.target.value })}
                    className="w-12 h-10 rounded border border-black cursor-pointer"
                  />
                  <Input
                    value={brand.backgroundColor}
                    onChange={(e) => setBrand({ ...brand, backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <select
                  id="fontFamily"
                  value={brand.fontFamily}
                  onChange={(e) => setBrand({ ...brand, fontFamily: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-black bg-white text-sm"
                  data-testid="select-font-family"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius (px)</Label>
                <Input
                  id="borderRadius"
                  type="number"
                  min="0"
                  max="24"
                  value={brand.borderRadius}
                  onChange={(e) => setBrand({ ...brand, borderRadius: parseInt(e.target.value) || 0 })}
                  data-testid="input-border-radius"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  value={brand.logoUrl || ""}
                  onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-logo-url"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-black flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded flex items-center justify-center text-white text-xs font-bold"
                  style={{ 
                    backgroundColor: brand.primaryColor,
                    borderRadius: `${brand.borderRadius}px`,
                  }}
                >
                  Aa
                </div>
                <div className="text-sm text-slate-600">
                  Preview: <span style={{ fontFamily: brand.fontFamily }}>{brand.fontFamily}</span>
                </div>
              </div>
              <Button
                onClick={() => saveBrandSettings.mutate(brand)}
                disabled={saveBrandSettings.isPending}
                className="gap-2"
                data-testid="button-save-brand"
              >
                <Save className="w-4 h-4" />
                {saveBrandSettings.isPending ? "Saving..." : "Save Brand Settings"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Student Progress Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-black">Student Progress</h2>
          <Card className="border-2 border-black overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b border-black">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Day</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">XP Earned</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Active</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {stats.userProgress && stats.userProgress.length > 0 ? (
                    stats.userProgress.map((user: any, i: number) => (
                      <tr key={i} className="hover:bg-white" data-testid={`admin-user-row-${i}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-black">{user.firstName || "Unknown"} {user.lastName || ""}</p>
                              <p className="text-xs text-slate-600">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-black">Day {user.currentDay || 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${Math.round(((user.currentDay || 0) / 30) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600">{Math.round(((user.currentDay || 0) / 30) * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-black">{user.totalXp || 0} XP</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
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
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-white text-slate-600 text-xs font-medium">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-600">
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
          <h2 className="text-xl font-bold text-black">Day-by-Day Completion</h2>
          <Card className="p-6 border-2 border-black">
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
