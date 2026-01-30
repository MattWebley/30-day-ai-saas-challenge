import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  challengePurchased: boolean("challenge_purchased").default(false),
  promptPackPurchased: boolean("prompt_pack_purchased").default(false),
  launchPackPurchased: boolean("launch_pack_purchased").default(false),
  coachingPurchased: boolean("coaching_purchased").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  purchaseCurrency: varchar("purchase_currency"), // 'usd' or 'gbp' - set on first purchase
  // Referral system
  referralCode: varchar("referral_code"), // User's unique referral code
  referredBy: varchar("referred_by"), // Referral code of the user who referred them
  // Admin notes
  adminNotes: text("admin_notes"), // Private notes about this user (only visible to admins)
  // Ban system
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  bannedAt: timestamp("banned_at"),
  bannedBy: varchar("banned_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Day content table - stores the 21-day curriculum
export const dayContent = pgTable("day_content", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  phase: text("phase").notNull(),
  videoUrl: text("video_url"),
  aiTaskType: text("ai_task_type"), // 'suggestion' | 'template' | 'generator' | 'setup'
  aiTaskTitle: text("ai_task_title"),
  aiTaskDescription: text("ai_task_description"),
  suggestions: jsonb("suggestions"), // Array of {title, desc}
  template: text("template"),
  microDecisionQuestion: text("micro_decision_question"),
  microDecisionOptions: jsonb("micro_decision_options"), // Array of strings
  reflectionQuestion: text("reflection_question"),
  tip: text("tip"),
  lesson: text("lesson"),
  outcome: text("outcome"), // What the user will have accomplished by the end of the day
  completionMessage: text("completion_message"), // Motivational message shown after completing the day
  estimatedMinutes: integer("estimated_minutes").default(5), // Realistic time estimate for the task
  xpReward: integer("xp_reward").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDayContentSchema = createInsertSchema(dayContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DayContent = typeof dayContent.$inferSelect;
export type InsertDayContent = z.infer<typeof insertDayContentSchema>;

// User progress table - tracks user completion
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  completed: boolean("completed").default(false),
  selectedSuggestion: integer("selected_suggestion"),
  microDecisionChoice: text("micro_decision_choice"),
  reflectionAnswer: text("reflection_answer"),
  // Day 1 specific fields
  userInputs: jsonb("user_inputs"), // {knowledge, skills, interests, experience}
  generatedIdeas: jsonb("generated_ideas"), // Array of {title, desc, scores, totalScore}
  shortlistedIdeas: jsonb("shortlisted_ideas"), // Array of selected idea indices
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("user_progress_user_id_idx").on(table.userId),
  index("user_progress_day_idx").on(table.day),
]);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// Badge definitions
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  triggerType: text("trigger_type").notNull(), // 'day_completed' | 'phase_completed' | 'streak'
  triggerValue: integer("trigger_value"), // Day number or streak count
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

// User badges (earned)
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow(),
}, (table) => [
  index("user_badges_user_id_idx").on(table.userId),
]);

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

// User stats (for streak, XP, etc.)
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalXp: integer("total_xp").default(0),
  lastCompletedDay: integer("last_completed_day"),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_stats_user_id_idx").on(table.userId),
]);

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

// Day chat/comments
export const dayComments = pgTable("day_comments", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  status: text("status").default("approved"), // 'approved' | 'pending' | 'rejected'
  flagReason: text("flag_reason"), // Why it was flagged
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("day_comments_day_idx").on(table.day),
  index("day_comments_user_id_idx").on(table.userId),
  index("day_comments_status_idx").on(table.status),
]);

export const dayCommentsRelations = relations(dayComments, ({ one }) => ({
  user: one(users, {
    fields: [dayComments.userId],
    references: [users.id],
  }),
}));

export const insertDayCommentSchema = createInsertSchema(dayComments).omit({
  id: true,
  createdAt: true,
});

