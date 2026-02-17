import type { Express } from "express";
import { db } from "./db";
import {
  funnelCampaigns, funnelPresentations, funnelModules, funnelModuleVariants,
  funnelSlides, funnelOptinPages, funnelVariationSets, funnelVisitors,
  funnelEvents, funnelAdSpend, funnelAdCopy, users,
} from "@shared/schema";
import { eq, desc, and, sql, count, gte } from "drizzle-orm";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import multer from "multer";
import { addContactToSysteme } from "./systemeService";
import { isAuthenticated } from "./replitAuth";
import Anthropic from "@anthropic-ai/sdk";

// Set up multer for slide media uploads (images + videos)
const uploadsDir = path.resolve("uploads/slides");
fs.mkdirSync(uploadsDir, { recursive: true });

const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const videoExts = [".mp4", ".webm"];
const allMediaExts = [...imageExts, ...videoExts];

const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `slide_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (videos can be larger)
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allMediaExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, png, gif, webp, mp4, and webm files are allowed"));
    }
  },
});

// Middleware: check admin (looks up DB user like existing routes.ts pattern)
async function requireAdmin(req: any, res: any, next: any) {
  const userId = req.user?.claims?.sub;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
  (req as any).adminUser = user;
  next();
}

export function registerFunnelRoutes(app: Express) {

  // ==========================================
  // Media Upload (images + videos)
  // ==========================================

  app.post("/api/admin/funnels/upload-media", isAuthenticated, requireAdmin, (req: any, res: any) => {
    mediaUpload.single("file")(req, res, (err: any) => {
      if (err) {
        const msg = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "File too large (max 50MB)"
          : err.message || "Upload failed";
        return res.status(400).json({ message: msg });
      }
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const ext = path.extname(req.file.filename).toLowerCase();
      const type = videoExts.includes(ext) ? "video" : "image";
      const url = `/uploads/slides/${req.file.filename}`;
      res.json({ url, type });
    });
  });

  // Keep old endpoint for backwards compatibility
  app.post("/api/admin/funnels/upload-image", isAuthenticated, requireAdmin, (req: any, res: any) => {
    mediaUpload.single("image")(req, res, (err: any) => {
      if (err) {
        const msg = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "File too large (max 50MB)"
          : err.message || "Upload failed";
        return res.status(400).json({ message: msg });
      }
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const url = `/uploads/slides/${req.file.filename}`;
      res.json({ url });
    });
  });

  // ==========================================
  // ADMIN CRUD - Campaigns
  // ==========================================

  app.get("/api/admin/funnels/campaigns", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const campaigns = await db.select().from(funnelCampaigns).orderBy(desc(funnelCampaigns.createdAt));
      res.json(campaigns);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/funnels/campaigns", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, slug, ctaText, ctaUrl, ctaAppearTime } = req.body;
      if (!name || !slug) return res.status(400).json({ message: "Name and slug required" });
      const [campaign] = await db.insert(funnelCampaigns).values({
        name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        ctaText, ctaUrl, ctaAppearTime,
      }).returning();
      res.json(campaign);
    } catch (e: any) {
      if (e.message?.includes("unique")) return res.status(400).json({ message: "Slug already exists" });
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/campaigns/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, slug, isActive, presentationId, watchHeadline, watchSubheadline, speakerVideoUrl, ctaText, ctaUrl, ctaAppearTime } = req.body;
      const [campaign] = await db.update(funnelCampaigns)
        .set({ name, slug, isActive, presentationId, watchHeadline, watchSubheadline, speakerVideoUrl, ctaText, ctaUrl, ctaAppearTime, updatedAt: new Date() })
        .where(eq(funnelCampaigns.id, id))
        .returning();
      res.json(campaign);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/campaigns/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelCampaigns).where(eq(funnelCampaigns.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN CRUD - Presentations
  // ==========================================

  app.get("/api/admin/funnels/presentations", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const presentations = await db.select().from(funnelPresentations).orderBy(desc(funnelPresentations.createdAt));
      res.json(presentations);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/funnels/presentations", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: "Name required" });
      const [presentation] = await db.insert(funnelPresentations).values({ name, description }).returning();
      res.json(presentation);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/presentations/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, description, theme, fontSettings, displayMode } = req.body;
      const [presentation] = await db.update(funnelPresentations)
        .set({ name, description, theme, fontSettings, displayMode, updatedAt: new Date() })
        .where(eq(funnelPresentations.id, parseInt(req.params.id)))
        .returning();
      res.json(presentation);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/presentations/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelPresentations).where(eq(funnelPresentations.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Get full presentation with modules, variants, slides
  app.get("/api/admin/funnels/presentations/:id/full", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const [presentation] = await db.select().from(funnelPresentations).where(eq(funnelPresentations.id, id));
      if (!presentation) return res.status(404).json({ message: "Not found" });

      const modules = await db.select().from(funnelModules)
        .where(eq(funnelModules.presentationId, id))
        .orderBy(funnelModules.sortOrder);

      const modulesWithVariants = await Promise.all(modules.map(async (mod) => {
        const variants = await db.select().from(funnelModuleVariants)
          .where(eq(funnelModuleVariants.moduleId, mod.id));

        const variantsWithSlides = await Promise.all(variants.map(async (v) => {
          const slides = await db.select().from(funnelSlides)
            .where(eq(funnelSlides.variantId, v.id))
            .orderBy(funnelSlides.sortOrder);
          return { ...v, slides };
        }));

        return { ...mod, variants: variantsWithSlides };
      }));

      res.json({ ...presentation, modules: modulesWithVariants });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - Generate slides from script (AI)
  // ==========================================

  app.post("/api/admin/funnels/presentations/:id/generate-slides", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const presentationId = parseInt(req.params.id);
      const { script, simple } = req.body;
      if (!script || script.trim().length < 20) {
        return res.status(400).json({ message: "Script must be at least 20 characters" });
      }

      // Check presentation exists
      const [presentation] = await db.select().from(funnelPresentations).where(eq(funnelPresentations.id, presentationId));
      if (!presentation) return res.status(404).json({ message: "Presentation not found" });

      // simple flag from client = plain sentence split, no AI
      const isTextMode = simple || presentation.displayMode === "text";

      // Ensure displayMode is saved as "text" when doing simple split
      if (isTextMode && presentation.displayMode !== "text") {
        await db.update(funnelPresentations).set({ displayMode: "text" }).where(eq(funnelPresentations.id, presentationId)).catch(() => {});
      }

      // Auto-create module + variant if none exist
      let modules = await db.select().from(funnelModules).where(eq(funnelModules.presentationId, presentationId));
      let moduleId: number;
      let variantId: number;

      if (modules.length === 0) {
        const [mod] = await db.insert(funnelModules).values({
          presentationId, name: "Main", sortOrder: 0, isSwappable: false,
        }).returning();
        moduleId = mod.id;

        const [variant] = await db.insert(funnelModuleVariants).values({
          moduleId: mod.id, name: "Default", mediaType: "audio_slides", scriptText: script,
        }).returning();
        variantId = variant.id;
      } else {
        moduleId = modules[0].id;
        // Get or create first variant
        const variants = await db.select().from(funnelModuleVariants).where(eq(funnelModuleVariants.moduleId, moduleId));
        if (variants.length === 0) {
          const [variant] = await db.insert(funnelModuleVariants).values({
            moduleId, name: "Default", mediaType: "audio_slides", scriptText: script,
          }).returning();
          variantId = variant.id;
        } else {
          variantId = variants[0].id;
          // Update script on existing variant
          await db.update(funnelModuleVariants).set({ scriptText: script }).where(eq(funnelModuleVariants.id, variantId));
        }
      }

      // Simple sentence splitting (no AI) — always used for Text Sync mode
      if (isTextMode) {
        // Split script into sentences, group 1-2 per segment
        const rawSentences = script
          .replace(/\n{2,}/g, ' ¶ ') // preserve paragraph breaks as markers
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .split(/(?<=[.!?])\s+/)
          .map((s: string) => s.replace(/¶/g, '').trim())
          .filter((s: string) => s.length > 0);

        // Group: if a sentence is short (< 60 chars), pair it with the next one
        const segments: string[] = [];
        let i = 0;
        while (i < rawSentences.length) {
          const current = rawSentences[i];
          if (current.length < 60 && i + 1 < rawSentences.length) {
            segments.push(current + ' ' + rawSentences[i + 1]);
            i += 2;
          } else {
            segments.push(current);
            i += 1;
          }
        }

        // Delete existing slides
        await db.delete(funnelSlides).where(eq(funnelSlides.variantId, variantId));

        // Insert segments as slides
        const createdSlides = [];
        for (let s = 0; s < segments.length; s++) {
          const [slide] = await db.insert(funnelSlides).values({
            variantId,
            sortOrder: s,
            headline: "",
            body: segments[s],
            scriptNotes: null,
            startTimeMs: 0,
          }).returning();
          createdSlides.push(slide);
        }

        console.log(`[generate-slides] Simple split: ${segments.length} segments from ${script.length} chars`);
        return res.json({ slides: createdSlides, variantId, moduleId });
      }

      // Call Anthropic API directly (bypass abuse detection - this is admin-only)
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const SYSTEM_PROMPT = isTextMode
        ? `You are a presentation text-sync designer. Break the user's script into individual text segments that will be displayed ONE AT A TIME as large text on a white background, synced to audio.

Each segment should have:
- "headline": ALWAYS empty string ""
- "body": ONE sentence or short phrase (what the viewer reads on screen while listening). Keep it punchy — max ~15 words. This is NOT a slide, it's a text overlay.
- "scriptNotes": the FULL original script text for this section (everything spoken aloud while this text is showing)

Create more segments than you would slides — aim for one segment per sentence or key phrase. The viewer should see text change frequently (every 5-15 seconds of speech).

Return ONLY a valid JSON array, no other text.
Example: [{"headline":"","body":"Every great product starts with a problem.","scriptNotes":"Every great product starts with a problem. Think about the last time you were frustrated by something..."}]`
        : `You are a presentation slide designer. Break the user's script into presentation slides. Each slide should have:
- "headline": short punchy headline (max 8 words)
- "body": 1-3 key sentences for the audience to see
- "scriptNotes": the FULL original script text for this section (everything the presenter reads aloud while this slide is showing)

