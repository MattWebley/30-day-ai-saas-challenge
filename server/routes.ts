import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserProgressSchema, insertDayContentSchema } from "@shared/schema";
import OpenAI from "openai";

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
      const { selectedSuggestion, microDecisionChoice, reflectionAnswer } = req.body;
      
      const progress = await storage.completeDay(userId, day, {
        selectedSuggestion,
        microDecisionChoice,
        reflectionAnswer,
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

        for (const badge of allBadges) {
          if (earnedBadgeIds.has(badge.id)) continue;

          let shouldAward = false;
          
          if (badge.triggerType === 'day_completed' && badge.triggerValue === day) {
            shouldAward = true;
          } else if (badge.triggerType === 'streak' && newStreak >= (badge.triggerValue || 0)) {
            shouldAward = true;
          } else if (badge.triggerType === 'xp' && totalXp >= (badge.triggerValue || 0)) {
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
      
      res.json(stats);
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
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          currentDay: (stats?.lastCompletedDay || 0) + 1,
          totalXp: stats?.totalXp || 0,
          lastActive: stats?.lastActivityDate,
          isActive: stats?.lastActivityDate && new Date(stats.lastActivityDate) > sevenDaysAgo,
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
4. Speed to MVP - Can they build an MVP in 30 days?
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

  // Generic AI prompt endpoint for Day 2 validation
  app.post("/api/ai-prompt", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt } = req.body;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });

      res.json({ response: response.choices[0].message.content });
    } catch (error: any) {
      console.error("Error running AI prompt:", error);
      res.status(500).json({ message: error.message || "Failed to run AI prompt" });
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
      const { idea, painPoints, features, mvpFeatures } = req.body;

      // Generate summary
      const summaryPrompt = `You are a product strategist. Create a 3-4 sentence executive summary for this SaaS product.

Product Idea: ${idea}

Pain Points: ${painPoints.join(', ')}
MVP Features: ${mvpFeatures.join(', ')}

Write a compelling executive summary that explains:
1. What the product is
2. What problem it solves
3. Who it's for
4. The key value proposition

Keep it concise, professional, and compelling. 3-4 sentences maximum.`;

      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: summaryPrompt }],
      });

      const summary = summaryResponse.choices[0].message.content || "";

      // Generate full PRD
      const prdPrompt = `Create a PRD for this product. No fluff, no filler, no generic advice. Be extremely specific to THIS product.

PRODUCT: ${idea}

PAIN POINTS:
${painPoints.map((p: string, i: number) => `- ${p}`).join('\n')}

MVP FEATURES:
${mvpFeatures.map((f: string, i: number) => `- ${f}`).join('\n')}

ALL FEATURES:
${features.map((f: string, i: number) => `- ${f}`).join('\n')}

OUTPUT FORMAT:

# ${idea} - PRD

## What It Is
[1-2 sentences. What does this specific product do?]

## Who It's For
[Specific user type. Not "businesses" - be precise: "freelance designers who..." or "e-commerce store owners with..."]

## Core Problem
[The #1 pain point this solves. One sentence.]

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
        appName: "30 Day AI SaaS Challenge",
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
      const customRules = chatSettings?.customRules || '';

      const systemPrompt = `You are the AI SaaS Mentor for the 21 Day AI SaaS Challenge, trained by Matt Webley. You help users build their SaaS product from idea to a working MVP.

YOUR PERSONALITY:
- Direct and practical, no fluff
- Encouraging but honest
- You give specific, actionable advice
- You speak like a helpful mentor, not a corporate chatbot
- Keep responses concise (2-4 paragraphs max unless they ask for more detail)

YOUR SCOPE - CRITICAL:
You ONLY help with:
- Idea validation and refinement
- Planning (features, PRD, tech decisions)
- Building (coding help, debugging, implementation)
- Testing and fixing issues
- Technical infrastructure (auth, APIs, database)

You DO NOT help with:
- Sales pages or copywriting for sales
- Marketing strategies or campaigns
- Launch strategies beyond technical readiness
- Pricing strategies
- Customer acquisition
- Business models or monetization
- Anything post-launch (growth, retention, etc.)

When users ask about sales, marketing, launch strategy, pricing, or business topics:
1. Acknowledge their question briefly
2. Explain that this challenge focuses on BUILDING a working product first
3. Say: "For business strategy, sales, and launch planning, Matt offers 1:1 mentorship. Apply here: https://mattwebley.com/workwithmatt"
4. Redirect them back to building: "For now, let's focus on getting your MVP working. What technical challenge can I help with?"

If they try to skip ahead or rush to launch:
- Gently discourage this
- Remind them: "The challenge is designed to build a SOLID foundation. Rushing to launch with a broken product will cost you more time in the long run."
- Ask what day they're on and help them with THAT day's task

THE CHALLENGE STRUCTURE:
- Days 0-6: Planning (idea, validation, features, naming, tech stack, PRD)
- Day 7: First Replit build
- Day 8: Claude Code setup (cheaper than Replit Agent)
- Days 9-12: Build skills (reality check, fix/iterate, test USP, feature testing)
- Day 13: Adding AI with OpenAI
- Day 14: Connecting APIs
- Days 15-18: Infrastructure (auth, email, onboarding, admin)
- Days 19-20: Polish (mobile, branding)
- Day 21: Technical launch readiness check

TECH STACK THEY'RE USING:
- Replit for hosting and initial builds
- Claude Code for cheaper AI-assisted development
- OpenAI API for AI features in their app
- ChatGPT/Claude as business advisors

USER'S CONTEXT:
${context.userName ? `- Name: ${context.userName}` : ''}
- Current Day: ${context.currentDay}
- Completed Days: ${context.completedDays?.join(', ') || 'None yet'}
${context.userIdea ? `- Their Idea: ${context.userIdea}` : ''}
${context.painPoints?.length ? `- Pain Points: ${context.painPoints.join(', ')}` : ''}
${context.features?.length ? `- Features: ${context.features.join(', ')}` : ''}
${context.mvpFeatures?.length ? `- MVP Features: ${context.mvpFeatures.join(', ')}` : ''}

CORE RULES:
1. Reference their specific idea/features when relevant
2. If they're stuck, give ONE clear next step
3. Don't overwhelm with information - be concise
4. NEVER help with sales/marketing/launch strategy - redirect to Matt's mentorship
5. Keep them focused on their current day's task
6. Encourage them - building a SaaS is hard, celebrate small wins

${customRules ? `ADDITIONAL RULES FROM ADMIN:\n${customRules}` : ''}`;

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
      console.error("Error in chat:", error);
      res.status(500).json({ message: error.message || "Failed to get response" });
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

  // Showcase routes
  // Submit to showcase (user)
  app.post("/api/showcase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { appName, description, screenshotUrl, liveUrl } = req.body;

      if (!appName || !description || !screenshotUrl) {
        return res.status(400).json({ message: "App name, description, and screenshot are required" });
      }

      const entry = await storage.createShowcaseEntry({
        userId,
        appName,
        description,
        screenshotUrl,
        liveUrl: liveUrl || null,
      });

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

  return httpServer;
}
