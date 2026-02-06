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
  referrals,
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
  type Referral,
  type InsertReferral,
  showcase,
  type Showcase,
  type InsertShowcase,
  dayQuestions,
  type DayQuestion,
  type InsertDayQuestion,
  testimonials,
  type Testimonial,
  type InsertTestimonial,
  emailTemplates,
  type EmailTemplate,
  type InsertEmailTemplate,
  aiUsageLogs,
  type AIUsageLog,
  type InsertAIUsageLog,
  activityLogs,
  type ActivityLog,
  type InsertActivityLog,
  coupons,
  type Coupon,
  type InsertCoupon,
  couponUsages,
  type CouponUsage,
  type InsertCouponUsage,
  announcements,
  type Announcement,
  type InsertAnnouncement,
  announcementDismissals,
  type AnnouncementDismissal,
  type InsertAnnouncementDismissal,
  pendingPurchases,
  type PendingPurchase,
  emailLogs,
  type EmailLog,
  type InsertEmailLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNotNull, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getUserByEmail(email: string): Promise<User | undefined>;

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
  deleteUserBadges(userId: string): Promise<void>;
  
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
  getAllComments(): Promise<(DayComment & { user: User })[]>;
  deleteComment(id: number): Promise<void>;
  
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
  flagMessage(id: number, reason: string): Promise<ChatMessage | undefined>;
  getUserChatSummary(): Promise<{ userId: string; user: User; messageCount: number; flaggedCount: number; lastMessage: Date }[]>;

  // Showcase operations
  createShowcaseEntry(entry: InsertShowcase): Promise<Showcase>;
  getShowcaseEntry(userId: string): Promise<Showcase | undefined>;
  getApprovedShowcase(): Promise<(Showcase & { user: User })[]>;
  getPendingShowcase(): Promise<(Showcase & { user: User })[]>;
  updateShowcaseStatus(id: number, status: string): Promise<Showcase | undefined>;
  toggleShowcaseFeatured(id: number): Promise<Showcase | undefined>;

  // Q&A operations
  createQuestion(question: InsertDayQuestion): Promise<DayQuestion>;
  getQuestionsByDay(day: number): Promise<(DayQuestion & { user: User })[]>;
  getAnsweredQuestionsByDay(day: number): Promise<(DayQuestion & { user: User })[]>;
  getPendingQuestions(): Promise<(DayQuestion & { user: User })[]>;
  getAllQuestions(): Promise<(DayQuestion & { user: User })[]>;
  getQuestionByToken(token: string): Promise<DayQuestion | undefined>;
  answerQuestion(id: number, answer: string): Promise<DayQuestion | undefined>;
  setAiSuggestedAnswer(id: number, aiAnswer: string): Promise<DayQuestion | undefined>;
  markQuestionHelpful(id: number): Promise<DayQuestion | undefined>;
  hideQuestion(id: number): Promise<DayQuestion | undefined>;

  // Referral operations
  getUserByReferralCode(code: string): Promise<User | undefined>;
  setUserReferralCode(userId: string, code: string): Promise<User | undefined>;
  setUserReferredBy(userId: string, referralCode: string): Promise<User | undefined>;
  createReferral(referrerId: string, referredUserId: string): Promise<Referral>;
  getReferralCount(userId: string): Promise<number>;
  getReferrals(userId: string): Promise<Referral[]>;
  markReferralPurchased(referredUserId: string): Promise<void>;

  // Testimonial operations
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getUserTestimonial(userId: string): Promise<Testimonial | undefined>;
  getAllTestimonials(): Promise<(Testimonial & { user: User })[]>;
  toggleTestimonialFeatured(id: number): Promise<Testimonial | undefined>;

  // AI Usage logging operations
  logAIUsage(log: {
    userId: string;
    endpoint: string;
    tokensUsed: number;
    blocked: boolean;
    blockReason?: string;
    flagged: boolean;
    flagReason?: string;
    timestamp: Date;
  }): Promise<AIUsageLog>;
  getAIUsageLogs(options?: { userId?: string; flagged?: boolean; blocked?: boolean; limit?: number }): Promise<AIUsageLog[]>;
  getAIUsageStats(): Promise<{ totalCalls: number; totalTokens: number; blockedCalls: number; flaggedCalls: number }>;
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

    // Link any pending purchases for this email
    if (userData.email) {
      await this.linkPendingPurchases(user.id, userData.email);
    }

    return user;
  }

  async linkPendingPurchases(userId: string, email: string): Promise<void> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      // Find unlinked purchases for this email
      const pending = await db
        .select()
        .from(pendingPurchases)
        .where(
          and(
            sql`lower(${pendingPurchases.email}) = ${normalizedEmail}`,
            isNull(pendingPurchases.linkedToUserId)
          )
        );

      if (pending.length === 0) return;

      console.log(`[Link Purchases] Found ${pending.length} pending purchases for ${email}`);

      // Grant access based on product types
      const updateData: Partial<UpsertUser> = {};
      let stripeCustomerId = '';
      let purchaseCurrency = '';
      let firstName: string | undefined;
      let lastName: string | undefined;

      for (const purchase of pending) {
        stripeCustomerId = purchase.stripeCustomerId;
        purchaseCurrency = purchase.currency;
        if (!firstName && purchase.firstName) firstName = purchase.firstName;
        if (!lastName && purchase.lastName) lastName = purchase.lastName;

        switch (purchase.productType) {
          case 'challenge':
            updateData.challengePurchased = true;
            break;
          case 'coaching':
          case 'coaching-single':
          case 'coaching-matt':
          case 'coaching-matt-single':
            updateData.coachingPurchased = true;
            break;
        }

        // Mark as linked
        await db
          .update(pendingPurchases)
          .set({
            linkedToUserId: userId,
            linkedAt: new Date()
          })
          .where(eq(pendingPurchases.id, purchase.id));
      }

      // Update user with purchases and Stripe customer ID
      const shouldUpdateName = !!firstName || !!lastName;
      if (Object.keys(updateData).length > 0 || stripeCustomerId || shouldUpdateName) {
        await db
          .update(users)
          .set({
            ...updateData,
            ...(firstName ? { firstName: sql`coalesce(${users.firstName}, ${firstName})` } : {}),
            ...(lastName ? { lastName: sql`coalesce(${users.lastName}, ${lastName})` } : {}),
            stripeCustomerId: stripeCustomerId || undefined,
            purchaseCurrency: purchaseCurrency || undefined,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        console.log(`[Link Purchases] Granted access to user ${userId}:`, updateData);
      }
    } catch (error) {
      console.error('[Link Purchases] Error:', error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete related data first (cascading will handle most, but be explicit)
    await db.delete(userProgress).where(eq(userProgress.userId, id));
    await db.delete(userBadges).where(eq(userBadges.userId, id));
    await db.delete(userStats).where(eq(userStats.userId, id));
    await db.delete(chatMessages).where(eq(chatMessages.userId, id));
    await db.delete(chatUsage).where(eq(chatUsage.userId, id));
    await db.delete(dayComments).where(eq(dayComments.userId, id));
    await db.delete(userSpamStatus).where(eq(userSpamStatus.userId, id));
    // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${normalizedEmail}`);
    return user;
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
    userInputs?: Record<string, unknown>;
  }): Promise<UserProgress> {
    // Atomic upsert — prevents duplicate rows if two requests arrive simultaneously
    const [result] = await db
      .insert(userProgress)
      .values({
        userId,
        day,
        completed: true,
        completedAt: new Date(),
        ...data,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.day],
        set: {
          completed: true,
          completedAt: new Date(),
          ...data,
        },
      })
      .returning();
    return result;
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

  async deleteUserBadges(userId: string): Promise<void> {
    await db.delete(userBadges).where(eq(userBadges.userId, userId));
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

  async getAllComments(): Promise<(DayComment & { user: User })[]> {
    const comments = await db
      .select()
      .from(dayComments)
      .innerJoin(users, eq(dayComments.userId, users.id))
      .orderBy(desc(dayComments.createdAt));
    return comments.map(c => ({ ...c.day_comments, user: c.users }));
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(dayComments).where(eq(dayComments.id, id));
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

  async flagMessage(id: number, reason: string): Promise<ChatMessage | undefined> {
    const [updated] = await db
      .update(chatMessages)
      .set({ flagged: true, flagReason: reason })
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

  // Showcase operations
  async createShowcaseEntry(entry: InsertShowcase): Promise<Showcase> {
    // Check if user already has an entry
    const existing = await this.getShowcaseEntry(entry.userId);
    if (existing) {
      // Update existing entry
      const [updated] = await db
        .update(showcase)
        .set({ ...entry, status: "pending", createdAt: new Date() })
        .where(eq(showcase.userId, entry.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(showcase).values(entry).returning();
    return created;
  }

  async getShowcaseEntry(userId: string): Promise<Showcase | undefined> {
    const [entry] = await db.select().from(showcase).where(eq(showcase.userId, userId));
    return entry;
  }

  async getApprovedShowcase(): Promise<(Showcase & { user: User })[]> {
    const entries = await db
      .select()
      .from(showcase)
      .where(eq(showcase.status, "approved"))
      .orderBy(desc(showcase.featured), desc(showcase.createdAt));

    const entriesWithUsers = await Promise.all(
      entries.map(async (entry) => {
        const user = await this.getUser(entry.userId);
        return { ...entry, user: user! };
      })
    );
    return entriesWithUsers;
  }

  async getPendingShowcase(): Promise<(Showcase & { user: User })[]> {
    const entries = await db
      .select()
      .from(showcase)
      .where(eq(showcase.status, "pending"))
      .orderBy(desc(showcase.createdAt));

    const entriesWithUsers = await Promise.all(
      entries.map(async (entry) => {
        const user = await this.getUser(entry.userId);
        return { ...entry, user: user! };
      })
    );
    return entriesWithUsers;
  }

  async updateShowcaseStatus(id: number, status: string): Promise<Showcase | undefined> {
    const [updated] = await db
      .update(showcase)
      .set({ status })
      .where(eq(showcase.id, id))
      .returning();
    return updated;
  }

  async toggleShowcaseFeatured(id: number): Promise<Showcase | undefined> {
    const [entry] = await db.select().from(showcase).where(eq(showcase.id, id));
    if (!entry) return undefined;

    const [updated] = await db
      .update(showcase)
      .set({ featured: !entry.featured })
      .where(eq(showcase.id, id))
      .returning();
    return updated;
  }

  // Q&A operations
  async createQuestion(question: InsertDayQuestion): Promise<DayQuestion> {
    const [created] = await db.insert(dayQuestions).values(question).returning();
    return created;
  }

  async getQuestionsByDay(day: number): Promise<(DayQuestion & { user: User })[]> {
    const questions = await db
      .select()
      .from(dayQuestions)
      .innerJoin(users, eq(dayQuestions.userId, users.id))
      .where(eq(dayQuestions.day, day))
      .orderBy(desc(dayQuestions.createdAt));
    return questions.map(q => ({ ...q.day_questions, user: q.users }));
  }

  async getAnsweredQuestionsByDay(day: number): Promise<(DayQuestion & { user: User })[]> {
    const questions = await db
      .select()
      .from(dayQuestions)
      .innerJoin(users, eq(dayQuestions.userId, users.id))
      .where(and(
        eq(dayQuestions.day, day),
        eq(dayQuestions.status, "answered")
      ))
      .orderBy(desc(dayQuestions.helpful), desc(dayQuestions.answeredAt));
    return questions.map(q => ({ ...q.day_questions, user: q.users }));
  }

  async getPendingQuestions(): Promise<(DayQuestion & { user: User })[]> {
    const questions = await db
      .select()
      .from(dayQuestions)
      .innerJoin(users, eq(dayQuestions.userId, users.id))
      .where(eq(dayQuestions.status, "pending"))
      .orderBy(desc(dayQuestions.createdAt));
    return questions.map(q => ({ ...q.day_questions, user: q.users }));
  }

  async getAllQuestions(): Promise<(DayQuestion & { user: User })[]> {
    const questions = await db
      .select()
      .from(dayQuestions)
      .innerJoin(users, eq(dayQuestions.userId, users.id))
      .orderBy(desc(dayQuestions.createdAt));
    return questions.map(q => ({ ...q.day_questions, user: q.users }));
  }

  async getQuestionByToken(token: string): Promise<DayQuestion | undefined> {
    const [question] = await db
      .select()
      .from(dayQuestions)
      .where(eq(dayQuestions.answerToken, token));
    return question;
  }

  async answerQuestion(id: number, answer: string): Promise<DayQuestion | undefined> {
    const [updated] = await db
      .update(dayQuestions)
      .set({
        answer,
        status: "answered",
        answeredAt: new Date()
      })
      .where(eq(dayQuestions.id, id))
      .returning();
    return updated;
  }

  async setAiSuggestedAnswer(id: number, aiAnswer: string): Promise<DayQuestion | undefined> {
    const [updated] = await db
      .update(dayQuestions)
      .set({ aiSuggestedAnswer: aiAnswer })
      .where(eq(dayQuestions.id, id))
      .returning();
    return updated;
  }

  async markQuestionHelpful(id: number): Promise<DayQuestion | undefined> {
    const [question] = await db.select().from(dayQuestions).where(eq(dayQuestions.id, id));
    if (!question) return undefined;

    const [updated] = await db
      .update(dayQuestions)
      .set({ helpful: (question.helpful || 0) + 1 })
      .where(eq(dayQuestions.id, id))
      .returning();
    return updated;
  }

  async hideQuestion(id: number): Promise<DayQuestion | undefined> {
    const [updated] = await db
      .update(dayQuestions)
      .set({ status: "hidden" })
      .where(eq(dayQuestions.id, id))
      .returning();
    return updated;
  }

  // Referral operations
  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async setUserReferralCode(userId: string, code: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async setUserReferredBy(userId: string, referralCode: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ referredBy: referralCode })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async createReferral(referrerId: string, referredUserId: string): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values({ referrerId, referredUserId })
      .returning();
    return referral;
  }

  async getReferralCount(userId: string): Promise<number> {
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));
    return userReferrals.length;
  }

  async getReferrals(userId: string): Promise<Referral[]> {
    return db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async markReferralPurchased(referredUserId: string): Promise<void> {
    await db
      .update(referrals)
      .set({ referredUserPurchased: true })
      .where(eq(referrals.referredUserId, referredUserId));
  }

  // Testimonial operations
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [created] = await db.insert(testimonials).values(testimonial).returning();
    return created;
  }

  async getUserTestimonial(userId: string): Promise<Testimonial | undefined> {
    const [testimonial] = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.userId, userId))
      .limit(1);
    return testimonial;
  }

  async getAllTestimonials(): Promise<(Testimonial & { user: User })[]> {
    const entries = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.featured), desc(testimonials.createdAt));

    const result: (Testimonial & { user: User })[] = [];
    for (const entry of entries) {
      const user = await this.getUser(entry.userId);
      if (user) {
        result.push({ ...entry, user });
      }
    }
    return result;
  }

  async toggleTestimonialFeatured(id: number): Promise<Testimonial | undefined> {
    const [existing] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    if (!existing) return undefined;

    const [updated] = await db
      .update(testimonials)
      .set({ featured: !existing.featured })
      .where(eq(testimonials.id, id))
      .returning();
    return updated;
  }

  // Email Templates
  async getEmailTemplate(templateKey: string): Promise<EmailTemplate | undefined> {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.templateKey, templateKey));
    return template;
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(emailTemplates.name);
  }

  async updateEmailTemplate(
    templateKey: string,
    updates: { subject?: string; body?: string; isActive?: boolean }
  ): Promise<EmailTemplate | undefined> {
    const [updated] = await db
      .update(emailTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailTemplates.templateKey, templateKey))
      .returning();
    return updated;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [created] = await db
      .insert(emailTemplates)
      .values(template)
      .returning();
    return created;
  }

  async upsertEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const existing = await this.getEmailTemplate(template.templateKey);
    if (existing) {
      const [updated] = await db
        .update(emailTemplates)
        .set({ ...template, updatedAt: new Date() })
        .where(eq(emailTemplates.templateKey, template.templateKey))
        .returning();
      return updated;
    }
    return this.createEmailTemplate(template);
  }

  // AI Usage logging operations
  async logAIUsage(log: {
    userId: string;
    endpoint: string;
    tokensUsed: number;
    blocked: boolean;
    blockReason?: string;
    flagged: boolean;
    flagReason?: string;
    timestamp: Date;
  }): Promise<AIUsageLog> {
    const [created] = await db
      .insert(aiUsageLogs)
      .values({
        userId: log.userId,
        endpoint: log.endpoint,
        tokensUsed: log.tokensUsed,
        blocked: log.blocked,
        blockReason: log.blockReason || null,
        flagged: log.flagged,
        flagReason: log.flagReason || null,
      })
      .returning();
    return created;
  }

  async getAIUsageLogs(options?: { userId?: string; flagged?: boolean; blocked?: boolean; limit?: number }): Promise<AIUsageLog[]> {
    let query = db.select().from(aiUsageLogs);

    const conditions = [];
    if (options?.userId) {
      conditions.push(eq(aiUsageLogs.userId, options.userId));
    }
    if (options?.flagged !== undefined) {
      conditions.push(eq(aiUsageLogs.flagged, options.flagged));
    }
    if (options?.blocked !== undefined) {
      conditions.push(eq(aiUsageLogs.blocked, options.blocked));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return await query
      .orderBy(desc(aiUsageLogs.createdAt))
      .limit(options?.limit || 100);
  }

  async getAIUsageStats(): Promise<{ totalCalls: number; totalTokens: number; blockedCalls: number; flaggedCalls: number }> {
    const logs = await db.select().from(aiUsageLogs);

    return {
      totalCalls: logs.length,
      totalTokens: logs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0),
      blockedCalls: logs.filter(log => log.blocked).length,
      flaggedCalls: logs.filter(log => log.flagged).length,
    };
  }

  // Activity log operations
  async logActivity(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return created;
  }

  async getActivityLogs(options?: {
    userId?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<(ActivityLog & { user?: User; targetUser?: User })[]> {
    const conditions = [];
    if (options?.userId) {
      conditions.push(eq(activityLogs.userId, options.userId));
    }
    if (options?.category) {
      conditions.push(eq(activityLogs.category, options.category));
    }

    let query = db.select().from(activityLogs);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const logs = await query
      .orderBy(desc(activityLogs.createdAt))
      .limit(options?.limit || 100)
      .offset(options?.offset || 0);

    // Fetch user info for each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = log.userId ? await this.getUser(log.userId) : undefined;
        const targetUser = log.targetUserId ? await this.getUser(log.targetUserId) : undefined;
        return { ...log, user, targetUser };
      })
    );

    return logsWithUsers;
  }

  async getActivityLogStats(): Promise<{
    totalLogs: number;
    todayLogs: number;
    categoryCounts: Record<string, number>;
  }> {
    const logs = await db.select().from(activityLogs);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categoryCounts: Record<string, number> = {};
    let todayCount = 0;

    logs.forEach(log => {
      // Count by category
      categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;

      // Count today's logs
      if (log.createdAt && new Date(log.createdAt) >= today) {
        todayCount++;
      }
    });

    return {
      totalLogs: logs.length,
      todayLogs: todayCount,
      categoryCounts,
    };
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [created] = await db
      .insert(coupons)
      .values(coupon)
      .returning();
    return created;
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()));
    return coupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db
      .select()
      .from(coupons)
      .orderBy(desc(coupons.createdAt));
  }

  async updateCoupon(id: number, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const [updated] = await db
      .update(coupons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return updated;
  }

  async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async incrementCouponUsage(id: number): Promise<void> {
    const coupon = await this.getCoupon(id);
    if (coupon) {
      await db
        .update(coupons)
        .set({ currentUses: (coupon.currentUses || 0) + 1 })
        .where(eq(coupons.id, id));
    }
  }

  async recordCouponUsage(usage: InsertCouponUsage): Promise<CouponUsage> {
    const [created] = await db
      .insert(couponUsages)
      .values(usage)
      .returning();
    // Also increment the usage count on the coupon
    if (usage.couponId) {
      await this.incrementCouponUsage(usage.couponId);
    }
    return created;
  }

  async getCouponUsages(couponId: number): Promise<CouponUsage[]> {
    return await db
      .select()
      .from(couponUsages)
      .where(eq(couponUsages.couponId, couponId))
      .orderBy(desc(couponUsages.usedAt));
  }

  async validateCoupon(code: string, purchaseAmount?: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
    discountAmount?: number;
  }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return { valid: false, error: 'This coupon is not yet active' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return { valid: false, error: 'This coupon has expired' };
    }

    if (coupon.maxUses && coupon.currentUses && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    if (purchaseAmount && coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      return { valid: false, error: `Minimum purchase of ${coupon.minPurchaseAmount / 100} required` };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (purchaseAmount) {
      if (coupon.discountType === 'percent') {
        discountAmount = Math.floor(purchaseAmount * (coupon.discountAmount / 100));
      } else {
        discountAmount = Math.min(coupon.discountAmount, purchaseAmount);
      }
    }

    return { valid: true, coupon, discountAmount };
  }

  // Announcement operations
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return created;
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));
    return announcement;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date();
    const all = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));

    // Filter by date range
    return all.filter(a => {
      if (a.startsAt && new Date(a.startsAt) > now) return false;
      if (a.expiresAt && new Date(a.expiresAt) < now) return false;
      return true;
    });
  }

  async getAnnouncementsForUser(userId: string, segment: string): Promise<Announcement[]> {
    const active = await this.getActiveAnnouncements();

    // Get dismissed announcements for this user
    const dismissed = await db
      .select()
      .from(announcementDismissals)
      .where(eq(announcementDismissals.userId, userId));
    const dismissedIds = new Set(dismissed.map(d => d.announcementId));

    // Filter by segment and not dismissed
    return active.filter(a => {
      if (dismissedIds.has(a.id)) return false;
      if (a.targetSegment === 'all') return true;
      return a.targetSegment === segment;
    });
  }

  async updateAnnouncement(id: number, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db
      .update(announcements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async dismissAnnouncement(announcementId: number, userId: string): Promise<void> {
    await db
      .insert(announcementDismissals)
      .values({ announcementId, userId })
      .onConflictDoNothing();
  }

  // Email log operations
  async logEmail(data: InsertEmailLog): Promise<EmailLog> {
    const [created] = await db.insert(emailLogs).values(data).returning();
    return created;
  }

  async getEmailLogs(limit: number = 50, offset: number = 0): Promise<EmailLog[]> {
    return await db
      .select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.sentAt))
      .limit(limit)
      .offset(offset);
  }
}

export const storage = new DatabaseStorage();
