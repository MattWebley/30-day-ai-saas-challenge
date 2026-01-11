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
  Save,
  Bot,
  MessageCircle,
  Flag,
  Eye,
  ChevronDown,
  ChevronUp,
  Image,
  Star,
  ExternalLink
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

interface ChatbotSettings {
  customRules: string;
  responseStyle: string;
  scopeHelps: string;
  scopeWontHelp: string;
  businessRedirect: string;
  coreRules: string;
  dailyLimit: number;
  hourlyLimit: number;
}

interface ChatMessage {
  id: number;
  userId: string;
  role: string;
  content: string;
  flagged: boolean;
  flagReason: string | null;
  reviewed: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface UserChatSummary {
  userId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  messageCount: number;
  flaggedCount: number;
  lastMessage: string;
}

interface ShowcaseEntry {
  id: number;
  userId: string;
  appName: string;
  description: string;
  screenshotUrl: string;
  liveUrl: string | null;
  status: string;
  featured: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
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

  // Chatbot management
  const [chatbotRules, setChatbotRules] = useState("");
  const [responseStyle, setResponseStyle] = useState("- Be BRIEF. Max 2-3 sentences per point.\n- Use bullet points for multiple items.\n- Give ONE clear action, not a list of options.\n- No fluff, no preamble, no \"Great question!\"\n- Get straight to the answer.");
  const [scopeHelps, setScopeHelps] = useState("ideas, planning, coding, debugging, tech decisions, APIs, auth, testing");
  const [scopeWontHelp, setScopeWontHelp] = useState("sales, marketing, pricing, business strategy, post-launch growth");
  const [businessRedirect, setBusinessRedirect] = useState("This challenge focuses on building. For business strategy, see Matt's mentorship: https://mattwebley.com/workwithmatt");
  const [coreRules, setCoreRules] = useState("1. Reference their idea/features when relevant\n2. ONE clear next step when stuck\n3. Keep them on their current day's task");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showChatSection, setShowChatSection] = useState(true); // Open by default

  const { data: chatbotSettings } = useQuery<ChatbotSettings>({
    queryKey: ["/api/admin/chatbot/settings"],
  });

