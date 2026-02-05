import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTestMode } from "@/contexts/TestModeContext";
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
  ExternalLink,
  Heart,
  Video,
  FlaskConical,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Pencil,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Mail,
  UserPlus,
  Search,
  CreditCard,
  RefreshCw,
  UserX,
  DollarSign,
  PoundSterling,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Activity,
  Filter,
  Tag,
  Percent,
  Calendar,
  Send,
  Radio,
  Megaphone,
  Info,
  AlertCircle,
  CheckCircle,
  Gift,
  Ban
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

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

interface TestimonialEntry {
  id: number;
  userId: string;
  testimonial: string | null;
  videoUrl: string | null;
  appName: string | null;
  appUrl: string | null;
  featured: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface CritiqueRequest {
  id: number;
  userId: string;
  salesPageUrl: string;
  productDescription: string | null;
  targetAudience: string | null;
  specificQuestions: string | null;
  status: string;
  videoUrl: string | null;
  completedAt: string | null;
  createdAt: string;
  userEmail: string | null;
  userFirstName: string | null;
}

interface AbVariant {
  id: number;
  testId: number;
  name: string;
  headline: string;
  views: number;
  conversions: number;
}

interface AbTest {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  variants: AbVariant[];
  totalViews: number;
  totalConversions: number;
  overallConversionRate: string;
}

interface EmailTemplate {
  id: number;
  templateKey: string;
  name: string;
  subject: string;
  body: string;
  description: string | null;
  variables: string | null;
  isActive: boolean;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isAdmin: boolean | null;
  challengePurchased: boolean | null;
  coachingPurchased: boolean | null;
  stripeCustomerId: string | null;
  purchaseCurrency: string | null;
  referralCode: string | null;
  adminNotes: string | null;
  isBanned: boolean | null;
  banReason: string | null;
  bannedAt: string | null;
  createdAt: string;
  stats: {
    lastCompletedDay: number;
    totalXp: number;
    currentStreak: number;
    lastActivityDate: string | null;
  };
  completedDays: number;
}

interface CurrencyBreakdown {
  currency: string;
  amount: number;
  count: number;
}

interface RevenueData {
  balance: {
    available: number;
    pending: number;
    currency: string;
  };
  totals: {
    allTime: number;
    last30Days: number;
    last7Days: number;
    transactions: number;
  };
  revenueByCurrency: CurrencyBreakdown[];
  last7DaysByCurrency: CurrencyBreakdown[];
  last30DaysByCurrency: CurrencyBreakdown[];
  refunds: {
    total: number;
    count: number;
  };
  recentTransactions: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    refunded: boolean;
    customerEmail: string;
    customerName: string;
    description: string;
    created: number;
  }[];
  revenueByProduct: {
    name: string;
    amount: number;
    count: number;
    currency: string;
  }[];
}

interface ActivityLog {
  id: number;
  userId: string | null;
  targetUserId: string | null;
  action: string;
  category: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  targetUser?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface ActivityLogResponse {
  logs: ActivityLog[];
  stats: {
    totalLogs: number;
    todayLogs: number;
    categoryCounts: Record<string, number>;
  };
}

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountAmount: number;
  maxUses: number | null;
  currentUses: number | null;
  minPurchaseAmount: number | null;
  applicableProducts: string[] | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean | null;
  createdAt: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: string;
  targetSegment: string | null;
  dismissible: boolean | null;
  linkUrl: string | null;
  linkText: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean | null;
  priority: number | null;
  createdAt: string;
}

interface LiveUser {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  currentPage: string;
  lastSeen: string;
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
  const { testMode, setTestMode } = useTestMode();

