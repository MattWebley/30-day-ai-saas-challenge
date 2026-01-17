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
  promptPackPurchased: boolean("prompt_pack_purchased").default(false),
  launchPackPurchased: boolean("launch_pack_purchased").default(false),
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
  screenshotUrl: text("screenshot_url").notNull(),
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
