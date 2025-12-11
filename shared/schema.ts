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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Day content table - stores the 30-day curriculum
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
