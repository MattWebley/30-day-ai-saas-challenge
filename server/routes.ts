import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserProgressSchema, insertDayContentSchema, users, type User } from "@shared/schema";
import OpenAI from "openai";
import dns from "dns";
import { promisify } from "util";
import crypto from "crypto";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sendPurchaseConfirmationEmail, sendCoachingConfirmationEmail } from "./emailService";

const dnsResolve = promisify(dns.resolve);

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Day content routes
  app.get("/api/days", async (req, res) => {
    try {
      const days = await storage.getAllDayContent();
      res.json(days);
    } catch (error) {
      console.error("Error fetching day content:", error);
      res.status(500).json({ message: "Failed to fetch day content" });
    }
  });

  app.get("/api/days/:day", async (req, res) => {
    try {
      const day = parseInt(req.params.day);
      const content = await storage.getDayContent(day);
      if (!content) {
        return res.status(404).json({ message: "Day not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching day content:", error);
      res.status(500).json({ message: "Failed to fetch day content" });
    }
  });

  // Admin route to create/update day content (protected)
  app.post("/api/admin/days", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertDayContentSchema.parse(req.body);
      const content = await storage.createDayContent(parsed);
      res.json(content);
    } catch (error: any) {
      console.error("Error creating day content:", error);
      res.status(400).json({ message: error.message || "Failed to create day content" });
    }
  });

  app.patch("/api/admin/days/:day", isAuthenticated, async (req, res) => {
    try {
      const day = parseInt(req.params.day);
      const updated = await storage.updateDayContent(day, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Day not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating day content:", error);
      res.status(400).json({ message: error.message || "Failed to update day content" });
    }
  });

  // User progress routes
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.get("/api/progress/:day", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const day = parseInt(req.params.day);
      const progress = await storage.getUserProgressForDay(userId, day);
      res.json(progress || null);
    } catch (error) {
      console.error("Error fetching day progress:", error);
      res.status(500).json({ message: "Failed to fetch day progress" });
    }
  });

  app.post("/api/progress/complete/:day", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const day = parseInt(req.params.day);
      const { selectedSuggestion, microDecisionChoice, reflectionAnswer, ...componentData } = req.body;

      // Build userInputs from component data (customDomain, etc.)
      const userInputs = Object.keys(componentData).length > 0 ? componentData : undefined;

      const progress = await storage.completeDay(userId, day, {
        selectedSuggestion,
        microDecisionChoice,
        reflectionAnswer,
        userInputs,
      });

      // Update user stats
      const stats = await storage.getUserStats(userId);
      if (stats) {
        const today = new Date().toDateString();
        const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate).toDateString() : null;
        
        let newStreak = stats.currentStreak || 0;
        if (lastActivity !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          if (lastActivity === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        await storage.updateUserStats(userId, {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, stats.longestStreak || 0),
          totalXp: (stats.totalXp || 0) + 100,
          lastCompletedDay: day,
          lastActivityDate: new Date(),
        });

        // Check for badge awards
        const allBadges = await storage.getAllBadges();
        const userBadgesEarned = await storage.getUserBadges(userId);
        const earnedBadgeIds = new Set(userBadgesEarned.map(ub => ub.badgeId));
        const updatedStats = await storage.getUserStats(userId);
        const totalXp = updatedStats?.totalXp || 0;

        // Check if user shared build in public (from Day 0 completion data in request body)
        const buildInPublicLink = req.body?.buildInPublic;
        const hasBuildInPublic = buildInPublicLink && typeof buildInPublicLink === 'string' && buildInPublicLink.length > 10;

        for (const badge of allBadges) {
          if (earnedBadgeIds.has(badge.id)) continue;

          let shouldAward = false;

          if (badge.triggerType === 'day_completed' && badge.triggerValue === day) {
            shouldAward = true;
          } else if (badge.triggerType === 'streak' && newStreak >= (badge.triggerValue || 0)) {
            shouldAward = true;
          } else if (badge.triggerType === 'xp' && totalXp >= (badge.triggerValue || 0)) {
            shouldAward = true;
          } else if (badge.triggerType === 'build_in_public' && hasBuildInPublic) {
            shouldAward = true;
          }

          if (shouldAward) {
            await storage.awardBadge(userId, badge.id);
          }
        }
      }

      res.json(progress);
    } catch (error: any) {
      console.error("Error completing day:", error);
      res.status(400).json({ message: error.message || "Failed to complete day" });
    }
  });

  // User stats routes
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let stats = await storage.getUserStats(userId);

      if (!stats) {
        stats = await storage.createUserStats({ userId });
      }

      // Include user's coaching purchase status for unlock-all feature
      const user = await storage.getUser(userId);
      const hasCoaching = user?.coachingPurchased || false;

      // Calculate days since user started
      const userCreatedAt = user?.createdAt || new Date();
      const daysSinceStart = Math.floor((Date.now() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60 * 24));

      res.json({ ...stats, hasCoaching, daysSinceStart });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Admin stats route
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allStats = await storage.getAllUserStats();
      const allProgress = await storage.getAllUserProgress();
      
      // Calculate metrics
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeUsers = allStats.filter((s: any) => 
        s.lastActivityDate && new Date(s.lastActivityDate) > sevenDaysAgo
      ).length;
      
      const completedChallenges = allStats.filter((s: any) => 
        s.lastCompletedDay && s.lastCompletedDay >= 30
      ).length;
      
      const avgProgress = allStats.length > 0
        ? allStats.reduce((sum: number, s: any) => sum + ((s.lastCompletedDay || 0) / 30) * 100, 0) / allStats.length
        : 0;
      
      // Day completion counts
      const dayCompletions: Record<number, number> = {};
      allProgress.forEach((p: any) => {
        if (p.completed) {
          dayCompletions[p.day] = (dayCompletions[p.day] || 0) + 1;
        }
      });
      
      // User progress list
      const userProgress = allUsers.map((user: any) => {
        const stats = allStats.find((s: any) => s.userId === user.id);
        // Get Day 17 progress to find custom domain
        const day17Progress = allProgress.find((p: any) => p.userId === user.id && p.day === 17);
        const day17Inputs = day17Progress?.userInputs as Record<string, unknown> | null;
        const customDomain = day17Inputs?.customDomain as string | undefined;

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          currentDay: (stats?.lastCompletedDay || 0) + 1,
          totalXp: stats?.totalXp || 0,
          lastActive: stats?.lastActivityDate,
          isActive: stats?.lastActivityDate && new Date(stats.lastActivityDate) > sevenDaysAgo,
          customDomain,
        };
      });
      
      res.json({
        totalUsers: allUsers.length,
        activeUsers,
        completedChallenges,
        avgProgress,
        dayCompletions,
        userProgress,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/badges/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Sync badges - check for any missing badges based on current progress
      const allBadges = await storage.getAllBadges();
      const existingUserBadges = await storage.getUserBadges(userId);
      const earnedBadgeIds = new Set(existingUserBadges.map(ub => ub.badgeId));

      // Get user's completed days
      const userProgressList = await storage.getUserProgress(userId);
      const completedDays = new Set(userProgressList.filter(p => p.completed).map(p => p.day));

      // Check if user has build in public link (from Day 0 progress)
      const day0Progress = userProgressList.find(p => p.day === 0);
      const day0Inputs = day0Progress?.userInputs as Record<string, unknown> | null;
      const buildInPublicLink = day0Inputs?.buildInPublic;
      const hasBuildInPublic = buildInPublicLink && typeof buildInPublicLink === 'string' && buildInPublicLink.length > 10;

      // Get user stats for streak
      const userStats = await storage.getUserStats(userId);
      const currentStreak = userStats?.currentStreak || 0;
      const totalXp = userStats?.totalXp || 0;

      // Award any missing badges
      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        let shouldAward = false;

        if (badge.triggerType === 'day_completed' && badge.triggerValue !== null && badge.triggerValue !== undefined && completedDays.has(badge.triggerValue)) {
          shouldAward = true;
        } else if (badge.triggerType === 'streak' && currentStreak >= (badge.triggerValue || 0)) {
          shouldAward = true;
        } else if (badge.triggerType === 'xp' && totalXp >= (badge.triggerValue || 0)) {
          shouldAward = true;
        } else if (badge.triggerType === 'build_in_public' && hasBuildInPublic) {
          shouldAward = true;
        }

        if (shouldAward) {
          await storage.awardBadge(userId, badge.id);
          console.log(`Retroactively awarded badge ${badge.name} to user ${userId}`);
        }
      }

      // Return updated badges list
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Day 1: Generate SaaS ideas based on user inputs
  app.post("/api/generate-ideas", isAuthenticated, async (req: any, res) => {
    try {
      const { knowledge, skills, interests, experience } = req.body;
      
      const prompt = `You are a SaaS business idea expert. Generate exactly 28 B2B SaaS product ideas where the user has a NATURAL ADVANTAGE.

USER PROFILE:
- Knowledge/Expertise: ${knowledge}
- Skills: ${skills}
- Interests/Passions: ${interests}
- Work Experience: ${experience}

CRITICAL RULES:
1. Each idea should leverage ONE area where they have a clear advantage (knowledge, skills, OR experience)
2. DO NOT force weird combinations of all three unless it's genuinely natural
3. Focus on problems they ALREADY understand deeply from one of their inputs
4. Ideas should feel obvious given their background, not Frankenstein combinations

GOOD EXAMPLES:
- If they have "accounting knowledge" → Ideas solving accounting pain points
- If they have "sales experience" → Ideas automating sales workflows
- If they know "healthcare" → Ideas for healthcare professionals

BAD EXAMPLES:
- Combining "loves gaming" + "knows Excel" + "worked in HR" into one weird idea
- Forcing all inputs into every idea when they don't naturally connect

SCORING CRITERIA (rate each 1-5):
1. Market Demand - Is there proven demand? Are competitors making money?
2. Skill Match - Does it align with their skills and knowledge?
3. Passion Fit - Will they enjoy working on this?
4. Speed to MVP - Can they build an MVP in 21 days?
5. Monetization - Clear path to $1k+ MRR?

For each idea, provide:
- title: Short catchy name (2-4 words)
- desc: One sentence description of what it does
- targetCustomer: Who would pay for this
- scores: Object with marketDemand, skillMatch, passionFit, speedToMvp, monetization (each 1-5)
- totalScore: Sum of all scores (out of 25)
- whyThisWorks: One sentence explaining why THEIR background gives them an edge

Return JSON array of 28 ideas, sorted by totalScore descending.
Format: { "ideas": [...] }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      res.json(result.ideas || []);
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      res.status(500).json({ message: error.message || "Failed to generate ideas" });
    }
  });

  // Save Day 1 progress with ideas
  app.post("/api/progress/day1", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userInputs, generatedIdeas, shortlistedIdeas } = req.body;
      
      // Check if progress exists
      const existing = await storage.getUserProgressForDay(userId, 1);
      
      if (existing) {
        // Update existing progress
        const updated = await storage.updateUserProgress(existing.id, {
          userInputs,
          generatedIdeas,
          shortlistedIdeas,
        });
        res.json(updated);
      } else {
        // Create new progress
        const created = await storage.createUserProgress({
          userId,
          day: 1,
          userInputs,
          generatedIdeas,
          shortlistedIdeas,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 1 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Save Day 2 progress with chosen idea
  app.post("/api/progress/day2", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { chosenIdea, chosenIdeaTitle, selectedPainPoints, validationInsights } = req.body;

      const existing = await storage.getUserProgressForDay(userId, 2);

      const progressData = {
        userInputs: { chosenIdea, chosenIdeaTitle, selectedPainPoints, validationInsights },
      };

      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 2,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 2 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Save Day 3 progress with features
  app.post("/api/progress/day3", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bleedingNeckProblem, coreFeatures, uspFeatures } = req.body;
      
      const existing = await storage.getUserProgressForDay(userId, 3);
      
      const progressData = {
        userInputs: { bleedingNeckProblem, coreFeatures, uspFeatures },
      };
      
      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 3,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 3 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Save Day 4 progress with pitch
  app.post("/api/progress/day4", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { who, what, benefit, finalPitch, pitchVariations } = req.body;
      
      const existing = await storage.getUserProgressForDay(userId, 4);
      
      const progressData = {
        userInputs: { who, what, benefit, finalPitch, pitchVariations },
      };
      
      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 4,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 4 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Reset all progress (for testing)
  app.post("/api/progress/reset-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAllUserProgress(userId);
      res.json({ success: true, message: "All progress reset" });
    } catch (error: any) {
      console.error("Error resetting progress:", error);
      res.status(500).json({ message: error.message || "Failed to reset progress" });
    }
  });

  // Save Day 5 progress with MVP prioritization
  app.post("/api/progress/day5", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mustHaveFeatures, niceToHaveFeatures, cutFeatures, killerFeature, aiSuggestion } = req.body;
      
      const existing = await storage.getUserProgressForDay(userId, 5);
      
      const progressData = {
        userInputs: { mustHaveFeatures, niceToHaveFeatures, cutFeatures, killerFeature, aiSuggestion },
      };
      
      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day: 5,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error saving Day 5 progress:", error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Generic progress save endpoint (used by Day4Naming and others)
  app.post("/api/progress/:day(\\d+)", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const day = parseInt(req.params.day);
      const data = req.body;

      const existing = await storage.getUserProgressForDay(userId, day);

      const progressData = {
        userInputs: data,
      };

      if (existing) {
        const updated = await storage.updateUserProgress(existing.id, progressData);
        res.json(updated);
      } else {
        const created = await storage.createUserProgress({
          userId,
          day,
          ...progressData,
        });
        res.json(created);
      }
    } catch (error: any) {
      console.error(`Error saving Day ${req.params.day} progress:`, error);
      res.status(500).json({ message: error.message || "Failed to save progress" });
    }
  });

  // Generic AI prompt endpoint for Day 2 validation
  app.post("/api/ai-prompt", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,  // Maximum randomness for varied outputs
      });

      res.json({ response: response.choices[0].message.content });
    } catch (error: any) {
      console.error("Error running AI prompt:", error);
      res.status(500).json({ message: error.message || "Failed to run AI prompt" });
    }
  });

  // Analyze website design from URL
  app.post("/api/analyze-design", isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL format
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      // Use thum.io for free screenshots (no API key needed)
      // thum.io expects the URL directly appended, not encoded
      const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/${cleanUrl}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this website screenshot and describe its design style. I want to recreate a SIMILAR vibe (not exact copy) in my own app.

Describe:
1. COLOR PALETTE: What are the main colors? (give hex codes if you can guess them)
2. OVERALL VIBE: Is it minimal, bold, playful, corporate, dark, light, etc?
3. SPACING: Lots of whitespace or dense? Generous padding or compact?
4. TYPOGRAPHY FEEL: Modern, classic, friendly, technical, elegant?
5. SHADOWS & BORDERS: Soft shadows, hard shadows, none? Visible borders or borderless?
6. CORNERS: Sharp, slightly rounded, very rounded?
7. SPECIAL EFFECTS: Any gradients, glass effects, animations visible?

Then write a prompt I can give to Claude Code to recreate this approximate style. Start the prompt with "Transform my app's design:" and include specific, actionable instructions.

Be concise but specific. Focus on what makes this design FEEL the way it does.`
              },
              {
                type: "image_url",
                image_url: {
                  url: screenshotUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      });

      const analysis = response.choices[0].message.content || "";

      // Extract the Claude Code prompt (everything after "Transform my app's design:")
      const promptMatch = analysis.match(/Transform my app's design:[\s\S]*/i);
      const generatedPrompt = promptMatch ? promptMatch[0] : analysis;

      res.json({
        analysis,
        generatedPrompt,
        screenshotUrl
      });
    } catch (error: any) {
      console.error("Error analyzing design:", error);
      res.status(500).json({ message: error.message || "Failed to analyze design. The website might be blocking screenshots." });
    }
  });

  // Domain availability check endpoint
  app.post("/api/check-domain", isAuthenticated, async (req: any, res) => {
    try {
      const { domain } = req.body;

      if (!domain || typeof domain !== 'string') {
        return res.status(400).json({ message: "Domain is required" });
      }

      // Clean the domain - remove protocol, www, and trailing slashes
      const cleanDomain = domain.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .trim();

      // Add timeout to DNS lookup
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), 3000);
      });

      try {
        // Try to resolve DNS with timeout - if it fails, domain is likely available
        await Promise.race([dnsResolve(cleanDomain), timeoutPromise]);
        // DNS resolved - domain is taken
        res.json({ domain: cleanDomain, available: false });
      } catch (dnsError: any) {
        if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
          // No DNS records - domain is likely available
          res.json({ domain: cleanDomain, available: true });
        } else if (dnsError.message === 'DNS_TIMEOUT') {
          // Timeout - assume available (most invented names won't have DNS)
          res.json({ domain: cleanDomain, available: true });
        } else {
          // Other DNS error - assume available for invented names
          console.error("DNS lookup error:", dnsError.code || dnsError.message);
          res.json({ domain: cleanDomain, available: true });
        }
      }
    } catch (error: any) {
      console.error("Error checking domain:", error);
      res.status(500).json({ message: error.message || "Failed to check domain" });
    }
  });

  // Competitor Research endpoint for Day 3
  app.post("/api/research-competitors", isAuthenticated, async (req: any, res) => {
    try {
      const { ideaTitle, ideaDescription, targetCustomer } = req.body;
      
      const prompt = `You are a SaaS market research expert. I need you to find DIRECT competitors for this SaaS idea:

Product: "${ideaTitle}"
Description: ${ideaDescription}
Target Customer: ${targetCustomer}

Find 4-5 REAL, EXISTING SaaS companies that do EXACTLY the same thing or very similar. For each competitor, provide:
1. Company name
2. Website URL (must be real and working)
3. A one-line description of what they do
4. Their top 5 features that they promote most prominently on their sales page

IMPORTANT: Only include REAL companies with real websites. Do not make up companies.

Respond in this exact JSON format:
{
  "competitors": [
    {
      "name": "Company Name",
      "url": "https://example.com",
      "description": "One line description",
      "topFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]
    }
  ]
}

Only respond with valid JSON, nothing else.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(content);
      
      // Add screenshot URLs using free screenshot service
      // Using screenshotapi.net which is free and doesn't require authentication for basic usage
      const competitorsWithScreenshots = (parsed.competitors || []).map((comp: any) => ({
        ...comp,
        screenshotUrl: `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(comp.url)}&width=400&height=300&output=image&file_type=png&wait_for_event=load`,
      }));

      // Find shared features across all competitors
      const allFeatures: Record<string, number> = {};
      competitorsWithScreenshots.forEach((comp: any) => {
        (comp.topFeatures || []).forEach((feature: string) => {
          const normalized = feature.toLowerCase().trim();
          allFeatures[normalized] = (allFeatures[normalized] || 0) + 1;
        });
      });

      // Features that appear in 2+ competitors are "core" features
      const sharedFeatureNames = Object.entries(allFeatures)
        .filter(([_, count]) => count >= 2)
        .map(([feature]) => feature.charAt(0).toUpperCase() + feature.slice(1))
        .slice(0, 8);

      // Generate detailed descriptions for shared features using AI
      let sharedFeaturesWithDetails = sharedFeatureNames.map(name => ({
        name,
        description: '',
        why: ''
      }));

      if (sharedFeatureNames.length > 0) {
        try {
          const descriptionPrompt = `You are a SaaS product expert. For this product idea: "${ideaTitle}" (${ideaDescription}), explain these core features that all competitors have.

Target Customer: ${targetCustomer}

Core Features Found in Competitors:
${sharedFeatureNames.map((f, i) => `${i + 1}. ${f}`).join('\n')}

For EACH feature, provide:
1. A clear 1-sentence description of what this feature does
2. A 1-sentence explanation of why this feature is important/valuable to the target customer

Respond in this exact JSON format:
{
  "features": [
    {
      "name": "Feature Name",
      "description": "What this feature does...",
      "why": "Why customers need this..."
    }
  ]
}

Keep each description and why statement under 120 characters. Only respond with valid JSON.`;

          const descResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: descriptionPrompt }],
            response_format: { type: "json_object" },
          });

          const descContent = descResponse.choices[0].message.content || "{}";
          const descParsed = JSON.parse(descContent);

          if (descParsed.features && Array.isArray(descParsed.features)) {
            sharedFeaturesWithDetails = descParsed.features;
          }
        } catch (error) {
          console.error("Error generating feature descriptions:", error);
          // Fall back to simple format if AI call fails
        }
      }

      res.json({
        competitors: competitorsWithScreenshots,
        sharedFeatures: sharedFeaturesWithDetails,
      });
    } catch (error: any) {
      console.error("Error researching competitors:", error);
      res.status(500).json({ message: error.message || "Failed to research competitors" });
    }
  });

  // Generate USP features based on competitors
  app.post("/api/generate-usp-features", isAuthenticated, async (req: any, res) => {
    try {
      const { ideaTitle, ideaDescription, userSkills, sharedFeatures, competitors } = req.body;
      
      const competitorInfo = competitors.map((c: any) => 
        `${c.name}: ${c.topFeatures?.join(', ')}`
      ).join('\n');
      
      const prompt = `You are a SaaS positioning expert. Based on this analysis, suggest unique differentiating features (USPs) for a new product.

Product: "${ideaTitle}"
Description: ${ideaDescription}
User's Skills: ${userSkills}

Competitor Features:
${competitorInfo}

Shared Core Features (what everyone has): ${sharedFeatures.join(', ')}

What are 5-7 UNIQUE features this product could have that competitors DON'T have? Focus on:
- Gaps in the market
- Features the user's skills enable
- Innovative approaches competitors haven't tried

List only the features, one per line, each under 10 words. No numbering or bullets.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });

      const features = (response.choices[0].message.content || "")
        .split('\n')
        .map((line: string) => line.replace(/^[-•*\d.]+\s*/, '').trim())
        .filter((line: string) => line.length > 3 && line.length < 80);

      res.json({ uspFeatures: features });
    } catch (error: any) {
      console.error("Error generating USP features:", error);
      res.status(500).json({ message: error.message || "Failed to generate USP features" });
    }
  });

  // Generate all features for Day 3 (Core + Shared + USP)
  app.post("/api/ai/generate-features", isAuthenticated, async (req: any, res) => {
    try {
      const { idea, painPoints } = req.body;

      // Step 1: Generate core features based on idea and pain points
      const corePrompt = `You are a SaaS product expert. Based on this idea and pain points, suggest 5-7 core features.

Product Idea: ${idea}

Pain Points to Solve:
${painPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

Generate 5-7 CORE features that directly solve these pain points. Each feature should:
- Solve at least one of the pain points
- Be specific and actionable
- Be essential to the product

Respond in this exact JSON format:
{
  "coreFeatures": [
    {
      "name": "Feature Name (3-6 words)",
      "description": "What this feature does and which pain point it solves (1 sentence, max 120 chars)"
    }
  ]
}

Only respond with valid JSON, nothing else.`;

      const coreResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: corePrompt }],
        response_format: { type: "json_object" },
      });

      const coreContent = coreResponse.choices[0].message.content || "{}";
      const coreParsed = JSON.parse(coreContent);
      const coreFeatures = coreParsed.coreFeatures || [];

      // Step 2: Find competitors and analyze shared features
      const competitorPrompt = `You are a SaaS market research expert. Find 3-4 REAL competitors for this idea: "${idea}"

Find REAL, EXISTING SaaS companies that do the same or very similar thing. For each competitor, provide their top 3-5 features.

Respond in this exact JSON format:
{
  "competitors": [
    {
      "name": "Company Name",
      "topFeatures": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ]
}

Only respond with valid JSON, nothing else.`;

      const competitorResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: competitorPrompt }],
        response_format: { type: "json_object" },
      });

      const competitorContent = competitorResponse.choices[0].message.content || "{}";
      const competitorParsed = JSON.parse(competitorContent);
      const competitors = competitorParsed.competitors || [];

      // Find shared features across competitors
      const allFeatures: Record<string, number> = {};
      competitors.forEach((comp: any) => {
        (comp.topFeatures || []).forEach((feature: string) => {
          const normalized = feature.toLowerCase().trim();
          allFeatures[normalized] = (allFeatures[normalized] || 0) + 1;
        });
      });

      // Features that appear in 2+ competitors are "shared must-haves"
      const sharedFeatureNames = Object.entries(allFeatures)
        .filter(([_, count]) => count >= 2)
        .map(([feature]) => feature.charAt(0).toUpperCase() + feature.slice(1))
        .slice(0, 6);

      // Generate descriptions for shared features
      let sharedFeatures: any[] = [];
      if (sharedFeatureNames.length > 0) {
        const sharedPrompt = `For this product idea: "${idea}", explain these features that all competitors have:

Shared Features:
${sharedFeatureNames.map((f, i) => `${i + 1}. ${f}`).join('\n')}

For EACH feature, provide:
1. A clear 1-sentence description (max 100 chars)

Respond in this exact JSON format:
{
  "sharedFeatures": [
    {
      "name": "Feature Name",
      "description": "What this feature does and why it's essential to compete (1 sentence, max 120 chars)"
    }
  ]
}

Only respond with valid JSON, nothing else.`;

        const sharedResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: sharedPrompt }],
          response_format: { type: "json_object" },
        });

        const sharedContent = sharedResponse.choices[0].message.content || "{}";
        const sharedParsed = JSON.parse(sharedContent);
        sharedFeatures = sharedParsed.sharedFeatures || [];
      }

      // Step 3: Generate USP features
      const uspPrompt = `You are a SaaS positioning expert. Based on this analysis, suggest 4-6 UNIQUE differentiating features.

Product Idea: ${idea}

Core Features (what we're building): ${coreFeatures.map((f: any) => f.name).join(', ')}
Shared Features (what competitors have): ${sharedFeatureNames.join(', ')}

Generate 4-6 UNIQUE features this product could have that competitors DON'T have. Focus on:
- Gaps in the market
- Innovative approaches competitors haven't tried
- Features that give a competitive advantage

Respond in this exact JSON format:
{
  "uspFeatures": [
    {
      "name": "Feature Name (3-6 words)",
      "description": "What makes this unique and why customers would want it (1 sentence, max 120 chars)"
    }
  ]
}

Only respond with valid JSON, nothing else.`;

      const uspResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: uspPrompt }],
        response_format: { type: "json_object" },
      });

      const uspContent = uspResponse.choices[0].message.content || "{}";
      const uspParsed = JSON.parse(uspContent);
      const uspFeatures = uspParsed.uspFeatures || [];

      res.json({
        coreFeatures,
        sharedFeatures,
        uspFeatures,
      });
    } catch (error: any) {
      console.error("Error generating features:", error);
      res.status(500).json({ message: error.message || "Failed to generate features" });
    }
  });

  // Generate MVP Roadmap for Day 4
  app.post("/api/ai/generate-mvp-roadmap", isAuthenticated, async (req: any, res) => {
    try {
      const { idea, features } = req.body;

      const prompt = `You are a SaaS product strategist. Create an MVP roadmap for this product idea.

Product Idea: ${idea}

All Features:
${features.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

Divide these features into two groups:
1. **MVP Features** (MUST build first): The minimum features needed to launch and deliver core value
2. **Post-MVP Features** (build after launch): Nice-to-haves that can wait

For each feature, estimate build time in weeks (be realistic).

Prioritize features that:
- Solve the core pain point
- Are essential to basic functionality
- Provide immediate value

De-prioritize features that:
- Are nice-to-have but not essential
- Can be added based on user feedback
- Are complex or time-consuming

Respond in this exact JSON format:
{
  "mvpFeatures": [
    {
      "name": "Feature Name",
      "description": "Why this is essential for MVP (1 sentence, max 100 chars)",
      "estimatedWeeks": 2
    }
  ],
  "postMvpFeatures": [
    {
      "name": "Feature Name",
      "description": "Why this can wait until after launch (1 sentence, max 100 chars)",
      "estimatedWeeks": 1
    }
  ]
}

Keep MVP scope tight - aim for 4-6 weeks total build time for MVP features. Only respond with valid JSON, nothing else.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(content);

      res.json({
        mvpFeatures: parsed.mvpFeatures || [],
        postMvpFeatures: parsed.postMvpFeatures || [],
      });
    } catch (error: any) {
      console.error("Error generating MVP roadmap:", error);
      res.status(500).json({ message: error.message || "Failed to generate MVP roadmap" });
    }
  });

  // Generate PRD for Day 6
  app.post("/api/ai/generate-prd", isAuthenticated, async (req: any, res) => {
    try {
      const { idea, painPoints, features, mvpFeatures, appName, iHelpStatement, uspFeatures, brandVibe, customerAvatar, lookAndFeel } = req.body;

      // Generate summary
      const summaryPrompt = `You are a product strategist. Create a 3-4 sentence executive summary for this SaaS product.

Product Name: ${appName || 'TBD'}
Product Idea: ${idea}
${iHelpStatement ? `Value Proposition: "${iHelpStatement}"` : ''}
${customerAvatar ? `Target Customer: ${customerAvatar}` : ''}

Pain Points: ${painPoints.join(', ')}
MVP Features: ${mvpFeatures.join(', ')}
${uspFeatures && uspFeatures.length > 0 ? `Standout Features (USP): ${uspFeatures.join(', ')}` : ''}

Write a compelling executive summary that explains:
1. What the product is
2. What problem it solves
3. Who it's for (use the target customer description)
4. The key value proposition

Keep it concise, professional, and compelling. 3-4 sentences maximum.`;

      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: summaryPrompt }],
      });

      const summary = summaryResponse.choices[0].message.content || "";

      // Generate full PRD
      const prdPrompt = `Create a PRD for this product. No fluff, no filler, no generic advice. Be extremely specific to THIS product.

PRODUCT NAME: ${appName || 'TBD'}
PRODUCT IDEA: ${idea}
${iHelpStatement ? `VALUE PROPOSITION: "${iHelpStatement}"` : ''}

CUSTOMER AVATAR: ${customerAvatar || 'Not specified'}

PAIN POINTS:
${painPoints.map((p: string, i: number) => `- ${p}`).join('\n')}

MVP FEATURES:
${mvpFeatures.map((f: string, i: number) => `- ${f}`).join('\n')}

ALL FEATURES:
${features.map((f: string, i: number) => `- ${f}`).join('\n')}

${uspFeatures && uspFeatures.length > 0 ? `STANDOUT FEATURES (USP):
${uspFeatures.map((f: string) => `- ${f}`).join('\n')}` : ''}

${brandVibe ? `BRAND VIBE: ${brandVibe}` : ''}
LOOK & FEEL: ${lookAndFeel || 'Modern and clean'}

OUTPUT FORMAT:

# ${appName || idea} - PRD

## What It Is
[1-2 sentences. What does this specific product do?]

## Who It's For
[Use the customer avatar provided. Be specific and detailed about who this person is and their situation.]

## Core Problem
[The #1 pain point this solves. One sentence.]

## Unique Value Proposition
[What makes this different from competitors? Why would someone choose THIS product?]

## MVP Features

[For EACH MVP feature, write:]

### [Feature Name]
**User does:** [Exact action user takes]
**System does:** [Exact system response]
**Done when:** [Specific completion criteria - testable]

## Data Model
[List the core entities/tables needed. E.g., Users, Projects, Tasks - with key fields]

## API Endpoints
[List 5-8 critical endpoints. Format: METHOD /path - what it does]

## Third-Party Services
[Only list if actually needed: Stripe, SendGrid, etc. with WHY]

## UI/UX Direction
[Based on the look & feel description: ${lookAndFeel || 'modern and clean'}]
[2-3 sentences on the visual style and user experience approach]

## Launch Blockers
[5-7 specific items that MUST work before launch. Not generic - specific to this product]

NO generic advice. NO "consider accessibility". NO "ensure security best practices". Only specific, actionable items for THIS product.`;

      const prdResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prdPrompt }],
      });

      const prd = prdResponse.choices[0].message.content || "";

      res.json({
        summary,
        prd,
      });
    } catch (error: any) {
      console.error("Error generating PRD:", error);
      res.status(500).json({ message: error.message || "Failed to generate PRD" });
    }
  });

  // Chat/Comments routes
  app.get("/api/comments/:day", async (req, res) => {
    try {
      const day = parseInt(req.params.day);
      const comments = await storage.getDayComments(day);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Anti-spam detection function
  function detectSpam(content: string): { isSpam: boolean; reason?: string } {
    const lowerContent = content.toLowerCase();
    
    // Check for links (various patterns)
    const linkPatterns = [
      /https?:\/\//i,
      /www\./i,
      /\[url/i,
      /\.com\b/i,
      /\.net\b/i,
      /\.org\b/i,
      /\.io\b/i,
      /\.co\b/i,
      /bit\.ly/i,
      /tinyurl/i,
      /t\.co/i,
      /goo\.gl/i,
      // Unicode domain obfuscation
      /[\u0430-\u044f]+\.(com|net|org|io)/i, // Cyrillic
      // Spaced out links
      /h\s*t\s*t\s*p/i,
      /w\s*w\s*w\s*\./i,
      // Common substitutions
      /\[dot\]/i,
      /\(dot\)/i,
      /\[at\]/i,
      /\(at\)/i,
    ];
    
    for (const pattern of linkPatterns) {
      if (pattern.test(content)) {
        return { isSpam: true, reason: "Contains links or link-like content" };
      }
    }
    
    // Check for email patterns
    if (/[\w.-]+@[\w.-]+\.\w+/.test(content)) {
      return { isSpam: true, reason: "Contains email address" };
    }
    
    // Check for phone numbers
    if (/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(content)) {
      return { isSpam: true, reason: "Contains phone number" };
    }
    
    // Check for promotional keywords
    const promoKeywords = ["buy now", "click here", "free money", "guaranteed", "limited time", "act now", "discount code", "promo code", "affiliate"];
    for (const keyword of promoKeywords) {
      if (lowerContent.includes(keyword)) {
        return { isSpam: true, reason: `Contains promotional content: ${keyword}` };
      }
    }
    
    return { isSpam: false };
  }

  app.post("/api/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { day, content } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment cannot be empty" });
      }
      
      if (content.length > 1000) {
        return res.status(400).json({ message: "Comment too long (max 1000 characters)" });
      }
      
      // Check user's spam status
      const spamStatus = await storage.getUserSpamStatus(userId);
      const requiresApproval = spamStatus?.requiresApproval || false;
      
      // Check for spam content
      const spamCheck = detectSpam(content);
      
      let status = "approved";
      let flagReason = null;
      
      if (requiresApproval) {
        status = "pending";
        flagReason = "User flagged for repeated suspicious activity";
      } else if (spamCheck.isSpam) {
        status = "pending";
        flagReason = spamCheck.reason;
        // Increment flag count
        await storage.incrementFlagCount(userId);
      }
      
      const comment = await storage.createDayComment({
        day,
        userId,
        content: content.trim(),
        status,
        flagReason,
      });
      
      if (status === "pending") {
        res.json({ 
          ...comment, 
          message: "Your comment is being reviewed and will appear once approved." 
        });
      } else {
        const user = await storage.getUser(userId);
        res.json({ ...comment, user });
      }
    } catch (error: any) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: error.message || "Failed to create comment" });
    }
  });

  // Admin: Get pending comments
  app.get("/api/admin/pending-comments", isAuthenticated, async (req: any, res) => {
    try {
      const comments = await storage.getPendingComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching pending comments:", error);
      res.status(500).json({ message: "Failed to fetch pending comments" });
    }
  });

  // Admin: Approve/reject comment
  app.post("/api/admin/comments/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body; // 'approved' or 'rejected'

      const updated = await storage.updateCommentStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating comment status:", error);
      res.status(500).json({ message: error.message || "Failed to update comment" });
    }
  });

  // Admin: Delete comment
  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: error.message || "Failed to delete comment" });
    }
  });

  // Brand settings - public endpoint (for applying theme)
  app.get("/api/brand-settings", async (req, res) => {
    try {
      const settings = await storage.getBrandSettings();
      res.json(settings || {
        primaryColor: "#007BFF",
        textColor: "#000000",
        backgroundColor: "#FFFFFF",
        accentColor: "#007BFF",
        fontFamily: "Poppins",
        borderRadius: 6,
        appName: "21 Day AI SaaS Challenge",
      });
    } catch (error) {
      console.error("Error fetching brand settings:", error);
      res.status(500).json({ message: "Failed to fetch brand settings" });
    }
  });

  // Admin: Update brand settings
  app.post("/api/admin/brand-settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = req.body;
      const updated = await storage.updateBrandSettings(settings);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating brand settings:", error);
      res.status(500).json({ message: error.message || "Failed to update brand settings" });
    }
  });

  // AI Build Coach chat endpoint
  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      // Debug: Log user object to diagnose auth issues
      if (!req.user) {
        console.error("Chat error: req.user is undefined");
        return res.status(401).json({ message: "User session not found. Please log in again." });
      }
      if (!req.user.claims) {
        console.error("Chat error: req.user.claims is undefined", { user: req.user });
        return res.status(401).json({ message: "Invalid session. Please log in again." });
      }
      if (!req.user.claims.sub) {
        console.error("Chat error: req.user.claims.sub is undefined", { claims: req.user.claims });
        return res.status(401).json({ message: "User ID not found. Please log in again." });
      }

      const userId = req.user.claims.sub;
      const { message, context, history } = req.body;

      // Check rate limits
      const usageCheck = await storage.checkAndIncrementChatUsage(userId);
      if (!usageCheck.allowed) {
        return res.status(429).json({
          error: "rate_limit",
          message: usageCheck.reason,
          resetIn: usageCheck.resetIn
        });
      }

      // Fetch admin-configurable rules (if any)
      const chatSettings = await storage.getChatbotSettings();

      // Use admin-configured values or defaults
      const responseStyle = chatSettings?.responseStyle || `- Be helpful and conversational, like a knowledgeable friend.
- Explain things clearly - use examples when helpful.
- Use formatting (bullets, code blocks) when it aids clarity.
- Give actionable guidance with context on why.
- Be encouraging but genuine - no over-the-top praise.`;

      const scopeHelps = chatSettings?.scopeHelps || 'ideas, planning, coding, debugging, tech decisions, APIs, auth, testing';
      const scopeWontHelp = chatSettings?.scopeWontHelp || 'sales, marketing, pricing, business strategy, post-launch growth';
      const businessRedirect = chatSettings?.businessRedirect || 'This challenge focuses on building. For business strategy, see Matt\'s mentorship: https://mattwebley.com/workwithmatt';
      const coreRules = chatSettings?.coreRules || `1. Reference their idea/features when relevant
2. ONE clear next step when stuck
3. Keep them on their current day's task`;
      const customRules = chatSettings?.customRules || '';

      const systemPrompt = `You are the AI Mentor for the 21 Day AI SaaS Challenge. Help users build their SaaS MVP.

RESPONSE STYLE - CRITICAL:
${responseStyle}

SCOPE:
Help with: ${scopeHelps}.
DON'T help with: ${scopeWontHelp}.

For business/marketing questions, say: "${businessRedirect}" - then move on.

CHALLENGE DAYS:
0-6: Planning | 7: First build | 8: Claude Code | 9-14: Build & test | 15-18: Infrastructure | 19-21: Polish & launch-ready

USER CONTEXT:
${context.userName ? `Name: ${context.userName}` : ''}
Day ${context.currentDay} | Completed: ${context.completedDays?.join(', ') || 'None'}
${context.userIdea ? `Idea: ${context.userIdea}` : ''}
${context.painPoints?.length ? `Pain points: ${context.painPoints.join(', ')}` : ''}
${context.features?.length ? `Features: ${context.features.join(', ')}` : ''}
${context.mvpFeatures?.length ? `MVP: ${context.mvpFeatures.join(', ')}` : ''}

RULES:
${coreRules}

${customRules ? `ADDITIONAL RULES:\n${customRules}` : ''}`;

      const messages: any[] = [
        { role: "system", content: systemPrompt },
      ];

      // Add conversation history
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          messages.push({ role: msg.role, content: msg.content });
        });
      }

      // Add current message
      messages.push({ role: "user", content: message });

      // Abuse detection - check for patterns
      const abusePatterns = [
        { pattern: /ignore (previous|all|your) (instructions|rules|prompt)/i, reason: "Attempted prompt injection" },
        { pattern: /pretend you('re| are) (not|a different)/i, reason: "Attempted role manipulation" },
        { pattern: /jailbreak|bypass|hack|exploit/i, reason: "Potential abuse keywords" },
        { pattern: /repeat after me|say exactly/i, reason: "Attempted output manipulation" },
        { pattern: /what('s| is) (your|the) (system|initial) (prompt|message)/i, reason: "Attempted prompt extraction" },
      ];

      let flagged = false;
      let flagReason = null;

      for (const { pattern, reason } of abusePatterns) {
        if (pattern.test(message)) {
          flagged = true;
          flagReason = reason;
          break;
        }
      }

      // Save user message
      await storage.saveChatMessage({
        userId,
        role: "user",
        content: message,
        flagged,
        flagReason,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 500,
      });

      const reply = response.choices[0].message.content || "I'm not sure how to help with that. Can you try rephrasing?";

      // Save assistant response
      await storage.saveChatMessage({
        userId,
        role: "assistant",
        content: reply,
        flagged: false,
      });

      res.json({ response: reply });
    } catch (error: any) {
      console.error("Error in chat:", {
        message: error.message,
        code: error.code,
        status: error.status,
        type: error.type,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      });

      // Check for specific OpenAI errors
      if (error.code === 'invalid_api_key' || error.message?.includes('API key') || error.message?.includes('Incorrect API key')) {
        return res.status(500).json({ message: "AI service not configured. Please contact support." });
      }
      if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
        return res.status(500).json({ message: "AI service temporarily unavailable (quota exceeded). Please try again later." });
      }
      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        return res.status(429).json({ message: "Too many requests to AI service. Please wait a moment and try again." });
      }
      if (error.code === 'model_not_found') {
        return res.status(500).json({ message: "AI model configuration error. Please contact support." });
      }
      if (error.message?.includes('Connection') || error.code === 'ECONNREFUSED') {
        return res.status(503).json({ message: "Could not connect to AI service. Please try again." });
      }

      res.status(500).json({ message: error.message || "Failed to get response from AI. Please try again." });
    }
  });

  // Admin: Get chatbot settings
  app.get("/api/admin/chatbot/settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getChatbotSettings();
      res.json(settings || { customRules: "", dailyLimit: 20, hourlyLimit: 10 });
    } catch (error: any) {
      console.error("Error fetching chatbot settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Admin: Update chatbot settings
  app.post("/api/admin/chatbot/settings", isAuthenticated, async (req: any, res) => {
    try {
      const { customRules, dailyLimit, hourlyLimit } = req.body;
      const updated = await storage.updateChatbotSettings({ customRules, dailyLimit, hourlyLimit });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating chatbot settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Admin: Get all chat messages
  app.get("/api/admin/chatbot/messages", isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getAllChatMessages();
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Admin: Get flagged messages
  app.get("/api/admin/chatbot/flagged", isAuthenticated, async (req: any, res) => {
    try {
      const flagged = await storage.getFlaggedMessages();
      res.json(flagged);
    } catch (error: any) {
      console.error("Error fetching flagged messages:", error);
      res.status(500).json({ message: "Failed to fetch flagged messages" });
    }
  });

  // Admin: Get chat summary by user
  app.get("/api/admin/chatbot/users", isAuthenticated, async (req: any, res) => {
    try {
      const summary = await storage.getUserChatSummary();
      res.json(summary);
    } catch (error: any) {
      console.error("Error fetching user chat summary:", error);
      res.status(500).json({ message: "Failed to fetch user summary" });
    }
  });

  // Admin: Get specific user's chat history
  app.get("/api/admin/chatbot/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.userId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching user messages:", error);
      res.status(500).json({ message: "Failed to fetch user messages" });
    }
  });

  // Admin: Mark message as reviewed
  app.post("/api/admin/chatbot/review/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markMessageReviewed(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error marking message reviewed:", error);
      res.status(500).json({ message: "Failed to mark reviewed" });
    }
  });

  // Admin: Manually flag a message
  app.post("/api/admin/chatbot/flag/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const updated = await storage.flagMessage(id, reason || "Flagged by admin");
      res.json(updated);
    } catch (error: any) {
      console.error("Error flagging message:", error);
      res.status(500).json({ message: "Failed to flag message" });
    }
  });

  // Showcase routes
  // Submit to showcase (user)
  app.post("/api/showcase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { appName, description, screenshotUrl, liveUrl, testimonial, videoUrl } = req.body;

      if (!appName || !description) {
        return res.status(400).json({ message: "App name and description are required" });
      }

      const entry = await storage.createShowcaseEntry({
        userId,
        appName,
        description,
        screenshotUrl: screenshotUrl || null,
        liveUrl: liveUrl || null,
        testimonial: testimonial || null,
        videoUrl: videoUrl || null,
      });

      // Award Ambassador badge if testimonial is included
      if (testimonial && testimonial.trim().length > 0) {
        try {
          const allBadges = await storage.getAllBadges();
          const ambassadorBadge = allBadges.find(b => b.triggerType === 'testimonial_submitted');
          if (ambassadorBadge) {
            const userBadges = await storage.getUserBadges(userId);
            const alreadyHas = userBadges.some(ub => ub.badgeId === ambassadorBadge.id);
            if (!alreadyHas) {
              await storage.awardBadge(userId, ambassadorBadge.id);
              console.log(`Awarded Ambassador badge to user ${userId}`);
            }
          }
        } catch (badgeError) {
          console.error("Error awarding Ambassador badge:", badgeError);
          // Don't fail the request if badge awarding fails
        }
      }

      res.json(entry);
    } catch (error: any) {
      console.error("Error creating showcase entry:", error);
      res.status(500).json({ message: "Failed to submit to showcase" });
    }
  });

  // Get user's showcase entry
  app.get("/api/showcase/mine", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.getShowcaseEntry(userId);
      res.json(entry || null);
    } catch (error: any) {
      console.error("Error fetching showcase entry:", error);
      res.status(500).json({ message: "Failed to fetch showcase entry" });
    }
  });

  // Get approved showcase (public)
  app.get("/api/showcase", async (req, res) => {
    try {
      const entries = await storage.getApprovedShowcase();
      res.json(entries);
    } catch (error: any) {
      console.error("Error fetching showcase:", error);
      res.status(500).json({ message: "Failed to fetch showcase" });
    }
  });

  // Get showcase stats (public)
  app.get("/api/showcase/stats", async (req, res) => {
    try {
      const entries = await storage.getApprovedShowcase();
      res.json({
        count: entries.length,
        recent: entries.slice(0, 3).map(e => ({ appName: e.appName, liveUrl: e.liveUrl }))
      });
    } catch (error: any) {
      console.error("Error fetching showcase stats:", error);
      res.status(500).json({ message: "Failed to fetch showcase stats" });
    }
  });

  // Admin: Get pending showcase entries
  app.get("/api/admin/showcase/pending", isAuthenticated, async (req: any, res) => {
    try {
      const entries = await storage.getPendingShowcase();
      res.json(entries);
    } catch (error: any) {
      console.error("Error fetching pending showcase:", error);
      res.status(500).json({ message: "Failed to fetch pending showcase" });
    }
  });

  // Admin: Update showcase status
  app.post("/api/admin/showcase/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateShowcaseStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating showcase status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Admin: Toggle featured
  app.post("/api/admin/showcase/:id/feature", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.toggleShowcaseFeatured(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error toggling featured:", error);
      res.status(500).json({ message: "Failed to toggle featured" });
    }
  });

  // ============================================
  // Q&A ROUTES
  // ============================================

  // Submit a question (sends email notification)
  app.post("/api/questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { day, question } = req.body;

      if (!day || !question) {
        return res.status(400).json({ message: "Day and question are required" });
      }

      // Generate unique answer token
      const answerToken = crypto.randomUUID();

      // Create the question
      const created = await storage.createQuestion({
        day,
        userId,
        question,
        answerToken,
        status: "pending"
      });

      // Get user info for email
      const user = await storage.getUser(userId);
      const dayContent = await storage.getDayContent(day);

      // Generate AI suggested answer
      try {
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are Matt Webley's assistant for the 21 Day AI SaaS Challenge. Generate a helpful, concise answer to this student question about Day ${day}: "${dayContent?.title || 'Unknown'}". Keep answers practical and actionable. Use Matt's punchy, direct style with short sentences and ALL CAPS for emphasis occasionally.`
            },
            {
              role: "user",
              content: question
            }
          ],
          max_tokens: 500
        });

        const aiAnswer = aiResponse.choices[0]?.message?.content || "";
        if (aiAnswer) {
          await storage.setAiSuggestedAnswer(created.id, aiAnswer);
        }
      } catch (aiError) {
        console.error("Failed to generate AI answer:", aiError);
        // Continue without AI answer
      }

      // Build answer URL
      const baseUrl = process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : process.env.REPLIT_DEPLOYMENT_URL || "http://localhost:5000";
      const answerUrl = `${baseUrl}/admin/answer/${answerToken}`;

      // Log the email that would be sent (in production, integrate with Resend or similar)
      console.log("=== NEW QUESTION NOTIFICATION ===");
      console.log(`To: info@rapidwebsupport.com`);
      console.log(`Subject: New Question on Day ${day}: ${dayContent?.title || 'Unknown'}`);
      console.log(`From: ${user?.firstName || 'Unknown'} ${user?.lastName || ''} (${user?.email || 'No email'})`);
      console.log(`Question: ${question}`);
      console.log(`Answer Link: ${answerUrl}`);
      console.log("=================================");

      res.json({
        success: true,
        message: "Question submitted! Matt will be notified and may answer it soon.",
        questionId: created.id
      });
    } catch (error: any) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to submit question" });
    }
  });

  // Get answered questions for a day (public)
  app.get("/api/questions/day/:day", async (req, res) => {
    try {
      const day = parseInt(req.params.day);
      const questions = await storage.getAnsweredQuestionsByDay(day);
      res.json(questions);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get pending questions (admin only)
  app.get("/api/admin/questions/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const questions = await storage.getPendingQuestions();
      res.json(questions);
    } catch (error: any) {
      console.error("Error fetching pending questions:", error);
      res.status(500).json({ message: "Failed to fetch pending questions" });
    }
  });

  // Get question by answer token (for email link)
  app.get("/api/questions/token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const question = await storage.getQuestionByToken(token);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      console.error("Error fetching question by token:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Answer a question (via token - no auth needed for email link)
  app.post("/api/questions/token/:token/answer", async (req, res) => {
    try {
      const { token } = req.params;
      const { answer } = req.body;

      if (!answer) {
        return res.status(400).json({ message: "Answer is required" });
      }

      const question = await storage.getQuestionByToken(token);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const updated = await storage.answerQuestion(question.id, answer);
      res.json({ success: true, question: updated });
    } catch (error: any) {
      console.error("Error answering question:", error);
      res.status(500).json({ message: "Failed to answer question" });
    }
  });

  // Mark question as helpful
  app.post("/api/questions/:id/helpful", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markQuestionHelpful(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error marking helpful:", error);
      res.status(500).json({ message: "Failed to mark helpful" });
    }
  });

  // Hide a question (admin only)
  app.post("/api/admin/questions/:id/hide", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updated = await storage.hideQuestion(id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error hiding question:", error);
      res.status(500).json({ message: "Failed to hide question" });
    }
  });

  // Stripe checkout - create checkout session for the 21 Day Challenge
  app.post("/api/checkout", async (req, res) => {
    try {
      const { currency = 'usd', includePromptPack = false, includeLaunchPack = false } = req.body;
      const stripe = await getUncachableStripeClient();

      // Price IDs from Stripe - main challenge
      const priceIds: Record<string, string> = {
        usd: 'price_1SqGYdLcRVtxg5yV9eeLLOJK',
        gbp: 'price_1SqGYdLcRVtxg5yVgbtDKL7S'
      };

      // Price IDs for Prompt Pack bump ($49 USD / £39 GBP)
      // TODO: Create these products in Stripe and update with real price IDs
      const promptPackPriceIds: Record<string, string> = {
        usd: 'price_PROMPT_PACK_USD', // TODO: Replace with real Stripe price ID
        gbp: 'price_PROMPT_PACK_GBP'  // TODO: Replace with real Stripe price ID
      };

      // Price IDs for Launch Pack bump ($97 USD / £75 GBP)
      // TODO: Create these products in Stripe and update with real price IDs
      const launchPackPriceIds: Record<string, string> = {
        usd: 'price_LAUNCH_PACK_USD', // TODO: Replace with real Stripe price ID
        gbp: 'price_LAUNCH_PACK_GBP'  // TODO: Replace with real Stripe price ID
      };

      const priceId = priceIds[currency.toLowerCase()] || priceIds.usd;
      const host = req.get('host');
      const protocol = req.protocol;

      // Build line items
      const lineItems: Array<{ price: string; quantity: number }> = [{
        price: priceId,
        quantity: 1
      }];

      // Add prompt pack bump offer if selected
      if (includePromptPack) {
        const promptPackPriceId = promptPackPriceIds[currency.toLowerCase()] || promptPackPriceIds.usd;
        lineItems.push({
          price: promptPackPriceId,
          quantity: 1
        });
      }

      // Add launch pack bump offer if selected
      if (includeLaunchPack) {
        const launchPackPriceId = launchPackPriceIds[currency.toLowerCase()] || launchPackPriceIds.usd;
        lineItems.push({
          price: launchPackPriceId,
          quantity: 1
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${protocol}://${host}/checkout/success?session_id={CHECKOUT_SESSION_ID}&currency=${currency}`,
        cancel_url: `${protocol}://${host}/order`,
        // Create a customer and save their payment method for one-click upsells
        customer_creation: 'always',
        payment_intent_data: {
          setup_future_usage: 'off_session',
        },
        metadata: {
          includePromptPack: includePromptPack ? 'true' : 'false',
          includeLaunchPack: includeLaunchPack ? 'true' : 'false',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe checkout - standalone Prompt Pack purchase (for users who already have the challenge)
  app.post("/api/prompt-pack/checkout", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Prompt Pack ($49 USD / £39 GBP)
      // TODO: Create these products in Stripe and update with real price IDs
      const promptPackPriceIds: Record<string, string> = {
        usd: 'price_PROMPT_PACK_USD', // TODO: Replace with real Stripe price ID
        gbp: 'price_PROMPT_PACK_GBP'  // TODO: Replace with real Stripe price ID
      };

      // Default to USD for standalone purchase
      const priceId = promptPackPriceIds.usd;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/prompt-pack?success=true`,
        cancel_url: `${protocol}://${host}/prompt-pack`,
        metadata: {
          userId: (req.user as any).id,
          productType: 'prompt_pack'
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating prompt pack checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe checkout - standalone Launch Pack purchase (for users who already have the challenge)
  app.post("/api/launch-pack/checkout", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Launch Pack ($97 USD / £75 GBP)
      // TODO: Create these products in Stripe and update with real price IDs
      const launchPackPriceIds: Record<string, string> = {
        usd: 'price_LAUNCH_PACK_USD', // TODO: Replace with real Stripe price ID
        gbp: 'price_LAUNCH_PACK_GBP'  // TODO: Replace with real Stripe price ID
      };

      // Default to USD for standalone purchase
      const priceId = launchPackPriceIds.usd;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/launch-pack?success=true`,
        cancel_url: `${protocol}://${host}/launch-pack`,
        metadata: {
          userId: (req.user as any).id,
          productType: 'launch_pack'
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating launch pack checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe checkout - Coaching (4 x 1-hour sessions) - Traditional checkout flow
  app.post("/api/checkout/coaching", async (req, res) => {
    try {
      const { currency = 'usd' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Coaching by currency
      // TODO: Create these products in Stripe and update with real price IDs
      const coachingPriceIds: Record<string, string> = {
        usd: 'price_COACHING_USD', // $1,195 - TODO: Replace with real Stripe price ID
        gbp: 'price_COACHING_GBP'  // £995 - TODO: Replace with real Stripe price ID
      };
      const coachingPriceId = coachingPriceIds[currency.toLowerCase()] || coachingPriceIds.usd;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: coachingPriceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching?success=true`,
        cancel_url: `${protocol}://${host}/coaching/upsell?currency=${currency}`,
        metadata: {
          productType: 'coaching',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating coaching checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Single coaching session checkout
  app.post("/api/checkout/coaching-single", async (req, res) => {
    try {
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Single Coaching Session by currency
      // TODO: Create these products in Stripe and update with real price IDs
      const singleCoachingPriceIds: Record<string, string> = {
        usd: 'price_COACHING_SINGLE_USD', // $449 - TODO: Replace with real Stripe price ID
        gbp: 'price_COACHING_SINGLE_GBP'  // £349 - TODO: Replace with real Stripe price ID
      };
      const priceId = singleCoachingPriceIds[currency.toLowerCase()] || singleCoachingPriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching?success=true&type=single`,
        cancel_url: `${protocol}://${host}/coaching`,
        metadata: {
          productType: 'coaching-single',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating single coaching checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Matt Webley single session checkout
  app.post("/api/checkout/coaching-matt-single", async (req, res) => {
    try {
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Matt Webley Single Session by currency
      // TODO: Create these products in Stripe and update with real price IDs
      const mattSinglePriceIds: Record<string, string> = {
        usd: 'price_COACHING_MATT_SINGLE_USD', // $2,495 - TODO: Replace with real Stripe price ID
        gbp: 'price_COACHING_MATT_SINGLE_GBP'  // £1,995 - TODO: Replace with real Stripe price ID
      };
      const priceId = mattSinglePriceIds[currency.toLowerCase()] || mattSinglePriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching?success=true&type=matt-single`,
        cancel_url: `${protocol}://${host}/coaching`,
        metadata: {
          productType: 'coaching-matt-single',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating Matt single session checkout:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Matt Webley premium coaching checkout (4-pack)
  app.post("/api/checkout/coaching-matt", async (req, res) => {
    try {
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Matt Webley Coaching by currency
      // TODO: Create these products in Stripe and update with real price IDs
      const mattCoachingPriceIds: Record<string, string> = {
        usd: 'price_COACHING_MATT_USD', // $4,995 - TODO: Replace with real Stripe price ID
        gbp: 'price_COACHING_MATT_GBP'  // £3,995 - TODO: Replace with real Stripe price ID
      };
      const priceId = mattCoachingPriceIds[currency.toLowerCase()] || mattCoachingPriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching?success=true&type=matt`,
        cancel_url: `${protocol}://${host}/coaching`,
        metadata: {
          productType: 'coaching-matt',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating Matt coaching checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Sales Page Video Critique checkout
  app.post("/api/checkout/critique", async (req, res) => {
    try {
      const { currency = 'gbp', includeHeadlines = false } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Video Critique by currency
      // TODO: Create these products in Stripe and update with real price IDs
      const critiquePriceIds: Record<string, string> = {
        usd: 'price_CRITIQUE_USD', // $595 - TODO: Replace with real Stripe price ID
        gbp: 'price_CRITIQUE_GBP'  // £495 - TODO: Replace with real Stripe price ID
      };
      const headlinesPriceIds: Record<string, string> = {
        usd: 'price_CRITIQUE_HEADLINES_USD', // $97 - TODO: Replace with real Stripe price ID
        gbp: 'price_CRITIQUE_HEADLINES_GBP'  // £95 - TODO: Replace with real Stripe price ID
      };

      const priceId = critiquePriceIds[currency.toLowerCase()] || critiquePriceIds.gbp;
      const headlinesPriceId = headlinesPriceIds[currency.toLowerCase()] || headlinesPriceIds.gbp;

      const lineItems: any[] = [{
        price: priceId,
        quantity: 1
      }];

      // Add headlines bump offer if selected
      if (includeHeadlines) {
        lineItems.push({
          price: headlinesPriceId,
          quantity: 1
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching?success=true&type=critique`,
        cancel_url: `${protocol}://${host}/coaching`,
        metadata: {
          productType: 'critique',
          includeHeadlines: includeHeadlines ? 'true' : 'false',
          currency: currency
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating critique checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Process checkout success - verify purchase and grant access
  app.post("/api/checkout/process-success", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent']
      });

      // Verify payment was successful
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Build update object based on what was purchased
      const updateData: Record<string, any> = {
        challengePurchased: true, // Main challenge is always purchased
      };

      // Check metadata for bump offers
      if (session.metadata?.includePromptPack === 'true') {
        updateData.promptPackPurchased = true;
      }
      if (session.metadata?.includeLaunchPack === 'true') {
        updateData.launchPackPurchased = true;
      }

      // Save Stripe customer ID for one-click upsells
      if (session.customer) {
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
        updateData.stripeCustomerId = customerId;
      }

      // Save purchase currency for future default
      if (session.metadata?.currency) {
        updateData.purchaseCurrency = session.metadata.currency.toLowerCase();
      }

      // Update user record with all purchases
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, (req.user as User).id));

      // Send purchase confirmation email
      const user = req.user as User;
      const userEmail = (user as any).email;
      const firstName = (user as any).firstName || 'there';
      const currency = (session.metadata?.currency || 'usd').toLowerCase() as 'usd' | 'gbp';

      // Calculate total from session amount
      const total = session.amount_total ? session.amount_total / 100 : 399;

      if (userEmail) {
        sendPurchaseConfirmationEmail({
          to: userEmail,
          firstName,
          includesPromptPack: updateData.promptPackPurchased || false,
          includesLaunchPack: updateData.launchPackPurchased || false,
          currency,
          total
        }).catch(err => console.error('Email send error:', err));
      }

      res.json({
        success: true,
        challengePurchased: true,
        promptPackPurchased: updateData.promptPackPurchased || false,
        launchPackPurchased: updateData.launchPackPurchased || false
      });
    } catch (error: any) {
      console.error("Error processing checkout success:", error);
      res.status(500).json({ message: "Failed to process checkout" });
    }
  });

  // One-click upsell - Coaching purchase using saved payment method
  app.post("/api/upsell/coaching", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as User;
      const stripeCustomerId = (user as any).stripeCustomerId;
      const { currency = 'usd' } = req.body;

      // Pricing based on currency (amount in smallest unit - cents/pence)
      const coachingPricing: Record<string, { amount: number; currency: string }> = {
        usd: { amount: 119500, currency: 'usd' }, // $1,195
        gbp: { amount: 99500, currency: 'gbp' }   // £995
      };
      const priceConfig = coachingPricing[currency.toLowerCase()] || coachingPricing.usd;

      if (!stripeCustomerId) {
        return res.status(400).json({ message: "No saved payment method", requiresCheckout: true });
      }

      const stripe = await getUncachableStripeClient();

      // Get the customer's default payment method
      const customer = await stripe.customers.retrieve(stripeCustomerId) as any;
      const paymentMethodId = customer.invoice_settings?.default_payment_method ||
                              customer.default_source;

      if (!paymentMethodId) {
        // If no default, get the first payment method
        const paymentMethods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
          limit: 1
        });

        if (paymentMethods.data.length === 0) {
          return res.status(400).json({ message: "No saved payment method", requiresCheckout: true });
        }

        // Use the first available payment method
        const pm = paymentMethods.data[0];

        // Create and confirm payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: priceConfig.amount,
          currency: priceConfig.currency,
          customer: stripeCustomerId,
          payment_method: pm.id,
          off_session: true,
          confirm: true,
          description: '1:1 Vibe Coding Coaching - 4 x 1-hour sessions',
          metadata: {
            userId: user.id,
            productType: 'coaching'
          }
        });

        if (paymentIntent.status === 'succeeded') {
          // Mark coaching as purchased
          await db.update(users)
            .set({ coachingPurchased: true })
            .where(eq(users.id, user.id));

          // Send coaching confirmation email
          const userEmail = (user as any).email;
          const firstName = (user as any).firstName || 'there';
          if (userEmail) {
            sendCoachingConfirmationEmail({
              to: userEmail,
              firstName,
              currency: currency.toLowerCase() as 'usd' | 'gbp',
              amount: priceConfig.amount / 100
            }).catch(err => console.error('Email send error:', err));
          }

          return res.json({ success: true, message: "Coaching purchased successfully!" });
        } else {
          return res.status(400).json({ message: "Payment failed", status: paymentIntent.status });
        }
      }

      // Create and confirm payment intent with default payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceConfig.amount,
        currency: priceConfig.currency,
        customer: stripeCustomerId,
        payment_method: paymentMethodId as string,
        off_session: true,
        confirm: true,
        description: '1:1 Vibe Coding Coaching - 4 x 1-hour sessions',
        metadata: {
          userId: user.id,
          productType: 'coaching'
        }
      });

      if (paymentIntent.status === 'succeeded') {
        // Mark coaching as purchased
        await db.update(users)
          .set({ coachingPurchased: true })
          .where(eq(users.id, user.id));

        // Send coaching confirmation email
        const userEmail = (user as any).email;
        const firstName = (user as any).firstName || 'there';
        if (userEmail) {
          sendCoachingConfirmationEmail({
            to: userEmail,
            firstName,
            currency: currency.toLowerCase() as 'usd' | 'gbp',
            amount: priceConfig.amount / 100
          }).catch(err => console.error('Email send error:', err));
        }

        return res.json({ success: true, message: "Coaching purchased successfully!" });
      } else {
        return res.status(400).json({ message: "Payment failed", status: paymentIntent.status });
      }
    } catch (error: any) {
      console.error("Error processing one-click upsell:", error);

      // Handle card declined or authentication required
      if (error.code === 'authentication_required' || error.code === 'card_declined') {
        return res.status(400).json({
          message: "Card requires authentication or was declined",
          requiresCheckout: true
        });
      }

      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  return httpServer;
}
