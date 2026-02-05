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
  Mail,
  BarChart3,
  Save,
  Flag,
  Eye,
  AlertTriangle,
  MessageCircle,
  Pencil,
  Send,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type {
  BrandSettings,
  ChatbotSettings,
  ChatMessage,
  UserChatSummary,
  EmailTemplate,
} from "./adminTypes";
import { FONT_OPTIONS } from "./adminTypes";

export default function AdminSettings() {
  const queryClient = useQueryClient();

  // Brand state
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

  // Email templates
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [testEmailAddress, setTestEmailAddress] = useState(() => {
    return localStorage.getItem("adminTestEmailAddress") || "";
  });

  useEffect(() => {
    if (testEmailAddress) {
      localStorage.setItem("adminTestEmailAddress", testEmailAddress);
    }
  }, [testEmailAddress]);

  const { data: emailTemplates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
  });

  const updateEmailTemplate = useMutation({
    mutationFn: async ({
      templateKey,
      subject,
      body,
      isActive,
    }: {
      templateKey: string;
      subject?: string;
      body?: string;
      isActive?: boolean;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/email-templates/${templateKey}`, {
        subject,
        body,
        isActive,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast.success("Email template updated");
      setEditingTemplate(null);
    },
    onError: () => {
      toast.error("Failed to update email template");
    },
  });

  const sendTestEmail = useMutation({
    mutationFn: async ({ templateKey, testEmail }: { templateKey: string; testEmail: string }) => {
      const res = await apiRequest("POST", `/api/admin/email-templates/${templateKey}/test`, {
        testEmail,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Test email sent");
    },
    onError: () => {
      toast.error("Failed to send test email");
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
        <Card className={`p-6 border border-slate-200 shadow-sm ${flaggedMessages.length > 0 ? "border-l-4 border-l-red-500" : ""}`}>
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

      {/* Email Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Email Templates</h2>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            {emailTemplates.length} templates
          </span>
        </div>

        {/* Test Email Address Config */}
        <Card className="p-4 border border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <Label className="text-slate-700 font-medium whitespace-nowrap">Test Email Address:</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm text-slate-500">All test emails will be sent here</span>
          </div>
        </Card>

        {emailTemplates.length === 0 ? (
          <Card className="p-8 border border-slate-200 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              No email templates found. Run the seed script to create default templates.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {emailTemplates.map((template) => (
              <Card
                key={template.templateKey}
                className={`p-4 border shadow-sm ${
                  template.isActive ? "border-slate-200" : "border-slate-300 bg-slate-50 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{template.name}</h3>
                      {!template.isActive && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                    {template.variables && (
                      <p className="text-xs text-slate-400 mt-1">
                        Variables:{" "}
                        {template.variables
                          .split(",")
                          .map((v) => `{{${v.trim()}}}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateEmailTemplate.mutate({
                          templateKey: template.templateKey,
                          isActive: !template.isActive,
                        });
                      }}
                    >
                      {template.isActive ? (
                        <ToggleRight className="w-4 h-4 text-primary" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingTemplate === template.templateKey) {
                          setEditingTemplate(null);
                        } else {
                          setEditingTemplate(template.templateKey);
                          setEditedSubject(template.subject);
                          setEditedBody(template.body);
                        }
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!testEmailAddress) {
                          toast.error("Set a test email address above first");
                          return;
                        }
                        sendTestEmail.mutate({
                          templateKey: template.templateKey,
                          testEmail: testEmailAddress,
                        });
                      }}
                      disabled={sendTestEmail.isPending}
                      title={
                        testEmailAddress
                          ? `Send test to ${testEmailAddress}`
                          : "Set test email address first"
                      }
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editingTemplate === template.templateKey && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Body (use {"{{variable}}"} for placeholders)</Label>
                      <Textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        className="mt-1 font-mono text-sm min-h-[300px]"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => {
                          updateEmailTemplate.mutate({
                            templateKey: template.templateKey,
                            subject: editedSubject,
                            body: editedBody,
                          });
                        }}
                        disabled={updateEmailTemplate.isPending}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                        Cancel
                      </Button>
                      <div className="flex-1" />
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Test email address"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          className="w-48"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!testEmailAddress) {
                              toast.error("Enter an email address first");
                              return;
                            }
                            sendTestEmail.mutate({
                              templateKey: template.templateKey,
                              testEmail: testEmailAddress,
                            });
                          }}
                          disabled={sendTestEmail.isPending}
                        >
                          Send Test
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
