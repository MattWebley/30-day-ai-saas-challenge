import type { Express } from "express";
import { db } from "./db";
import {
  slmSettings, slmSections, slmWeeks, slmLessons,
  slmLessonProgress, slmZoomCalls, slmComments, users,
} from "@shared/schema";
import { eq, desc, and, asc, sql } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";

// Middleware: check admin (same pattern as funnelRoutes.ts)
async function requireAdmin(req: any, res: any, next: any) {
  const userId = req.user?.claims?.sub;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
  (req as any).adminUser = user;
  next();
}

// Helper: get or create the single settings row
async function getSettings() {
  const [existing] = await db.select().from(slmSettings);
  if (existing) return existing;
  const [created] = await db.insert(slmSettings).values({ isLive: false }).returning();
  return created;
}

// Helper: check if user has SLM access
async function checkAccess(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { allowed: false, reason: "User not found" };
  if (user.isAdmin) return { allowed: true };
  const settings = await getSettings();
  if (!settings.isLive) return { allowed: false, reason: "Coming soon" };
  if (!user.saasLaunchMachinePurchased) return { allowed: false, reason: "Not purchased" };
  return { allowed: true };
}

export function registerSlmRoutes(app: Express) {

  // ==========================================
  // ADMIN ROUTES
  // ==========================================

  // Settings
  app.get("/api/admin/slm/settings", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const settings = await getSettings();
      res.json(settings);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/slm/settings", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const settings = await getSettings();
      const [updated] = await db.update(slmSettings)
        .set({ isLive: req.body.isLive, updatedAt: new Date() })
        .where(eq(slmSettings.id, settings.id))
        .returning();
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Sections CRUD
  app.get("/api/admin/slm/sections", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const sections = await db.select().from(slmSections).orderBy(asc(slmSections.sortOrder));
      res.json(sections);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/slm/sections", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { title, description, sortOrder, isPublished } = req.body;
      const [section] = await db.insert(slmSections)
        .values({ title, description, sortOrder: sortOrder || 0, isPublished: isPublished || false })
        .returning();
      res.json(section);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/slm/sections/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { title, description, sortOrder, isPublished } = req.body;
      const [updated] = await db.update(slmSections)
        .set({ title, description, sortOrder, isPublished })
        .where(eq(slmSections.id, parseInt(req.params.id)))
        .returning();
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/slm/sections/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await db.delete(slmSections).where(eq(slmSections.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Weeks CRUD
  app.get("/api/admin/slm/weeks", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const sectionId = req.query.sectionId ? parseInt(req.query.sectionId as string) : undefined;
      const query = sectionId
        ? db.select().from(slmWeeks).where(eq(slmWeeks.sectionId, sectionId)).orderBy(asc(slmWeeks.sortOrder))
        : db.select().from(slmWeeks).orderBy(asc(slmWeeks.sortOrder));
      const weeks = await query;
      res.json(weeks);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/slm/weeks", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { sectionId, title, description, sortOrder, isPublished } = req.body;
      const [week] = await db.insert(slmWeeks)
        .values({ sectionId, title, description, sortOrder: sortOrder || 0, isPublished: isPublished || false })
        .returning();
      res.json(week);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/slm/weeks/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { sectionId, title, description, sortOrder, isPublished } = req.body;
      const [updated] = await db.update(slmWeeks)
        .set({ sectionId, title, description, sortOrder, isPublished })
        .where(eq(slmWeeks.id, parseInt(req.params.id)))
        .returning();
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/slm/weeks/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await db.delete(slmWeeks).where(eq(slmWeeks.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Lessons CRUD
  app.get("/api/admin/slm/lessons", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const weekId = req.query.weekId ? parseInt(req.query.weekId as string) : undefined;
      const query = weekId
        ? db.select().from(slmLessons).where(eq(slmLessons.weekId, weekId)).orderBy(asc(slmLessons.sortOrder))
        : db.select().from(slmLessons).orderBy(asc(slmLessons.sortOrder));
      const lessons = await query;
      res.json(lessons);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/slm/lessons", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { weekId, title, description, videoUrl, lessonText, interactiveComponent, sortOrder, isPublished } = req.body;
      const [lesson] = await db.insert(slmLessons)
        .values({ weekId, title, description, videoUrl, lessonText, interactiveComponent, sortOrder: sortOrder || 0, isPublished: isPublished || false })
        .returning();
      res.json(lesson);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/slm/lessons/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { weekId, title, description, videoUrl, lessonText, interactiveComponent, sortOrder, isPublished } = req.body;
      const [updated] = await db.update(slmLessons)
        .set({ weekId, title, description, videoUrl, lessonText, interactiveComponent, sortOrder, isPublished })
        .where(eq(slmLessons.id, parseInt(req.params.id)))
        .returning();
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/slm/lessons/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await db.delete(slmLessons).where(eq(slmLessons.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Zoom Calls CRUD
  app.get("/api/admin/slm/zoom-calls", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const calls = await db.select().from(slmZoomCalls).orderBy(desc(slmZoomCalls.scheduledAt));
      res.json(calls);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/slm/zoom-calls", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { title, scheduledAt, joinUrl, recordingUrl, isPast } = req.body;
      const [call] = await db.insert(slmZoomCalls)
        .values({ title, scheduledAt: new Date(scheduledAt), joinUrl, recordingUrl, isPast: isPast || false })
        .returning();
      res.json(call);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/slm/zoom-calls/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { title, scheduledAt, joinUrl, recordingUrl, isPast } = req.body;
      const [updated] = await db.update(slmZoomCalls)
        .set({ title, scheduledAt: new Date(scheduledAt), joinUrl, recordingUrl, isPast })
        .where(eq(slmZoomCalls.id, parseInt(req.params.id)))
        .returning();
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/slm/zoom-calls/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await db.delete(slmZoomCalls).where(eq(slmZoomCalls.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Comments moderation
  app.get("/api/admin/slm/comments", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const comments = await db.execute(sql`
        SELECT c.*, u.first_name, u.last_name, u.email, u.profile_image_url, u.is_admin,
               s.title as section_title
        FROM slm_comments c
        JOIN users u ON c.user_id = u.id
        JOIN slm_sections s ON c.section_id = s.id
        ORDER BY c.created_at DESC
      `);
      res.json(comments.rows || comments);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/slm/comments/:id/status", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const [updated] = await db.update(slmComments)
        .set({ status })
        .where(eq(slmComments.id, parseInt(req.params.id)))
        .returning();
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/slm/comments/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await db.delete(slmComments).where(eq(slmComments.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // USER ROUTES
  // ==========================================

  // Full content tree + progress + zoom calls
  app.get("/api/slm/content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const access = await checkAccess(userId);

      // Always return isLive + basic info so sidebar can show status
      const settings = await getSettings();

      if (!access.allowed) {
        return res.json({ isLive: settings.isLive, hasAccess: false, reason: access.reason });
      }

      // Fetch full content tree
      const sections = await db.select().from(slmSections)
        .where(eq(slmSections.isPublished, true))
        .orderBy(asc(slmSections.sortOrder));

      const weeks = await db.select().from(slmWeeks)
        .where(eq(slmWeeks.isPublished, true))
        .orderBy(asc(slmWeeks.sortOrder));

      const lessons = await db.select().from(slmLessons)
        .where(eq(slmLessons.isPublished, true))
        .orderBy(asc(slmLessons.sortOrder));

      // User progress
      const progress = await db.select().from(slmLessonProgress)
        .where(eq(slmLessonProgress.userId, userId));

      // Zoom calls
      const calls = await db.select().from(slmZoomCalls)
        .orderBy(desc(slmZoomCalls.scheduledAt));

      // Build tree structure
      const contentTree = sections.map(section => ({
        ...section,
        weeks: weeks
          .filter(w => w.sectionId === section.id)
          .map(week => ({
            ...week,
            lessons: lessons.filter(l => l.weekId === week.id),
          })),
      }));

      const totalLessons = lessons.length;
      const completedLessons = progress.filter(p => p.completed).length;

      res.json({
        isLive: settings.isLive,
        hasAccess: true,
        sections: contentTree,
        progress: progress,
        totalLessons,
        completedLessons,
        zoomCalls: calls,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Mark lesson complete
  app.post("/api/slm/lessons/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const access = await checkAccess(userId);
      if (!access.allowed) return res.status(403).json({ message: access.reason });

      const lessonId = parseInt(req.params.id);

      // Upsert progress
      const [existing] = await db.select().from(slmLessonProgress)
        .where(and(
          eq(slmLessonProgress.userId, userId),
          eq(slmLessonProgress.lessonId, lessonId),
        ));

      if (existing) {
        if (!existing.completed) {
          await db.update(slmLessonProgress)
            .set({ completed: true, completedAt: new Date() })
            .where(eq(slmLessonProgress.id, existing.id));
        }
      } else {
        await db.insert(slmLessonProgress)
          .values({ userId, lessonId, completed: true, completedAt: new Date() });
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Section comments (approved only)
  app.get("/api/slm/comments/:sectionId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const access = await checkAccess(userId);
      if (!access.allowed) return res.status(403).json({ message: access.reason });

      const sectionId = parseInt(req.params.sectionId);
      const comments = await db.execute(sql`
        SELECT c.*, u.first_name, u.last_name, u.email, u.profile_image_url, u.is_admin
        FROM slm_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.section_id = ${sectionId} AND c.status = 'approved'
        ORDER BY c.created_at DESC
        LIMIT 50
      `);
      res.json(comments.rows || comments);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Post comment
  app.post("/api/slm/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const access = await checkAccess(userId);
      if (!access.allowed) return res.status(403).json({ message: access.reason });

      const { sectionId, content } = req.body;
      if (!content?.trim()) return res.status(400).json({ message: "Content required" });

      const [comment] = await db.insert(slmComments)
        .values({ sectionId, userId, content: content.trim(), status: "approved" })
        .returning();
      res.json(comment);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Delete own comment
  app.delete("/api/slm/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const commentId = parseInt(req.params.id);

      const [comment] = await db.select().from(slmComments)
        .where(eq(slmComments.id, commentId));

      if (!comment) return res.status(404).json({ message: "Comment not found" });

      // Allow delete if user owns the comment or is admin
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (comment.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await db.delete(slmComments).where(eq(slmComments.id, commentId));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Zoom calls (user view)
  app.get("/api/slm/zoom-calls", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const access = await checkAccess(userId);
      if (!access.allowed) return res.status(403).json({ message: access.reason });

      const calls = await db.select().from(slmZoomCalls).orderBy(desc(slmZoomCalls.scheduledAt));
      res.json(calls);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Download .ics calendar invite
  app.get("/api/slm/zoom-calls/:id/ics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const access = await checkAccess(userId);
      if (!access.allowed) return res.status(403).json({ message: access.reason });

      const [call] = await db.select().from(slmZoomCalls)
        .where(eq(slmZoomCalls.id, parseInt(req.params.id)));

      if (!call) return res.status(404).json({ message: "Call not found" });

      const start = new Date(call.scheduledAt);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default

      const formatDate = (d: Date) =>
        d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SaaS Launch Machine//EN",
        "BEGIN:VEVENT",
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        `SUMMARY:${call.title}`,
        call.joinUrl ? `URL:${call.joinUrl}` : "",
        call.joinUrl ? `DESCRIPTION:Join: ${call.joinUrl}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
      ].filter(Boolean).join("\r\n");

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${call.title.replace(/[^a-z0-9]/gi, '_')}.ics"`);
      res.send(ics);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });
}