Aim for one slide per key point or paragraph. Return ONLY a valid JSON array, no other text.
Example: [{"headline":"Your Big Idea","body":"Every great product starts with...","scriptNotes":"Every great product starts with a problem. Think about the last time you were frustrated by something..."}]`;

      // Helper to parse AI JSON response with fallback strategies
      const parseSlideResponse = (raw: string): { headline: string; body: string; scriptNotes?: string }[] => {
        let result: { headline: string; body: string; scriptNotes?: string }[] = [];
        try { result = JSON.parse(raw); } catch {}
        if (Array.isArray(result) && result.length > 0) return result;
        const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) { try { result = JSON.parse(codeBlockMatch[1].trim()); } catch {} }
        if (Array.isArray(result) && result.length > 0) return result;
        const arrayMatch = raw.match(/\[[\s\S]*\]/);
        if (arrayMatch) { try { result = JSON.parse(arrayMatch[0]); } catch {} }
        if (Array.isArray(result) && result.length > 0) return result;
        const objMatch = raw.match(/\{[\s\S]*"slides"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
        if (objMatch) { try { const p = JSON.parse(objMatch[0]); if (Array.isArray(p.slides)) return p.slides; } catch {} }
        return [];
      }

      // Split script into chunks by paragraphs - each chunk ~6000 chars max
      // This ensures even hour-long webinar scripts get fully processed
      const CHUNK_SIZE = 6000;
      const paragraphs = script.split(/\n\s*\n/);
      const chunks: string[] = [];
      let currentChunk = "";

      for (const para of paragraphs) {
        if (currentChunk.length + para.length + 2 > CHUNK_SIZE && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
        currentChunk += para + "\n\n";
      }
      if (currentChunk.trim()) chunks.push(currentChunk.trim());

      // If no paragraph breaks, split by sentences instead
      if (chunks.length === 1 && chunks[0].length > CHUNK_SIZE) {
        const longText = chunks[0];
        chunks.length = 0;
        let pos = 0;
        while (pos < longText.length) {
          let end = Math.min(pos + CHUNK_SIZE, longText.length);
          // Try to break at a sentence boundary
          if (end < longText.length) {
            const lastPeriod = longText.lastIndexOf('. ', end);
            if (lastPeriod > pos + CHUNK_SIZE / 2) end = lastPeriod + 2;
          }
          chunks.push(longText.substring(pos, end).trim());
          pos = end;
        }
      }

      console.log(`[generate-slides] Processing ${chunks.length} chunk(s), total script length: ${script.length} chars`);

      // Process each chunk through the AI
      let slides: { headline: string; body: string; scriptNotes?: string }[] = [];

      for (let c = 0; c < chunks.length; c++) {
        const chunkLabel = chunks.length > 1 ? ` (part ${c + 1} of ${chunks.length})` : "";
        console.log(`[generate-slides] Processing chunk ${c + 1}/${chunks.length}, ${chunks[c].length} chars`);

        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 16000,
            system: SYSTEM_PROMPT,
            messages: [{
              role: "user",
              content: `Break this script${chunkLabel} into presentation slides. Return ONLY a JSON array of objects with "headline", "body", and "scriptNotes" fields:\n\n${chunks[c]}`,
            }],
          });
          const raw = response.content[0].type === "text" ? response.content[0].text : "";
          console.log(`[generate-slides] Chunk ${c + 1} response length: ${raw.length}`);

          const chunkSlides = parseSlideResponse(raw);
          if (chunkSlides.length > 0) {
            slides.push(...chunkSlides);
          } else {
            console.error(`[generate-slides] Chunk ${c + 1} returned no parseable slides`);
          }
        } catch (aiError: any) {
          console.error(`[generate-slides] Claude API error on chunk ${c + 1}:`, aiError.message);
          // Continue with other chunks even if one fails
          if (chunks.length === 1) {
            return res.status(500).json({ message: `AI error: ${aiError.message}` });
          }
        }
      }

      if (slides.length === 0) {
        return res.status(500).json({ message: "AI returned an unexpected format. Please try again." });
      }

      console.log(`[generate-slides] Total slides generated: ${slides.length}`);

      // Delete existing slides on this variant
      await db.delete(funnelSlides).where(eq(funnelSlides.variantId, variantId));

      // Insert new slides
      const createdSlides = [];
      for (let i = 0; i < slides.length; i++) {
        const s = slides[i];
        const [slide] = await db.insert(funnelSlides).values({
          variantId,
          sortOrder: i,
          headline: s.headline,
          body: s.body,
          scriptNotes: s.scriptNotes || null,
          startTimeMs: 0,
        }).returning();
        createdSlides.push(slide);
      }

      res.json({ slides: createdSlides, variantId, moduleId });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - AI "Format for Impact" - rewrites slides for engagement
  // ==========================================

  app.post("/api/admin/funnels/presentations/:id/format-for-impact", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const presentationId = parseInt(req.params.id);
      const [presentation] = await db.select().from(funnelPresentations).where(eq(funnelPresentations.id, presentationId));
      if (!presentation) return res.status(404).json({ message: "Presentation not found" });

      const isTextMode = presentation.displayMode === "text";

      // Get all modules → variants → slides
      const modules = await db.select().from(funnelModules)
        .where(eq(funnelModules.presentationId, presentationId))
        .orderBy(funnelModules.sortOrder);

      const allSlides: { id: number; sortOrder: number; headline: string | null; body: string | null; scriptNotes: string | null }[] = [];

      for (const mod of modules) {
        const variants = await db.select().from(funnelModuleVariants)
          .where(eq(funnelModuleVariants.moduleId, mod.id));
        for (const variant of variants) {
          const slides = await db.select().from(funnelSlides)
            .where(eq(funnelSlides.variantId, variant.id))
            .orderBy(funnelSlides.sortOrder);
          allSlides.push(...slides.map(s => ({ id: s.id, sortOrder: s.sortOrder, headline: s.headline, body: s.body, scriptNotes: s.scriptNotes })));
        }
      }

      if (allSlides.length === 0) return res.status(400).json({ message: "No slides to format" });

      // Optional limit - only process first N slides to save API costs during testing
      const limit = req.body?.limit;
      const slidesToProcess = limit && limit > 0 ? allSlides.slice(0, limit) : allSlides;
      console.log(`[format-for-impact] Processing ${slidesToProcess.length} of ${allSlides.length} total slides${limit ? ` (limited to ${limit})` : ""}`);

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const IMPACT_SYSTEM = isTextMode
        ? `You are a direct-response copywriter. You reformat text segments for MAXIMUM spoken impact.

These segments display ONE AT A TIME as large black text on a white screen, synced to audio. Think teleprompter for the VIEWER — they read along as the speaker talks.

Rules:
1. Each segment has "headline" (ALWAYS empty "") and "body" (the single sentence/phrase the viewer sees).
2. Body text: ONE punchy sentence or fragment, max ~15 words. Short hits hard.
3. Keep the same NUMBER of segments.
4. Keep the core MESSAGE — just rewrite for spoken impact and clarity.
5. Markup (max 1 per segment): *word* = underline, **word** = bold accent. Use sparingly.
6. Script Notes = CONTEXT only, do NOT include in output.

Return ONLY a valid JSON array: [{"headline":"","body":"..."}]`
        : `You are a direct-response copywriter. You reformat presentation slides for MAXIMUM engagement.

Each slide has two fields: "headline" (renders HUGE and dominant) and "body" (renders smaller beneath). The size difference IS the design.

CRITICAL: At least 70% of slides MUST have a non-empty headline. If a slide has text, pick the most powerful line for headline. NEVER dump all text into body with an empty headline — that makes everything the same size and kills the impact.

Rules:
1. LAYOUTS - mix these up:
   - 40% headline ONLY (body="") — bold punchy statements, one line fills the screen
   - 30% headline + body — headline is the hook, body is the explanation
   - 30% body ONLY (headline="") — storytelling, quiet narrative moments. USE SPARINGLY.
2. Headlines: SHORT and punchy. 2-8 words. The STRONGEST line from the slide content.
3. Body: conversational, short sentences, fragments fine. Use \\n for line breaks between stacked lines.
4. Markup (max 1-2 per slide): *word* = underline, **word** = accent color, ==word== = highlight (rare)
5. Keep the same NUMBER of slides.
6. Keep the core MESSAGE — just restructure for impact.
7. Think like a webinar host. Curiosity gaps, open loops, pattern interrupts.
8. Script Notes = CONTEXT only, do NOT include in output.

Return ONLY a valid JSON array: [{"headline":"...","body":"..."}]
Use "" (not null) for empty fields.`;

      // Helper to parse AI JSON response
      const parseFormatResponse = (raw: string): { headline: string; body: string }[] => {
        let result: { headline: string; body: string }[] = [];
        try { result = JSON.parse(raw); } catch {}
        if (Array.isArray(result) && result.length > 0) return result;
        const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) { try { result = JSON.parse(codeBlockMatch[1].trim()); } catch {} }
        if (Array.isArray(result) && result.length > 0) return result;
        const arrayMatch = raw.match(/\[[\s\S]*\]/);
        if (arrayMatch) { try { result = JSON.parse(arrayMatch[0]); } catch {} }
        return Array.isArray(result) ? result : [];
      };

      // Process in chunks of 15 slides at a time
      const BATCH_SIZE = 15;
      let totalUpdated = 0;

      for (let batchStart = 0; batchStart < slidesToProcess.length; batchStart += BATCH_SIZE) {
        const batch = slidesToProcess.slice(batchStart, batchStart + BATCH_SIZE);
        const batchLabel = slidesToProcess.length > BATCH_SIZE ? ` (slides ${batchStart + 1}-${batchStart + batch.length} of ${slidesToProcess.length})` : "";

        const batchContent = batch.map((s, i) => {
          let text = `Slide ${batchStart + i + 1}:\nHeadline: ${s.headline || "(empty)"}\nBody: ${s.body || "(empty)"}`;
          if (s.scriptNotes) text += `\nScript Notes: ${s.scriptNotes}`;
          return text;
        }).join("\n\n");

        console.log(`[format-for-impact] Processing batch${batchLabel}, ${batch.length} slides`);

        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 8000,
            system: IMPACT_SYSTEM,
            messages: [{
              role: "user",
              content: `Rewrite these ${batch.length} slides${batchLabel} for maximum impact and conversions. Return exactly ${batch.length} slides as a JSON array:\n\n${batchContent}`,
            }],
          });

          const raw = response.content[0].type === "text" ? response.content[0].text : "";
          const formatted = parseFormatResponse(raw);

          if (formatted.length > 0) {
            const updateCount = Math.min(formatted.length, batch.length);
            for (let i = 0; i < updateCount; i++) {
              const f = formatted[i];
              await db.update(funnelSlides).set({
                headline: f.headline || null,
                body: f.body || null,
              }).where(eq(funnelSlides.id, batch[i].id));
            }
            totalUpdated += updateCount;
          } else {
            console.error(`[format-for-impact] Batch starting at ${batchStart} returned no parseable slides`);
          }
        } catch (batchError: any) {
          console.error(`[format-for-impact] Batch error:`, batchError.message);
          if (slidesToProcess.length <= BATCH_SIZE) {
            return res.status(500).json({ message: `AI error: ${batchError.message}` });
          }
        }
      }

      if (totalUpdated === 0) {
        return res.status(500).json({ message: "AI returned invalid format. Please try again." });
      }

      console.log(`[format-for-impact] Done, updated ${totalUpdated} slides`);
      res.json({ success: true, slidesUpdated: totalUpdated });
    } catch (e: any) {
      console.error("[format-for-impact] Error:", e.message);
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - AI "Master Layout Energy" - dramatic typography reformatting
  // ==========================================

  app.post("/api/admin/funnels/presentations/:id/master-layout-energy", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const presentationId = parseInt(req.params.id);
      const [presentation] = await db.select().from(funnelPresentations).where(eq(funnelPresentations.id, presentationId));
      if (!presentation) return res.status(404).json({ message: "Presentation not found" });

      const modules = await db.select().from(funnelModules)
        .where(eq(funnelModules.presentationId, presentationId))
        .orderBy(funnelModules.sortOrder);

      const allSlides: { id: number; sortOrder: number; headline: string | null; body: string | null; scriptNotes: string | null }[] = [];

      for (const mod of modules) {
        const variants = await db.select().from(funnelModuleVariants)
          .where(eq(funnelModuleVariants.moduleId, mod.id));
        for (const variant of variants) {
          const slides = await db.select().from(funnelSlides)
            .where(eq(funnelSlides.variantId, variant.id))
            .orderBy(funnelSlides.sortOrder);
          allSlides.push(...slides.map(s => ({ id: s.id, sortOrder: s.sortOrder, headline: s.headline, body: s.body, scriptNotes: s.scriptNotes })));
        }
      }

      if (allSlides.length === 0) return res.status(400).json({ message: "No slides to format" });

      const limit = req.body?.limit;
      const slidesToProcess = limit && limit > 0 ? allSlides.slice(0, limit) : allSlides;
      console.log(`[master-layout] Processing ${slidesToProcess.length} of ${allSlides.length} total slides${limit ? ` (limited to ${limit})` : ""}`);

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const MASTER_LAYOUT_SYSTEM = `You reformat presentation slides for dramatic cinematic energy using psychological typography.

