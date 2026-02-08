import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getServerErrorMessage } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  Save,
  Pencil,
  Send,
  Eye,
  ToggleLeft,
  ToggleRight,
  MessageCircle,
  ScrollText,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Plus,
  X,
  Users,
  AlertTriangle,
  Zap,
  Play,
  Power,
  PowerOff,
  UserX,
  UserPlus,
  Heart,
  Info,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { EmailTemplate, EmailLog, DripEmail } from "./adminTypes";

// Sample values used to preview what an email will look like
const SAMPLE_VARIABLES: Record<string, string> = {
  firstName: "Sarah",
  userName: "Sarah Johnson",
  userEmail: "sarah@example.com",
  currencySymbol: "$",
  total: "24.75",
  amount: "149.00",
  currency: "USD",
  coachingType: "1:1 Coaching",
  testimonial: "This challenge completely changed how I build software. I went from zero to a working SaaS in 21 days!",
  videoUrl: "https://example.com/video",
  appName: "My SaaS App",
  appUrl: "https://example.com",
  day: "5",
  dayTitle: "Logo & Brand Identity",
  question: "How do I connect my Stripe account to accept payments?",
  answer: "Great question! Head to your Stripe dashboard and grab your API keys from the Developers section...",
  content: "Just finished Day 5 - my logo looks amazing! Really proud of how this is coming together.",
  answerUrl: "https://challenge.mattwebley.com/dashboard/5",
  salesPageUrl: "https://example.com/sales",
  productDescription: "An AI-powered project management tool for freelancers",
  targetAudience: "Freelance designers and developers",
  specificQuestions: "Is my headline compelling enough? Does the pricing section make sense?",
  preferredEmail: "sarah@example.com",
  referrerName: "Sarah Johnson",
  referrerEmail: "sarah@example.com",
  newUserName: "Alex Smith",
  newUserEmail: "alex@example.com",
  referralCount: "3",
  timestamp: new Date().toLocaleString(),
  DASHBOARD_URL: "https://challenge.mattwebley.com/dashboard",
  UNLOCK_URL: "https://challenge.mattwebley.com/unlock",
  READINESS_CALL_URL: "https://challenge.mattwebley.com/coaching",
};