  const { data: flaggedMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/admin/chatbot/flagged"],
  });

  const { data: userChatSummary = [] } = useQuery<UserChatSummary[]>({
    queryKey: ["/api/admin/chatbot/users"],
  });

  const { data: userChatHistory = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/admin/chatbot/user", selectedUserId],
    enabled: !!selectedUserId,
  });

  // Showcase management
  const [showShowcaseSection, setShowShowcaseSection] = useState(false);

  const { data: pendingShowcase = [] } = useQuery<ShowcaseEntry[]>({
    queryKey: ["/api/admin/showcase/pending"],
  });

  const updateShowcaseStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/showcase/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/showcase/pending"] });
      toast.success(status === "approved" ? "App approved and added to showcase!" : "App rejected");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const toggleShowcaseFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/showcase/${id}/feature`, { featured });
      return res.json();
    },
    onSuccess: (_, { featured }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/showcase/pending"] });
      toast.success(featured ? "App marked as featured!" : "Featured status removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update featured status");
    },
  });

  useEffect(() => {
    if (chatbotSettings) {
      setChatbotRules(chatbotSettings.customRules || "");
      if (chatbotSettings.responseStyle) setResponseStyle(chatbotSettings.responseStyle);
      if (chatbotSettings.scopeHelps) setScopeHelps(chatbotSettings.scopeHelps);
      if (chatbotSettings.scopeWontHelp) setScopeWontHelp(chatbotSettings.scopeWontHelp);
      if (chatbotSettings.businessRedirect) setBusinessRedirect(chatbotSettings.businessRedirect);
      if (chatbotSettings.coreRules) setCoreRules(chatbotSettings.coreRules);
    }
  }, [chatbotSettings]);

  const saveChatbotSettings = useMutation({
    mutationFn: async (settings: Partial<ChatbotSettings>) => {
      const res = await apiRequest("POST", "/api/admin/chatbot/settings", settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chatbot/settings"] });
      toast.success("Chatbot settings saved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  const markReviewed = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/chatbot/review/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chatbot/flagged"] });
      toast.success("Marked as reviewed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark reviewed");
    },
  });

  const flagMessage = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await apiRequest("POST", `/api/admin/chatbot/flag/${id}`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chatbot/flagged"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chatbot/user", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chatbot/users"] });
      toast.success("Message flagged");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to flag message");
    },
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

        {/* Comment Approval Queue */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Comment Approval Queue</h2>
            {pendingComments.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {pendingComments.length} pending
              </span>
            )}
          </div>
          
          {pendingComments.length === 0 ? (
            <Card className="p-8 border-2 border-slate-100 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No comments pending approval</p>
            </Card>
          ) : (
            <Card className="border-2 border-slate-100 divide-y divide-slate-100">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="p-4" data-testid={`pending-comment-${comment.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {comment.user?.firstName || "Anonymous"} {comment.user?.lastName || ""}
                        </span>
                        <span className="text-xs text-slate-400">
                          Day {comment.day}
                        </span>
                        <span className="text-xs text-slate-400">
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

        {/* Showcase Moderation */}
        <div className="space-y-4">
          <button
            onClick={() => setShowShowcaseSection(!showShowcaseSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <h2 className="text-xl font-bold text-slate-900">Showcase Moderation</h2>
            {pendingShowcase.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {pendingShowcase.length} pending
              </span>
            )}
            {showShowcaseSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showShowcaseSection && (
            <div className="space-y-4">
              {pendingShowcase.length === 0 ? (
                <Card className="p-8 border-2 border-slate-100 text-center">
                  <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No apps pending approval</p>
                  <a href="/showcase" target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline mt-2 inline-block">
                    View public showcase
                  </a>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingShowcase.map((entry) => (
                    <Card key={entry.id} className="p-0 border-2 border-slate-100 overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Screenshot */}
                        <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100 flex-shrink-0">
                          <img
                            src={entry.screenshotUrl}
                            alt={entry.appName}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Preview";
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-slate-900">{entry.appName}</h3>
                              <p className="text-sm text-slate-500">
                                by {entry.user?.firstName || "Unknown"} {entry.user?.lastName || ""} ({entry.user?.email})
                              </p>
                            </div>
                            {entry.liveUrl && (
                              <a
                                href={entry.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                          </div>

                          <p className="text-sm text-slate-600 mb-4">{entry.description}</p>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => updateShowcaseStatus.mutate({ id: entry.id, status: "approved" })}
                              disabled={updateShowcaseStatus.isPending}
                            >
                              <Check className="w-4 h-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => updateShowcaseStatus.mutate({ id: entry.id, status: "rejected" })}
                              disabled={updateShowcaseStatus.isPending}
                            >
                              <X className="w-4 h-4" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`gap-1 ${
                                entry.featured
                                  ? "border-amber-200 text-amber-700 bg-amber-50"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                              onClick={() => toggleShowcaseFeatured.mutate({ id: entry.id, featured: !entry.featured })}
                              disabled={toggleShowcaseFeatured.isPending}
                            >
                              <Star className={`w-4 h-4 ${entry.featured ? "fill-amber-500" : ""}`} />
                              {entry.featured ? "Featured" : "Feature"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <a
                  href="/showcase"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View public showcase page
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Brand Pack */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Brand Pack</h2>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                App-wide
              </span>
            </div>
            <a
              href="/design-preview"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Palette className="w-4 h-4" />
              Preview Design Styles
            </a>
          </div>

          <Card className="p-6 border-2 border-slate-100">
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
                    className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
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
                    className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
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
                    className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
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
                    className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
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
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
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

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
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
                <div className="text-sm text-slate-500">
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

        {/* AI Mentor Management */}
        <div className="space-y-4">
          <button
            onClick={() => setShowChatSection(!showChatSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <h2 className="text-xl font-bold text-slate-900">AI Mentor Management</h2>
            {flaggedMessages.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {flaggedMessages.length} flagged
              </span>
            )}
            {showChatSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showChatSection && (
            <div className="space-y-6">
              {/* Chatbot Rules Editor */}
              <Card className="p-6 border-2 border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <Bot className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Chatbot System Prompt</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Editable</span>
                </div>

                <div className="space-y-6">
                  {/* Response Style */}
                  <div>
                    <Label className="text-sm font-medium text-slate-900 mb-2 block">Response Style</Label>
                    <p className="text-xs text-slate-500 mb-2">How the AI should format and deliver responses</p>
                    <textarea
                      value={responseStyle}
                      onChange={(e) => setResponseStyle(e.target.value)}
                      className="w-full h-28 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* Scope */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-900 mb-2 block">Helps With</Label>
                      <p className="text-xs text-slate-500 mb-2">Topics the AI will assist with</p>
                      <textarea
                        value={scopeHelps}
                        onChange={(e) => setScopeHelps(e.target.value)}
                        className="w-full h-20 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-900 mb-2 block">Won't Help With</Label>
                      <p className="text-xs text-slate-500 mb-2">Topics to redirect away from</p>
                      <textarea
                        value={scopeWontHelp}
                        onChange={(e) => setScopeWontHelp(e.target.value)}
                        className="w-full h-20 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Business Redirect */}
                  <div>
                    <Label className="text-sm font-medium text-slate-900 mb-2 block">Business Question Redirect</Label>
                    <p className="text-xs text-slate-500 mb-2">Message shown when users ask about sales/marketing/business</p>
                    <textarea
                      value={businessRedirect}
                      onChange={(e) => setBusinessRedirect(e.target.value)}
                      className="w-full h-16 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* Core Rules */}
                  <div>
                    <Label className="text-sm font-medium text-slate-900 mb-2 block">Core Rules</Label>
                    <p className="text-xs text-slate-500 mb-2">Main behavior rules for the AI</p>
                    <textarea
                      value={coreRules}
                      onChange={(e) => setCoreRules(e.target.value)}
                      className="w-full h-24 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* Additional Custom Rules */}
                  <div>
                    <Label className="text-sm font-medium text-slate-900 mb-2 block">Additional Custom Rules</Label>
                    <p className="text-xs text-slate-500 mb-2">Extra rules appended to the system prompt</p>
                    <textarea
                      value={chatbotRules}
                      onChange={(e) => setChatbotRules(e.target.value)}
                      placeholder="Example:&#10;- Always recommend booking a call for complex business questions&#10;- Never discuss competitor products by name"
                      className="w-full h-24 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={() => saveChatbotSettings.mutate({
                        customRules: chatbotRules,
                        responseStyle,
                        scopeHelps,
                        scopeWontHelp,
                        businessRedirect,
                        coreRules
                      })}
                      disabled={saveChatbotSettings.isPending}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saveChatbotSettings.isPending ? "Saving..." : "Save All Rules"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Flagged Messages */}
              <Card className="p-6 border-2 border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Flag className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-slate-900">Flagged Messages</h3>
                  {flaggedMessages.length > 0 && (
                    <span className="text-sm text-slate-500">({flaggedMessages.length} need review)</span>
                  )}
                </div>

                {flaggedMessages.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">No flagged messages to review</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {flaggedMessages.map((msg) => (
                      <div key={msg.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-slate-900">
                                {msg.user?.firstName || "Unknown"} {msg.user?.lastName || ""}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{msg.content}</p>
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              {msg.flagReason}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markReviewed.mutate(msg.id)}
                            disabled={markReviewed.isPending}
                            className="flex-shrink-0"
                          >
                            <Eye className="w-4 h-4 mr-1" /> Reviewed
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* User Chat Activity */}
              <Card className="p-6 border-2 border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-slate-900">User Chat Activity</h3>
                  <span className="text-sm text-slate-500">({userChatSummary.length} users)</span>
                </div>

                {userChatSummary.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">No chat activity yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {userChatSummary.map((summary) => (
                      <button
                        key={summary.userId}
                        onClick={() => setSelectedUserId(selectedUserId === summary.userId ? null : summary.userId)}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          selectedUserId === summary.userId
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                              {summary.user?.firstName?.[0] || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                {summary.user?.firstName || "Unknown"} {summary.user?.lastName || ""}
                              </p>
                              <p className="text-xs text-slate-500">{summary.user?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">{summary.messageCount} messages</p>
                            {summary.flaggedCount > 0 && (
                              <p className="text-xs text-red-600">{summary.flaggedCount} flagged</p>
                            )}
                          </div>
                        </div>

                        {selectedUserId === summary.userId && userChatHistory.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {userChatHistory.slice(0, 20).map((msg) => (
                              <div
                                key={msg.id}
                                className={`p-2 rounded text-sm ${
                                  msg.role === "user"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-primary/10 text-slate-700"
                                } ${msg.flagged ? "border-l-2 border-red-500" : ""}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-400 mb-1">
                                      {msg.role === "user" ? "User" : "AI"} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                      {msg.flagged && <span className="text-red-500 ml-2">• Flagged</span>}
                                    </p>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                  {msg.role === "user" && !msg.flagged && (
                                    <button
                                      onClick={() => flagMessage.mutate({ id: msg.id, reason: "Manual flag by admin" })}
                                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                      title="Flag this message"
                                    >
                                      <Flag className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
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