Each slide has two fields: "headline" (renders HUGE, dominant, fills the screen) and "body" (renders smaller beneath). The SIZE CONTRAST between them IS the design.

CRITICAL RULE: At least 80% of slides MUST have a non-empty headline. The headline is where the drama lives. If a slide has text, the most powerful phrase MUST go in headline. NEVER leave headline empty when there's impactful text — that makes everything the same size and kills the energy.

headline = the BIG text:
- ALL CAPS dominant statements: "EVERYTHING CHANGED."
- Single powerful words: "OBSESSED."
- Key emotional beats: "He GHOSTED me..."
- Short. 1-8 words. Punchy. Often UPPERCASE.

body = the smaller text beneath:
- Conversational setup lines before the big moment
- Stacked short lines (use \\n between each line)
- Context, storytelling, the quiet voice
- NEVER long paragraphs. Break lines aggressively.

The goal: dramatic size contrast and rhythm. NOT symmetrical formatting.
- Large dominant statements in ALL CAPS (headline)
- Sudden drops into smaller conversational lines (body)
- Occasional one-word punch lines (headline only, body="")
- Strategic line breaks in body that create anticipation
- Ellipses for suspense, CAPS for power within body sentences
- Hard pattern interrupts — vary the rhythm constantly

EXAMPLE INPUT: body="Then I'll show you the part nobody else talks about... How to actually get customers. How to make them pay you every single month."
GOOD OUTPUT: {"headline":"How to actually get **CUSTOMERS**.","body":"Then I'll show you the part\\nnobody else talks about...\\n\\nHow to make them *pay you*\\nevery single month."}
BAD OUTPUT: {"headline":"","body":"Then I'll show you... How to actually get customers..."} ← NO! Everything same size!

Markup: **word** = accent colour, *word* = underline, ==word== = highlight (rare). Use sparingly.
Do NOT rewrite content — only restructure and add emphasis.
Script Notes = context only, do NOT include in output.

Keep same NUMBER of slides. Return ONLY valid JSON array: [{"headline":"...","body":"..."}]
Use "" (not null) for empty fields.`;

      const parseFormatResponse = (raw: string): { headline: string; body: string }[] => {
        let result: { headline: string; body: string }[] = [];
        try { result = JSON.parse(raw); } catch {}
        if (Array.isArray(result) && result.length > 0) return result;
        const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) { try { result = JSON.parse(codeBlockMatch[1].trim()); } catch {} }
        if (Array.isArray(result) && result.length > 0) return result;
        const arrayMatch = raw.match(/\[[\s\S]*\]/);
        if (arrayMatch) { try { result = JSON.parse(arrayMatch[0]); } catch {} }
        return Array.isArray(result) ? result : [];
      };

      const BATCH_SIZE = 15;
      let totalUpdated = 0;

      for (let batchStart = 0; batchStart < slidesToProcess.length; batchStart += BATCH_SIZE) {
        const batch = slidesToProcess.slice(batchStart, batchStart + BATCH_SIZE);
        const batchLabel = slidesToProcess.length > BATCH_SIZE ? ` (slides ${batchStart + 1}-${batchStart + batch.length} of ${slidesToProcess.length})` : "";

        const batchContent = batch.map((s, i) => {
          let text = `Slide ${batchStart + i + 1}:\nHeadline: ${s.headline || "(empty)"}\nBody: ${s.body || "(empty)"}`;
          if (s.scriptNotes) text += `\nScript Notes: ${s.scriptNotes}`;
          return text;
        }).join("\n\n");

        console.log(`[master-layout] Processing batch${batchLabel}, ${batch.length} slides`);

        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 8000,
            system: MASTER_LAYOUT_SYSTEM,
            messages: [{
              role: "user",
              content: `Reformat these ${batch.length} slides${batchLabel} with dramatic cinematic energy. Return exactly ${batch.length} slides as a JSON array:\n\n${batchContent}`,
            }],
          });

          const raw = response.content[0].type === "text" ? response.content[0].text : "";
          const formatted = parseFormatResponse(raw);

          if (formatted.length > 0) {
            const updateCount = Math.min(formatted.length, batch.length);
            for (let i = 0; i < updateCount; i++) {
              const f = formatted[i];
              await db.update(funnelSlides).set({
                headline: f.headline || null,
                body: f.body || null,
              }).where(eq(funnelSlides.id, batch[i].id));
            }
            totalUpdated += updateCount;
          } else {
            console.error(`[master-layout] Batch starting at ${batchStart} returned no parseable slides`);
          }
        } catch (batchError: any) {
          console.error(`[master-layout] Batch error:`, batchError.message);
          if (slidesToProcess.length <= BATCH_SIZE) {
            return res.status(500).json({ message: `AI error: ${batchError.message}` });
          }
        }
      }

      if (totalUpdated === 0) {
        return res.status(500).json({ message: "AI returned invalid format. Please try again." });
      }

      console.log(`[master-layout] Done, updated ${totalUpdated} slides`);
      res.json({ success: true, slidesUpdated: totalUpdated });
    } catch (e: any) {
      console.error("[master-layout] Error:", e.message);
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - AI "Matt's Style" - webinar slide formatting with dramatic whitespace and emphasis
  // ==========================================

  app.post("/api/admin/funnels/presentations/:id/matts-style", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const presentationId = parseInt(req.params.id);
      const [presentation] = await db.select().from(funnelPresentations).where(eq(funnelPresentations.id, presentationId));
      if (!presentation) return res.status(404).json({ message: "Presentation not found" });

      const modules = await db.select().from(funnelModules)
        .where(eq(funnelModules.presentationId, presentationId))
        .orderBy(funnelModules.sortOrder);

      const allSlides: { id: number; sortOrder: number; headline: string | null; body: string | null; scriptNotes: string | null }[] = [];

      for (const mod of modules) {
        const variants = await db.select().from(funnelModuleVariants)
          .where(eq(funnelModuleVariants.moduleId, mod.id));
        for (const variant of variants) {
          const slides = await db.select().from(funnelSlides)
            .where(eq(funnelSlides.variantId, variant.id))
            .orderBy(funnelSlides.sortOrder);
          allSlides.push(...slides.map(s => ({ id: s.id, sortOrder: s.sortOrder, headline: s.headline, body: s.body, scriptNotes: s.scriptNotes })));
        }
      }

      if (allSlides.length === 0) return res.status(400).json({ message: "No slides to format" });

      const limit = req.body?.limit;
      const slidesToProcess = limit && limit > 0 ? allSlides.slice(0, limit) : allSlides;
      console.log(`[matts-style] Processing ${slidesToProcess.length} of ${allSlides.length} total slides${limit ? ` (limited to ${limit})` : ""}`);

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const MATTS_STYLE_SYSTEM = `You reformat webinar slides in Matt's signature style: dramatic size contrast, emphasis stacking, theatrical pacing.

Each slide has "headline" and "body". The headline renders as the biggest text. The body supports FOUR TEXT SIZES via line prefixes — this is the key feature. You MUST use these size prefixes in body text to create dramatic visual rhythm WITHIN each slide.

BODY TEXT SIZE PREFIXES (use these in the body field):
### line = HUGE (massive impact text, same size as headline — for power statements WITHIN the body)
## line = LARGE (bold, prominent — for key claims and emotional beats)
Regular line (no prefix) = MEDIUM (conversational, storytelling voice)
> line = SMALL (context, dates, asides, parenthetical whispers)

EXAMPLE — BAD (everything same size, no prefixes):
{"headline":"","body":"Then I'll show you the part nobody else talks about...\\nHow to actually get customers.\\nHow to make them pay you every single month.\\nThe build it in 24 hours crowd can't teach this."}

EXAMPLE — GOOD (dramatic size contrast throughout):
{"headline":"","body":"Then I'll show you the part\\nnobody else talks about...\\n\\n### How to actually get **CUSTOMERS**.\\n\\n## How to make them *pay you*\\n## every single month.\\n\\nThe \\"build it in 24 hours\\" crowd\\ncan't teach this.\\n\\n> Because they've never done it."}

MORE EXAMPLES:
{"headline":"","body":"I know that might sound\\ntoo good to be true...\\n\\n### AI HAS CHANGED **EVERYTHING**!\\n\\n## And I'm going to show you EXACTLY how."}

{"headline":"","body":"> And then when I asked him for next steps...\\n\\n### GHOSTED.\\n\\n## The HELP he promised\\n## never materialized!"}

{"headline":"","body":"...and if I can make $10+ MILLIONS\\ndoing it the HARD way with\\n\\n### NO HELP\\n### NO GUIDANCE\\n### NO MENTORS\\n### NO MONEY\\n\\n> (and no AI...)"}