function renderPreview(text: string): string {
  let result = text;
  for (const [key, value] of Object.entries(SAMPLE_VARIABLES)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

export default function AdminEmails() {
  const queryClient = useQueryClient();

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<string | null>(null);
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

  // Drip sequence state
  const [editingDrip, setEditingDrip] = useState<number | null>(null);
  const [previewingDrip, setPreviewingDrip] = useState<number | null>(null);
  const [editedDripSubject, setEditedDripSubject] = useState("");
  const [editedDripAltSubject, setEditedDripAltSubject] = useState("");
  const [editedDripBody, setEditedDripBody] = useState("");

  const [logPage, setLogPage] = useState(1);
  const [showNewForm, setShowNewForm] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<string | null>(null);
  const [sendSegment, setSendSegment] = useState("paid");
  const [confirmSend, setConfirmSend] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    templateKey: "",
    name: "",
    subject: "",
    body: "",
    description: "",
    variables: "",
  });

  const { data: emailTemplates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
  });

  const { data: emailLogs = [], isLoading: logsLoading } = useQuery<EmailLog[]>({
    queryKey: ["/api/admin/email-logs", logPage],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/email-logs?page=${logPage}&limit=50`);
      return res.json();
    },
    staleTime: 30_000,
  });

  // Drip email queries
  const { data: dripEmails = [] } = useQuery<DripEmail[]>({
    queryKey: ["/api/admin/drip-emails"],
  });

  const updateDripEmail = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; subject?: string; altSubject?: string; body?: string; isActive?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/drip-emails/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drip-emails"] });
      toast.success("Drip email updated");
      setEditingDrip(null);
    },
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to update drip email"));
    },
  });

  const toggleAllDrip = useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await apiRequest("POST", "/api/admin/drip-emails/toggle-all", { isActive });
      return res.json();
    },
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drip-emails"] });
      toast.success(isActive ? "All drip emails enabled" : "All drip emails disabled");
    },
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to toggle drip emails"));
    },
  });

  const processDrip = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/drip-emails/process");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drip-emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-logs"] });
      toast.success(data.message || "Drip emails processed");
    },
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to process drip emails"));
    },
  });

  const sendTestDrip = useMutation({
    mutationFn: async ({ id, testEmail }: { id: number; testEmail: string }) => {
      const res = await apiRequest("POST", `/api/admin/drip-emails/${id}/test`, { testEmail });
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Test drip email sent");
    },
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to send test drip email"));
    },
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
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to update email template"));
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
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to send test email"));
    },
  });

  const createEmailTemplate = useMutation({
    mutationFn: async (data: typeof newTemplate) => {
      const res = await apiRequest("POST", "/api/admin/email-templates", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast.success("Email template created");
      setShowNewForm(false);
      setNewTemplate({ templateKey: "", name: "", subject: "", body: "", description: "", variables: "" });
    },
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to create email template"));
    },
  });

  const sendBroadcast = useMutation({
    mutationFn: async ({ subject, body, segment }: { subject: string; body: string; segment: string }) => {
      const res = await apiRequest("POST", "/api/admin/broadcast/send", { subject, body, segment });
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Sent to ${data.sent} of ${data.total} users`);
      setSendingTemplate(null);
      setConfirmSend(false);
      // Refresh logs so the new sends show up
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-logs"] });
    },
    onError: (error: Error) => {
      toast.error(getServerErrorMessage(error, "Failed to send emails"));
      setConfirmSend(false);
    },
  });

  // Reusable card renderer for all drip/nag/initial email types
  const colorMap: Record<string, { active: string; badge: string; toggle: string }> = {
    amber: { active: "border-slate-200", badge: "bg-amber-100 text-amber-700", toggle: "text-primary" },
    blue: { active: "border-blue-200", badge: "bg-blue-100 text-blue-700", toggle: "text-blue-500" },
    orange: { active: "border-orange-200", badge: "bg-orange-100 text-orange-700", toggle: "text-orange-500" },
    slate: { active: "border-slate-200", badge: "bg-slate-200 text-slate-600", toggle: "text-slate-500" },
    emerald: { active: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", toggle: "text-emerald-500" },
    teal: { active: "border-teal-200", badge: "bg-teal-100 text-teal-700", toggle: "text-teal-500" },
  };

  function renderDripCard(drip: DripEmail, color: string, triggerLabel: string) {
    const c = colorMap[color] || colorMap.amber;
    return (
      <Card
        key={drip.id}
        className={`p-3 border-2 shadow-none ${drip.isActive ? c.active : "border-slate-200 bg-slate-50/50"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              drip.isActive ? c.badge : "bg-slate-100 text-slate-400"
            }`}>
              {drip.emailType === 'nag' || drip.emailType === 'initial' ? drip.nagLevel || drip.emailNumber : drip.emailType === 'milestone' ? `D${drip.dayTrigger}` : drip.emailType === 'welcome_back' ? '↩' : drip.emailNumber}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded flex-shrink-0 ${
                  drip.isActive ? c.badge : "bg-slate-100 text-slate-400"
                }`}>
                  {triggerLabel}
                </span>
                <p className={`text-sm font-medium truncate ${drip.isActive ? "text-slate-900" : "text-slate-500"}`}>
                  {drip.subject}
                </p>
                {!drip.isActive && (
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded flex-shrink-0">OFF</span>
                )}
              </div>
              <p className="text-xs text-slate-600">{drip.sentCount || 0} sent</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Preview"
              onClick={() => { setPreviewingDrip(previewingDrip === drip.id ? null : drip.id); setEditingDrip(null); }}>
              <Eye className={`w-4 h-4 ${previewingDrip === drip.id ? "text-primary" : ""}`} />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title={drip.isActive ? "Disable" : "Enable"}
              onClick={() => updateDripEmail.mutate({ id: drip.id, isActive: !drip.isActive })}>
              {drip.isActive ? <ToggleRight className={`w-4 h-4 ${c.toggle}`} /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit"
              onClick={() => {
                if (editingDrip === drip.id) { setEditingDrip(null); }
                else { setEditingDrip(drip.id); setEditedDripSubject(drip.subject); setEditedDripAltSubject(drip.altSubject || ""); setEditedDripBody(drip.body); setPreviewingDrip(null); }
              }}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
              title={testEmailAddress ? `Send test to ${testEmailAddress}` : "Set test email first"}
              onClick={() => { if (!testEmailAddress) { toast.error("Set a test email address above first"); return; } sendTestDrip.mutate({ id: drip.id, testEmail: testEmailAddress }); }}
              disabled={sendTestDrip.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {editingDrip === drip.id && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
            <div>
              <Label className="text-slate-700">Subject</Label>
              <Input value={editedDripSubject} onChange={(e) => setEditedDripSubject(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-slate-700">Alt Subject</Label>
              <Input value={editedDripAltSubject} onChange={(e) => setEditedDripAltSubject(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-slate-700">Body ({"{{firstName}}, {{DASHBOARD_URL}}, {{UNLOCK_URL}}, {{READINESS_CALL_URL}}"})</Label>
              <Textarea value={editedDripBody} onChange={(e) => setEditedDripBody(e.target.value)} className="mt-1 font-mono text-sm min-h-[250px]" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => updateDripEmail.mutate({ id: drip.id, subject: editedDripSubject, altSubject: editedDripAltSubject, body: editedDripBody })} disabled={updateDripEmail.isPending}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingDrip(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  const SEGMENTS = [
    { value: "paid", label: "All Customers", desc: "Everyone who purchased the challenge" },
    { value: "active", label: "Active", desc: "Active in the last 7 days" },
    { value: "inactive", label: "Inactive", desc: "No activity for 7+ days" },
    { value: "stuck", label: "Stuck", desc: "Started but inactive 7+ days" },
    { value: "all", label: "All Users", desc: "Everyone including non-paying" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Email Templates</h2>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            {emailTemplates.length} templates
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => setShowNewForm(!showNewForm)}
          variant={showNewForm ? "outline" : "default"}
        >
          {showNewForm ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              New Template
            </>
          )}
        </Button>
      </div>

      {/* New Template Form */}
      {showNewForm && (
        <Card className="p-5 border-2 border-primary/30 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Create New Email Template</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-slate-700">Template Key</Label>
              <Input
                placeholder="e.g. welcome_email"
                value={newTemplate.templateKey}
                onChange={(e) => setNewTemplate({ ...newTemplate, templateKey: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-slate-600 mt-1">Unique identifier (lowercase, underscores)</p>
            </div>
            <div>
              <Label className="text-slate-700">Display Name</Label>
              <Input
                placeholder="e.g. Welcome Email"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-slate-700">Description</Label>
            <Input
              placeholder="When is this email sent?"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="mb-4">
            <Label className="text-slate-700">Variables (comma-separated)</Label>
            <Input
              placeholder="e.g. firstName, total, currencySymbol"
              value={newTemplate.variables}
              onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-slate-600 mt-1">{"Use {{variableName}} in subject and body to insert dynamic values"}</p>
          </div>
          <div className="mb-4">
            <Label className="text-slate-700">Subject</Label>
            <Input
              placeholder="Email subject line"
              value={newTemplate.subject}
              onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="mb-4">
            <Label className="text-slate-700">Body</Label>
            <Textarea
              placeholder="Email body text..."
              value={newTemplate.body}
              onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
              className="mt-1 font-mono text-sm min-h-[200px]"
            />
          </div>
          <Button
            onClick={() => {
              if (!newTemplate.templateKey || !newTemplate.name || !newTemplate.subject || !newTemplate.body) {
                toast.error("Fill in template key, name, subject, and body");
                return;
              }
              createEmailTemplate.mutate(newTemplate);
            }}
            disabled={createEmailTemplate.isPending}
          >
            <Save className="w-4 h-4 mr-1" />
            Create Template
          </Button>
        </Card>
      )}

      {/* Test Email Address Config */}
      <Card className="p-4 border-2 border-slate-200 shadow-none bg-slate-50">
        <div className="flex items-center gap-3">
          <Label className="text-slate-700 font-medium whitespace-nowrap">Test Email Address:</Label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            className="flex-1 max-w-xs"
          />
          <span className="text-slate-600">All test emails will be sent here</span>
        </div>
      </Card>

      {/* ============================================ */}
      {/* AUTOMATED EMAIL CAMPAIGNS */}
      {/* ============================================ */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Automated Email Campaigns</h2>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              {dripEmails.filter(d => d.isActive).length}/{dripEmails.length} active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => processDrip.mutate()}
              disabled={processDrip.isPending}
              title="Manually process drip emails now"
            >
              <Play className="w-4 h-4 mr-1" />
              {processDrip.isPending ? "Processing..." : "Run Now"}
            </Button>
            {dripEmails.some(d => d.isActive) ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleAllDrip.mutate(false)}
                disabled={toggleAllDrip.isPending}
              >
                <PowerOff className="w-4 h-4 mr-1" />
                Disable All
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => toggleAllDrip.mutate(true)}
                disabled={toggleAllDrip.isPending}
              >
                <Power className="w-4 h-4 mr-1" />
                Enable All
              </Button>
            )}
          </div>
        </div>

        {/* How it works overview */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-slate-700 space-y-2">
              <p className="font-medium text-slate-900">How the email system works</p>
              <p>The system checks every hour and sends emails based on each customer's situation. There are 6 campaigns that work together:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Initial Engagement</strong> — paid but never started</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Daily Challenge</strong> — sent as user completes each day</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Milestone Celebrations</strong> — key achievements</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Personal Re-engagement</strong> — started but stalled</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                  <span><strong>Gentle Nudges</strong> — repeat stalls (ongoing)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Welcome Back</strong> — returned after being nagged</span>
                </div>
              </div>
              <p className="text-slate-600">All campaigns skip banned users, unsubscribed users, and users without an email address. Every email includes an unsubscribe link.</p>
            </div>
          </div>
        </div>

        {dripEmails.length === 0 ? (
          <Card className="p-6 border-2 border-slate-200 shadow-none text-center">
            <p className="text-slate-600">No drip emails found. They'll be seeded on next server restart.</p>
          </Card>
        ) : (
          <>
            {/* ---- CAMPAIGN 1: INITIAL ENGAGEMENT ---- */}
            {dripEmails.some(d => d.emailType === 'initial') && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-slate-900">Initial Engagement</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {dripEmails.filter(d => d.emailType === 'initial' && d.isActive).length}/{dripEmails.filter(d => d.emailType === 'initial').length} active
                  </span>
                </div>
                <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg mb-3">
                  <p className="text-blue-900">
                    <strong>Who:</strong> Customers who paid but have never completed Day 0.
                    <br />
                    <strong>When:</strong> Based on days since signup (1, 3, and 7 days).
                    <br />
                    <strong>Repeats?</strong> No — one-time only. Once they complete Day 0, these stop permanently and the Daily Challenge emails take over.
                  </p>
                </div>
                <div className="space-y-2">
                  {dripEmails.filter(d => d.emailType === 'initial').map((drip) => renderDripCard(drip, "blue", `+${drip.dayTrigger}d after signup`))}
                </div>
              </div>
            )}

            {/* ---- CAMPAIGN 2: DAILY CHALLENGE EMAILS ---- */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900">Daily Challenge Emails</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  {dripEmails.filter(d => !d.emailType || d.emailType === 'drip').filter(d => d.isActive).length}/{dripEmails.filter(d => !d.emailType || d.emailType === 'drip').length} active
                </span>
              </div>
              <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg mb-3">
                <p className="text-amber-900">
                  <strong>Who:</strong> Active customers who are progressing through the challenge.
                  <br />
                  <strong>When:</strong> Progress-based. Sent when the user completes a day, motivating them to do the NEXT one. Works at any pace (fast or slow).
                  <br />
                  <strong>Skips if:</strong> The user already completed that day, or hasn't done the day before it. Post-completion emails (Days 22+) are calendar-spaced after finishing.
                </p>
              </div>
              <div className="space-y-2">
                {dripEmails.filter(d => !d.emailType || d.emailType === 'drip').map((drip) => renderDripCard(drip, "amber", `Day ${drip.dayTrigger}`))}
              </div>
            </div>

            {/* ---- CAMPAIGN 3: PERSONAL RE-ENGAGEMENT ---- */}
            {dripEmails.some(d => d.emailType === 'nag' && (d.nagLevel || 0) <= 3) && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <UserX className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-slate-900">Personal Re-engagement</h3>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                    {dripEmails.filter(d => d.emailType === 'nag' && (d.nagLevel || 0) <= 3 && d.isActive).length}/{dripEmails.filter(d => d.emailType === 'nag' && (d.nagLevel || 0) <= 3).length} active
                  </span>
                </div>
                <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-lg mb-3">
                  <p className="text-orange-900">
                    <strong>Who:</strong> Users who completed at least Day 0 but then stopped progressing. Does NOT go to people who never started.
                    <br />
                    <strong>When:</strong> Based on days of inactivity (1, 3, and 6 days with no activity).
                    <br />
                    <strong>Repeats?</strong> No — this personal sequence plays ONCE ever. After they've received all 3, it never sends again. If they stall again in the future, they get the Gentle Nudges instead.
                  </p>
                </div>
                <div className="space-y-2">
                  {dripEmails.filter(d => d.emailType === 'nag' && (d.nagLevel || 0) <= 3).map((drip) => renderDripCard(drip, "orange", `+${drip.dayTrigger}d inactive`))}
                </div>
              </div>
            )}

            {/* ---- CAMPAIGN 4: GENTLE NUDGES ---- */}
            {dripEmails.some(d => d.emailType === 'nag' && (d.nagLevel || 0) > 3) && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-900">Gentle Nudges</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                    {dripEmails.filter(d => d.emailType === 'nag' && (d.nagLevel || 0) > 3 && d.isActive).length}/{dripEmails.filter(d => d.emailType === 'nag' && (d.nagLevel || 0) > 3).length} active
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-lg mb-3">
                  <p className="text-slate-700">
                    <strong>Who:</strong> Users who've already been through the Personal Re-engagement sequence above, and have gone inactive again.
                    <br />
                    <strong>When:</strong> Based on days of inactivity (2 and 7 days).
                    <br />
                    <strong>Repeats?</strong> Yes — these are short and non-personal, so they reset each time the user comes back and stalls again. Designed to never feel annoying.
                  </p>
                </div>
                <div className="space-y-2">
                  {dripEmails.filter(d => d.emailType === 'nag' && (d.nagLevel || 0) > 3).map((drip) => renderDripCard(drip, "slate", `+${drip.dayTrigger}d inactive`))}
                </div>
              </div>
            )}

            {/* ---- CAMPAIGN 5: MILESTONE CELEBRATIONS ---- */}
            {dripEmails.some(d => d.emailType === 'milestone') && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-900">Milestone Celebrations</h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    {dripEmails.filter(d => d.emailType === 'milestone' && d.isActive).length}/{dripEmails.filter(d => d.emailType === 'milestone').length} active
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg mb-3">
                  <p className="text-emerald-900">
                    <strong>Who:</strong> All active customers, as they hit key achievements.
                    <br />
                    <strong>When:</strong> Fires once when the user completes a milestone day (planning done, build phase, mid-build, launch phase, challenge complete).
                    <br />
                    <strong>Repeats?</strong> No — one-time per milestone.
                  </p>
                </div>
                <div className="space-y-2">
                  {dripEmails.filter(d => d.emailType === 'milestone').map((drip) => renderDripCard(drip, "emerald", `Completed Day ${drip.dayTrigger}`))}
                </div>
              </div>
            )}

            {/* ---- CAMPAIGN 6: WELCOME BACK ---- */}
            {dripEmails.some(d => d.emailType === 'welcome_back') && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-5 h-5 text-teal-500" />
                  <h3 className="text-lg font-bold text-slate-900">Welcome Back</h3>
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                    {dripEmails.filter(d => d.emailType === 'welcome_back' && d.isActive).length}/{dripEmails.filter(d => d.emailType === 'welcome_back').length} active
                  </span>
                </div>
                <div className="p-3 bg-teal-50 border-2 border-teal-200 rounded-lg mb-3">
                  <p className="text-teal-900">
                    <strong>Who:</strong> Users who went inactive, received re-engagement or nudge emails, and then came back.
                    <br />
                    <strong>When:</strong> Fires when the user becomes active again after being nagged.
                    <br />
                    <strong>Repeats?</strong> Yes — sends once per inactive/active cycle. Each time they come back after a nag, they get a fresh welcome back.
                  </p>
                </div>
                <div className="space-y-2">
                  {dripEmails.filter(d => d.emailType === 'welcome_back').map((drip) => renderDripCard(drip, "teal", "On return"))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* REGULAR EMAIL TEMPLATES */}
      {/* ============================================ */}

      {/* Templates */}
      {emailTemplates.length === 0 ? (
        <Card className="p-8 border-2 border-slate-200 shadow-none text-center">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">
            No email templates found. Run the seed script to create default templates.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {emailTemplates.map((template) => (
            <Card
              key={template.templateKey}
              className={`p-4 border-2 shadow-none ${
                template.isActive ? "border-slate-200" : "border-slate-200 bg-slate-50 opacity-75"
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
                  <p className="text-slate-700 mt-1">{template.description}</p>
                  {template.variables && (
                    <p className="text-sm text-slate-600 mt-1">
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
                    title="Preview email"
                    onClick={() => {
                      setPreviewingTemplate(
                        previewingTemplate === template.templateKey ? null : template.templateKey
                      );
                      setEditingTemplate(null);
                    }}
                  >
                    <Eye className={`w-4 h-4 ${previewingTemplate === template.templateKey ? "text-primary" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Toggle enabled/disabled"
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
                    title="Edit template"
                    onClick={() => {
                      if (editingTemplate === template.templateKey) {
                        setEditingTemplate(null);
                      } else {
                        setEditingTemplate(template.templateKey);
                        setEditedSubject(template.subject);
                        setEditedBody(template.body);
                        setPreviewingTemplate(null);
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
                  <Button
                    size="sm"
                    variant={sendingTemplate === template.templateKey ? "default" : "outline"}
                    title="Send to customers"
                    onClick={() => {
                      if (sendingTemplate === template.templateKey) {
                        setSendingTemplate(null);
                        setConfirmSend(false);
                      } else {
                        setSendingTemplate(template.templateKey);
                        setEditingTemplate(null);
                        setPreviewingTemplate(null);
                        setConfirmSend(false);
                        setSendSegment("paid");
                      }
                    }}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Edit panel */}
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

              {/* Send to Customers panel */}
              {sendingTemplate === template.templateKey && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-3">Send to Customers</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {SEGMENTS.map((seg) => (
                      <button
                        key={seg.value}
                        onClick={() => { setSendSegment(seg.value); setConfirmSend(false); }}
                        className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                          sendSegment === seg.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4">
                    {SEGMENTS.find(s => s.value === sendSegment)?.desc}
                    {" - "}
                    {"{{firstName}}"} will be replaced with each customer's name.
                  </p>

                  {!confirmSend ? (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => setConfirmSend(true)}
                        disabled={sendBroadcast.isPending}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send This Email
                      </Button>
                      <Button variant="outline" onClick={() => setSendingTemplate(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 mb-1">
                            Are you sure?
                          </p>
                          <p className="text-slate-700 mb-3">
                            This will send "{template.subject}" to all <strong>{sendSegment}</strong> users. This cannot be undone.
                          </p>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="destructive"
                              onClick={() => {
                                sendBroadcast.mutate({
                                  subject: template.subject,
                                  body: template.body,
                                  segment: sendSegment,
                                });
                              }}
                              disabled={sendBroadcast.isPending}
                            >
                              {sendBroadcast.isPending ? "Sending..." : "Yes, Send Now"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setConfirmSend(false)}
                              disabled={sendBroadcast.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Email Send Log */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <ScrollText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Email Send Log</h2>
        </div>

        {logsLoading ? (
          <Card className="p-8 border-2 border-slate-200 shadow-none text-center">
            <p className="text-slate-600">Loading email logs...</p>
          </Card>
        ) : emailLogs.length === 0 ? (
          <Card className="p-8 border-2 border-slate-200 shadow-none text-center">
            <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No emails sent yet. Logs will appear here as emails are sent.</p>
          </Card>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2 text-xs font-bold text-slate-700 uppercase">Recipient</th>
                    <th className="pb-2 text-xs font-bold text-slate-700 uppercase">Subject</th>
                    <th className="pb-2 text-xs font-bold text-slate-700 uppercase">Template</th>
                    <th className="pb-2 text-xs font-bold text-slate-700 uppercase">Status</th>
                    <th className="pb-2 text-xs font-bold text-slate-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4">
                        <div className="text-slate-900 font-medium">
                          {log.recipientName || "-"}
                        </div>
                        <div className="text-slate-600 text-sm">{log.recipientEmail}</div>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="py-2.5 pr-4">
                        {log.templateKey ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {log.templateKey}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {log.status === "sent" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full" title={log.error || undefined}>
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-sm text-slate-600 whitespace-nowrap">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-slate-700">
                Page {logPage}{emailLogs.length === 50 ? "+" : ""}
              </div>
              <div className="flex items-center gap-2">
                {logPage > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLogPage(logPage - 1)}
                  >
                    Previous
                  </Button>
                )}
                {emailLogs.length === 50 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLogPage(logPage + 1)}
                  >
                    <ChevronDown className="w-4 h-4 mr-1 rotate-[-90deg]" />
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Email Preview Modal */}
      {(() => {
        const previewDrip = previewingDrip ? dripEmails.find(d => d.id === previewingDrip) : null;
        const previewTemplate = previewingTemplate ? emailTemplates.find(t => t.templateKey === previewingTemplate) : null;
        const isOpen = !!(previewDrip || previewTemplate);
        const subject = previewDrip ? previewDrip.subject : previewTemplate?.subject || "";
        const altSubject = previewDrip?.altSubject;
        const body = previewDrip ? previewDrip.body : previewTemplate?.body || "";
        const name = previewDrip ? `Drip #${previewDrip.emailNumber}` : previewTemplate?.name || "";

        return (
          <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
              setPreviewingDrip(null);
              setPreviewingTemplate(null);
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{name} - Preview</DialogTitle>
                <DialogDescription>
                  Preview uses sample data - actual emails will use real customer details
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
                {/* Email header */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 space-y-1 sticky top-0">
                  {previewTemplate && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600 w-14">From:</span>
                        <span className="text-sm text-slate-700">Matt Webley &lt;matt@challenge.mattwebley.com&gt;</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600 w-14">To:</span>
                        <span className="text-sm text-slate-700">sarah@example.com</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 w-14">Subject:</span>
                    <span className="text-sm font-semibold text-slate-900">{renderPreview(subject)}</span>
                  </div>
                  {altSubject && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 w-14">Alt:</span>
                      <span className="text-sm text-slate-600">{renderPreview(altSubject)}</span>
                    </div>
                  )}
                </div>
                {/* Email body */}
                <div className="px-4 py-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                    {renderPreview(body)}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
