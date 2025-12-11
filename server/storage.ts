import {
  users,
  dayContent,
  userProgress,
  badges,
  userBadges,
  userStats,
  dayComments,
  userSpamStatus,
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
}

export const storage = new DatabaseStorage();