{"headline":"","body":"I was working part time in a nightclub...\\n\\n## Still in university...\\n\\nTrying to find SOMETHING\\nthat would work.\\n\\n> My friends wanted to talk about girls, and guitars, and DJ'ing..."}

KEY POINTS:
- Put MOST content in body using size prefixes. The headline field is optional — only use it for a standalone massive opener. Most slides can have headline="" and all content in body with mixed sizes.
- The ### and ## prefixes create BIG TEXT within the body. Use them for impact moments, reveals, emotional peaks, key claims.
- Regular lines (no prefix) are the conversational voice — storytelling, setup, transitions.
- > lines are the quiet whisper — context, asides, dates, parenthetical thoughts.
- VARY the sizes constantly. Never have 5 lines in a row at the same size.
- Empty lines (\\n\\n) create spacing/breathing room between size changes.
- Break lines aggressively. Short stacked lines, NOT paragraphs.

EMPHASIS MARKUP (use within any size level):
- UPPERCASE for power words: "I was OBSESSED"
- **word** for accent colour
- *word* for underline
- ==word== for yellow highlight (max 1-2 in entire deck)
- ... for dramatic pauses

RULES:
- Do NOT rewrite content. Only restructure and add size prefixes + emphasis.
- Keep the same NUMBER of slides.
- Script Notes = context only, do NOT include in output.

Return ONLY a valid JSON array: [{"headline":"...","body":"..."}]
Use "" (not null) for empty fields.