  // Check if user is admin - use the same pattern as server routes
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user", { credentials: "include" });
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
            <p className="text-slate-600">You don't have permission to access the admin panel.</p>
          </Card>
        </div>
      </Layout>
    );
  }

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

  const grantAccessMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/admin/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, productType: 'challenge' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to grant access");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setGrantAccessEmail('');
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to grant access");
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
  const [showChatSection, setShowChatSection] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [showBrandSection, setShowBrandSection] = useState(false);
  const [showProgressSection, setShowProgressSection] = useState(false);
  const [showDayCompletionSection, setShowDayCompletionSection] = useState(false);
  const [showRevenueSection, setShowRevenueSection] = useState(false);
  const [revenueDateRange, setRevenueDateRange] = useState<'7d' | '30d' | '90d' | '365d' | 'all'>('all');
  const [grantAccessEmail, setGrantAccessEmail] = useState('');
  const [showActivityLogSection, setShowActivityLogSection] = useState(false);
  const [activityLogCategory, setActivityLogCategory] = useState<string>('');
  const [showFunnelSection, setShowFunnelSection] = useState(false);
  const [showLiveUsersSection, setShowLiveUsersSection] = useState(false);
  const [showCouponsSection, setShowCouponsSection] = useState(false);
  const [showCoachingPurchasesSection, setShowCoachingPurchasesSection] = useState(false);
  const [showBroadcastSection, setShowBroadcastSection] = useState(false);
  const [showAnnouncementsSection, setShowAnnouncementsSection] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'promo',
    targetSegment: 'all',
    dismissible: true,
    linkUrl: '',
    linkText: '',
    expiresAt: '',
  });
  const [broadcastEmail, setBroadcastEmail] = useState({
    subject: '',
    body: '',
    segment: 'all' as 'all' | 'paid' | 'unpaid' | 'active' | 'inactive' | 'stuck',
    testEmail: '',
  });
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountAmount: 0,
    maxUses: '',
    expiresAt: '',
  });

  // Activity log data
  const { data: activityLogData, isLoading: activityLogLoading } = useQuery<ActivityLogResponse>({
    queryKey: [activityLogCategory ? `/api/admin/activity-logs?category=${activityLogCategory}` : "/api/admin/activity-logs"],
  });

  // Live users data (only fetches when section is visible)
  const { data: liveUsersData, refetch: refetchLiveUsers } = useQuery<{ count: number; users: LiveUser[] }>({
    queryKey: ["/api/admin/live-users"],
    enabled: showLiveUsersSection, // Only fetch when viewing this section
    refetchInterval: showLiveUsersSection ? 10000 : false, // Refresh every 10s when visible
  });

  // Coupons data
  const { data: couponsData = [], refetch: refetchCoupons } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  // Coaching purchases data
  interface CoachingPurchase {
    id: number;
    userId: string | null;
    email: string;
    coachType: string;
    packageType: string;
    sessionsTotal: number;
    amountPaid: number;
    currency: string;
    purchasedAt: string;
  }
  const { data: coachingPurchasesData = [] } = useQuery<CoachingPurchase[]>({
    queryKey: ["/api/admin/coaching-purchases"],
    enabled: showCoachingPurchasesSection,
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: typeof newCoupon) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          maxUses: data.maxUses ? parseInt(data.maxUses) : null,
          expiresAt: data.expiresAt || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Coupon created successfully");
      refetchCoupons();
      setShowCreateCoupon(false);
      setNewCoupon({ code: '', description: '', discountType: 'percent', discountAmount: 0, maxUses: '', expiresAt: '' });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Coupon> & { id: number }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      refetchCoupons();
      setEditingCoupon(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      refetchCoupons();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Announcements data
  const { data: announcementsData = [], refetch: refetchAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

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
      setNewAnnouncement({ title: '', message: '', type: 'info', targetSegment: 'all', dismissible: true, linkUrl: '', linkText: '', expiresAt: '' });
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

  // Ban/unban user mutations
  const banUserMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to ban user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User banned successfully");
      refetchUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}/unban`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to unban user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User unbanned successfully");
      refetchUsers();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Broadcast email mutations
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
      setBroadcastEmail({ subject: '', body: '', segment: 'all', testEmail: '' });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue", revenueDateRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/revenue?range=${revenueDateRange}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch revenue');
      return res.json();
    },
  });

  const formatCurrency = (amount: number, currency: string = 'gbp') => {
    // Use Intl.NumberFormat to properly format any currency
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
      }).format(amount / 100);
    } catch {
      // Fallback for invalid currency codes
      return `${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`;
    }
  };

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

  // Testimonials management
  const [showTestimonialsSection, setShowTestimonialsSection] = useState(false);

  const { data: testimonials = [] } = useQuery<TestimonialEntry[]>({
    queryKey: ["/api/admin/testimonials"],
  });

  // Critique requests management
  const [showCritiqueSection, setShowCritiqueSection] = useState(true);
  const [critiqueTab, setCritiqueTab] = useState<'pending' | 'completed'>('pending');

  const { data: critiqueRequests = [] } = useQuery<CritiqueRequest[]>({
    queryKey: ["/api/admin/critiques"],
  });

  const pendingCritiques = critiqueRequests.filter(c => c.status === 'pending' || c.status === 'in_progress');

  const updateCritiqueStatus = useMutation({
    mutationFn: async ({ id, status, videoUrl }: { id: number; status: string; videoUrl?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/critiques/${id}`, { status, videoUrl });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/critiques"] });
      toast.success("Critique status updated");
    },
    onError: () => {
      toast.error("Failed to update critique");
    }
  });

  const deleteCritique = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/critiques/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/critiques"] });
      toast.success("Critique deleted");
    },
    onError: () => {
      toast.error("Failed to delete critique");
    }
  });

  const completedCritiques = critiqueRequests.filter(c => c.status === 'completed');

  // Email templates management
  const [showEmailTemplatesSection, setShowEmailTemplatesSection] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [testEmailAddress, setTestEmailAddress] = useState(() => {
    return localStorage.getItem('adminTestEmailAddress') || '';
  });

  // Persist test email address to localStorage
  useEffect(() => {
    if (testEmailAddress) {
      localStorage.setItem('adminTestEmailAddress', testEmailAddress);
    }
  }, [testEmailAddress]);

  // Refund confirmation modal state
  const [refundConfirmation, setRefundConfirmation] = useState<{
    isOpen: boolean;
    chargeId: string;
    amount: number;
    currency: string;
    customerEmail: string;
    confirmText: string;
    step: 1 | 2;
  }>({
    isOpen: false,
    chargeId: '',
    amount: 0,
    currency: 'gbp',
    customerEmail: '',
    confirmText: '',
    step: 1,
  });

  // Delete user confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    userId: string;
    userEmail: string;
    confirmText: string;
    step: 1 | 2;
  }>({
    isOpen: false,
    userId: '',
    userEmail: '',
    confirmText: '',
    step: 1,
  });

  // Ban user confirmation modal state
  const [banConfirmation, setBanConfirmation] = useState<{
    isOpen: boolean;
    userId: string;
    userEmail: string;
    banReason: string;
    confirmText: string;
    step: 1 | 2;
  }>({
    isOpen: false,
    userId: '',
    userEmail: '',
    banReason: '',
    confirmText: '',
    step: 1,
  });

  const { data: emailTemplates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
  });

  const updateEmailTemplate = useMutation({
    mutationFn: async ({ templateKey, subject, body, isActive }: { templateKey: string; subject?: string; body?: string; isActive?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/email-templates/${templateKey}`, { subject, body, isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast.success("Email template updated");
      setEditingTemplate(null);
    },
    onError: () => {
      toast.error("Failed to update email template");
    }
  });

  const sendTestEmail = useMutation({
    mutationFn: async ({ templateKey, testEmail }: { templateKey: string; testEmail: string }) => {
      const res = await apiRequest("POST", `/api/admin/email-templates/${templateKey}/test`, { testEmail });
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Test email sent");
    },
    onError: () => {
      toast.error("Failed to send test email");
    }
  });

  // User Management state
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<'all' | 'paid' | 'unpaid' | 'active' | 'inactive' | 'stuck' | 'completed'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingNotesFor, setEditingNotesFor] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [newUserHasPurchased, setNewUserHasPurchased] = useState(false);

  const { data: adminUsers = [], refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  // Calculate user segments
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const userSegments = {
    all: adminUsers.length,
    paid: adminUsers.filter(u => u.challengePurchased).length,
    unpaid: adminUsers.filter(u => !u.challengePurchased).length,
    active: adminUsers.filter(u => u.stats.lastActivityDate && new Date(u.stats.lastActivityDate) > sevenDaysAgo).length,
    inactive: adminUsers.filter(u => !u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo).length,
    stuck: adminUsers.filter(u => u.stats.lastCompletedDay > 0 && u.stats.lastCompletedDay < 21 && (!u.stats.lastActivityDate || new Date(u.stats.lastActivityDate) <= sevenDaysAgo)).length,
    completed: adminUsers.filter(u => u.stats.lastCompletedDay >= 21).length,
  };

  // Funnel data - progression through challenge phases
  const funnelData = [
    { stage: 'Signed Up', count: adminUsers.length, color: 'bg-slate-400' },
    { stage: 'Purchased', count: adminUsers.filter(u => u.challengePurchased).length, color: 'bg-blue-500' },
    { stage: 'Started (Day 0)', count: adminUsers.filter(u => u.stats.lastCompletedDay >= 0 && u.challengePurchased).length, color: 'bg-cyan-500' },
    { stage: 'Idea Phase (1-4)', count: adminUsers.filter(u => u.stats.lastCompletedDay >= 1).length, color: 'bg-teal-500' },
    { stage: 'Prepare (5-9)', count: adminUsers.filter(u => u.stats.lastCompletedDay >= 5).length, color: 'bg-green-500' },
    { stage: 'Build (10-18)', count: adminUsers.filter(u => u.stats.lastCompletedDay >= 10).length, color: 'bg-amber-500' },
    { stage: 'Launch (19-21)', count: adminUsers.filter(u => u.stats.lastCompletedDay >= 19).length, color: 'bg-orange-500' },
    { stage: 'Completed', count: adminUsers.filter(u => u.stats.lastCompletedDay >= 21).length, color: 'bg-emerald-600' },
  ];
  const maxFunnelCount = Math.max(...funnelData.map(d => d.count), 1);

  const filteredUsers = adminUsers.filter(user => {
    // Apply segment filter
    if (userFilter !== 'all') {
      const isActive = user.stats.lastActivityDate && new Date(user.stats.lastActivityDate) > sevenDaysAgo;
      const isStuck = user.stats.lastCompletedDay > 0 && user.stats.lastCompletedDay < 21 && !isActive;

      switch (userFilter) {
        case 'paid': if (!user.challengePurchased) return false; break;
        case 'unpaid': if (user.challengePurchased) return false; break;
        case 'active': if (!isActive) return false; break;
        case 'inactive': if (isActive) return false; break;
        case 'stuck': if (!isStuck) return false; break;
        case 'completed': if (user.stats.lastCompletedDay < 21) return false; break;
      }
    }

    // Apply search filter
    if (!userSearchQuery) return true;
    const query = userSearchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  // Bulk selection helpers
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllFiltered = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const exportUsersCSV = () => {
    const usersToExport = selectedUsers.size > 0
      ? filteredUsers.filter(u => selectedUsers.has(u.id))
      : filteredUsers;

    const headers = ['Email', 'First Name', 'Last Name', 'Paid', 'Day', 'XP', 'Signed Up', 'Last Active'];
    const rows = usersToExport.map(u => [
      u.email || '',
      u.firstName || '',
      u.lastName || '',
      u.challengePurchased ? 'Yes' : 'No',
      u.stats.lastCompletedDay.toString(),
      u.stats.totalXp.toString(),
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
      u.stats.lastActivityDate ? new Date(u.stats.lastActivityDate).toLocaleDateString() : '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${userFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${usersToExport.length} users to CSV`);
  };

  // Refund mutation
  const issueRefund = useMutation({
    mutationFn: async ({ chargeId, amount }: { chargeId: string; amount?: number }) => {
      const res = await apiRequest("POST", "/api/admin/refund", { chargeId, amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue"] });
      toast.success("Refund issued successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to issue refund");
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: { email: string; firstName?: string; lastName?: string; isAdmin?: boolean; challengePurchased?: boolean }) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsAddingUser(false);
      setNewUserEmail("");
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserIsAdmin(false);
      setNewUserHasPurchased(false);
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUser(null);
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const resetUserProgress = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/reset-progress`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("User progress reset successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset user progress");
    },
  });

  // A/B Testing state
  const DEFAULT_HEADLINE = "How Complete Beginners Are Using AI to Build Real, Working Software Products in 21 Days for Less Than $100...";
  const [showAbTestSection, setShowAbTestSection] = useState(true);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newVariantA, setNewVariantA] = useState(DEFAULT_HEADLINE);
  const [newVariantB, setNewVariantB] = useState("");
  const [editingVariant, setEditingVariant] = useState<number | null>(null);
  const [editingHeadline, setEditingHeadline] = useState("");
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);

  const { data: abTests = [] } = useQuery<AbTest[]>({
    queryKey: ["/api/admin/ab/tests"],
  });

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
      console.log("Generate headlines response:", data);
      if (data.headlines && Array.isArray(data.headlines) && data.headlines.length > 0) {
        setGeneratedHeadlines(data.headlines);
        toast.success("Generated 5 headline alternatives!");
      } else if (data.message) {
        toast.error(data.message);
      } else {
        toast.error("No headlines were generated. Please try again.");
      }
    } catch (error: any) {
      console.error("Generate headlines error:", error);
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

  const toggleTestimonialFeatured = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/testimonials/${id}/feature`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast.success(data.featured ? "Testimonial featured!" : "Removed from featured");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle featured");
    },
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
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Track student progress and engagement metrics</p>
          </div>
          <button
            onClick={() => setTestMode(!testMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              testMode
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title={testMode ? "All days unlocked, bypass time restrictions" : "Normal day unlocking rules apply"}
          >
            {testMode ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            Test Mode
          </button>
        </div>

        {/* Overview Stats - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Students Card */}
          <Card className="p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Students</h3>
              </div>
              <span className="text-xs text-slate-400">Click a stat to filter</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setUserFilter('all');
                  setShowUserManagement(true);
                  setTimeout(() => {
                    document.getElementById('user-management-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                <p className="text-slate-600">Total</p>
              </button>
              <button
                onClick={() => {
                  setUserFilter('active');
                  setShowUserManagement(true);
                  setTimeout(() => {
                    document.getElementById('user-management-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-primary">{stats.activeUsers}</p>
                <p className="text-slate-600">Active (7d)</p>
              </button>
              <button
                onClick={() => {
                  setUserFilter('inactive');
                  setShowUserManagement(true);
                  setTimeout(() => {
                    document.getElementById('user-management-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-slate-400">{stats.totalUsers - stats.activeUsers}</p>
                <p className="text-slate-600">Inactive</p>
              </button>
            </div>
          </Card>

          {/* Revenue Card */}
          <Card className="p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <PoundSterling className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Revenue</h3>
              </div>
              <span className="text-xs text-slate-400">Click a stat to filter</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setRevenueDateRange('all');
                  setShowRevenueSection(true);
                  setTimeout(() => {
                    document.getElementById('revenue-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-primary">
                  {revenueData?.totals.transactions || 0}
                </p>
                <p className="text-slate-600">Total Sales</p>
              </button>
              <button
                onClick={() => {
                  setRevenueDateRange('7d');
                  setShowRevenueSection(true);
                  setTimeout(() => {
                    document.getElementById('revenue-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-slate-900">
                  {revenueData?.totals.last7Days || 0}
                </p>
                <p className="text-slate-600">Last 7 days</p>
              </button>
              <button
                onClick={() => {
                  setRevenueDateRange('30d');
                  setShowRevenueSection(true);
                  setTimeout(() => {
                    document.getElementById('revenue-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-slate-900">
                  {revenueData?.totals.last30Days || 0}
                </p>
                <p className="text-slate-600">Last 30 days</p>
              </button>
            </div>
          </Card>

          {/* Progress Card */}
          <Card className="p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Progress</h3>
              </div>
              <span className="text-xs text-slate-400">Click a stat to filter</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setShowProgressSection(true);
                  setTimeout(() => {
                    document.getElementById('progress-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-slate-900">{Math.round(stats.avgProgress)}%</p>
                <p className="text-slate-600">Avg Progress</p>
              </button>
              <button
                onClick={() => {
                  setUserFilter('completed');
                  setShowUserManagement(true);
                  setTimeout(() => {
                    document.getElementById('user-management-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-primary">{stats.completedChallenges}</p>
                <p className="text-slate-600">Completed</p>
              </button>
              <button
                onClick={() => {
                  setUserFilter('stuck');
                  setShowUserManagement(true);
                  setTimeout(() => {
                    document.getElementById('user-management-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-left p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <p className="text-3xl font-bold text-slate-400">
                  {stats.totalUsers > 0 ? Math.round((stats.completedChallenges / stats.totalUsers) * 100) : 0}%
                </p>
                <p className="text-slate-600">Completion Rate</p>
              </button>
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => {
                  setShowUserManagement(true);
                  setIsAddingUser(true);
                  setTimeout(() => {
                    document.getElementById('user-management-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setShowCommentsSection(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Comments {pendingComments.length > 0 && `(${pendingComments.length})`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setShowEmailTemplatesSection(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Emails
              </Button>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-start gap-2 px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50"
              >
                <PoundSterling className="w-4 h-4" />
                Stripe
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </div>
          </Card>
        </div>

        {/* Live Users Section */}
        <div className="space-y-4" id="live-users-section">
          <button
            onClick={() => setShowLiveUsersSection(!showLiveUsersSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="relative">
              <Users className="w-6 h-6 text-primary" />
              {liveUsersData && liveUsersData.count > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">Live Users</h2>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              liveUsersData && liveUsersData.count > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {liveUsersData?.count || 0} online
            </span>
            {showLiveUsersSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showLiveUsersSection && (
            <Card className="p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Users active in the last 3 minutes • Updates every 10 seconds
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchLiveUsers()}
                  className="gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </Button>
              </div>

              {!liveUsersData || liveUsersData.count === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>No users currently online</p>
                  <p className="text-sm text-slate-400 mt-1">Users will appear here when they're active on the site</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveUsersData.users.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt=""
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-500">
                                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : user.email || 'Unknown'}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded">
                          {user.currentPage}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Revenue & Payments Section */}
        <div className="space-y-4" id="revenue-section">
          <button
            onClick={() => setShowRevenueSection(!showRevenueSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <PoundSterling className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Revenue & Payments</h2>
            {revenueData && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {revenueData.totals.transactions} sales
              </span>
            )}
            {showRevenueSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showRevenueSection && (
            <div className="space-y-4">
              {/* Date Range Filter & Stripe Link */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Date range:</span>
                  <div className="flex gap-1">
                    {[
                      { value: '7d', label: '7 days' },
                      { value: '30d', label: '30 days' },
                      { value: '90d', label: '90 days' },
                      { value: '365d', label: '1 year' },
                      { value: 'all', label: 'All time' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setRevenueDateRange(option.value as typeof revenueDateRange)}
                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                          revenueDateRange === option.value
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#635BFF] text-white text-sm font-medium rounded-lg hover:bg-[#5851ea] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                  </svg>
                  Open Stripe Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Quick Grant Access Tool */}
              <Card className="p-4 border border-slate-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">Quick Grant Access</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Manually grant challenge access to a customer (use when webhooks fail)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="customer@email.com"
                        value={grantAccessEmail}
                        onChange={(e) => setGrantAccessEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (grantAccessEmail.trim()) {
                            grantAccessMutation.mutate(grantAccessEmail.trim());
                          }
                        }}
                        disabled={!grantAccessEmail.trim() || grantAccessMutation.isPending}
                        className="whitespace-nowrap"
                      >
                        {grantAccessMutation.isPending ? "Granting..." : "Grant Access"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {revenueLoading ? (
                <Card className="p-8 border border-slate-200 text-center">
                  <p className="text-slate-500">Loading revenue data...</p>
                </Card>
              ) : revenueData ? (
                <>
                  {/* Revenue by Currency */}
                  <Card className="p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Revenue by Currency</h3>
                    {revenueData.revenueByCurrency.length === 0 ? (
                      <p className="text-slate-500 text-sm">No sales yet</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {revenueData.revenueByCurrency.map((curr) => (
                          <div key={curr.currency} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-slate-900">{curr.currency}</span>
                              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                {curr.count} sale{curr.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(curr.amount, curr.currency)}
                            </p>
                            <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-slate-500">Last 7 days</p>
                                <p className="font-medium text-slate-900">
                                  {formatCurrency(
                                    revenueData.last7DaysByCurrency.find(c => c.currency === curr.currency)?.amount || 0,
                                    curr.currency
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Last 30 days</p>
                                <p className="font-medium text-slate-900">
                                  {formatCurrency(
                                    revenueData.last30DaysByCurrency.find(c => c.currency === curr.currency)?.amount || 0,
                                    curr.currency
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="p-4 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500">Total Sales</p>
                          <p className="text-xl font-bold text-slate-900">
                            {revenueData.totals.transactions}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ArrowDownRight className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500">Refunds</p>
                          <p className="text-xl font-bold text-red-600">
                            {revenueData.refunds.count}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Revenue by Product */}
                  {revenueData.revenueByProduct.length > 0 && (
                    <Card className="p-4 border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-3">Revenue by Product</h3>
                      <div className="space-y-2">
                        {revenueData.revenueByProduct.map((product, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-sm text-slate-500">{product.count} sales</p>
                            </div>
                            <p className="font-bold text-slate-900">
                              {formatCurrency(product.amount, product.currency)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Recent Transactions */}
                  <Card className="border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900">Recent Transactions</h3>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                      {revenueData.recentTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          No transactions yet
                        </div>
                      ) : (
                        revenueData.recentTransactions.map((tx) => (
                          <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.refunded ? 'bg-red-100' : tx.status === 'succeeded' ? 'bg-green-100' : 'bg-slate-100'
                              }`}>
                                {tx.refunded ? (
                                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                                ) : (
                                  <Receipt className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {tx.customerName !== 'Unknown' ? tx.customerName : tx.customerEmail}
                                </p>
                                <p className="text-sm text-slate-500">{tx.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {!tx.refunded && tx.status === 'succeeded' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setRefundConfirmation({
                                      isOpen: true,
                                      chargeId: tx.id,
                                      amount: tx.amount,
                                      currency: tx.currency,
                                      customerEmail: tx.customerEmail,
                                      confirmText: '',
                                      step: 1,
                                    });
                                  }}
                                  disabled={issueRefund.isPending}
                                >
                                  Refund
                                </Button>
                              )}
                              {tx.refunded && (
                                <span className="text-xs text-red-500 font-medium">Refunded</span>
                              )}
                              <div className="text-right">
                                <p className={`font-bold ${tx.refunded ? 'text-red-600 line-through' : 'text-slate-900'}`}>
                                  {formatCurrency(tx.amount, tx.currency)}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {new Date(tx.created * 1000).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                </>
              ) : (
                <Card className="p-8 border border-slate-200 text-center">
                  <PoundSterling className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Unable to load revenue data. Check Stripe configuration.</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Coaching Purchases Section */}
        <div className="space-y-4" id="coaching-purchases-section">
          <button
            onClick={() => setShowCoachingPurchasesSection(!showCoachingPurchasesSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Video className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Coaching Purchases</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {coachingPurchasesData.length} sales
            </span>
            {showCoachingPurchasesSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showCoachingPurchasesSection && (
            <Card className="p-4 border border-slate-200">
              {coachingPurchasesData.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No coaching purchases yet</p>
              ) : (
                <div className="space-y-3">
                  {/* Summary stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-slate-200">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">
                        {coachingPurchasesData.filter(p => p.coachType === 'matt').length}
                      </p>
                      <p className="text-xs text-slate-500">Matt Sessions</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">
                        {coachingPurchasesData.filter(p => p.coachType === 'expert').length}
                      </p>
                      <p className="text-xs text-slate-500">Expert Sessions</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">
                        {coachingPurchasesData.reduce((sum, p) => sum + p.sessionsTotal, 0)}
                      </p>
                      <p className="text-xs text-slate-500">Total Sessions</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        £{(coachingPurchasesData.filter(p => p.currency === 'gbp').reduce((sum, p) => sum + p.amountPaid, 0) / 100).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">GBP Revenue</p>
                    </div>
                  </div>

                  {/* Purchases list */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Purchases</h3>
                    {coachingPurchasesData.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            purchase.coachType === 'matt' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}>
                            {purchase.coachType === 'matt' ? 'M' : 'J'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{purchase.email}</p>
                            <p className="text-xs text-slate-500">
                              {purchase.coachType === 'matt' ? 'Matt' : 'Expert (James)'} • {purchase.sessionsTotal} session{purchase.sessionsTotal > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {purchase.currency === 'gbp' ? '£' : '$'}{(purchase.amountPaid / 100).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(purchase.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Coupons Section */}
        <div className="space-y-4" id="coupons-section">
          <button
            onClick={() => setShowCouponsSection(!showCouponsSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Tag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Coupon Codes</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {couponsData.filter(c => c.isActive).length} active
            </span>
            {showCouponsSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showCouponsSection && (
            <div className="space-y-4">
              {/* Create Coupon Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowCreateCoupon(!showCreateCoupon)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Coupon
                </Button>
              </div>

              {/* Create Coupon Form */}
              {showCreateCoupon && (
                <Card className="p-6 border border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-900 mb-4">Create New Coupon</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Coupon Code</Label>
                      <Input
                        placeholder="e.g., LAUNCH50"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label>Description (internal)</Label>
                      <Input
                        placeholder="e.g., Launch promotion"
                        value={newCoupon.description}
                        onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label>Discount Type</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                        value={newCoupon.discountType}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'percent' | 'fixed' })}
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (£)</option>
                      </select>
                    </div>
                    <div>
                      <Label>
                        {newCoupon.discountType === 'percent' ? 'Discount (%)' : 'Discount Amount (£)'}
                      </Label>
                      <Input
                        type="number"
                        placeholder={newCoupon.discountType === 'percent' ? '10' : '5'}
                        value={newCoupon.discountAmount || ''}
                        onChange={(e) => setNewCoupon({
                          ...newCoupon,
                          discountAmount: newCoupon.discountType === 'percent'
                            ? parseInt(e.target.value)
                            : parseInt(e.target.value) * 100 // Convert to cents
                        })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label>Max Uses (optional)</Label>
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        value={newCoupon.maxUses}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label>Expires (optional)</Label>
                      <Input
                        type="date"
                        value={newCoupon.expiresAt}
                        onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => createCouponMutation.mutate(newCoupon)}
                      disabled={!newCoupon.code || createCouponMutation.isPending}
                    >
                      {createCouponMutation.isPending ? 'Creating...' : 'Create Coupon'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateCoupon(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Coupons List */}
              <Card className="border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {couponsData.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>No coupons created yet</p>
                    </div>
                  ) : (
                    couponsData.map((coupon) => (
                      <div key={coupon.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              coupon.isActive ? 'bg-slate-100' : 'bg-slate-100'
                            }`}>
                              {coupon.discountType === 'percent' ? (
                                <Percent className={`w-5 h-5 ${coupon.isActive ? 'text-primary' : 'text-slate-400'}`} />
                              ) : (
                                <PoundSterling className={`w-5 h-5 ${coupon.isActive ? 'text-primary' : 'text-slate-400'}`} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">{coupon.code}</span>
                                {!coupon.isActive && (
                                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Inactive</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">
                                {coupon.discountType === 'percent'
                                  ? `${coupon.discountAmount}% off`
                                  : `£${(coupon.discountAmount / 100).toFixed(2)} off`
                                }
                                {coupon.description && ` • ${coupon.description}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="font-medium text-slate-900">
                                {coupon.currentUses || 0}{coupon.maxUses ? `/${coupon.maxUses}` : ''} uses
                              </p>
                              {coupon.expiresAt && (
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCouponMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                              >
                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm(`Delete coupon ${coupon.code}?`)) {
                                    deleteCouponMutation.mutate(coupon.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Broadcast Email Section */}
        <div className="space-y-4" id="broadcast-section">
          <button
            onClick={() => setShowBroadcastSection(!showBroadcastSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Radio className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Broadcast Email</h2>
            {showBroadcastSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showBroadcastSection && (
            <Card className="p-6 border border-slate-200">
              <div className="space-y-4">
                {/* Segment Selection */}
                <div>
                  <Label className="mb-2 block">Target Segment</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'All Users', count: userSegments.all },
                      { value: 'paid', label: 'Paid', count: userSegments.paid },
                      { value: 'unpaid', label: 'Unpaid', count: userSegments.unpaid },
                      { value: 'active', label: 'Active (7d)', count: userSegments.active },
                      { value: 'inactive', label: 'Inactive', count: userSegments.inactive },
                      { value: 'stuck', label: 'Stuck', count: userSegments.stuck },
                    ].map((seg) => (
                      <button
                        key={seg.value}
                        onClick={() => setBroadcastEmail({ ...broadcastEmail, segment: seg.value as typeof broadcastEmail.segment })}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          broadcastEmail.segment === seg.value
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {seg.label} ({seg.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <Label>Subject</Label>
                  <Input
                    placeholder="Your subject line..."
                    value={broadcastEmail.subject}
                    onChange={(e) => setBroadcastEmail({ ...broadcastEmail, subject: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-1">Use {"{{firstName}}"} for personalization</p>
                </div>

                {/* Body */}
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
                    onClick={() => sendTestEmailMutation.mutate({
                      subject: broadcastEmail.subject,
                      body: broadcastEmail.body,
                      email: broadcastEmail.testEmail,
                    })}
                    disabled={!broadcastEmail.subject || !broadcastEmail.body || !broadcastEmail.testEmail || sendTestEmailMutation.isPending}
                  >
                    {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>

                {/* Send Broadcast Button */}
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      const count = userSegments[broadcastEmail.segment as keyof typeof userSegments] || 0;
                      if (confirm(`Send this email to ${count} users in the "${broadcastEmail.segment}" segment?`)) {
                        sendBroadcastMutation.mutate({
                          subject: broadcastEmail.subject,
                          body: broadcastEmail.body,
                          segment: broadcastEmail.segment,
                        });
                      }
                    }}
                    disabled={!broadcastEmail.subject || !broadcastEmail.body || sendBroadcastMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                    {sendBroadcastMutation.isPending ? 'Sending...' : `Send to ${
                      userSegments[broadcastEmail.segment as keyof typeof userSegments] || 0
                    } Users`}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Announcements Section */}
        <div className="space-y-4" id="announcements-section">
          <button
            onClick={() => setShowAnnouncementsSection(!showAnnouncementsSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Megaphone className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">In-App Announcements</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {announcementsData.filter(a => a.isActive).length} active
            </span>
            {showAnnouncementsSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showAnnouncementsSection && (
            <div className="space-y-4">
              {/* Create Announcement Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowCreateAnnouncement(!showCreateAnnouncement)}
                  className="gap-2"
                >
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
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as typeof newAnnouncement.type })}
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
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetSegment: e.target.value })}
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
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAnnouncement.dismissible}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, dismissible: e.target.checked })}
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
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, linkUrl: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label>CTA Text</Label>
                        <Input
                          placeholder="Learn more"
                          value={newAnnouncement.linkText}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, linkText: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => createAnnouncementMutation.mutate(newAnnouncement)}
                        disabled={!newAnnouncement.title || !newAnnouncement.message || createAnnouncementMutation.isPending}
                      >
                        {createAnnouncementMutation.isPending ? 'Creating...' : 'Create Announcement'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateAnnouncement(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Announcements List */}
              <Card className="border border-slate-200 overflow-hidden">
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
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
                              {announcement.type === 'info' ? <Info className="w-5 h-5 text-primary" /> :
                               announcement.type === 'warning' ? <AlertCircle className="w-5 h-5 text-primary" /> :
                               announcement.type === 'success' ? <CheckCircle className="w-5 h-5 text-primary" /> :
                               <Gift className="w-5 h-5 text-primary" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{announcement.title}</span>
                                {!announcement.isActive && (
                                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Inactive</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{announcement.message}</p>
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
                              onClick={() => updateAnnouncementMutation.mutate({ id: announcement.id, isActive: !announcement.isActive })}
                            >
                              {announcement.isActive ? 'Deactivate' : 'Activate'}
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
          )}
        </div>

        {/* Activity Log Section */}
        <div className="space-y-4" id="activity-log-section">
          <button
            onClick={() => setShowActivityLogSection(!showActivityLogSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
            {activityLogData?.stats && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {activityLogData.stats.todayLogs} today
              </span>
            )}
            {showActivityLogSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showActivityLogSection && (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <div className="flex gap-2 flex-wrap">
                  {['', 'user', 'payment', 'content', 'system'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActivityLogCategory(cat)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        activityLogCategory === cat
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              {activityLogData?.stats && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Total Activities</p>
                    <p className="text-xl font-bold text-slate-900">{activityLogData.stats.totalLogs}</p>
                  </Card>
                  <Card className="p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">Today</p>
                    <p className="text-xl font-bold text-slate-900">{activityLogData.stats.todayLogs}</p>
                  </Card>
                  <Card className="p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500">By Category</p>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {Object.entries(activityLogData.stats.categoryCounts).map(([cat, count]) => (
                        <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {cat}: {count}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Activity Log List */}
              <Card className="border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {activityLogLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading activity log...</div>
                  ) : !activityLogData?.logs.length ? (
                    <div className="p-8 text-center text-slate-500">
                      <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>No activity recorded yet</p>
                    </div>
                  ) : (
                    activityLogData.logs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100">
                              {log.category === 'payment' ? (
                                <DollarSign className="w-4 h-4 text-primary" />
                              ) : log.category === 'user' ? (
                                <Users className="w-4 h-4 text-primary" />
                              ) : (
                                <Activity className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-sm text-slate-500">
                                {log.user ? (
                                  <>by <span className="font-medium">{log.user.firstName || log.user.email || 'Admin'}</span></>
                                ) : (
                                  <span className="text-slate-400">System</span>
                                )}
                                {log.targetUser && (
                                  <> → <span className="font-medium">{log.targetUser.firstName || log.targetUser.email}</span></>
                                )}
                              </p>
                              {log.details && Object.keys(log.details).length > 0 && (
                                <div className="mt-1 text-xs text-slate-400 bg-slate-50 rounded px-2 py-1 inline-block">
                                  {JSON.stringify(log.details).slice(0, 100)}
                                  {JSON.stringify(log.details).length > 100 && '...'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {log.category}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">
                              {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* User Funnel Section */}
        <div className="space-y-4" id="funnel-section">
          <button
            onClick={() => setShowFunnelSection(!showFunnelSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">User Funnel</h2>
            {userSegments.completed > 0 && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                {userSegments.completed} completed
              </span>
            )}
            {showFunnelSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showFunnelSection && (
            <Card className="p-6 border border-slate-200">
              <div className="space-y-4">
                {funnelData.map((stage, index) => {
                  const widthPercent = (stage.count / maxFunnelCount) * 100;
                  const conversionRate = index > 0 && funnelData[index - 1].count > 0
                    ? ((stage.count / funnelData[index - 1].count) * 100).toFixed(0)
                    : null;
                  const overallRate = funnelData[0].count > 0
                    ? ((stage.count / funnelData[0].count) * 100).toFixed(0)
                    : '0';

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
                          <span className="font-bold text-slate-900 w-12 text-right">{stage.count}</span>
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
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Conversion to Purchase</p>
                      <p className="text-lg font-bold text-slate-900">
                        {userSegments.all > 0 ? ((userSegments.paid / userSegments.all) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Completion Rate</p>
                      <p className="text-lg font-bold text-slate-900">
                        {userSegments.paid > 0 ? ((userSegments.completed / userSegments.paid) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Stuck Users</p>
                      <p className="text-lg font-bold text-slate-900">
                        {userSegments.stuck}
                        <span className="text-sm font-normal text-slate-400 ml-1">
                          ({userSegments.paid > 0 ? ((userSegments.stuck / userSegments.paid) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* User Management Section */}
        <div className="space-y-4" id="user-management-section">
          <button
            onClick={() => setShowUserManagement(!showUserManagement)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              {adminUsers.length} users
            </span>
            {showUserManagement ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showUserManagement && (
            <div className="space-y-4">
              {/* Search and Add User */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by email, name, or ID..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setIsAddingUser(true)}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </div>

              {/* Segment Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'paid', label: 'Paid' },
                  { key: 'unpaid', label: 'Unpaid' },
                  { key: 'active', label: 'Active' },
                  { key: 'inactive', label: 'Inactive' },
                  { key: 'stuck', label: 'Stuck' },
                  { key: 'completed', label: 'Completed' },
                ].map(segment => (
                  <button
                    key={segment.key}
                    onClick={() => setUserFilter(segment.key as typeof userFilter)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      userFilter === segment.key
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {segment.label}
                    <span className="ml-1.5 opacity-70">
                      {userSegments[segment.key as keyof typeof userSegments]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2 py-2 border-y border-slate-100">
                <button
                  onClick={selectAllFiltered}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0
                    ? 'Deselect all'
                    : `Select all ${filteredUsers.length}`}
                </button>
                {selectedUsers.size > 0 && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm text-slate-500">{selectedUsers.size} selected</span>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={exportUsersCSV}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        const selectedUsersList = filteredUsers.filter(u => selectedUsers.has(u.id));
                        selectedUsersList.forEach(u => {
                          updateUser.mutate({ id: u.id, challengePurchased: true });
                        });
                        toast.success(`Granted access to ${selectedUsers.size} users`);
                        setSelectedUsers(new Set());
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Grant Access
                    </button>
                    <button
                      onClick={() => setSelectedUsers(new Set())}
                      className="text-sm text-slate-400 hover:underline ml-auto"
                    >
                      Clear
                    </button>
                  </>
                )}
                {selectedUsers.size === 0 && (
                  <button
                    onClick={exportUsersCSV}
                    className="text-sm text-slate-500 hover:text-primary ml-auto flex items-center gap-1"
                  >
                    Export all to CSV
                  </button>
                )}
              </div>

              {/* Add User Form */}
              {isAddingUser && (
                <Card className="p-4 border border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-900 mb-4">Add New User</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={newUserFirstName}
                        onChange={(e) => setNewUserFirstName(e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={newUserLastName}
                        onChange={(e) => setNewUserLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newUserHasPurchased}
                            onChange={(e) => setNewUserHasPurchased(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Challenge Access</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newUserIsAdmin}
                            onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Admin</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        if (!newUserEmail) {
                          toast.error("Email is required");
                          return;
                        }
                        createUser.mutate({
                          email: newUserEmail,
                          firstName: newUserFirstName || undefined,
                          lastName: newUserLastName || undefined,
                          isAdmin: newUserIsAdmin,
                          challengePurchased: newUserHasPurchased,
                        });
                      }}
                      disabled={createUser.isPending}
                    >
                      {createUser.isPending ? "Creating..." : "Create User"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* User List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <Card className="p-4 text-center text-slate-500">
                    {userSearchQuery ? "No users found matching your search" : "No users yet"}
                  </Card>
                ) : (
                  filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      className={`p-4 border-2 cursor-pointer transition-colors ${
                        selectedUsers.has(user.id)
                          ? "border-primary bg-primary/5"
                          : selectedUser?.id === user.id
                          ? "border-primary bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Bulk selection checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleUserSelection(user.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt=""
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">
                                {user.firstName || user.lastName
                                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                  : "No name"}
                              </p>
                              {user.isAdmin && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-primary text-xs font-bold rounded">
                                  Admin
                                </span>
                              )}
                              {user.isBanned && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-red-600 text-xs font-bold rounded">
                                  Banned
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{user.email || "No email"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right hidden md:block">
                            <p className="text-slate-500 text-xs">Signed up</p>
                            <p className="text-slate-700">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {user.challengePurchased ? (
                                <span className="flex items-center gap-1 text-primary">
                                  <CreditCard className="w-4 h-4" />
                                  Paid
                                </span>
                              ) : (
                                <span className="text-slate-400">No purchase</span>
                              )}
                            </div>
                            <p className="text-slate-500">
                              Day {user.stats.lastCompletedDay}/{21} · {user.stats.totalXp} XP
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedUser?.id === user.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">User ID</p>
                              <p className="font-mono text-xs break-all">{user.id}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Stripe ID</p>
                              <p className="font-mono text-xs break-all">{user.stripeCustomerId || "None"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Currency</p>
                              <p>{user.purchaseCurrency?.toUpperCase() || "Not set"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Referral Code</p>
                              <p className="font-mono text-xs">{user.referralCode || "None"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Signed Up</p>
                              <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown"}</p>
                              <p className="text-xs text-slate-400">{user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : ""}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Last Active</p>
                              <p>{user.stats.lastActivityDate ? formatDistanceToNow(new Date(user.stats.lastActivityDate), { addSuffix: true }) : "Never"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Current Streak</p>
                              <p>{user.stats.currentStreak} days</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Days Completed</p>
                              <p>{user.completedDays} of 21</p>
                            </div>
                          </div>

                          {/* Admin Notes */}
                          <div className="pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-slate-700">Admin Notes</p>
                              {editingNotesFor !== user.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingNotesFor(user.id);
                                    setNotesText(user.adminNotes || '');
                                  }}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {user.adminNotes ? 'Edit' : 'Add note'}
                                </button>
                              )}
                            </div>
                            {editingNotesFor === user.id ? (
                              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                <Textarea
                                  value={notesText}
                                  onChange={(e) => setNotesText(e.target.value)}
                                  placeholder="Add private notes about this user..."
                                  className="text-sm min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      updateUser.mutate({ id: user.id, adminNotes: notesText });
                                      setEditingNotesFor(null);
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingNotesFor(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : user.adminNotes ? (
                              <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded whitespace-pre-wrap">
                                {user.adminNotes}
                              </p>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No notes yet</p>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateUser.mutate({
                                  id: user.id,
                                  challengePurchased: !user.challengePurchased,
                                });
                              }}
                            >
                              {user.challengePurchased ? "Revoke Access" : "Grant Access"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateUser.mutate({
                                  id: user.id,
                                  isAdmin: !user.isAdmin,
                                });
                              }}
                            >
                              {user.isAdmin ? "Remove Admin" : "Make Admin"}
                            </Button>
                            {!user.isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (user.isBanned) {
                                    unbanUserMutation.mutate(user.id);
                                  } else {
                                    setBanConfirmation({
                                      isOpen: true,
                                      userId: user.id,
                                      userEmail: user.email || user.id,
                                      banReason: '',
                                      confirmText: '',
                                      step: 1,
                                    });
                                  }
                                }}
                                className={user.isBanned ? "text-primary hover:text-primary/80" : "text-slate-600 hover:text-slate-700"}
                              >
                                {user.isBanned ? "Unban User" : "Ban User"}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Reset all progress for this user? This cannot be undone.")) {
                                  resetUserProgress.mutate(user.id);
                                }
                              }}
                              className="text-slate-600 hover:text-slate-700"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Reset Progress
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                  isOpen: true,
                                  userId: user.id,
                                  userEmail: user.email || user.id,
                                  confirmText: '',
                                  step: 1,
                                });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Delete User
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* A/B Testing Section */}
        <div className="space-y-4">
          <button
            onClick={() => setShowAbTestSection(!showAbTestSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <FlaskConical className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">A/B Headline Testing</h2>
            {abTests.some(t => t.isActive) && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                Test Running
              </span>
            )}
            {showAbTestSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showAbTestSection && (
            <div className="space-y-4">
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
                                  ? 'border-primary bg-primary/5 text-slate-900'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
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
                  <p className="text-slate-400 text-sm mt-1">Create a test to compare different headlines on your sales page</p>
                </Card>
              ) : (
                abTests.map((test) => (
                  <Card key={test.id} className={`p-4 border ${test.isActive ? 'border-primary' : 'border-slate-200'}`}>
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
                          {test.totalViews} views · {test.totalConversions} conversions · {test.overallConversionRate}% overall
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
                        const conversionRate = variant.views > 0
                          ? ((variant.conversions / variant.views) * 100).toFixed(2)
                          : "0.00";
                        const isWinning = test.variants.length > 1 &&
                          variant.views > 10 &&
                          parseFloat(conversionRate) === Math.max(...test.variants.map(v =>
                            v.views > 10 ? (v.conversions / v.views) * 100 : 0
                          ));

                        return (
                          <div
                            key={variant.id}
                            className={`p-3 rounded-lg border ${isWinning ? 'border-primary bg-slate-50' : 'border-slate-200 bg-white'}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                    {variant.name}
                                  </span>
                                  {isWinning && (
                                    <span className="text-xs font-bold text-primary flex items-center gap-1">
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
                                        onClick={() => updateVariant.mutate({ id: variant.id, headline: editingHeadline })}
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
                              <span className={`font-bold ${isWinning ? 'text-primary' : 'text-slate-700'}`}>
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
          )}
        </div>

        {/* Comment Approval Queue */}
        <div className="space-y-4">
          <button
            onClick={() => setShowCommentsSection(!showCommentsSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Comment Approval Queue</h2>
            {pendingComments.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {pendingComments.length} pending
              </span>
            )}
            {showCommentsSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showCommentsSection && (pendingComments.length === 0 ? (
            <Card className="p-8 border border-slate-200 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No comments pending approval</p>
            </Card>
          ) : (
            <Card className="border border-slate-200 divide-y divide-slate-100">
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
                        <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded inline-flex">
                          <AlertTriangle className="w-3 h-3" />
                          {comment.flagReason}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-slate-200 text-primary hover:bg-slate-50"
                        onClick={() => updateCommentStatus.mutate({ id: comment.id, status: "approved" })}
                        disabled={updateCommentStatus.isPending}
                        data-testid={`approve-comment-${comment.id}`}
                      >
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-slate-200 text-slate-600 hover:bg-slate-50"
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
          ))}
        </div>

        {/* Critique Requests */}
        <div className="space-y-4">
          <button
            onClick={() => setShowCritiqueSection(!showCritiqueSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Video className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Video Critiques</h2>
            {pendingCritiques.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {pendingCritiques.length} to do
              </span>
            )}
            {showCritiqueSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showCritiqueSection && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCritiqueTab('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    critiqueTab === 'pending'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pending ({pendingCritiques.length})
                </button>
                <button
                  onClick={() => setCritiqueTab('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    critiqueTab === 'completed'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Completed ({completedCritiques.length})
                </button>
              </div>

              {(critiqueTab === 'pending' ? pendingCritiques : completedCritiques).length === 0 ? (
                <Card className="p-8 border border-slate-200 text-center">
                  <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    {critiqueTab === 'pending' ? 'No pending critique requests' : 'No completed critiques yet'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(critiqueTab === 'pending' ? pendingCritiques : completedCritiques).map((critique) => (
                    <Card key={critique.id} className={`p-4 border ${critique.status === 'pending' ? 'border-slate-300' : critique.status === 'completed' ? 'border-slate-200' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                              critique.status === 'pending' ? 'bg-slate-100 text-slate-700' :
                              critique.status === 'in_progress' ? 'bg-slate-100 text-slate-700' :
                              'bg-slate-100 text-primary'
                            }`}>
                              {critique.status === 'pending' ? 'TO DO' : critique.status === 'in_progress' ? 'IN PROGRESS' : 'DONE'}
                            </span>
                            <span className="text-sm text-slate-500">
                              {formatDistanceToNow(new Date(critique.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900">{critique.userFirstName || critique.userEmail}</p>
                          <a href={critique.salesPageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                            {critique.salesPageUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {critique.productDescription && (
                            <p className="text-sm text-slate-600 mt-2"><strong>Product:</strong> {critique.productDescription}</p>
                          )}
                          {critique.targetAudience && (
                            <p className="text-sm text-slate-600"><strong>Audience:</strong> {critique.targetAudience}</p>
                          )}
                          {critique.specificQuestions && (
                            <p className="text-sm text-slate-600"><strong>Questions:</strong> {critique.specificQuestions}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {(critique.status === 'pending' || critique.status === 'in_progress') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const videoUrl = prompt("Enter the video URL to mark complete:");
                                  if (videoUrl) {
                                    updateCritiqueStatus.mutate({ id: critique.id, status: 'completed', videoUrl });
                                  }
                                }}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                              {critique.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCritiqueStatus.mutate({ id: critique.id, status: 'in_progress' })}
                                >
                                  Start Working
                                </Button>
                              )}
                            </>
                          )}
                          {critique.status === 'completed' && (
                            <>
                              {critique.videoUrl && (
                                <a href={critique.videoUrl} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline" className="w-full">
                                    <Video className="w-4 h-4 mr-1" />
                                    View Video
                                  </Button>
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newVideoUrl = prompt("Update video URL:", critique.videoUrl || "");
                                  if (newVideoUrl !== null) {
                                    updateCritiqueStatus.mutate({ id: critique.id, status: 'completed', videoUrl: newVideoUrl });
                                  }
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Edit URL
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-slate-600 hover:bg-slate-100 border-slate-200"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this critique request?")) {
                                deleteCritique.mutate(critique.id);
                              }
                            }}
                            disabled={deleteCritique.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Showcase Moderation */}
        <div className="space-y-4">
          <button
            onClick={() => setShowShowcaseSection(!showShowcaseSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Image className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Showcase Moderation</h2>
            {pendingShowcase.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
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
                <Card className="p-8 border border-slate-200 text-center">
                  <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No apps pending approval</p>
                  <a href="/showcase" target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline mt-2 inline-block">
                    View public showcase
                  </a>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingShowcase.map((entry) => (
                    <Card key={entry.id} className="p-0 border border-slate-200 overflow-hidden">
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
                              className="gap-1 border-slate-200 text-primary hover:bg-slate-50"
                              onClick={() => updateShowcaseStatus.mutate({ id: entry.id, status: "approved" })}
                              disabled={updateShowcaseStatus.isPending}
                            >
                              <Check className="w-4 h-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-slate-200 text-slate-600 hover:bg-slate-50"
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
                                  ? "border-primary text-primary bg-slate-50"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                              onClick={() => toggleShowcaseFeatured.mutate({ id: entry.id, featured: !entry.featured })}
                              disabled={toggleShowcaseFeatured.isPending}
                            >
                              <Star className={`w-4 h-4 ${entry.featured ? "fill-current" : ""}`} />
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

        {/* Testimonials */}
        <div className="space-y-4">
          <button
            onClick={() => setShowTestimonialsSection(!showTestimonialsSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Star className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Testimonials</h2>
            {testimonials.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {testimonials.length} received
              </span>
            )}
            {showTestimonialsSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showTestimonialsSection && (
            <div className="space-y-4">
              {testimonials.length === 0 ? (
                <Card className="p-8 border border-slate-200 text-center">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No testimonials received yet</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {testimonials.map((entry) => (
                    <Card key={entry.id} className="p-4 border border-slate-200">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">
                              {entry.user?.firstName || "Unknown"} {entry.user?.lastName || ""}
                            </p>
                            {entry.featured && (
                              <span className="px-2 py-0.5 bg-slate-100 text-primary text-xs font-medium rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{entry.user?.email}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`gap-1 ${
                            entry.featured
                              ? "border-primary text-primary bg-slate-50"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                          onClick={() => toggleTestimonialFeatured.mutate(entry.id)}
                          disabled={toggleTestimonialFeatured.isPending}
                        >
                          <Star className={`w-4 h-4 ${entry.featured ? "fill-current" : ""}`} />
                          {entry.featured ? "Featured" : "Feature"}
                        </Button>
                      </div>

                      {entry.testimonial && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                          <p className="text-slate-700 whitespace-pre-wrap">{entry.testimonial}</p>
                        </div>
                      )}

                      {entry.videoUrl && (
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <Video className="w-4 h-4 text-primary" />
                          <a
                            href={entry.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View video testimonial
                          </a>
                        </div>
                      )}

                      {(entry.appName || entry.appUrl) && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <ExternalLink className="w-4 h-4" />
                          {entry.appName && <span className="font-medium">{entry.appName}</span>}
                          {entry.appUrl && (
                            <a
                              href={entry.appUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {entry.appUrl}
                            </a>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brand Pack */}
        <div className="space-y-4">
          <button
            onClick={() => setShowBrandSection(!showBrandSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Brand Pack</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              App-wide
            </span>
            {showBrandSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showBrandSection && (
          <Card className="p-6 border border-slate-200">
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
          )}
        </div>

        {/* AI Mentor Management */}
        <div className="space-y-4">
          <button
            onClick={() => setShowChatSection(!showChatSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Bot className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">AI Mentor Management</h2>
            {flaggedMessages.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
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
              <Card className="p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <Bot className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Chatbot System Prompt</h3>
                  <span className="text-xs bg-slate-100 text-primary px-2 py-0.5 rounded">Editable</span>
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
              <Card className="p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Flag className="w-5 h-5 text-primary" />
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
              <Card className="p-6 border border-slate-200">
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
                              <p className="text-xs text-slate-600">{summary.flaggedCount} flagged</p>
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
        <div className="space-y-4" id="progress-section">
          <button
            onClick={() => setShowProgressSection(!showProgressSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Student Progress</h2>
            {showProgressSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>
          {showProgressSection && (
          <Card className="border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">App URL</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Day</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Referrals</th>
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
                          {user.referralCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-primary text-sm font-medium">
                              {user.referralCount}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">0</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="w-3 h-3" />
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.currentDay >= 30 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-primary text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          ) : user.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
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
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        No students enrolled yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          )}
        </div>

        {/* Day Completion Stats */}
        <div className="space-y-4">
          <button
            onClick={() => setShowDayCompletionSection(!showDayCompletionSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Day-by-Day Completion</h2>
            {showDayCompletionSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>
          {showDayCompletionSection && (
          <Card className="p-6 border border-slate-200">
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-15 gap-2">
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
          )}
        </div>

        {/* Email Templates */}
        <div className="space-y-4">
          <button
            onClick={() => setShowEmailTemplatesSection(!showEmailTemplatesSection)}
            className="flex items-center gap-3 w-full text-left"
          >
            <Mail className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Email Templates</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              {emailTemplates.length} templates
            </span>
            {showEmailTemplatesSection ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          {showEmailTemplatesSection && (
            <div className="space-y-4">
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
                  <p className="text-slate-500">No email templates found. Run the seed script to create default templates.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {emailTemplates.map((template) => (
                    <Card key={template.templateKey} className={`p-4 border ${template.isActive ? 'border-slate-200' : 'border-slate-300 bg-slate-50'}`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{template.name}</h3>
                            {!template.isActive && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">Disabled</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                          {template.variables && (
                            <p className="text-xs text-slate-400 mt-1">
                              Variables: {template.variables.split(',').map(v => `{{${v.trim()}}}`).join(', ')}
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
                                isActive: !template.isActive
                              });
                            }}
                          >
                            {template.isActive ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
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
                                testEmail: testEmailAddress
                              });
                            }}
                            disabled={sendTestEmail.isPending}
                            title={testEmailAddress ? `Send test to ${testEmailAddress}` : "Set test email address first"}
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
                                  body: editedBody
                                });
                              }}
                              disabled={updateEmailTemplate.isPending}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingTemplate(null)}
                            >
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
                                    testEmail: testEmailAddress
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
          )}
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Delete User</h2>
              <p className="text-slate-600 mt-2">
                You are about to permanently delete <strong>{deleteConfirmation.userEmail}</strong>
              </p>
              <p className="text-red-600 text-sm mt-2 font-medium">
                This action cannot be undone. All user data will be lost.
              </p>
            </div>

            {deleteConfirmation.step === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Click the button below to proceed to final confirmation.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => setDeleteConfirmation(prev => ({ ...prev, step: 2 }))}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    Type <span className="font-mono bg-red-100 text-red-700 px-1 rounded">DELETE</span> to confirm
                  </Label>
                  <Input
                    value={deleteConfirmation.confirmText}
                    onChange={(e) => setDeleteConfirmation(prev => ({ ...prev, confirmText: e.target.value }))}
                    placeholder="Type DELETE here"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false, step: 1, confirmText: '' }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={deleteConfirmation.confirmText !== 'DELETE' || deleteUser.isPending}
                    onClick={() => {
                      deleteUser.mutate(deleteConfirmation.userId);
                      setDeleteConfirmation(prev => ({ ...prev, isOpen: false, step: 1, confirmText: '' }));
                    }}
                  >
                    {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Ban User Confirmation Modal */}
      {banConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Ban User</h2>
              <p className="text-slate-600 mt-2">
                You are about to ban <strong>{banConfirmation.userEmail}</strong>
              </p>
              <p className="text-red-600 text-sm mt-2 font-medium">
                This user will no longer be able to access their account.
              </p>
            </div>

            {banConfirmation.step === 1 ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Ban reason (optional)</Label>
                  <Input
                    value={banConfirmation.banReason}
                    onChange={(e) => setBanConfirmation(prev => ({ ...prev, banReason: e.target.value }))}
                    placeholder="Enter reason for banning"
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setBanConfirmation(prev => ({ ...prev, isOpen: false }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => setBanConfirmation(prev => ({ ...prev, step: 2 }))}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    Type <span className="font-mono bg-red-100 text-red-700 px-1 rounded">BAN</span> to confirm
                  </Label>
                  <Input
                    value={banConfirmation.confirmText}
                    onChange={(e) => setBanConfirmation(prev => ({ ...prev, confirmText: e.target.value }))}
                    placeholder="Type BAN here"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setBanConfirmation(prev => ({ ...prev, isOpen: false, step: 1, confirmText: '', banReason: '' }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={banConfirmation.confirmText !== 'BAN' || banUserMutation.isPending}
                    onClick={() => {
                      banUserMutation.mutate({
                        id: banConfirmation.userId,
                        reason: banConfirmation.banReason || 'No reason provided'
                      });
                      setBanConfirmation(prev => ({ ...prev, isOpen: false, step: 1, confirmText: '', banReason: '' }));
                    }}
                  >
                    {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {refundConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Confirm Refund</h2>
              <p className="text-slate-600 mt-2">
                You are about to refund <strong>{formatCurrency(refundConfirmation.amount, refundConfirmation.currency)}</strong> to <strong>{refundConfirmation.customerEmail}</strong>
              </p>
              <p className="text-red-600 text-sm mt-2 font-medium">
                This action cannot be undone and will cost you money.
              </p>
            </div>

            {refundConfirmation.step === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Click the button below to proceed to final confirmation.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRefundConfirmation(prev => ({ ...prev, isOpen: false }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => setRefundConfirmation(prev => ({ ...prev, step: 2 }))}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    Type <span className="font-mono bg-red-100 text-red-700 px-1 rounded">REFUND</span> to confirm
                  </Label>
                  <Input
                    value={refundConfirmation.confirmText}
                    onChange={(e) => setRefundConfirmation(prev => ({ ...prev, confirmText: e.target.value }))}
                    placeholder="Type REFUND here"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRefundConfirmation(prev => ({ ...prev, isOpen: false, step: 1, confirmText: '' }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={refundConfirmation.confirmText !== 'REFUND' || issueRefund.isPending}
                    onClick={() => {
                      issueRefund.mutate({ chargeId: refundConfirmation.chargeId });
                      setRefundConfirmation(prev => ({ ...prev, isOpen: false, step: 1, confirmText: '' }));
                    }}
                  >
                    {issueRefund.isPending ? 'Processing...' : 'Issue Refund'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </Layout>
  );
}