export type DayComment = typeof dayComments.$inferSelect;
export type InsertDayComment = z.infer<typeof insertDayCommentSchema>;

// User spam tracking
export const userSpamStatus = pgTable("user_spam_status", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  flaggedCount: integer("flagged_count").default(0),
  requiresApproval: boolean("requires_approval").default(false), // True after 3 flags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_spam_status_user_id_idx").on(table.userId),
]);

export const insertUserSpamStatusSchema = createInsertSchema(userSpamStatus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserSpamStatus = typeof userSpamStatus.$inferSelect;
export type InsertUserSpamStatus = z.infer<typeof insertUserSpamStatusSchema>;

// Referral tracking
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserPurchased: boolean("referred_user_purchased").default(false), // True when referred user buys challenge
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("referrals_referrer_id_idx").on(table.referrerId),
  index("referrals_referred_user_id_idx").on(table.referredUserId),
]);

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
  }),
}));

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// Brand settings - global app theming
export const brandSettings = pgTable("brand_settings", {
  id: serial("id").primaryKey(),
  primaryColor: varchar("primary_color").default("#007BFF"),
  textColor: varchar("text_color").default("#000000"),
  backgroundColor: varchar("background_color").default("#FFFFFF"),
  accentColor: varchar("accent_color").default("#007BFF"),
  fontFamily: varchar("font_family").default("Poppins"),
  borderRadius: integer("border_radius").default(6),
  logoUrl: text("logo_url"),
  appName: varchar("app_name").default("21 Day AI SaaS Challenge"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBrandSettingsSchema = createInsertSchema(brandSettings).omit({
  id: true,
  updatedAt: true,
});

export type BrandSettings = typeof brandSettings.$inferSelect;
export type InsertBrandSettings = z.infer<typeof insertBrandSettingsSchema>;

// Chat usage tracking for rate limiting
export const chatUsage = pgTable("chat_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  dailyCount: integer("daily_count").default(0),
  hourlyCount: integer("hourly_count").default(0),
  lastResetDate: timestamp("last_reset_date").defaultNow(),
  lastHourReset: timestamp("last_hour_reset").defaultNow(),
}, (table) => [
  index("chat_usage_user_id_idx").on(table.userId),
]);

export type ChatUsage = typeof chatUsage.$inferSelect;
export type InsertChatUsage = typeof chatUsage.$inferInsert;

// Chatbot settings - admin configurable
export const chatbotSettings = pgTable("chatbot_settings", {
  id: serial("id").primaryKey(),
  customRules: text("custom_rules"), // Additional rules to append to system prompt
  responseStyle: text("response_style"), // Editable response style rules
  scopeHelps: text("scope_helps"), // What the bot helps with
  scopeWontHelp: text("scope_wont_help"), // What the bot won't help with
  businessRedirect: text("business_redirect"), // Redirect message for business questions
  coreRules: text("core_rules"), // Core behavior rules
  dailyLimit: integer("daily_limit").default(20),
  hourlyLimit: integer("hourly_limit").default(10),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ChatbotSettings = typeof chatbotSettings.$inferSelect;
export type InsertChatbotSettings = typeof chatbotSettings.$inferInsert;

// Chat messages - stores all conversations
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  flagged: boolean("flagged").default(false), // Potential abuse flag
  flagReason: text("flag_reason"), // Why it was flagged
  reviewed: boolean("reviewed").default(false), // Admin has reviewed
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("chat_messages_user_id_idx").on(table.userId),
  index("chat_messages_flagged_idx").on(table.flagged),
  index("chat_messages_created_at_idx").on(table.createdAt),
]);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Showcase - completed apps gallery
export const showcase = pgTable("showcase", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appName: varchar("app_name").notNull(),
  description: text("description").notNull(),
  screenshotUrl: text("screenshot_url"),
  liveUrl: text("live_url"),
  testimonial: text("testimonial"), // Their experience building with the challenge
  videoUrl: text("video_url"), // Optional video testimonial URL
  status: varchar("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("showcase_user_id_idx").on(table.userId),
  index("showcase_status_idx").on(table.status),
]);

export const showcaseRelations = relations(showcase, ({ one }) => ({
  user: one(users, {
    fields: [showcase.userId],
    references: [users.id],
  }),
}));

export type Showcase = typeof showcase.$inferSelect;
export type InsertShowcase = typeof showcase.$inferInsert;

// Q&A Questions - user submitted questions for each day
export const dayQuestions = pgTable("day_questions", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer"), // Admin's answer (null if unanswered)
  aiSuggestedAnswer: text("ai_suggested_answer"), // AI-generated suggestion for admin review
  status: varchar("status").default("pending"), // 'pending' | 'answered' | 'hidden'
  answerToken: varchar("answer_token").unique(), // Unique token for email answer link
  helpful: integer("helpful").default(0), // Count of users who found this helpful
  createdAt: timestamp("created_at").defaultNow(),
  answeredAt: timestamp("answered_at"),
}, (table) => [
  index("day_questions_day_idx").on(table.day),
  index("day_questions_status_idx").on(table.status),
  index("day_questions_token_idx").on(table.answerToken),
]);

export const dayQuestionsRelations = relations(dayQuestions, ({ one }) => ({
  user: one(users, {
    fields: [dayQuestions.userId],
    references: [users.id],
  }),
}));

export const insertDayQuestionSchema = createInsertSchema(dayQuestions).omit({
  id: true,
  createdAt: true,
  answeredAt: true,
});

export type DayQuestion = typeof dayQuestions.$inferSelect;
export type InsertDayQuestion = z.infer<typeof insertDayQuestionSchema>;

// Challenge testimonials - feedback about the training/challenge
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  testimonial: text("testimonial"), // Written testimonial
  videoUrl: text("video_url"), // Video testimonial link
  appName: text("app_name"), // Optional - what they built
  appUrl: text("app_url"), // Optional - link to their app
  featured: boolean("featured").default(false), // Admin can feature testimonials
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("testimonials_user_id_idx").on(table.userId),
  index("testimonials_featured_idx").on(table.featured),
]);

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  user: one(users, {
    fields: [testimonials.userId],
    references: [users.id],
  }),
}));

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// A/B Testing - headline tests
export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // e.g., "Homepage Headline Test"
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AbTest = typeof abTests.$inferSelect;
export type InsertAbTest = typeof abTests.$inferInsert;

