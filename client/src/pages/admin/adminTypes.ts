export interface PendingComment {
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

export interface BrandSettings {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: number;
  logoUrl?: string;
  appName: string;
}

export interface ChatbotSettings {
  customRules: string;
  responseStyle: string;
  scopeHelps: string;
  scopeWontHelp: string;
  businessRedirect: string;
  coreRules: string;
  dailyLimit: number;
  hourlyLimit: number;
}

export interface ChatMessage {
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

export interface UserChatSummary {
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

export interface ShowcaseEntry {
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

export interface TestimonialEntry {
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

export interface CritiqueRequest {
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

export interface AbVariant {
  id: number;
  testId: number;
  name: string;
  headline: string;
  views: number;
  conversions: number;
}

export interface AbTest {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  variants: AbVariant[];
  totalViews: number;
  totalConversions: number;
  overallConversionRate: string;
}

export interface EmailTemplate {
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

export interface EmailLog {
  id: number;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  templateKey: string | null;
  status: string;
  resendId: string | null;
  error: string | null;
  sentAt: string;
}

export interface AdminUser {
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
  isPending?: boolean;
  amountPaid?: number;
  stats: {
    lastCompletedDay: number;
    totalXp: number;
    currentStreak: number;
    lastActivityDate: string | null;
  };
  completedDays: number;
}

export interface CurrencyBreakdown {
  currency: string;
  amount: number;
  count: number;
}

export interface RevenueData {
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

export interface ActivityLog {
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

export interface ActivityLogResponse {
  logs: ActivityLog[];
  stats: {
    totalLogs: number;
    todayLogs: number;
    categoryCounts: Record<string, number>;
  };
}

export interface Coupon {
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

export interface Announcement {
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

export interface LiveUser {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  currentPage: string;
  lastSeen: string;
}

export interface CoachingPurchase {
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

export const formatCurrency = (amount: number, currency: string = 'gbp') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`;
  }
};

export const FONT_OPTIONS = [
  "Poppins",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Nunito",
  "Source Sans Pro",
];
