import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Palette,
  Bot,
  BarChart3,
  Save,
  Flag,
  Eye,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type {
  BrandSettings,
  ChatbotSettings,
  ChatMessage,
  UserChatSummary,
} from "./adminTypes";
import { FONT_OPTIONS } from "./adminTypes";

type AdminDiagnostics = {
  serverTime: string;
  host: string;
  nodeEnv: string;
  databaseUrlSet: boolean;
  stripeWebhookSecretSet: boolean;
  counts: {
    users: number;
    pendingPurchases: number;
    coachingPurchases: number;
  };
  lastActivity: {
    userCreatedAt: string | null;
    pendingPurchaseAt: string | null;
    coachingPurchaseAt: string | null;
    webhookAt: string | null;
    webhookType: string | null;
  };
};

export default function AdminSettings() {
  const queryClient = useQueryClient();

  // Brand state
  const { data: brandSettings } = useQuery<BrandSettings>({
    queryKey: ["/api/brand-settings"],
  });

  const {
    data: diagnostics,
    refetch: refetchDiagnostics,
    isFetching: diagnosticsLoading,
  } = useQuery<AdminDiagnostics>({
    queryKey: ["/api/admin/diagnostics"],
  });

  const [brand, setBrand] = useState<BrandSettings>({
    primaryColor: "#007BFF",
    textColor: "#000000",
    backgroundColor: "#FFFFFF",
    accentColor: "#007BFF",
    fontFamily: "Poppins",
    borderRadius: 6,
    appName: "21-Day AI SaaS Challenge",
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
        appName: brandSettings.appName || "21-Day AI SaaS Challenge",
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

  // Chatbot state
  const [chatbotRules, setChatbotRules] = useState("");
  const [responseStyle, setResponseStyle] = useState(
    "- Be BRIEF. Max 2-3 sentences per point.\n- Use bullet points for multiple items.\n- Give ONE clear action, not a list of options.\n- No fluff, no preamble, no \"Great question!\"\n- Get straight to the answer."
  );
  const [scopeHelps, setScopeHelps] = useState(
    "ideas, planning, coding, debugging, tech decisions, APIs, auth, testing"
  );
  const [scopeWontHelp, setScopeWontHelp] = useState(
    "sales, marketing, pricing, business strategy, post-launch growth"
  );
  const [businessRedirect, setBusinessRedirect] = useState(
    "This challenge focuses on building. For business strategy, see Matt's mentorship: https://mattwebley.com/workwithmatt"
  );
  const [coreRules, setCoreRules] = useState(
    "1. Reference their idea/features when relevant\n2. ONE clear next step when stuck\n3. Keep them on their current day's task"
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
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

  // Day completion stats
  const { data: adminData } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
  });

  const stats = adminData || { totalUsers: 0, dayCompletions: {} };

  return (
    <div className="space-y-8">
      {/* Diagnostics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Diagnostics</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDiagnostics()}
            disabled={diagnosticsLoading}
          >
            {diagnosticsLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Server Time</p>
              <p className="font-medium text-slate-900">{diagnostics?.serverTime || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-500">Host</p>
              <p className="font-medium text-slate-900">{diagnostics?.host || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-500">Environment</p>
              <p className="font-medium text-slate-900">{diagnostics?.nodeEnv || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-500">DATABASE_URL</p>
              <p className="font-medium text-slate-900">
                {diagnostics?.databaseUrlSet ? "Set" : "Missing"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">STRIPE_WEBHOOK_SECRET</p>
              <p className="font-medium text-slate-900">
                {diagnostics?.stripeWebhookSecretSet ? "Set" : "Missing"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Last Webhook</p>
              <p className="font-medium text-slate-900">
                {diagnostics?.lastActivity?.webhookAt
                  ? formatDistanceToNow(new Date(diagnostics.lastActivity.webhookAt), { addSuffix: true })
                  : "Never"}
              </p>
              {diagnostics?.lastActivity?.webhookType && (
                <p className="text-xs text-slate-500">{diagnostics.lastActivity.webhookType}</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-slate-500">Users</p>
              <p className="text-lg font-bold text-slate-900">{diagnostics?.counts?.users ?? 0}</p>
              <p className="text-xs text-slate-500">
                Last created{" "}
                {diagnostics?.lastActivity?.userCreatedAt
                  ? formatDistanceToNow(new Date(diagnostics.lastActivity.userCreatedAt), { addSuffix: true })
                  : "Never"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-slate-500">Pending Purchases</p>
              <p className="text-lg font-bold text-slate-900">
                {diagnostics?.counts?.pendingPurchases ?? 0}
              </p>
              <p className="text-xs text-slate-500">
                Last purchase{" "}
                {diagnostics?.lastActivity?.pendingPurchaseAt
                  ? formatDistanceToNow(new Date(diagnostics.lastActivity.pendingPurchaseAt), { addSuffix: true })
                  : "Never"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-slate-500">Coaching Purchases</p>
              <p className="text-lg font-bold text-slate-900">
                {diagnostics?.counts?.coachingPurchases ?? 0}
              </p>
              <p className="text-xs text-slate-500">
                Last purchase{" "}
                {diagnostics?.lastActivity?.coachingPurchaseAt
                  ? formatDistanceToNow(new Date(diagnostics.lastActivity.coachingPurchaseAt), { addSuffix: true })
                  : "Never"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Brand Pack */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Brand Pack</h2>
        </div>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={brand.appName}
                onChange={(e) => setBrand({ ...brand, appName: e.target.value })}
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
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input
                id="logoUrl"
                value={brand.logoUrl || ""}
                onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })}
                placeholder="https://..."
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
            >
              <Save className="w-4 h-4" />
              {saveBrandSettings.isPending ? "Saving..." : "Save Brand Settings"}
            </Button>
          </div>
        </Card>
      </div>

      {/* AI Mentor Management */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">AI Mentor Management</h2>
          {flaggedMessages.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {flaggedMessages.length} flagged
            </span>
          )}
        </div>

        {/* Chatbot Rules Editor */}
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Chatbot System Prompt</h3>
            <span className="text-xs bg-slate-100 text-primary px-2 py-0.5 rounded">Editable</span>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-slate-900 mb-2 block">Response Style</Label>
              <p className="text-xs text-slate-500 mb-2">
                How the AI should format and deliver responses
              </p>
              <textarea
                value={responseStyle}
                onChange={(e) => setResponseStyle(e.target.value)}
                className="w-full h-28 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
              />
            </div>

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

            <div>
              <Label className="text-sm font-medium text-slate-900 mb-2 block">
                Business Question Redirect
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Message shown when users ask about sales/marketing/business
              </p>
              <textarea
                value={businessRedirect}
                onChange={(e) => setBusinessRedirect(e.target.value)}
                className="w-full h-16 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-900 mb-2 block">Core Rules</Label>
              <p className="text-xs text-slate-500 mb-2">Main behavior rules for the AI</p>
              <textarea
                value={coreRules}
                onChange={(e) => setCoreRules(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-900 mb-2 block">
                Additional Custom Rules
              </Label>
              <p className="text-xs text-slate-500 mb-2">Extra rules appended to the system prompt</p>
              <textarea
                value={chatbotRules}
                onChange={(e) => setChatbotRules(e.target.value)}
                placeholder={
                  "Example:\n- Always recommend booking a call for complex business questions\n- Never discuss competitor products by name"
                }
                className="w-full h-24 p-3 rounded-lg border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                onClick={() =>
                  saveChatbotSettings.mutate({
                    customRules: chatbotRules,
                    responseStyle,
                    scopeHelps,
                    scopeWontHelp,
                    businessRedirect,
                    coreRules,
                  })
                }
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
        <Card id="admin-flagged" className={`p-6 border border-slate-200 shadow-sm scroll-mt-4 ${flaggedMessages.length > 0 ? "border-l-4 border-l-red-500" : ""}`}>
          <div className="flex items-center gap-2 mb-4">
            <Flag className={`w-5 h-5 ${flaggedMessages.length > 0 ? "text-red-500" : "text-primary"}`} />
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
                <div key={msg.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
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
                      <div className="flex items-center gap-1 text-xs text-slate-600">
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
        <Card className="p-6 border border-slate-200 shadow-sm">
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
                  onClick={() =>
                    setSelectedUserId(selectedUserId === summary.userId ? null : summary.userId)
                  }
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
                      <p className="text-sm font-medium text-slate-900">
                        {summary.messageCount} messages
                      </p>
                      {summary.flaggedCount > 0 && (
                        <p className="text-xs text-slate-600">{summary.flaggedCount} flagged</p>
                      )}
                    </div>
                  </div>

                  {selectedUserId === summary.userId && userChatHistory.length > 0 && (
                    <div
                      className="mt-3 pt-3 border-t border-slate-200 space-y-2 max-h-64 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                                {msg.role === "user" ? "User" : "AI"} ·{" "}
                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                {msg.flagged && <span className="text-red-500 ml-2">· Flagged</span>}
                              </p>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            {msg.role === "user" && !msg.flagged && (
                              <button
                                onClick={() =>
                                  flagMessage.mutate({ id: msg.id, reason: "Manual flag by admin" })
                                }
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

      {/* Day Completion Heatmap (fixed: 22 squares for Day 0-21) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Day-by-Day Completion</h2>
        </div>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
            {Array.from({ length: 22 }, (_, i) => {
              const dayNum = i;
              const completions = stats.dayCompletions?.[dayNum] || 0;
              const percentage = stats.totalUsers > 0 ? (completions / stats.totalUsers) * 100 : 0;
              return (
                <div
                  key={dayNum}
                  className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  style={{
                    backgroundColor:
                      percentage > 0
                        ? `rgba(59, 130, 246, ${Math.min(percentage / 100 + 0.1, 1)})`
                        : "#f1f5f9",
                    color: percentage > 30 ? "white" : "#64748b",
                  }}
                  title={`Day ${dayNum}: ${completions} completions`}
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
  );
}
