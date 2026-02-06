import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getServerErrorMessage } from "@/lib/queryClient";
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
} from "lucide-react";
import { toast } from "sonner";
import type { EmailTemplate, EmailLog } from "./adminTypes";

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
              <p className="text-xs text-slate-400 mt-1">Unique identifier (lowercase, underscores)</p>
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
            <p className="text-xs text-slate-400 mt-1">{"Use {{variableName}} in subject and body to insert dynamic values"}</p>
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

      {/* Templates */}
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

              {/* Preview panel */}
              {previewingTemplate === template.templateKey && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {/* Email header */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 w-14">From:</span>
                        <span className="text-sm text-slate-700">Matt Webley &lt;matt@challenge.mattwebley.com&gt;</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 w-14">To:</span>
                        <span className="text-sm text-slate-700">sarah@example.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 w-14">Subject:</span>
                        <span className="text-sm font-semibold text-slate-900">{renderPreview(template.subject)}</span>
                      </div>
                    </div>
                    {/* Email body */}
                    <div className="px-4 py-4">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                        {renderPreview(template.body)}
                      </pre>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Preview uses sample data — actual emails will use real customer details
                  </p>
                </div>
              )}

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
                  <p className="text-sm text-slate-500 mb-4">
                    {SEGMENTS.find(s => s.value === sendSegment)?.desc}
                    {" — "}
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
                          <p className="text-sm text-slate-700 mb-3">
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
          <Card className="p-8 border border-slate-200 text-center">
            <p className="text-slate-500">Loading email logs...</p>
          </Card>
        ) : emailLogs.length === 0 ? (
          <Card className="p-8 border border-slate-200 text-center">
            <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No emails sent yet. Logs will appear here as emails are sent.</p>
          </Card>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2 text-xs font-bold text-slate-500 uppercase">Recipient</th>
                    <th className="pb-2 text-xs font-bold text-slate-500 uppercase">Subject</th>
                    <th className="pb-2 text-xs font-bold text-slate-500 uppercase">Template</th>
                    <th className="pb-2 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="pb-2 text-xs font-bold text-slate-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4">
                        <div className="text-slate-900 text-sm font-medium">
                          {log.recipientName || "—"}
                        </div>
                        <div className="text-slate-500 text-xs">{log.recipientEmail}</div>
                      </td>
                      <td className="py-2.5 pr-4 text-sm text-slate-700 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="py-2.5 pr-4">
                        {log.templateKey ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {log.templateKey}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
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
                      <td className="py-2.5 text-xs text-slate-500 whitespace-nowrap">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-500">
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
    </div>
  );
}
