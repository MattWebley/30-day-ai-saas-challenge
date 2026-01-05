import {
  users,
  dayContent,
  userProgress,
  badges,
  userBadges,
  userStats,
  dayComments,
  userSpamStatus,
  brandSettings,
  chatUsage,
  chatbotSettings,
  chatMessages,
  type User,
  type UpsertUser,
  type DayContent,
  type InsertDayContent,
  type UserProgress,
  type InsertUserProgress,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type UserStats,
  type InsertUserStats,
  type DayComment,
  type InsertDayComment,
  type UserSpamStatus,
  type InsertUserSpamStatus,
  type BrandSettings,
  type InsertBrandSettings,
  type ChatUsage,
  type ChatbotSettings,
  type InsertChatbotSettings,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Day content operations
  getDayContent(day: number): Promise<DayContent | undefined>;
  getAllDayContent(): Promise<DayContent[]>;
  createDayContent(content: InsertDayContent): Promise<DayContent>;
  updateDayContent(day: number, content: Partial<InsertDayContent>): Promise<DayContent | undefined>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressForDay(userId: string, day: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined>;
  completeDay(userId: string, day: number, data: {
    selectedSuggestion?: number;
    microDecisionChoice?: string;
    reflectionAnswer?: string;
  }): Promise<UserProgress>;
  getAllUserProgress(): Promise<UserProgress[]>;
  deleteAllUserProgress(userId: string): Promise<void>;
  
  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // User badge operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: number): Promise<UserBadge>;
  
  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats | undefined>;
  getAllUserStats(): Promise<UserStats[]>;
  
  // Day comments operations
  getDayComments(day: number): Promise<(DayComment & { user: User })[]>;
  createDayComment(comment: InsertDayComment): Promise<DayComment>;
  updateCommentStatus(id: number, status: string): Promise<DayComment | undefined>;
  getPendingComments(): Promise<(DayComment & { user: User })[]>;
  
  // Spam status operations
  getUserSpamStatus(userId: string): Promise<UserSpamStatus | undefined>;
  incrementFlagCount(userId: string): Promise<UserSpamStatus>;
  
  // Brand settings operations
  getBrandSettings(): Promise<BrandSettings | undefined>;
  updateBrandSettings(settings: Partial<InsertBrandSettings>): Promise<BrandSettings>;

  // Chat usage operations
  getChatUsage(userId: string): Promise<ChatUsage | undefined>;
  checkAndIncrementChatUsage(userId: string): Promise<{ allowed: boolean; reason?: string; resetIn?: number }>;

  // Chatbot settings operations
  getChatbotSettings(): Promise<ChatbotSettings | undefined>;
  updateChatbotSettings(settings: Partial<InsertChatbotSettings>): Promise<ChatbotSettings>;

  // Chat messages operations
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  getAllChatMessages(): Promise<(ChatMessage & { user: User })[]>;
  getFlaggedMessages(): Promise<(ChatMessage & { user: User })[]>;
  markMessageReviewed(id: number): Promise<ChatMessage | undefined>;
  getUserChatSummary(): Promise<{ userId: string; user: User; messageCount: number; flaggedCount: number; lastMessage: Date }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Create user stats if new user
    const existingStats = await this.getUserStats(user.id);
    if (!existingStats) {
      await this.createUserStats({ userId: user.id });
    }
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Day content operations
  async getDayContent(day: number): Promise<DayContent | undefined> {
    const [content] = await db.select().from(dayContent).where(eq(dayContent.day, day));
    return content;
  }

  async getAllDayContent(): Promise<DayContent[]> {
    return await db.select().from(dayContent).orderBy(dayContent.day);
  }

  async createDayContent(content: InsertDayContent): Promise<DayContent> {
    const [created] = await db.insert(dayContent).values(content).returning();
    return created;
  }

  async updateDayContent(day: number, content: Partial<InsertDayContent>): Promise<DayContent | undefined> {
    const [updated] = await db
      .update(dayContent)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(dayContent.day, day))
      .returning();
    return updated;
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(userProgress.day);
  }

  async getUserProgressForDay(userId: string, day: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.day, day)));
    return progress;
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [created] = await db.insert(userProgress).values(progress).returning();
    return created;
  }

  async updateUserProgress(id: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined> {
    const [updated] = await db
      .update(userProgress)
      .set(progress)
      .where(eq(userProgress.id, id))
      .returning();
    return updated;
  }

  async completeDay(userId: string, day: number, data: {
    selectedSuggestion?: number;
    microDecisionChoice?: string;
    reflectionAnswer?: string;
  }): Promise<UserProgress> {
    // Check if progress already exists
    const existing = await this.getUserProgressForDay(userId, day);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          completed: true,
          completedAt: new Date(),
          ...data,
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          day,
          completed: true,
          completedAt: new Date(),
          ...data,
        })
        .returning();
      return created;
    }
  }

  async getAllUserProgress(): Promise<UserProgress[]> {
    return await db.select().from(userProgress);
  }

  async deleteAllUserProgress(userId: string): Promise<void> {
    await db.delete(userProgress).where(eq(userProgress.userId, userId));
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [created] = await db.insert(badges).values(badge).returning();
    return created;
  }

  // User badge operations
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(userId: string, badgeId: number): Promise<UserBadge> {
    const [awarded] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    return awarded;
  }

  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const [created] = await db.insert(userStats).values(stats).returning();
    return created;
  }

  async updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats | undefined> {
    const [updated] = await db
      .update(userStats)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();
    return updated;
  }

  async getAllUserStats(): Promise<UserStats[]> {
    return await db.select().from(userStats);
  }

  // Day comments operations
  async getDayComments(day: number): Promise<(DayComment & { user: User })[]> {
    const comments = await db
      .select()
      .from(dayComments)
      .where(and(eq(dayComments.day, day), eq(dayComments.status, "approved")))
      .orderBy(desc(dayComments.createdAt));
    
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await this.getUser(comment.userId);
        return { ...comment, user: user! };
      })
    );
    return commentsWithUsers;
  }

  async createDayComment(comment: InsertDayComment): Promise<DayComment> {
    const [created] = await db.insert(dayComments).values(comment).returning();
    return created;
  }

  async updateCommentStatus(id: number, status: string): Promise<DayComment | undefined> {
    const [updated] = await db
      .update(dayComments)
      .set({ status })
      .where(eq(dayComments.id, id))
      .returning();
    return updated;
  }

  async getPendingComments(): Promise<(DayComment & { user: User })[]> {
    const comments = await db
      .select()
      .from(dayComments)
      .where(eq(dayComments.status, "pending"))
      .orderBy(desc(dayComments.createdAt));
    
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await this.getUser(comment.userId);
        return { ...comment, user: user! };
      })
    );
    return commentsWithUsers;
  }

  // Spam status operations
  async getUserSpamStatus(userId: string): Promise<UserSpamStatus | undefined> {
    const [status] = await db
      .select()
      .from(userSpamStatus)
      .where(eq(userSpamStatus.userId, userId));
    return status;
  }

  async incrementFlagCount(userId: string): Promise<UserSpamStatus> {
    const existing = await this.getUserSpamStatus(userId);
    
    if (existing) {
      const newCount = (existing.flaggedCount || 0) + 1;
      const [updated] = await db
        .update(userSpamStatus)
        .set({
          flaggedCount: newCount,
          requiresApproval: newCount >= 3,
          updatedAt: new Date(),
        })
        .where(eq(userSpamStatus.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userSpamStatus)
        .values({ userId, flaggedCount: 1 })
        .returning();
      return created;
    }
  }

  // Brand settings operations
  async getBrandSettings(): Promise<BrandSettings | undefined> {
    const [settings] = await db.select().from(brandSettings).limit(1);
    return settings;
  }

  async updateBrandSettings(settings: Partial<InsertBrandSettings>): Promise<BrandSettings> {
    const existing = await this.getBrandSettings();

    if (existing) {
      const [updated] = await db
        .update(brandSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(brandSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(brandSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  // Chat usage operations
  async getChatUsage(userId: string): Promise<ChatUsage | undefined> {
    const [usage] = await db.select().from(chatUsage).where(eq(chatUsage.userId, userId));
    return usage;
  }

  async checkAndIncrementChatUsage(userId: string): Promise<{ allowed: boolean; reason?: string; resetIn?: number }> {
    const DAILY_LIMIT = 20;
    const HOURLY_LIMIT = 10;

    const now = new Date();
    const existing = await this.getChatUsage(userId);

    if (!existing) {
      // First time user - create record and allow
      await db.insert(chatUsage).values({
        userId,
        dailyCount: 1,
        hourlyCount: 1,
        lastResetDate: now,
        lastHourReset: now,
      });
      return { allowed: true };
    }

    let dailyCount = existing.dailyCount || 0;
    let hourlyCount = existing.hourlyCount || 0;
    let lastResetDate = existing.lastResetDate || now;
    let lastHourReset = existing.lastHourReset || now;

    // Check if we need to reset daily count (new day)
    const lastResetDay = new Date(lastResetDate).toDateString();
    const todayDay = now.toDateString();
    if (lastResetDay !== todayDay) {
      dailyCount = 0;
      lastResetDate = now;
    }

    // Check if we need to reset hourly count (more than 1 hour since last reset)
    const hoursSinceReset = (now.getTime() - new Date(lastHourReset).getTime()) / (1000 * 60 * 60);
    if (hoursSinceReset >= 1) {
      hourlyCount = 0;
      lastHourReset = now;
    }

    // Check limits
    if (dailyCount >= DAILY_LIMIT) {
      // Calculate time until midnight UTC
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      const resetIn = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60)); // minutes
      return {
        allowed: false,
        reason: "You've been working hard today! The mentor needs a break. Try again tomorrow.",
        resetIn
      };
    }

    if (hourlyCount >= HOURLY_LIMIT) {
      const resetIn = Math.ceil(60 - (hoursSinceReset * 60)); // minutes until hour reset
      return {
        allowed: false,
        reason: `You're on fire! Let's pace ourselves. Try again in ${resetIn} minutes.`,
        resetIn
      };
    }

    // Increment and update
    await db
      .update(chatUsage)
      .set({
        dailyCount: dailyCount + 1,
        hourlyCount: hourlyCount + 1,
        lastResetDate,
        lastHourReset,
      })
      .where(eq(chatUsage.userId, userId));

    return { allowed: true };
  }

  // Chatbot settings operations
  async getChatbotSettings(): Promise<ChatbotSettings | undefined> {
    const [settings] = await db.select().from(chatbotSettings).limit(1);
    return settings;
  }

  async updateChatbotSettings(settings: Partial<InsertChatbotSettings>): Promise<ChatbotSettings> {
    const existing = await this.getChatbotSettings();

    if (existing) {
      const [updated] = await db
        .update(chatbotSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(chatbotSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(chatbotSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  // Chat messages operations
  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    return created;
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt));
  }

  async getAllChatMessages(): Promise<(ChatMessage & { user: User })[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(500);

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const user = await this.getUser(msg.userId);
        return { ...msg, user: user! };
      })
    );
    return messagesWithUsers;
  }

  async getFlaggedMessages(): Promise<(ChatMessage & { user: User })[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.flagged, true), eq(chatMessages.reviewed, false)))
      .orderBy(desc(chatMessages.createdAt));

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const user = await this.getUser(msg.userId);
        return { ...msg, user: user! };
      })
    );
    return messagesWithUsers;
  }

  async markMessageReviewed(id: number): Promise<ChatMessage | undefined> {
    const [updated] = await db
      .update(chatMessages)
      .set({ reviewed: true })
      .where(eq(chatMessages.id, id))
      .returning();
    return updated;
  }

  async getUserChatSummary(): Promise<{ userId: string; user: User; messageCount: number; flaggedCount: number; lastMessage: Date }[]> {
    // Get all messages grouped by user
    const allMessages = await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt));

    // Group by user
    const userMap = new Map<string, { messages: typeof allMessages; flagged: number }>();
    allMessages.forEach((msg) => {
      const existing = userMap.get(msg.userId) || { messages: [], flagged: 0 };
      existing.messages.push(msg);
      if (msg.flagged) existing.flagged++;
      userMap.set(msg.userId, existing);
    });

    // Build summary
    const summaries = await Promise.all(
      Array.from(userMap.entries()).map(async ([userId, data]) => {
        const user = await this.getUser(userId);
        return {
          userId,
          user: user!,
          messageCount: data.messages.length,
          flaggedCount: data.flagged,
          lastMessage: data.messages[0]?.createdAt || new Date(),
        };
      })
    );

    return summaries.sort((a, b) => b.messageCount - a.messageCount);
  }
}

export const storage = new DatabaseStorage();