// A/B Test Variants
export const abVariants = pgTable("ab_variants", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => abTests.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(), // e.g., "A", "B", "Control"
  headline: text("headline").notNull(),
  views: integer("views").default(0), // Unique visitor count
  conversions: integer("conversions").default(0), // Purchase count
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("ab_variants_test_id_idx").on(table.testId),
]);

export const abVariantsRelations = relations(abVariants, ({ one }) => ({
  test: one(abTests, {
    fields: [abVariants.testId],
    references: [abTests.id],
  }),
}));

export type AbVariant = typeof abVariants.$inferSelect;
export type InsertAbVariant = typeof abVariants.$inferInsert;

// Critique requests table - tracks sales page critique submissions
export const critiqueRequests = pgTable("critique_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  salesPageUrl: text("sales_page_url").notNull(),
  preferredEmail: text("preferred_email"), // Email to send the video to (may differ from account email)
  productDescription: text("product_description"),
  targetAudience: text("target_audience"),
  specificQuestions: text("specific_questions"),
  status: varchar("status").default("pending"), // 'pending', 'in_progress', 'completed'
  videoUrl: text("video_url"), // URL to the completed critique video
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const critiqueRequestsRelations = relations(critiqueRequests, ({ one }) => ({
  user: one(users, {
    fields: [critiqueRequests.userId],
    references: [users.id],
  }),
}));

export type CritiqueRequest = typeof critiqueRequests.$inferSelect;
export type InsertCritiqueRequest = typeof critiqueRequests.$inferInsert;

// Email templates - editable email content
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  templateKey: varchar("template_key").notNull().unique(), // e.g., 'purchase_confirmation', 'coaching_purchase'
  name: varchar("name").notNull(), // Human-readable name
  subject: text("subject").notNull(), // Email subject line
  body: text("body").notNull(), // Email body (plain text with {{variable}} placeholders)
  description: text("description"), // Description of when this email is sent
  variables: text("variables"), // Comma-separated list of available variables
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// AI usage logging - track all AI API calls for abuse prevention
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  endpoint: varchar("endpoint").notNull(), // e.g., 'chat', 'idea-generation', 'features'
  tokensUsed: integer("tokens_used").default(0),
  blocked: boolean("blocked").default(false),
  blockReason: text("block_reason"),
  flagged: boolean("flagged").default(false),
  flagReason: text("flag_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AIUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAIUsageLog = typeof aiUsageLogs.$inferInsert;

// Activity Logs - Track admin and user actions
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // Who performed the action
  targetUserId: varchar("target_user_id").references(() => users.id, { onDelete: "set null" }), // Who was affected (if applicable)
  action: varchar("action").notNull(), // 'user_created', 'access_granted', 'refund_issued', etc.
  category: varchar("category").notNull(), // 'user', 'payment', 'content', 'system'
  details: jsonb("details"), // Additional context (e.g., amount refunded, old/new values)
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("activity_logs_user_id_idx").on(table.userId),
  index("activity_logs_action_idx").on(table.action),
  index("activity_logs_category_idx").on(table.category),
  index("activity_logs_created_at_idx").on(table.createdAt),
]);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// Coupon codes table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(), // e.g., "LAUNCH50"
  description: varchar("description"), // Internal note about what this coupon is for
  discountType: varchar("discount_type").notNull(), // 'percent' or 'fixed'
  discountAmount: integer("discount_amount").notNull(), // Amount in cents for fixed, percentage for percent
  maxUses: integer("max_uses"), // null = unlimited
  currentUses: integer("current_uses").default(0),
  minPurchaseAmount: integer("min_purchase_amount"), // Minimum purchase in cents
  applicableProducts: jsonb("applicable_products").$type<string[]>(), // null = all products
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("coupons_code_idx").on(table.code),
  index("coupons_is_active_idx").on(table.isActive),
]);

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// Coupon usage tracking table
export const couponUsages = pgTable("coupon_usages", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").references(() => coupons.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  orderId: varchar("order_id"), // Stripe payment intent/charge ID
  discountApplied: integer("discount_applied").notNull(), // Amount discounted in cents
  usedAt: timestamp("used_at").defaultNow(),
}, (table) => [
  index("coupon_usages_coupon_id_idx").on(table.couponId),
  index("coupon_usages_user_id_idx").on(table.userId),
]);

export type CouponUsage = typeof couponUsages.$inferSelect;
export type InsertCouponUsage = typeof couponUsages.$inferInsert;

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default('info'), // 'info', 'warning', 'success', 'promo'
  targetSegment: varchar("target_segment").default('all'), // 'all', 'paid', 'unpaid', 'active', etc.
  dismissible: boolean("dismissible").default(true),
  linkUrl: varchar("link_url"), // Optional CTA link
  linkText: varchar("link_text"), // Optional CTA text
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0), // Higher = shown first
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// Track which users have dismissed which announcements
export const announcementDismissals = pgTable("announcement_dismissals", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").references(() => announcements.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  dismissedAt: timestamp("dismissed_at").defaultNow(),
}, (table) => [
  index("announcement_dismissals_user_idx").on(table.userId),
  index("announcement_dismissals_announcement_idx").on(table.announcementId),
]);

export type AnnouncementDismissal = typeof announcementDismissals.$inferSelect;
export type InsertAnnouncementDismissal = typeof announcementDismissals.$inferInsert;