Return ONLY a valid JSON array: [{"headline":"...","body":"..."}]
Use "" (not null) for empty fields.`;

      const parseFormatResponse = (raw: string): { headline: string; body: string }[] => {
        let result: { headline: string; body: string }[] = [];
        try { result = JSON.parse(raw); } catch {}
        if (Array.isArray(result) && result.length > 0) return result;
        const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) { try { result = JSON.parse(codeBlockMatch[1].trim()); } catch {} }
        if (Array.isArray(result) && result.length > 0) return result;
        const arrayMatch = raw.match(/\[[\s\S]*\]/);
        if (arrayMatch) { try { result = JSON.parse(arrayMatch[0]); } catch {} }
        return Array.isArray(result) ? result : [];
      };

      const BATCH_SIZE = 15;
      let totalUpdated = 0;

      for (let batchStart = 0; batchStart < slidesToProcess.length; batchStart += BATCH_SIZE) {
        const batch = slidesToProcess.slice(batchStart, batchStart + BATCH_SIZE);
        const batchLabel = slidesToProcess.length > BATCH_SIZE ? ` (slides ${batchStart + 1}-${batchStart + batch.length} of ${slidesToProcess.length})` : "";

        const batchContent = batch.map((s, i) => {
          let text = `Slide ${batchStart + i + 1}:\nHeadline: ${s.headline || "(empty)"}\nBody: ${s.body || "(empty)"}`;
          if (s.scriptNotes) text += `\nScript Notes: ${s.scriptNotes}`;
          return text;
        }).join("\n\n");

        console.log(`[matts-style] Processing batch${batchLabel}, ${batch.length} slides`);

        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 8000,
            system: MATTS_STYLE_SYSTEM,
            messages: [{
              role: "user",
              content: `Reformat these ${batch.length} slides${batchLabel} in Matt's signature webinar style — dramatic whitespace pacing, emphasis stacking, theatrical text hierarchy. Return exactly ${batch.length} slides as a JSON array:\n\n${batchContent}`,
            }],
          });

          const raw = response.content[0].type === "text" ? response.content[0].text : "";
          const formatted = parseFormatResponse(raw);

          if (formatted.length > 0) {
            const updateCount = Math.min(formatted.length, batch.length);
            for (let i = 0; i < updateCount; i++) {
              const f = formatted[i];
              await db.update(funnelSlides).set({
                headline: f.headline || null,
                body: f.body || null,
              }).where(eq(funnelSlides.id, batch[i].id));
            }
            totalUpdated += updateCount;
          } else {
            console.error(`[matts-style] Batch starting at ${batchStart} returned no parseable slides`);
          }
        } catch (batchError: any) {
          console.error(`[matts-style] Batch error:`, batchError.message);
          if (slidesToProcess.length <= BATCH_SIZE) {
            return res.status(500).json({ message: `AI error: ${batchError.message}` });
          }
        }
      }

      if (totalUpdated === 0) {
        return res.status(500).json({ message: "AI returned invalid format. Please try again." });
      }

      console.log(`[matts-style] Done, updated ${totalUpdated} slides`);
      res.json({ success: true, slidesUpdated: totalUpdated });
    } catch (e: any) {
      console.error("[matts-style] Error:", e.message);
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - AI auto-detect best CTA time from script
  // ==========================================

  app.post("/api/admin/funnels/campaigns/:id/detect-cta-time", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const [campaign] = await db.select().from(funnelCampaigns).where(eq(funnelCampaigns.id, campaignId));
      if (!campaign || !campaign.presentationId) return res.status(400).json({ message: "Campaign has no linked presentation" });

      // Get all slides with script notes and timestamps
      const modules = await db.select().from(funnelModules)
        .where(eq(funnelModules.presentationId, campaign.presentationId))
        .orderBy(funnelModules.sortOrder);

      const allSlides: { sortOrder: number; headline: string | null; body: string | null; scriptNotes: string | null; startTimeMs: number }[] = [];

      for (const mod of modules) {
        const variants = await db.select().from(funnelModuleVariants).where(eq(funnelModuleVariants.moduleId, mod.id));
        for (const variant of variants) {
          const slides = await db.select().from(funnelSlides)
            .where(eq(funnelSlides.variantId, variant.id))
            .orderBy(funnelSlides.sortOrder);
          allSlides.push(...slides.map(s => ({
            sortOrder: s.sortOrder, headline: s.headline, body: s.body, scriptNotes: s.scriptNotes, startTimeMs: s.startTimeMs,
          })));
        }
      }

      if (allSlides.length === 0) return res.status(400).json({ message: "No slides found" });

      // Build context for AI
      const slideContext = allSlides.map((s, i) => {
        const time = s.startTimeMs > 0 ? ` [${Math.floor(s.startTimeMs / 1000)}s]` : "";
        return `Slide ${i + 1}${time}: ${s.headline || ""} | ${s.body || ""} | Script: ${s.scriptNotes || "(none)"}`;
      }).join("\n");

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 500,
        system: `You analyze webinar/VSL scripts to find the optimal moment to show a Call-To-Action button. The CTA should appear AFTER the viewer has received enough value and social proof to be compelled to act, but BEFORE they lose interest. Typically this is after the main pitch/offer reveal, around 60-80% through the presentation. Return ONLY valid JSON: {"slideNumber": N, "seconds": N, "reason": "brief reason"}`,
        messages: [{
          role: "user",
          content: `This presentation has ${allSlides.length} slides. Analyze the content and tell me the optimal slide number to show the CTA button. If slides have timestamps, use the timestamp of that slide as the "seconds" value. If no timestamps, estimate based on roughly 15 seconds per slide.\n\n${slideContext}`,
        }],
      });

      const raw = response.content[0].type === "text" ? response.content[0].text : "";
      let result: { slideNumber: number; seconds: number; reason: string };
      try {
        result = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) result = JSON.parse(match[0]);
        else return res.status(500).json({ message: "AI returned unexpected format" });
      }

      res.json({ suggestedTime: result.seconds, slideNumber: result.slideNumber, reason: result.reason });
    } catch (e: any) {
      console.error("[detect-cta-time] Error:", e.message);
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - Presentation preview (no campaign/visitor needed)
  // ==========================================

  app.get("/api/admin/funnels/presentations/:id/preview", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const presentationId = parseInt(req.params.id);
      const [presentation] = await db.select().from(funnelPresentations).where(eq(funnelPresentations.id, presentationId));
      if (!presentation) return res.status(404).json({ message: "Presentation not found" });

      const modules = await db.select().from(funnelModules)
        .where(eq(funnelModules.presentationId, presentationId))
        .orderBy(funnelModules.sortOrder);

      const timeline = await Promise.all(modules.map(async (mod) => {
        const variants = await db.select().from(funnelModuleVariants)
          .where(eq(funnelModuleVariants.moduleId, mod.id));

        if (variants.length === 0) return null;
        const variant = variants[0]; // Use first variant for preview

        const slides = await db.select().from(funnelSlides)
          .where(eq(funnelSlides.variantId, variant.id))
          .orderBy(funnelSlides.sortOrder);

        return {
          module: { id: mod.id, name: mod.name, sortOrder: mod.sortOrder },
          variant,
          slides,
        };
      }));

      res.json({
        presentation,
        timeline: timeline.filter(Boolean),
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN CRUD - Modules
  // ==========================================

  app.post("/api/admin/funnels/modules", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { presentationId, name, sortOrder, isSwappable } = req.body;
      if (!presentationId || !name) return res.status(400).json({ message: "presentationId and name required" });
      const [mod] = await db.insert(funnelModules).values({
        presentationId, name, sortOrder: sortOrder ?? 0, isSwappable: isSwappable ?? false,
      }).returning();
      res.json(mod);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/modules/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, sortOrder, isSwappable } = req.body;
      const [mod] = await db.update(funnelModules)
        .set({ name, sortOrder, isSwappable })
        .where(eq(funnelModules.id, parseInt(req.params.id)))
        .returning();
      res.json(mod);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/modules/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelModules).where(eq(funnelModules.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Bulk reorder modules
  app.put("/api/admin/funnels/modules/reorder", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { orders } = req.body; // [{ id, sortOrder }]
      for (const o of orders) {
        await db.update(funnelModules).set({ sortOrder: o.sortOrder }).where(eq(funnelModules.id, o.id));
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN CRUD - Module Variants
  // ==========================================

  app.post("/api/admin/funnels/variants", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { moduleId, name, mediaType, audioUrl, videoUrl, durationMs, scriptText } = req.body;
      if (!moduleId || !name) return res.status(400).json({ message: "moduleId and name required" });
      const [variant] = await db.insert(funnelModuleVariants).values({
        moduleId, name, mediaType: mediaType || 'audio_slides', audioUrl, videoUrl, durationMs, scriptText,
      }).returning();
      res.json(variant);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/variants/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, mediaType, audioUrl, videoUrl, durationMs, scriptText } = req.body;
      const [variant] = await db.update(funnelModuleVariants)
        .set({ name, mediaType, audioUrl, videoUrl, durationMs, scriptText })
        .where(eq(funnelModuleVariants.id, parseInt(req.params.id)))
        .returning();
      res.json(variant);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/variants/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelModuleVariants).where(eq(funnelModuleVariants.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Get single variant with slides (used by SyncTool)
  app.get("/api/admin/funnels/variants/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const [variant] = await db.select().from(funnelModuleVariants).where(eq(funnelModuleVariants.id, id));
      if (!variant) return res.status(404).json({ message: "Not found" });
      const slides = await db.select().from(funnelSlides)
        .where(eq(funnelSlides.variantId, id))
        .orderBy(funnelSlides.sortOrder);
      res.json({ ...variant, slides });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN CRUD - Slides
  // ==========================================

  app.post("/api/admin/funnels/slides", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { variantId, sortOrder, headline, body, scriptNotes, imageUrl, videoUrl, overlayStyle, startTimeMs } = req.body;
      if (!variantId) return res.status(400).json({ message: "variantId required" });
      const [slide] = await db.insert(funnelSlides).values({
        variantId, sortOrder: sortOrder ?? 0, headline, body, scriptNotes, imageUrl, videoUrl, overlayStyle, startTimeMs: startTimeMs ?? 0,
      }).returning();
      res.json(slide);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/slides/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { sortOrder, headline, body, scriptNotes, imageUrl, videoUrl, overlayStyle, startTimeMs } = req.body;
      const [slide] = await db.update(funnelSlides)
        .set({ sortOrder, headline, body, scriptNotes, imageUrl, videoUrl, overlayStyle, startTimeMs })
        .where(eq(funnelSlides.id, parseInt(req.params.id)))
        .returning();
      res.json(slide);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/slides/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelSlides).where(eq(funnelSlides.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Bulk sync slide timestamps (from sync tool)
  app.put("/api/admin/funnels/slides/bulk-sync", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { slides } = req.body; // [{ id, startTimeMs }]
      for (const s of slides) {
        await db.update(funnelSlides).set({ startTimeMs: s.startTimeMs }).where(eq(funnelSlides.id, s.id));
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN CRUD - Opt-in Pages
  // ==========================================

  app.get("/api/admin/funnels/campaigns/:id/optin-pages", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const pages = await db.select().from(funnelOptinPages)
        .where(eq(funnelOptinPages.campaignId, parseInt(req.params.id)));
      res.json(pages);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/funnels/optin-pages", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { campaignId, name, headline, subheadline, ctaButtonText, heroImageUrl } = req.body;
      if (!campaignId || !name || !headline) return res.status(400).json({ message: "campaignId, name, and headline required" });
      const [page] = await db.insert(funnelOptinPages).values({
        campaignId, name, headline, subheadline, ctaButtonText, heroImageUrl,
      }).returning();
      res.json(page);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/optin-pages/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, headline, subheadline, ctaButtonText, heroImageUrl } = req.body;
      const [page] = await db.update(funnelOptinPages)
        .set({ name, headline, subheadline, ctaButtonText, heroImageUrl })
        .where(eq(funnelOptinPages.id, parseInt(req.params.id)))
        .returning();
      res.json(page);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/optin-pages/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelOptinPages).where(eq(funnelOptinPages.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN CRUD - Variation Sets
  // ==========================================

  app.get("/api/admin/funnels/campaigns/:id/variation-sets", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const sets = await db.select().from(funnelVariationSets)
        .where(eq(funnelVariationSets.campaignId, parseInt(req.params.id)));
      res.json(sets);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/funnels/variation-sets", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { campaignId, name, optinPageId, moduleVariantIds, weight, isActive } = req.body;
      if (!campaignId || !name || !optinPageId) return res.status(400).json({ message: "campaignId, name, optinPageId required" });
      const [set] = await db.insert(funnelVariationSets).values({
        campaignId, name, optinPageId, moduleVariantIds: moduleVariantIds || {}, weight: weight ?? 1, isActive: isActive ?? true,
      }).returning();
      res.json(set);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/variation-sets/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { name, optinPageId, moduleVariantIds, weight, isActive } = req.body;
      const [set] = await db.update(funnelVariationSets)
        .set({ name, optinPageId, moduleVariantIds, weight, isActive })
        .where(eq(funnelVariationSets.id, parseInt(req.params.id)))
        .returning();
      res.json(set);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/variation-sets/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelVariationSets).where(eq(funnelVariationSets.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - Campaign full detail (with optin pages + variation sets)
  // ==========================================

  app.get("/api/admin/funnels/campaigns/:id/full", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const [campaign] = await db.select().from(funnelCampaigns).where(eq(funnelCampaigns.id, id));
      if (!campaign) return res.status(404).json({ message: "Not found" });

      const optinPages = await db.select().from(funnelOptinPages).where(eq(funnelOptinPages.campaignId, id));
      const variationSets = await db.select().from(funnelVariationSets).where(eq(funnelVariationSets.campaignId, id));

      let presentation = null;
      if (campaign.presentationId) {
        const [p] = await db.select().from(funnelPresentations).where(eq(funnelPresentations.id, campaign.presentationId));
        presentation = p || null;
      }

      res.json({ ...campaign, optinPages, variationSets, presentation });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - Analytics
  // ==========================================

  app.get("/api/admin/funnels/campaigns/:id/analytics", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const [campaign] = await db.select().from(funnelCampaigns).where(eq(funnelCampaigns.id, campaignId));
      if (!campaign) return res.status(404).json({ message: "Not found" });

      // Get variation sets
      const variationSets = await db.select().from(funnelVariationSets)
        .where(eq(funnelVariationSets.campaignId, campaignId));

      // Count events by type per variation
      const eventCounts = await db.select({
        variationSetId: funnelEvents.variationSetId,
        eventType: funnelEvents.eventType,
        count: count(),
      }).from(funnelEvents)
        .where(eq(funnelEvents.campaignId, campaignId))
        .groupBy(funnelEvents.variationSetId, funnelEvents.eventType);

      // Count unique visitors per variation
      const visitorCounts = await db.select({
        variationSetId: funnelVisitors.variationSetId,
        count: count(),
      }).from(funnelVisitors)
        .where(eq(funnelVisitors.campaignId, campaignId))
        .groupBy(funnelVisitors.variationSetId);

      // Total ad spend
      const [spendResult] = await db.select({
        total: sql<number>`COALESCE(SUM(${funnelAdSpend.amount}), 0)`,
      }).from(funnelAdSpend)
        .where(eq(funnelAdSpend.campaignId, campaignId));
      const totalAdSpend = Number(spendResult?.total || 0);

      // Build per-variation analytics
      let totalVisitors = 0, totalRegistrations = 0, totalPlayStarts = 0;
      let totalCtaClicks = 0, totalCallsBooked = 0, totalSales = 0;

      const variations = variationSets.map(vs => {
        const visitors = Number(visitorCounts.find(v => v.variationSetId === vs.id)?.count || 0);
        const getCount = (type: string) => Number(eventCounts.find(e => e.variationSetId === vs.id && e.eventType === type)?.count || 0);

        const registrations = getCount('registration');
        const playStarts = getCount('play_start');
        const ctaClicks = getCount('cta_click');
        const callsBooked = getCount('call_booked');
        const sales = getCount('sale');

        totalVisitors += visitors;
        totalRegistrations += registrations;
        totalPlayStarts += playStarts;
        totalCtaClicks += ctaClicks;
        totalCallsBooked += callsBooked;
        totalSales += sales;

        return {
          variationSet: vs,
          visitors,
          registrations,
          playStarts,
          ctaClicks,
          callsBooked,
          sales,
          registrationRate: visitors > 0 ? (registrations / visitors) * 100 : 0,
          ctaClickRate: playStarts > 0 ? (ctaClicks / playStarts) * 100 : 0,
          confidence: 'need_data' as string,
          pValue: null as number | null,
        };
      });

      // Calculate confidence (two-proportion z-test vs best performer)
      if (variations.length > 1) {
        const bestRegRate = Math.max(...variations.map(v => v.registrationRate));
        for (const v of variations) {
          if (v.visitors < 30) {
            v.confidence = 'need_data';
            continue;
          }
          if (v.registrationRate === bestRegRate) {
            v.confidence = v.visitors >= 30 ? 'trending' : 'need_data';
            continue;
          }
          // Z-test
          const p1 = v.registrations / v.visitors;
          const best = variations.find(x => x.registrationRate === bestRegRate)!;
          const p2 = best.registrations / best.visitors;
          const pPool = (v.registrations + best.registrations) / (v.visitors + best.visitors);
          const se = Math.sqrt(pPool * (1 - pPool) * (1 / v.visitors + 1 / best.visitors));
          if (se === 0) { v.confidence = 'need_data'; continue; }
          const z = Math.abs(p1 - p2) / se;
          // Approximate p-value from z
          const pValue = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
          v.pValue = pValue;
          if (z >= 1.96) v.confidence = 'winner';
          else if (z >= 1.645) v.confidence = 'trending';
          else v.confidence = 'need_data';
        }
      }

      res.json({
        campaign,
        totalVisitors,
        totalRegistrations,
        totalPlayStarts,
        totalCtaClicks,
        totalCallsBooked,
        totalSales,
        totalAdSpend,
        costPerRegistration: totalRegistrations > 0 ? totalAdSpend / totalRegistrations : null,
        costPerSale: totalSales > 0 ? totalAdSpend / totalSales : null,
        variations,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Drop-off data - watch time distribution
  app.get("/api/admin/funnels/campaigns/:id/drop-off", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      // Get all play_progress events with watchTimeMs
      const events = await db.select({
        eventData: funnelEvents.eventData,
      }).from(funnelEvents)
        .where(and(
          eq(funnelEvents.campaignId, campaignId),
          eq(funnelEvents.eventType, 'play_progress'),
        ));

      // Find max watch time per visitor (from eventData.watchTimeMs)
      const maxTimes: number[] = [];
      const visitorMax = new Map<number, number>();

      // Also get play_progress grouped by visitor
      const progressEvents = await db.select({
        visitorId: funnelEvents.visitorId,
        eventData: funnelEvents.eventData,
      }).from(funnelEvents)
        .where(and(
          eq(funnelEvents.campaignId, campaignId),
          eq(funnelEvents.eventType, 'play_progress'),
        ));

      for (const evt of progressEvents) {
        const watchMs = (evt.eventData as any)?.watchTimeMs || 0;
        const current = visitorMax.get(evt.visitorId) || 0;
        if (watchMs > current) visitorMax.set(evt.visitorId, watchMs);
      }

      visitorMax.forEach(ms => maxTimes.push(ms));

      // Build 30-second buckets
      const totalViewers = maxTimes.length;
      if (totalViewers === 0) return res.json([]);

      const maxTime = Math.max(...maxTimes);
      const bucketSize = 30000; // 30 seconds in ms
      const buckets: { timeSeconds: number; viewerCount: number; percentage: number }[] = [];

      for (let t = 0; t <= maxTime; t += bucketSize) {
        const stillWatching = maxTimes.filter(m => m >= t).length;
        buckets.push({
          timeSeconds: t / 1000,
          viewerCount: stillWatching,
          percentage: (stillWatching / totalViewers) * 100,
        });
      }

      res.json(buckets);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // CSV export
  app.get("/api/admin/funnels/campaigns/:id/export-csv", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const visitors = await db.select().from(funnelVisitors)
        .where(eq(funnelVisitors.campaignId, campaignId));

      const events = await db.select().from(funnelEvents)
        .where(eq(funnelEvents.campaignId, campaignId));

      // Build CSV
      const header = "visitor_token,email,first_name,variation_set_id,utm_source,utm_medium,utm_campaign,event_type,event_data,event_date\n";
      const rows = events.map(evt => {
        const visitor = visitors.find(v => v.id === evt.visitorId);
        return [
          visitor?.visitorToken || '',
          visitor?.email || '',
          visitor?.firstName || '',
          evt.variationSetId,
          visitor?.utmSource || '',
          visitor?.utmMedium || '',
          visitor?.utmCampaign || '',
          evt.eventType,
          JSON.stringify(evt.eventData || {}),
          evt.createdAt,
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=funnel-${campaignId}-export.csv`);
      res.send(header + rows);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Manual sale entry
  app.post("/api/admin/funnels/campaigns/:id/record-sale", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { email, amount, currency } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });

      // Find most recent visitor with this email
      const [visitor] = await db.select().from(funnelVisitors)
        .where(and(eq(funnelVisitors.campaignId, campaignId), eq(funnelVisitors.email, email.toLowerCase())))
        .orderBy(desc(funnelVisitors.createdAt))
        .limit(1);

      if (!visitor) return res.status(404).json({ message: "No visitor found with that email in this campaign" });

      await db.insert(funnelEvents).values({
        visitorId: visitor.id,
        campaignId,
        variationSetId: visitor.variationSetId,
        eventType: 'sale',
        eventData: { amount, currency: currency || 'gbp' },
      });

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - Ad Spend
  // ==========================================

  app.get("/api/admin/funnels/campaigns/:id/ad-spend", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const entries = await db.select().from(funnelAdSpend)
        .where(eq(funnelAdSpend.campaignId, parseInt(req.params.id)))
        .orderBy(desc(funnelAdSpend.date));
      res.json(entries);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/funnels/ad-spend", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { campaignId, date, amount, currency, platform, notes } = req.body;
      if (!campaignId || !date || !amount) return res.status(400).json({ message: "campaignId, date, amount required" });
      const [entry] = await db.insert(funnelAdSpend).values({
        campaignId, date: new Date(date), amount, currency: currency || 'gbp', platform: platform || 'meta', notes,
      }).returning();
      res.json(entry);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/admin/funnels/ad-spend/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      await db.delete(funnelAdSpend).where(eq(funnelAdSpend.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // ADMIN - Ad Copy
  // ==========================================

  app.get("/api/admin/funnels/campaigns/:id/ad-copy", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const copies = await db.select().from(funnelAdCopy)
        .where(eq(funnelAdCopy.campaignId, parseInt(req.params.id)))
        .orderBy(desc(funnelAdCopy.createdAt));
      res.json(copies);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/admin/funnels/ad-copy/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      const [copy] = await db.update(funnelAdCopy)
        .set({ status })
        .where(eq(funnelAdCopy.id, parseInt(req.params.id)))
        .returning();
      res.json(copy);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/admin/funnels/campaigns/:id/generate-ad-copy", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { persuasionLevel, scriptContext } = req.body;

      // Get campaign info
      const [campaign] = await db.select().from(funnelCampaigns).where(eq(funnelCampaigns.id, campaignId));
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });

      const { callClaude } = require("./aiService");
      const prompt = `Generate 3 Meta ad copy variations for this campaign.

Campaign: ${campaign.name}
Persuasion Level: ${persuasionLevel || 5}/10 (1=soft educational, 10=aggressive direct response)
${scriptContext ? `\nPresentation script context:\n${scriptContext.substring(0, 2000)}` : ''}

For each variation, output JSON array with objects containing:
- headline (max 40 chars, punchy)
- primaryText (main ad copy body, 2-4 sentences, compelling)

Return ONLY valid JSON array, no markdown.`;

      const result = await callClaude(prompt);
      let copies: { headline: string; primaryText: string }[] = [];
      try {
        copies = JSON.parse(result);
      } catch {
        // Try extracting JSON from response
        const match = result.match(/\[[\s\S]*\]/);
        if (match) copies = JSON.parse(match[0]);
      }

      const inserted = [];
      for (const copy of copies) {
        const [row] = await db.insert(funnelAdCopy).values({
          campaignId,
          headline: copy.headline,
          primaryText: copy.primaryText,
          persuasionLevel: persuasionLevel || 5,
          status: 'pending',
        }).returning();
        inserted.push(row);
      }

      res.json(inserted);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Export approved ad copy as CSV
  app.get("/api/admin/funnels/campaigns/:id/ad-copy/export-csv", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const copies = await db.select().from(funnelAdCopy)
        .where(and(
          eq(funnelAdCopy.campaignId, parseInt(req.params.id)),
          eq(funnelAdCopy.status, 'approved'),
        ));

      const header = "headline,primary_text,persuasion_level\n";
      const rows = copies.map(c =>
        `"${c.headline.replace(/"/g, '""')}","${c.primaryText.replace(/"/g, '""')}",${c.persuasionLevel}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ad-copy-export.csv');
      res.send(header + rows);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // PUBLIC - Opt-in page (cookie-based variation assignment)
  // ==========================================

  app.get("/api/funnel/c/:slug", async (req: any, res) => {
    try {
      const slug = req.params.slug.toLowerCase();
      const [campaign] = await db.select().from(funnelCampaigns)
        .where(and(eq(funnelCampaigns.slug, slug), eq(funnelCampaigns.isActive, true)));

      if (!campaign) return res.status(404).json({ message: "Campaign not found" });

      // Get active variation sets
      const variationSets = await db.select().from(funnelVariationSets)
        .where(and(
          eq(funnelVariationSets.campaignId, campaign.id),
          eq(funnelVariationSets.isActive, true),
        ));

      if (variationSets.length === 0) return res.status(404).json({ message: "No active variations" });

      // Check cookie for existing assignment
      const cookieKey = `fv_${campaign.id}`;
      const existingToken = req.cookies?.[cookieKey];

      if (existingToken) {
        // Existing visitor - find their assignment
        const [visitor] = await db.select().from(funnelVisitors)
          .where(and(
            eq(funnelVisitors.campaignId, campaign.id),
            eq(funnelVisitors.visitorToken, existingToken),
          ))
          .limit(1);

        if (visitor) {
          const [optinPage] = await db.select().from(funnelOptinPages)
            .where(eq(funnelOptinPages.id,
              variationSets.find(v => v.id === visitor.variationSetId)?.optinPageId || 0));

          // Record page_view event
          await db.insert(funnelEvents).values({
            visitorId: visitor.id,
            campaignId: campaign.id,
            variationSetId: visitor.variationSetId,
            eventType: 'page_view',
          });

          return res.json({
            campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug, ctaText: campaign.ctaText, ctaUrl: campaign.ctaUrl },
            optinPage,
            visitorToken: existingToken,
          });
        }
      }

      // New visitor - weighted random assignment
      const totalWeight = variationSets.reduce((sum, v) => sum + (v.weight || 1), 0);
      let rand = Math.random() * totalWeight;
      let selectedSet = variationSets[0];
      for (const vs of variationSets) {
        rand -= (vs.weight || 1);
        if (rand <= 0) { selectedSet = vs; break; }
      }

      const visitorToken = crypto.randomUUID();

      // Create visitor record
      const [visitor] = await db.insert(funnelVisitors).values({
        campaignId: campaign.id,
        variationSetId: selectedSet.id,
        visitorToken,
        utmSource: (req.query.utm_source as string) || null,
        utmMedium: (req.query.utm_medium as string) || null,
        utmCampaign: (req.query.utm_campaign as string) || null,
        utmContent: (req.query.utm_content as string) || null,
        utmTerm: (req.query.utm_term as string) || null,
        referrer: req.headers.referer || null,
      }).returning();

      // Record page_view event
      await db.insert(funnelEvents).values({
        visitorId: visitor.id,
        campaignId: campaign.id,
        variationSetId: selectedSet.id,
        eventType: 'page_view',
      });

      // Set 90-day cookie
      res.cookie(cookieKey, visitorToken, {
        maxAge: 90 * 24 * 60 * 60 * 1000,
        httpOnly: false, // accessible from client
        sameSite: 'lax',
      });

      const [optinPage] = await db.select().from(funnelOptinPages)
        .where(eq(funnelOptinPages.id, selectedSet.optinPageId));

      res.json({
        campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug, ctaText: campaign.ctaText, ctaUrl: campaign.ctaUrl },
        optinPage,
        visitorToken,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // PUBLIC - Register (email capture)
  // ==========================================

  app.post("/api/funnel/c/:slug/register", async (req: any, res) => {
    try {
      const slug = req.params.slug.toLowerCase();
      const { email, firstName, visitorToken } = req.body;
      if (!email || !visitorToken) return res.status(400).json({ message: "Email and visitorToken required" });

      const [campaign] = await db.select().from(funnelCampaigns).where(eq(funnelCampaigns.slug, slug));
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });

      // Update visitor with email
      const [visitor] = await db.update(funnelVisitors)
        .set({ email: email.toLowerCase(), firstName })
        .where(and(
          eq(funnelVisitors.campaignId, campaign.id),
          eq(funnelVisitors.visitorToken, visitorToken),
        ))
        .returning();

      if (!visitor) return res.status(404).json({ message: "Visitor not found" });

      // Record registration event
      await db.insert(funnelEvents).values({
        visitorId: visitor.id,
        campaignId: campaign.id,
        variationSetId: visitor.variationSetId,
        eventType: 'registration',
      });

      // Fire Systeme.io webhook (non-blocking)
      addContactToSysteme({
        email: email.toLowerCase(),
        firstName,
        tags: [`Funnel: ${slug}`, 'Funnel Registration'],
      }).catch(err => console.log('[Funnel] Systeme.io webhook failed:', err.message));

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // PUBLIC - Watch page (stitched timeline)
  // ==========================================

  app.get("/api/funnel/c/:slug/watch", async (req: any, res) => {
    try {
      const slug = req.params.slug.toLowerCase();
      const visitorToken = req.query.token as string || req.cookies?.[`fv_0`]; // fallback

      const [campaign] = await db.select().from(funnelCampaigns)
        .where(eq(funnelCampaigns.slug, slug));
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });

      // Find visitor by token from cookie
      const cookieKey = `fv_${campaign.id}`;
      const token = visitorToken || req.cookies?.[cookieKey];

      let visitor = null;
      if (token) {
        const [v] = await db.select().from(funnelVisitors)
          .where(and(
            eq(funnelVisitors.campaignId, campaign.id),
            eq(funnelVisitors.visitorToken, token),
          ))
          .limit(1);
        visitor = v;
      }

      if (!campaign.presentationId) return res.status(404).json({ message: "No presentation linked" });

      // Get presentation (for theme)
      const [presentation] = await db.select().from(funnelPresentations)
        .where(eq(funnelPresentations.id, campaign.presentationId));

      // Get modules in order
      const modules = await db.select().from(funnelModules)
        .where(eq(funnelModules.presentationId, campaign.presentationId))
        .orderBy(funnelModules.sortOrder);

      // Get variation set for this visitor to know which variants to use
      const variationSet = visitor
        ? (await db.select().from(funnelVariationSets).where(eq(funnelVariationSets.id, visitor.variationSetId)))[0]
        : null;
      const moduleVariantMap = (variationSet?.moduleVariantIds as Record<string, number>) || {};

      // Stitch timeline
      const timeline = await Promise.all(modules.map(async (mod) => {
        const variants = await db.select().from(funnelModuleVariants)
          .where(eq(funnelModuleVariants.moduleId, mod.id));

        // Pick the right variant: if swappable, use mapped variant; otherwise use only variant
        let selectedVariant = variants[0]; // fallback
        if (mod.isSwappable && moduleVariantMap[String(mod.id)]) {
          const mapped = variants.find(v => v.id === moduleVariantMap[String(mod.id)]);
          if (mapped) selectedVariant = mapped;
        }

        if (!selectedVariant) return null;

        const slides = await db.select().from(funnelSlides)
          .where(eq(funnelSlides.variantId, selectedVariant.id))
          .orderBy(funnelSlides.sortOrder);

        return {
          module: { id: mod.id, name: mod.name, sortOrder: mod.sortOrder },
          variant: selectedVariant,
          slides,
        };
      }));

      res.json({
        campaign: {
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          watchHeadline: campaign.watchHeadline,
          watchSubheadline: campaign.watchSubheadline,
          speakerVideoUrl: campaign.speakerVideoUrl,
          ctaText: campaign.ctaText,
          ctaUrl: campaign.ctaUrl,
          ctaAppearTime: campaign.ctaAppearTime,
        },
        theme: presentation?.theme || "dark",
        fontSettings: presentation?.fontSettings || null,
        displayMode: presentation?.displayMode || "slides",
        timeline: timeline.filter(Boolean),
        visitorId: visitor?.id || null,
        variationSetId: visitor?.variationSetId || null,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // PUBLIC - Event tracking
  // ==========================================

  app.post("/api/funnel/track", async (req: any, res) => {
    try {
      const { visitorId, campaignId, variationSetId, eventType, eventData } = req.body;
      if (!visitorId || !campaignId || !eventType) {
        return res.status(400).json({ message: "visitorId, campaignId, eventType required" });
      }

      await db.insert(funnelEvents).values({
        visitorId,
        campaignId,
        variationSetId: variationSetId || 0,
        eventType,
        eventData: eventData || null,
      });

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // VSL SCRIPT GENERATOR
  // ==========================================

  const VSL_SYSTEM_PROMPT = `You are a world-class VSL (Video Sales Letter) scriptwriter working exclusively for Matt Webley. Your job is to generate complete, ready-to-record VSL scripts that Matt can read through, tweak slightly, and record.

Every VSL you generate must be 100% truthful. You must NEVER make up stories, testimonials, statistics, or claims. You can only use the facts provided in the MATT'S REAL FACTS section below. If you don't have a fact, don't invent one.

=================================================================
MATT'S REAL FACTS (use ONLY these, never invent)
=================================================================

PERSONAL BACKGROUND:
- Grew up on a council estate in the UK
- Family were broke, no money, no financial guidance, no mentors
- Failed A-levels, dropped out of uni
- Jobs: paper boy, bin man, concrete factory worker, pulling pints at a nightclub for drunken teenagers
- First girlfriend told him he was a nobody who'd never make anything of his life
- Workmates laughed at him when he said he'd be a millionaire
- Everybody he seemed to know were addicts, drug dealers and criminals
- Got used to hearing "No, we can't afford it" until he stopped asking
- Had hand me down second hand clothes that didn't fit
- Never been on holiday abroad as a kid
- Teachers thought he'd end up jobless, homeless or in prison

BUSINESS HISTORY:
- 25+ years building businesses online (started around 2000, first UK company incorporated 2002)
- $23+ million in total online business revenue
- $12+ million from software specifically
- Never written a single line of code
- Started with affiliate marketing: first $30 commission from a crappy website he forgot about, grew to $300/day then $2,000/day
- Built information products and courses across 50+ niches
- Had a fully outsourced team of Filipinos (8 full time writers, designers and a manager)
- Clickbank told him he was in the top 0.01% of their clients
- Spent hundreds of thousands on developers building software the old way
- Projects supposed to take 3 months took 3 years
- Built software that was never finished, never implemented, never sold (his biggest failure story)
- Now lives in Dubai, runs businesses from laptop
- Does less than 3 hours work per month on his software businesses
- Bought his mum a bungalow cash after she fell down stairs and was in hospital fighting for her life, promised her she'd never go up stairs again

CURRENT BUSINESS:
- Runs Webley Global FZCO from Dubai
- Teaches non-technical people to build AI SaaS businesses
- Offers 1:1 mentorship (limited spots, weekly calls, hands on)
- Has a waiting list, takes on limited people at a time
- Charges premium (high ticket mentorship)
- Team takes strategy calls (use "we/us" language for calls)
- Students have built real software and some have paying customers (do NOT claim specific income numbers for students)
- 70-80% application rejection rate
- CTA link: https://www.mattwebley.com/workwithmatt

SPECIFIC SAAS FACTS TO USE:
- Software businesses sell for 3-10x annual recurring revenue
- SaaS margins are 80-90%+
- Ongoing costs typically $50-200/month
- Model is: faceless, passive, sticky (customers recur)
- Can be built in spare time (5-10 hours per week)
- Zero tech skills needed
- Free marketing strategies exist
- Empire Flippers as example marketplace

WHAT MATT BELIEVES (use for philosophical framing):
- The rich don't work for money, they build or buy assets
- AI revolution will increase the gap between haves and have-nots
- Decent hard working people deserve a break
- He loves teaching and helping people escape their situation
- The people who move early on opportunities always make the most money
- Building is 10-20% of the job, getting customers is 80-90%
- Developers teach build, nobody teaches the business side
- The software industry was a gatekeeping machine that kept regular people out
- AI demolished those barriers

HONEST SOCIAL PROOF RULES:
- Students have built real software from scratch
- Some students have paying customers
- Students started as complete beginners, some didn't know what SaaS meant
- Do NOT claim specific income figures for students
- Do NOT say "six figure" or "quit their job" unless Matt specifically provides that info
- Frame around journey and milestones, not end-result income
- Use phrases like "real software that real people are paying for"

=================================================================
MATT'S WRITING AND SPEAKING STYLE
=================================================================

CRITICAL STYLE RULES (follow these EXACTLY):
1. Use ellipses (...) heavily for pacing and dramatic pauses
2. Use ALL-CAPS on 2-6 KEY words per paragraph for emphasis
3. Short paragraphs: 1-3 sentences MAX
4. Use single-line punchy statements frequently
5. Lots of white space between thoughts
6. British spellings: realise, favourite, whilst, colour
7. British casual language: "lads", "mates", "bollocks", "Anyways..."
8. Start sentences with And, But, So frequently
9. Parenthetical asides for casual tone: (...like this)
10. Specific numbers always: "$23 million" not "millions", "25+ years" not "many years"
11. Never use em dashes, use ellipses instead
12. Never use emojis
13. Never sound corporate, academic, or formal
14. Never use bullet points (stack lines instead)
15. Tone: tough love mentor, anti-guru, raw, authentic, British but accessible
16. Sign off: "Matt Webley" or "Matt"
17. Use "Anyways" not "Anyway"
18. Use fragments for punch: "At all." "Genuinely." "BOOOOOOM!"
19. Use rhetorical questions followed by his own answers
20. Position against fake gurus and the developer/tech crowd constantly

PHRASES MATT ACTUALLY USES:
- "Here's the thing..."
- "See, the thing is..."
- "The TRUTH is..."
- "Look..."
- "Anyways..."
- "Dunno..."
- "Let me tell you this..."
- "Don't get me wrong..."
- "Having said that..."
- "But here's the thing..."
- "Long story short..."
- "The bottom line is this..."
- "Book a call..."
- "Speak soon..."

=================================================================
VSL FORMULAS
=================================================================

FORMULA 1: "NATHAN'S HIGH-CONVERTING VSL"
Structure:
1. CALL OUT THE IDEAL VIEWER
2. BIG PROMISE WITH TIME LIMITATION
3. ESTABLISH AUTHORITY
4. BIG CLAIM AND WHY YOU
5. OPEN A LOOP
6. PRE-EMPT OBJECTIONS
7. URGENCY
8. PROOF
9. THIRD-PARTY CREDIBILITY
10. LET THEM IN ON A SECRET
11. SHARE STORY OF DISCOVERY
12. WIDEN THE GAP
13. RESTATE THE BIG PROMISE
14. PRESENT THE SCARCE OPPORTUNITY
15. SHARE PROOF AGAIN
16. THE ALTRUISTIC REASON WHY
17. FUTURE PACE
18. PATTERN INTERRUPT
19. ADDITIONAL PROOF
20. TRANSITION TO CALL CTA
21. RISK REVERSAL
22. CALL TO ACTION
23. FINAL URGENCY
24. CALLBACK

NESB CHECK: Frame as NEW, EASY, SAFE, BIG throughout.

FORMULA 2: "THE PERFECT WEBINAR (MODIFIED)"
Structure:
1. THE BIG PROMISE (0-3 min)
2. CREDIBILITY + ORIGIN (3-8 min)
3. THE ONE THING
4. SECRET #1: THE OPPORTUNITY
5. SECRET #2: THE VEHICLE
6. SECRET #3: THE MISSING PIECE
7. THE STACK
8. THE CLOSE

FORMULA 3: "THE CONFRONTATION VSL"
Structure:
1. CONFRONTATION
2. THE REAL TRUTH
3. CREDIBILITY FLASH
4. THE PROOF
5. THE PIVOT
6. THE INSIDER KNOWLEDGE
7. YOUR FAILURE STORY
8. THE BUSINESS MODEL
9. THE REVENUE MATH
10. THE VULNERABILITY
11. THE CLOSE

FORMULA 4: "THE UNDERDOG STORY VSL"
Structure:
1. THE ORIGIN
2. THE SPARK
3. THE JOURNEY
4. THE WALL
5. THE BREAKTHROUGH
6. THE REALISATION
7. THE DEMO
8. THE SECRET
9. THE OPPORTUNITY
10. THE WHY
11. THE OFFER
12. THE CALLBACK

FORMULA 5: "THE WEALTH DIVIDE VSL"
Structure:
1. THE WAKE UP CALL
2. THE DIVIDE
3. THE OPPORTUNITY
4. THE PROOF
5. THE CREDIBILITY
6. THE MODEL
7. THE MATH
8. THE MISSING PIECE
9. THE MISTAKES
10. THE SOLUTION
11. THE CLOSE

FORMULA 6: "JON BENSON'S 5-STEP VSL" (inspired by the inventor of the VSL)
Structure:
1. THE SNAP SUGGESTION - Pattern interrupt opening. A bold, unexpected statement that creates a "wait, what?" moment. NOT a question. A provocative claim or visual that forces them to keep watching.
2. THE USP HOOK - Within the first 10 slides, clearly state the unique selling proposition. What makes this different from everything else they've seen? Why should they care RIGHT NOW?
3. THE RELUCTANT HERO - Tell a dramatic, visual origin story using the reluctant hero formula. Matt didn't want to teach this. He was making money quietly. But something happened that changed his mind. Build empathy through shared struggle, not bragging.
4. THE MECHANISM REVEAL - Explain the specific mechanism (AI + SaaS model) that makes the result possible. This is the "how" that bridges the gap between their current situation and the promise. Use the revenue math here.
5. THE IRRESISTIBLE CLOSE - Stack the value. Use urgency. Risk reversal. Make saying "no" feel harder than saying "yes". Direct CTA to book a call.

Key Jon Benson principles to follow:
- Every slide should be one idea, one sentence
- Use NLP-style language patterns and embedded commands
- The story should read like a movie trailer, not a lecture
- Heavy use of curiosity gaps between sections
- "Show don't tell" — paint vivid pictures with words

FORMULA 7: "STEFAN GEORGI'S RMBC VSL" (inspired by the highest-paid VSL copywriter alive)
Structure:
1. RESEARCH-DRIVEN HOOK - Open by speaking the prospect's exact internal dialogue. What are they thinking at 2am? What have they tried that failed? Mirror their pain so precisely they think you're reading their mind.
2. THE MECHANISM - This is the core. Explain WHY everything else failed (it wasn't their fault — they were using the wrong mechanism). Then introduce the NEW mechanism (AI building software) that changes everything. This must be specific and believable.
3. THE BRIEF - Walk through the key proof points in bite-sized chunks. Each proof point is a mini-story: situation → old mechanism failed → new mechanism worked. Use Matt's real facts, real student milestones, real numbers.
4. THE COPY BRIDGE - Connect the mechanism to the offer. "So the question isn't whether AI can build software... the question is whether YOU want to be one of the people who uses it before everyone else catches on."
5. THE OFFER STACK - Present what they get. Stack each element. Future-pace each component (don't just say what it is, say what it DOES for them).
6. THE CLOSE - Urgency, scarcity, risk reversal. CTA to book a call.

Key Stefan Georgi principles to follow:
- The MECHANISM is everything — spend 40% of the VSL on it
- Research-level specificity: use exact phrases, exact pain points, exact scenarios
- Every claim needs a "reason why" backing it up
- The prospect should feel understood before they feel sold to
- Transitions between sections should feel invisible, like a conversation

FORMULA 8: "ALEX HORMOZI'S PROOF-PROMISE-PLAN" (inspired by the $100M Offers framework)
Structure:
1. THE PROOF WALL - Open with undeniable proof. Matt's $23M+, 25+ years, real businesses, real students building real software. Stack proof so thick that credibility is established before any selling begins. Let the results do the talking.
2. THE GRAND PROMISE - One clear, specific, believable promise. Not hype. State exactly what's possible and frame it honestly: "I'm not saying you'll do $23 million. But what if you built ONE piece of software that brought in $5,000 a month?"
3. THE VALUE EQUATION - Break down Hormozi's value equation: Dream Outcome × Perceived Likelihood of Achievement ÷ Time Delay × Effort & Sacrifice. Show how AI SaaS scores HIGH on dream outcome, HIGH on likelihood (because AI builds it), LOW on time (weeks not years), LOW on effort (no code needed).
4. THE PLAN - Lay out the exact steps. Make it feel achievable. Step 1: Find a problem. Step 2: AI builds the solution. Step 3: Get customers. Step 4: Recurring revenue. The simpler the plan, the higher the conversion.
5. THE IRRESISTIBLE OFFER - Stack everything they get. For each component, quantify the value. Show the total value vs the investment. Make it feel like a no-brainer.
6. THE GUARANTEE / RISK REVERSAL - Remove all risk. What happens if it doesn't work? What do they have to lose vs what do they have to gain?
7. THE CLOSE - Urgency (limited spots). Scarcity (real, not fake). Direct CTA to book a call.

Key Alex Hormozi principles to follow:
- Lead with PROOF not promises
- The value equation should be explicit, not implied
- Make the offer so good people feel stupid saying no
- Use "what if" framing instead of guarantees for compliance
- Stack elements one by one, never dump them all at once

=================================================================
ANGLE VARIATIONS
=================================================================

ANGLE A: "ESCAPE" - Focus on escaping 9-5, boss, commute, Sunday dread. Heavy on pain and freedom.
ANGLE B: "PROVE THEM WRONG" - Girlfriend story front and centre. Emotional revenge narrative.
ANGLE C: "THE EARLY MOVER" - Window of opportunity. Urgency-heavy. Fear of missing out.
ANGLE D: "THE ANTI-GURU" - Lead with scepticism. Position against fakers. Vulnerability and honesty.
ANGLE E: "THE ASSET BUILDER" - Wealth divide insight. Assets vs income. Legacy thinking.
ANGLE F: "THE SECOND CHANCE" - For people who've tried and failed. Empathy-heavy.

=================================================================
OUTPUT RULES
=================================================================

1. TARGET LENGTH: 2,000-2,500 words (~18-22 minutes spoken + 3-5 min demo = ~25 minutes total)
2. Write in Matt's EXACT voice using the style rules above
3. Include [DEMO PLAYS HERE - 3 to 5 minutes] at the appropriate point
4. Include [PAUSE] for dramatic silence moments
5. Include a revenue calculator section with $47/month x 100 subscribers = $4,700/month math
6. End with CTA to book a call
7. Include the girlfriend callback near the close
8. Include at least one pattern interrupt
9. Use "---" dividers between major sections
10. Write it as spoken narration, not slides
11. NO headers, section labels, or technique names in the output, just the clean script
12. Meta compliance: no income guarantees, hypothetical framing, educational positioning
13. NEVER invent testimonials, stories, or statistics not in the REAL FACTS section
14. If referencing students, use only the approved honest social proof language
15. Always include a disclaimer beat: "I'm not saying you'll make $23 million. I would never promise that. But what if you only achieved 10% of what I've done?"`;

  app.post("/api/admin/funnels/generate-vsl", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { formula = 1, angle = "A", hook, context } = req.body;

      const formulaNum = Math.min(Math.max(parseInt(formula) || 1, 1), 8);
      const angleChar = String(angle).toUpperCase().charAt(0);
      const validAngles = ["A", "B", "C", "D", "E", "F"];
      const finalAngle = validAngles.includes(angleChar) ? angleChar : "A";

      let userMessage = `FORMULA: ${formulaNum}\nANGLE: ${finalAngle}`;
      if (hook && hook.trim()) {
        userMessage += `\nHOOK: ${hook.trim()}`;
      }
      if (context && context.trim()) {
        userMessage += `\nADDITIONAL CONTEXT: ${context.trim()}`;
      }
      userMessage += `\n\nGenerate the complete VSL script now. No preamble. No explanation. Just the script, ready to read and record.`;

      console.log(`[generate-vsl] Formula ${formulaNum}, Angle ${finalAngle}, hook: ${hook ? "yes" : "no"}, context: ${context ? "yes" : "no"}`);

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 8000,
        system: VSL_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const script = response.content[0].type === "text" ? response.content[0].text : "";

      if (!script || script.length < 100) {
        return res.status(500).json({ message: "AI returned an empty or too-short script. Please try again." });
      }

      console.log(`[generate-vsl] Generated ${script.length} chars, ~${script.split(/\s+/).length} words`);

      res.json({ script });
    } catch (e: any) {
      console.error("[generate-vsl] Error:", e.message);
      res.status(500).json({ message: e.message });
    }
  });

  // ==========================================
  // VSL HOOK GENERATOR
  // ==========================================

  app.post("/api/admin/funnels/generate-hooks", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { formula = 1, angle = "A", context } = req.body;

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        system: `You are a world-class VSL hook writer working for Matt Webley. You write opening hooks for Video Sales Letters.

Matt's style: British, casual, uses ellipses (...) for pacing, ALL-CAPS for emphasis words, short punchy sentences, anti-guru tone, raw and authentic. Phrases he uses: "Here's the thing...", "Look...", "The TRUTH is...", "See, the thing is..."

Matt's facts: 25+ years online, $23+ million revenue, $12+ million from software, never written a line of code, grew up on a council estate, first girlfriend told him he was a nobody. Teaches non-technical people to build AI SaaS businesses. Runs Webley Global FZCO from Dubai.

Generate exactly 6 different opening hooks. Each should be 1-3 sentences, punchy, attention-grabbing, written in Matt's voice. Make them varied in approach — some emotional, some confrontational, some curiosity-driven, some stat-led.

Return ONLY a JSON array of 6 strings. No explanation, no numbering, just the JSON array.
Example: ["Hook one...", "Hook two...", "Hook three...", "Hook four...", "Hook five...", "Hook six..."]`,
        messages: [{
          role: "user",
          content: `Generate 6 VSL opening hooks for:\nFormula: ${formula}\nAngle: ${angle}${context ? `\nContext: ${context}` : ""}\n\nReturn ONLY a JSON array of 6 hook strings.`,
        }],
      });

      const raw = response.content[0].type === "text" ? response.content[0].text : "";
      let hooks: string[] = [];
      try { hooks = JSON.parse(raw); } catch {}
      if (!Array.isArray(hooks) || hooks.length === 0) {
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) { try { hooks = JSON.parse(match[0]); } catch {} }
      }

      if (!Array.isArray(hooks) || hooks.length === 0) {
        return res.status(500).json({ message: "Failed to generate hooks. Try again." });
      }

      res.json({ hooks });
    } catch (e: any) {
      console.error("[generate-hooks] Error:", e.message);
      res.status(500).json({ message: e.message });
    }
  });
}
