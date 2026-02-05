import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Radio,
  Megaphone,
  FlaskConical,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Pencil,
  Sparkles,
  Send,
  Info,
  AlertCircle,
  CheckCircle,
  Gift,
  Eye,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import type { Announcement, AbTest, AdminUser } from "./adminTypes";

export default function AdminMarketing() {
  const queryClient = useQueryClient();

  // Broadcast state
  const [broadcastEmail, setBroadcastEmail] = useState({
    subject: "",
    body: "",
    segment: "all" as "all" | "paid" | "unpaid" | "active" | "inactive" | "stuck",
    testEmail: "",
  });

  // Announcement state
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "success" | "promo",
    targetSegment: "all",
    dismissible: true,
    linkUrl: "",
    linkText: "",
    expiresAt: "",
  });

  // A/B Testing state
  const DEFAULT_HEADLINE =
    "How Complete Beginners Are Using AI to Build Real, Working Software Products in 21 Days for Less Than $100...";
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newVariantA, setNewVariantA] = useState(DEFAULT_HEADLINE);
  const [newVariantB, setNewVariantB] = useState("");
  const [editingVariant, setEditingVariant] = useState<number | null>(null);
  const [editingHeadline, setEditingHeadline] = useState("");
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);

  // Data queries
  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: announcementsData = [], refetch: refetchAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const { data: abTests = [] } = useQuery<AbTest[]>({
    queryKey: ["/api/admin/ab/tests"],
  });

  // User segments for broadcast
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const userSegments = {
    all: adminUsers.length,
    paid: adminUsers.filter((u) => u.challengePurchased).length,
    unpaid: adminUsers.filter((u) => !u.challengePurchased).length,
    active: adminUsers.filter(
      (u) => u.stats.lastActivityDate && new Date(u.stats.lastActivityDate) > sevenDaysAgo
    ).length,
    inactive: adminUsers.filter(
      (u) => !u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo
    ).length,
    stuck: adminUsers.filter(
      (u) =>
        u.stats.lastCompletedDay > 0 &&
        u.stats.lastCompletedDay < 21 &&
        (!u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo)
    ).length,
  };

  // Broadcast mutations
  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: { subject: string; body: string; email: string }) => {
      const res = await fetch("/api/admin/broadcast/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send test email");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Test email sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: { subject: string; body: string; segment: string }) => {
      const res = await fetch("/api/admin/broadcast/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send broadcast");
      }
      return res.json();
    },
    onSuccess: (data: { sent: number }) => {
      toast.success(`Broadcast sent to ${data.sent} users`);
      setBroadcastEmail({ subject: "", body: "", segment: "all", testEmail: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Announcement mutations
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: typeof newAnnouncement) => {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          expiresAt: data.expiresAt || null,
          linkUrl: data.linkUrl || null,
          linkText: data.linkText || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create announcement");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Announcement created successfully");
      refetchAnnouncements();
      setShowCreateAnnouncement(false);
      setNewAnnouncement({
        title: "",
        message: "",
        type: "info",
        targetSegment: "all",
        dismissible: true,
        linkUrl: "",
        linkText: "",
        expiresAt: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Announcement> & { id: number }) => {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update announcement");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Announcement updated");
      refetchAnnouncements();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete announcement");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Announcement deleted");
      refetchAnnouncements();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // A/B Testing mutations
  const createAbTest = useMutation({
    mutationFn: async (data: { name: string; variants: { name: string; headline: string }[] }) => {
      const res = await apiRequest("POST", "/api/admin/ab/tests", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ab/tests"] });
      setIsCreatingTest(false);
      setNewTestName("");
      setNewVariantA(DEFAULT_HEADLINE);
      setNewVariantB("");
      setGeneratedHeadlines([]);
      toast.success("A/B test created!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create test");
    },
  });

  const generateHeadlines = async () => {
    setIsGeneratingHeadlines(true);
    try {
      const res = await apiRequest("POST", "/api/admin/ab/generate-headlines", {
        currentHeadline: newVariantA,
      });
      const data = await res.json();
      if (data.headlines && Array.isArray(data.headlines) && data.headlines.length > 0) {
        setGeneratedHeadlines(data.headlines);
        toast.success("Generated 5 headline alternatives!");
      } else if (data.message) {
        toast.error(data.message);
      } else {
        toast.error("No headlines were generated. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate headlines");
    } finally {
      setIsGeneratingHeadlines(false);
    }
  };

  const toggleAbTest = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/ab/tests/${id}`, { isActive });
      return res.json();
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ab/tests"] });
      toast.success(isActive ? "Test activated!" : "Test paused");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle test");
    },
  });

  const deleteAbTest = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/ab/tests/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ab/tests"] });
      toast.success("Test deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete test");
    },
  });

  const resetAbTestStats = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/ab/tests/${id}/reset`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ab/tests"] });
      toast.success("Stats reset to zero");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset stats");
    },
  });

  const updateVariant = useMutation({
    mutationFn: async ({ id, headline }: { id: number; headline: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/ab/variants/${id}`, { headline });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ab/tests"] });
      setEditingVariant(null);
      setEditingHeadline("");
      toast.success("Headline updated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update headline");
    },
  });

  return (
    <div className="space-y-8">
      {/* Broadcast Email */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Broadcast Email</h2>
        </div>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="space-y-4">
            {/* Segment Selection */}
            <div>
              <Label className="mb-2 block">Target Segment</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All Users", count: userSegments.all },
                  { value: "paid", label: "Paid", count: userSegments.paid },
                  { value: "unpaid", label: "Unpaid", count: userSegments.unpaid },
                  { value: "active", label: "Active (7d)", count: userSegments.active },
                  { value: "inactive", label: "Inactive", count: userSegments.inactive },
                  { value: "stuck", label: "Stuck", count: userSegments.stuck },
                ].map((seg) => (
                  <button
                    key={seg.value}
                    onClick={() =>
                      setBroadcastEmail({
                        ...broadcastEmail,
                        segment: seg.value as typeof broadcastEmail.segment,
                      })
                    }
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      broadcastEmail.segment === seg.value
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {seg.label} ({seg.count})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Your subject line..."
                value={broadcastEmail.subject}
                onChange={(e) => setBroadcastEmail({ ...broadcastEmail, subject: e.target.value })}
              />
              <p className="text-xs text-slate-400 mt-1">Use {"{{firstName}}"} for personalization</p>
            </div>

            <div>
              <Label>Message Body</Label>
              <Textarea
                placeholder="Write your email message here..."
                value={broadcastEmail.body}
                onChange={(e) => setBroadcastEmail({ ...broadcastEmail, body: e.target.value })}
                className="min-h-[200px]"
              />
            </div>

            {/* Test Email */}
            <div className="flex items-end gap-2 pt-4 border-t border-slate-100">
              <div className="flex-1">
                <Label>Send Test Email To</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={broadcastEmail.testEmail}
                  onChange={(e) => setBroadcastEmail({ ...broadcastEmail, testEmail: e.target.value })}
                />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  sendTestEmailMutation.mutate({
                    subject: broadcastEmail.subject,
                    body: broadcastEmail.body,
                    email: broadcastEmail.testEmail,
                  })
                }
                disabled={
                  !broadcastEmail.subject ||
                  !broadcastEmail.body ||
                  !broadcastEmail.testEmail ||
                  sendTestEmailMutation.isPending
                }
              >
                {sendTestEmailMutation.isPending ? "Sending..." : "Send Test"}
              </Button>
            </div>

            {/* Send Broadcast Button */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                className="w-full gap-2"
                onClick={() => {
                  const count = userSegments[broadcastEmail.segment as keyof typeof userSegments] || 0;
                  if (
                    confirm(
                      `Send this email to ${count} users in the "${broadcastEmail.segment}" segment?`
                    )
                  ) {
                    sendBroadcastMutation.mutate({
                      subject: broadcastEmail.subject,
                      body: broadcastEmail.body,
                      segment: broadcastEmail.segment,
                    });
                  }
                }}
                disabled={
                  !broadcastEmail.subject || !broadcastEmail.body || sendBroadcastMutation.isPending
                }
              >
                <Send className="w-4 h-4" />
                {sendBroadcastMutation.isPending
                  ? "Sending..."
                  : `Send to ${userSegments[broadcastEmail.segment as keyof typeof userSegments] || 0} Users`}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Announcements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">In-App Announcements</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {announcementsData.filter((a) => a.isActive).length} active
            </span>
          </div>
          <Button onClick={() => setShowCreateAnnouncement(!showCreateAnnouncement)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Announcement
          </Button>
        </div>

        {/* Create Announcement Form */}
        {showCreateAnnouncement && (
          <Card className="p-6 border border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-4">Create New Announcement</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Announcement title..."
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    value={newAnnouncement.type}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        type: e.target.value as typeof newAnnouncement.type,
                      })
                    }
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="success">Success (Green)</option>
                    <option value="promo">Promo (Purple)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  placeholder="Announcement message..."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  className="bg-white min-h-[100px]"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Target Segment</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    value={newAnnouncement.targetSegment}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, targetSegment: e.target.value })
                    }
                  >
                    <option value="all">All Users</option>
                    <option value="paid">Paid Only</option>
                    <option value="unpaid">Unpaid Only</option>
                  </select>
                </div>
                <div>
                  <Label>Expires (optional)</Label>
                  <Input
                    type="date"
                    value={newAnnouncement.expiresAt}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAnnouncement.dismissible}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, dismissible: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">Dismissible</span>
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Link (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={newAnnouncement.linkUrl}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, linkUrl: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label>CTA Text</Label>
                  <Input
                    placeholder="Learn more"
                    value={newAnnouncement.linkText}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, linkText: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => createAnnouncementMutation.mutate(newAnnouncement)}
                  disabled={
                    !newAnnouncement.title ||
                    !newAnnouncement.message ||
                    createAnnouncementMutation.isPending
                  }
                >
                  {createAnnouncementMutation.isPending ? "Creating..." : "Create Announcement"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateAnnouncement(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Announcements List */}
        <Card className="border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {announcementsData.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No announcements created yet</p>
              </div>
            ) : (
              announcementsData.map((announcement) => (
                <div key={announcement.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        announcement.type === "info" ? "bg-blue-100" :
                        announcement.type === "warning" ? "bg-amber-100" :
                        announcement.type === "success" ? "bg-green-100" :
                        "bg-purple-100"
                      }`}>
                        {announcement.type === "info" ? (
                          <Info className="w-5 h-5 text-blue-600" />
                        ) : announcement.type === "warning" ? (
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        ) : announcement.type === "success" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Gift className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{announcement.title}</span>
                          {!announcement.isActive && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {announcement.message}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {announcement.targetSegment}
                          </span>
                          {announcement.expiresAt && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              Expires {new Date(announcement.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateAnnouncementMutation.mutate({
                            id: announcement.id,
                            isActive: !announcement.isActive,
                          })
                        }
                      >
                        {announcement.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Delete announcement "${announcement.title}"?`)) {
                            deleteAnnouncementMutation.mutate(announcement.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* A/B Testing */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">A/B Headline Testing</h2>
          {abTests.some((t) => t.isActive) && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              Test Running
            </span>
          )}
        </div>

        {/* Create New Test */}
        {!isCreatingTest ? (
          <Button
            variant="outline"
            onClick={() => setIsCreatingTest(true)}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Headline Test
          </Button>
        ) : (
          <Card className="p-4 border border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-4">New Headline Test</h3>
            <div className="space-y-4">
              <div>
                <Label>Test Name</Label>
                <Input
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="e.g., January 2026 Headline Test"
                />
              </div>
              <div>
                <Label>Variant A (Control)</Label>
                <Textarea
                  value={newVariantA}
                  onChange={(e) => setNewVariantA(e.target.value)}
                  placeholder="Enter the first headline..."
                  rows={3}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Variant B (Test)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateHeadlines}
                    disabled={isGeneratingHeadlines}
                  >
                    {isGeneratingHeadlines ? (
                      <>
                        <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>

                {generatedHeadlines.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Click to use:</p>
                    {generatedHeadlines.map((headline, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewVariantB(headline)}
                        className={`w-full text-left p-2 text-sm rounded border transition-colors ${
                          newVariantB === headline
                            ? "border-primary bg-primary/5 text-slate-900"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        {headline}
                      </button>
                    ))}
                  </div>
                )}

                <Textarea
                  value={newVariantB}
                  onChange={(e) => setNewVariantB(e.target.value)}
                  placeholder="Enter the alternative headline or generate with AI..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!newTestName || !newVariantA || !newVariantB) {
                      toast.error("Please fill in all fields");
                      return;
                    }
                    createAbTest.mutate({
                      name: newTestName,
                      variants: [
                        { name: "A", headline: newVariantA },
                        { name: "B", headline: newVariantB },
                      ],
                    });
                  }}
                  disabled={createAbTest.isPending}
                >
                  Create Test
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingTest(false);
                    setNewTestName("");
                    setNewVariantA(DEFAULT_HEADLINE);
                    setNewVariantB("");
                    setGeneratedHeadlines([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Existing Tests */}
        {abTests.length === 0 && !isCreatingTest ? (
          <Card className="p-8 border border-slate-200 text-center">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No headline tests yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Create a test to compare different headlines on your sales page
            </p>
          </Card>
        ) : (
          abTests.map((test) => (
            <Card
              key={test.id}
              className={`p-4 border ${test.isActive ? "border-primary shadow-md" : "border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{test.name}</h3>
                    {test.isActive && (
                      <span className="px-2 py-0.5 bg-slate-100 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {test.totalViews} views · {test.totalConversions} conversions ·{" "}
                    {test.overallConversionRate}% overall
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={test.isActive ? "outline" : "default"}
                    onClick={() => toggleAbTest.mutate({ id: test.id, isActive: !test.isActive })}
                    disabled={toggleAbTest.isPending}
                  >
                    {test.isActive ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" /> Start
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Reset all stats to zero?")) {
                        resetAbTestStats.mutate(test.id);
                      }
                    }}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm("Delete this test? This cannot be undone.")) {
                        deleteAbTest.mutate(test.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-3">
                {test.variants.map((variant) => {
                  const conversionRate =
                    variant.views > 0
                      ? ((variant.conversions / variant.views) * 100).toFixed(2)
                      : "0.00";
                  const isWinning =
                    test.variants.length > 1 &&
                    variant.views > 10 &&
                    parseFloat(conversionRate) ===
                      Math.max(
                        ...test.variants.map((v) =>
                          v.views > 10 ? (v.conversions / v.views) * 100 : 0
                        )
                      );

                  return (
                    <div
                      key={variant.id}
                      className={`p-3 rounded-lg border ${
                        isWinning ? "border-primary bg-slate-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {variant.name}
                            </span>
                            {isWinning && (
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> Leading
                              </span>
                            )}
                          </div>
                          {editingVariant === variant.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingHeadline}
                                onChange={(e) => setEditingHeadline(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateVariant.mutate({
                                      id: variant.id,
                                      headline: editingHeadline,
                                    })
                                  }
                                  disabled={updateVariant.isPending}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingVariant(null);
                                    setEditingHeadline("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-700">{variant.headline}</p>
                          )}
                        </div>
                        {editingVariant !== variant.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingVariant(variant.id);
                              setEditingHeadline(variant.headline);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-slate-500">
                          <Eye className="w-3 h-3 inline mr-1" />
                          {variant.views} views
                        </span>
                        <span className="text-slate-500">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          {variant.conversions} conversions
                        </span>
                        <span
                          className={`font-bold ${isWinning ? "text-primary" : "text-slate-700"}`}
                        >
                          {conversionRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
