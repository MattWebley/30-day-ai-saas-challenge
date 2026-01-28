import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserProgressSchema, insertDayContentSchema, users, abTests, abVariants, critiqueRequests, type User } from "@shared/schema";
import dns from "dns";
import { promisify } from "util";
import crypto from "crypto";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sendPurchaseConfirmationEmail, sendCoachingConfirmationEmail, sendTestimonialNotificationEmail, sendCritiqueNotificationEmail, sendCritiqueCompletedEmail, sendQuestionNotificationEmail, sendDiscussionNotificationEmail, sendCoachingPurchaseNotificationEmail, sendReferralNotificationEmail } from "./emailService";
import { generateBadgeImage, generateReferralImage } from "./badge-image";
import { callClaude, callClaudeForJSON, detectAbuse, checkRateLimit, logAIUsage, sendAbuseAlert } from "./aiService";

const dnsResolve = promisify(dns.resolve);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Bypass Auth route for testing
  app.get('/api/test-login', async (req: any, res) => {
    // Check for existing test user or create one
    let testUser = await storage.getUser("test_user_id");
    if (!testUser) {
      testUser = await storage.upsertUser({
        id: "test_user_id",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        coachingPurchased: true,
        referralCode: "TEST1234",
      });
    }

    // Manually set session data to mimic Replit Auth
    req.session.passport = {
      user: {
        claims: {
          sub: "test_user_id",
          email: "test@example.com",
          given_name: "Test",
          family_name: "User"
        }
      }
    };
    
    res.redirect('/dashboard');
  });

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
      
      // User progress list with referral counts
      const userProgress = await Promise.all(allUsers.map(async (user: any) => {
        const stats = allStats.find((s: any) => s.userId === user.id);
        // Get Day 17 progress to find custom domain
        const day17Progress = allProgress.find((p: any) => p.userId === user.id && p.day === 17);
        const day17Inputs = day17Progress?.userInputs as Record<string, unknown> | null;
        const customDomain = day17Inputs?.customDomain as string | undefined;

        // Get referral count
        const referralCount = await storage.getReferralCount(user.id);

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
          referralCount,
          referralCode: user.referralCode,
        };
      }));
      
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

  // Badge image generation for social sharing
  app.get("/api/badge-image/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const badges = await storage.getAllBadges();

      // Find badge by slug (convert name to slug format)
      const badge = badges.find(b =>
        b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === slug
      );

      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      const imageBuffer = await generateBadgeImage({
        badgeName: badge.name,
        badgeIcon: badge.icon,
        badgeDescription: badge.description,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error generating badge image:", error);
      res.status(500).json({ message: "Failed to generate badge image" });
    }
  });

  // Referral share image for social media
  app.get("/api/referral-image", async (req, res) => {
    try {
      const imageBuffer = await generateReferralImage();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error generating referral image:", error);
      res.status(500).json({ message: "Failed to generate referral image" });
    }
  });

  // Referral landing page with OG tags (for when referral links are shared)
  app.get("/api/share/referral", async (req, res) => {
    try {
      const host = req.get('host');
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}`;
      const imageUrl = `${baseUrl}/api/referral-image`;
      const ref = req.query.ref || '';
      const shareUrl = ref ? `${baseUrl}/?ref=${ref}` : baseUrl;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Your Own AI SaaS in 21 Days</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="Build Your Own AI SaaS in 21 Days">
  <meta property="og:description" content="No coding required. 100% AI-powered. Join the 21 Day Challenge and launch your own software business.">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="Build Your Own AI SaaS in 21 Days">
  <meta name="twitter:description" content="No coding required. 100% AI-powered. Join the 21 Day Challenge and launch your own software business.">
  <meta name="twitter:image" content="${imageUrl}">

  <meta http-equiv="refresh" content="0;url=${shareUrl}">
</head>
<body>
  <p>Redirecting to the challenge...</p>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error serving referral share page:", error);
      res.status(500).send("Error loading page");
    }
  });

  // Badge share page with OG tags (under /api for dev server compatibility)
  app.get("/api/share/badge/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const badges = await storage.getAllBadges();

      const badge = badges.find(b =>
        b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === slug
      );

      if (!badge) {
        return res.status(404).send("Badge not found");
      }

      // Get the host for absolute URLs
      const host = req.get('host');
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}`;
      const imageUrl = `${baseUrl}/api/badge-image/${slug}`;
      const shareUrl = `${baseUrl}/api/share/badge/${slug}`;

      // Return HTML with OG tags for social sharing
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${badge.name} - 21 Day AI SaaS Challenge Badge</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="I earned the ${badge.name} badge!">
  <meta property="og:description" content="${badge.description} - 21 Day AI SaaS Challenge by Matt Webley">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="I earned the ${badge.name} badge!">
  <meta name="twitter:description" content="${badge.description} - 21 Day AI SaaS Challenge by Matt Webley">
  <meta name="twitter:image" content="${imageUrl}">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
    }
    .badge-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      max-width: 500px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .badge-icon {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 70px;
      margin: 0 auto 24px;
      box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
    }
    .badge-earned {
      font-size: 12px;
      color: #22c55e;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 8px;
    }
    .badge-name {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .badge-desc {
      font-size: 18px;
      color: #94a3b8;
      margin-bottom: 32px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
    }
    .branding {
      margin-top: 32px;
      font-size: 14px;
      color: #64748b;
    }
    .branding a {
      color: #94a3b8;
      text-decoration: none;
    }
    .branding a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="badge-card">
    <div class="badge-icon">${badge.icon}</div>
    <div class="badge-earned">Badge Earned</div>
    <h1 class="badge-name">${badge.name}</h1>
    <p class="badge-desc">${badge.description}</p>
    <a href="/" class="cta-button">Join the 21 Day Challenge</a>
    <p class="branding">by <a href="https://mattwebley.com" target="_blank">Matt Webley</a></p>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error serving badge share page:", error);
      res.status(500).send("Error loading badge");
    }
  });

  // Referral system routes
  // Generate a unique referral code for the user
  function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing chars like 0/O, 1/I/L
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Get user's referral info
  app.get("/api/referral", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate referral code if user doesn't have one
      if (!user.referralCode) {
        let code = generateReferralCode();
        // Make sure it's unique
        let existing = await storage.getUserByReferralCode(code);
        while (existing) {
          code = generateReferralCode();
          existing = await storage.getUserByReferralCode(code);
        }
        user = await storage.setUserReferralCode(userId, code) || user;
      }

      // Get referral stats
      const referralCount = await storage.getReferralCount(userId);
      const referralsList = await storage.getReferrals(userId);

      // Calculate rewards unlocked
      const rewards = {
        launchChecklist: referralCount >= 1,
        marketingPrompts: referralCount >= 3,
        critiqueVideo: referralCount >= 5,
        coachingCall: referralCount >= 10,
      };

      res.json({
        referralCode: user.referralCode,
        referralLink: `https://challenge.mattwebley.com/?ref=${user.referralCode}`,
        referralCount,
        referrals: referralsList,
        rewards,
        nextReward: referralCount < 1 ? { at: 1, name: "Launch Checklist" }
          : referralCount < 3 ? { at: 3, name: "Marketing Prompt Pack" }
          : referralCount < 5 ? { at: 5, name: "Custom Critique Video" }
          : referralCount < 10 ? { at: 10, name: "1-Hour Coaching Call" }
          : null,
      });
    } catch (error) {
      console.error("Error fetching referral info:", error);
      res.status(500).json({ message: "Failed to fetch referral info" });
    }
  });

  // Track a referral (called when a new user signs up with a referral code)
  app.post("/api/referral/track", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { referralCode } = req.body;

      if (!referralCode) {
        return res.status(400).json({ message: "Referral code required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow self-referral
      if (user.referralCode === referralCode) {
        return res.status(400).json({ message: "Cannot refer yourself" });
      }

      // Check if user was already referred
      if (user.referredBy) {
        return res.status(400).json({ message: "Already referred by someone" });
      }

      // Find the referrer
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      // Mark user as referred
      await storage.setUserReferredBy(userId, referralCode);

      // Create referral record
      await storage.createReferral(referrer.id, userId);

      // Check if referrer earned new badges
      const referralCount = await storage.getReferralCount(referrer.id);

      // Send notification email to Matt
      const referrerName = `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || 'Unknown';
      const newUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
      sendReferralNotificationEmail({
        referrerEmail: referrer.email || 'unknown',
        referrerName,
        newUserEmail: user.email || 'unknown',
        newUserName,
        referralCount
      }).catch(err => console.error('Referral notification error:', err));
      const allBadges = await storage.getAllBadges();
      const userBadges = await storage.getUserBadges(referrer.id);
      const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        if (badge.triggerType === 'referral' && referralCount >= (badge.triggerValue || 0)) {
          await storage.awardBadge(referrer.id, badge.id);
          console.log(`Awarded referral badge ${badge.name} to user ${referrer.id}`);
        }
      }

      res.json({ success: true, referrerId: referrer.id });
    } catch (error) {
      console.error("Error tracking referral:", error);
      res.status(500).json({ message: "Failed to track referral" });
    }
  });

  // Day 1: Generate SaaS ideas based on user inputs
  app.post("/api/generate-ideas", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { knowledge, skills, interests, experience } = req.body;

      const userMessage = `Generate exactly 28 B2B SaaS product ideas for this user profile:

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

      const result = await callClaudeForJSON<{ ideas: any[] }>({
        userId,
        endpoint: 'generate-ideas',
        endpointType: 'ideaGen',
        systemPrompt: 'You are a SaaS business idea expert. Generate exactly 28 B2B SaaS product ideas where the user has a NATURAL ADVANTAGE. Return valid JSON only.',
        userMessage,
        maxTokens: 4000,
      });

      if (!result.success) {
        return res.status(result.error?.includes('limit') ? 429 : 500).json({
          message: result.error || "Failed to generate ideas"
        });
      }

      res.json(result.data?.ideas || []);
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
      const userId = req.user.claims.sub;
      const { prompt } = req.body;

      const result = await callClaude({
        userId,
        endpoint: 'ai-prompt',
        endpointType: 'general',
        systemPrompt: 'You are a helpful assistant for the 21 Day AI SaaS Challenge. Be concise and actionable.',
        userMessage: prompt,
        maxTokens: 1500,
        temperature: 1,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to run AI prompt"
        });
      }

      res.json({ response: result.response });
    } catch (error: any) {
      console.error("Error running AI prompt:", error);
      res.status(500).json({ message: error.message || "Failed to run AI prompt" });
    }
  });

  // Analyze website design from URL
  app.post("/api/analyze-design", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      // Check rate limit
      const rateCheck = await checkRateLimit(userId, 'general');
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: rateCheck.reason });
      }

      // Validate URL format
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      // Use thum.io for free screenshots (no API key needed)
      const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/${cleanUrl}`;

      // Use callClaude for text-based design analysis (describe what to look for)
      const result = await callClaude({
        userId,
        endpoint: 'analyze-design',
        endpointType: 'general',
        systemPrompt: 'You are a UI/UX design expert helping users understand and recreate website design styles.',
        userMessage: `I'm looking at a website at ${cleanUrl}. Based on this URL and common design patterns for this type of site, describe what a similar design style might look like:

1. COLOR PALETTE: What colors would work well? (suggest hex codes)
2. OVERALL VIBE: Is it likely minimal, bold, playful, corporate, dark, light, etc?
3. SPACING: Recommend whitespace approach
4. TYPOGRAPHY FEEL: Suggest modern, classic, friendly, technical, or elegant?
5. SHADOWS & BORDERS: Recommend shadow and border styles
6. CORNERS: Sharp, slightly rounded, or very rounded?
7. SPECIAL EFFECTS: Suggest any gradients, glass effects, or animations

Then write a prompt I can give to Claude Code to create this style. Start the prompt with "Transform my app's design:" and include specific, actionable instructions.

Be creative and specific. Focus on what would make this design FEEL professional and polished.`,
        maxTokens: 1000,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to analyze design."
        });
      }

      const analysis = result.response || "";

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
      const userId = req.user.claims.sub;
      const { ideaTitle, ideaDescription, targetCustomer } = req.body;

      const competitorResult = await callClaudeForJSON<{ competitors: any[] }>({
        userId,
        endpoint: 'research-competitors',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS market research expert. Only include REAL companies with real websites. Return valid JSON only.',
        userMessage: `Find DIRECT competitors for this SaaS idea:

Product: "${ideaTitle}"
Description: ${ideaDescription}
Target Customer: ${targetCustomer}

Find 4-5 REAL, EXISTING SaaS companies that do EXACTLY the same thing or very similar. For each competitor, provide:
1. Company name
2. Website URL (must be real and working)
3. A one-line description of what they do
4. Their top 5 features that they promote most prominently on their sales page

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
}`,
        maxTokens: 2000,
      });

      if (!competitorResult.success) {
        return res.status(competitorResult.error?.includes('limit') ? 429 : 500).json({
          message: competitorResult.error || "Failed to research competitors"
        });
      }

      const competitors = competitorResult.data?.competitors || [];

      // Add screenshot URLs using free screenshot service
      const competitorsWithScreenshots = competitors.map((comp: any) => ({
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
          const descResult = await callClaudeForJSON<{ features: any[] }>({
            userId,
            endpoint: 'feature-descriptions',
            endpointType: 'features',
            systemPrompt: 'You are a SaaS product expert. Return valid JSON only.',
            userMessage: `For this product idea: "${ideaTitle}" (${ideaDescription}), explain these core features that all competitors have.

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

Keep each description and why statement under 120 characters.`,
            maxTokens: 1500,
          });

          if (descResult.success && descResult.data?.features) {
            sharedFeaturesWithDetails = descResult.data.features;
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
      const userId = req.user.claims.sub;
      const { ideaTitle, ideaDescription, userSkills, sharedFeatures, competitors } = req.body;

      const competitorInfo = competitors.map((c: any) =>
        `${c.name}: ${c.topFeatures?.join(', ')}`
      ).join('\n');

      const result = await callClaude({
        userId,
        endpoint: 'generate-usp-features',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS positioning expert. Suggest unique differentiating features.',
        userMessage: `Based on this analysis, suggest unique differentiating features (USPs) for a new product.

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

List only the features, one per line, each under 10 words. No numbering or bullets.`,
        maxTokens: 500,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to generate USP features"
        });
      }

      const features = (result.response || "")
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
      const userId = req.user.claims.sub;
      const { idea, painPoints } = req.body;

      // Step 1: Generate core features based on idea and pain points
      const coreResult = await callClaudeForJSON<{ coreFeatures: any[] }>({
        userId,
        endpoint: 'generate-core-features',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS product expert. Return valid JSON only.',
        userMessage: `Based on this idea and pain points, suggest 5-7 core features.

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
}`,
        maxTokens: 1500,
      });

      if (!coreResult.success) {
        return res.status(coreResult.error?.includes('limit') ? 429 : 500).json({
          message: coreResult.error || "Failed to generate features"
        });
      }

      const coreFeatures = coreResult.data?.coreFeatures || [];

      // Step 2: Find competitors and analyze shared features
      const competitorResult = await callClaudeForJSON<{ competitors: any[] }>({
        userId,
        endpoint: 'find-competitors',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS market research expert. Return valid JSON only.',
        userMessage: `Find 3-4 REAL competitors for this idea: "${idea}"

Find REAL, EXISTING SaaS companies that do the same or very similar thing. For each competitor, provide their top 3-5 features.

Respond in this exact JSON format:
{
  "competitors": [
    {
      "name": "Company Name",
      "topFeatures": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ]
}`,
        maxTokens: 1000,
      });

      const competitors = competitorResult.data?.competitors || [];

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
        const sharedResult = await callClaudeForJSON<{ sharedFeatures: any[] }>({
          userId,
          endpoint: 'describe-shared-features',
          endpointType: 'features',
          systemPrompt: 'You are a SaaS product expert. Return valid JSON only.',
          userMessage: `For this product idea: "${idea}", explain these features that all competitors have:

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
}`,
          maxTokens: 1000,
        });

        sharedFeatures = sharedResult.data?.sharedFeatures || [];
      }

      // Step 3: Generate USP features
      const uspResult = await callClaudeForJSON<{ uspFeatures: any[] }>({
        userId,
        endpoint: 'generate-usp-features',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS positioning expert. Return valid JSON only.',
        userMessage: `Based on this analysis, suggest 4-6 UNIQUE differentiating features.

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
}`,
        maxTokens: 1000,
      });

      const uspFeatures = uspResult.data?.uspFeatures || [];

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
      const userId = req.user.claims.sub;
      const { idea, features } = req.body;

      const result = await callClaudeForJSON<{ mvpFeatures: any[]; postMvpFeatures: any[] }>({
        userId,
        endpoint: 'generate-mvp-roadmap',
        endpointType: 'features',
        systemPrompt: 'You are a SaaS product strategist. Return valid JSON only.',
        userMessage: `Create an MVP roadmap for this product idea.

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

Keep MVP scope tight - aim for 4-6 weeks total build time for MVP features.`,
        maxTokens: 2000,
      });

      if (!result.success) {
        return res.status(result.error?.includes('limit') ? 429 : 500).json({
          message: result.error || "Failed to generate MVP roadmap"
        });
      }

      res.json({
        mvpFeatures: result.data?.mvpFeatures || [],
        postMvpFeatures: result.data?.postMvpFeatures || [],
      });
    } catch (error: any) {
      console.error("Error generating MVP roadmap:", error);
      res.status(500).json({ message: error.message || "Failed to generate MVP roadmap" });
    }
  });

  // Generate PRD for Day 6
  app.post("/api/ai/generate-prd", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { idea, painPoints, features, mvpFeatures, appName, iHelpStatement, uspFeatures, brandVibe, customerAvatar, lookAndFeel } = req.body;

      // Generate summary
      const summaryResult = await callClaude({
        userId,
        endpoint: 'generate-prd-summary',
        endpointType: 'features',
        systemPrompt: 'You are a product strategist. Be concise and compelling.',
        userMessage: `Create a 3-4 sentence executive summary for this SaaS product.

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

Keep it concise, professional, and compelling. 3-4 sentences maximum.`,
        maxTokens: 500,
      });

      if (!summaryResult.success) {
        return res.status(summaryResult.blocked ? 429 : 500).json({
          message: summaryResult.error || "Failed to generate PRD"
        });
      }

      const summary = summaryResult.response || "";

      // Generate full PRD
      const prdResult = await callClaude({
        userId,
        endpoint: 'generate-prd',
        endpointType: 'features',
        systemPrompt: 'You are a product expert. No fluff, no filler, no generic advice. Be extremely specific.',
        userMessage: `Create a PRD for this product.

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

NO generic advice. NO "consider accessibility". NO "ensure security best practices". Only specific, actionable items for THIS product.`,
        maxTokens: 4000,
      });

      const prd = prdResult.response || "";

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
      
      // Get user and day info for email
      const user = await storage.getUser(userId);
      const dayContent = await storage.getDayContent(day);

      // Send email notification (for approved comments only)
      if (status === "approved") {
        await sendDiscussionNotificationEmail({
          userEmail: user?.email || 'unknown@unknown.com',
          userName: `${user?.firstName || 'Unknown'} ${user?.lastName || ''}`.trim(),
          day,
          dayTitle: dayContent?.title || 'Unknown',
          content: content.trim(),
        });
      }

      if (status === "pending") {
        res.json({
          ...comment,
          message: "Your comment is being reviewed and will appear once approved."
        });
      } else {
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
      const customRules = chatSettings?.customRules || '';

      // The complete 21-day curriculum - this is what we help with
      const curriculum = `
THE 21 DAY AI SAAS CHALLENGE CURRICULUM:

DAY 0 - START HERE: Commit to the challenge, set income goals, write accountability promise
DAY 1 - IDEA GENERATION: Use AI to generate SaaS ideas based on skills/knowledge/interests, shortlist 2-3
DAY 2 - VALIDATE IDEA: Research competitors, identify pain points, write "I help X solve Y" statement, lock in final idea
DAY 3 - FEATURES: Generate feature list with AI (core features, shared features, USP features), select MVP features
DAY 4 - NAMING: Generate name suggestions, pick name, register .com domain, check trademarks, claim social handles
DAY 5 - LOGO: Pick brand vibe/colors, generate AI logo prompt, create logo using Abacus AI or similar
DAY 6 - TECH STACK: Set up Replit account, set up Claude Pro account, optional tools (Wispr Flow, Abacus AI)
DAY 7 - PRD: Generate Product Requirements Document with AI, paste into Replit, start first build
DAY 8 - CLAUDE CODE SETUP: Connect GitHub, install Claude Code, create CLAUDE.md instruction file
DAY 9 - MASTER CLAUDE CODE: Learn the 8 rules for prompting Claude Code effectively
DAY 10 - BUILD LOOP: Learn Build-Test-Fix workflow, find and fix your first bug
DAY 11 - BRAND DESIGN: Pick design style, choose accent color, apply consistent styling with Claude Code
DAY 12 - AI BRAIN: Add OpenAI API integration to make app intelligent
DAY 13 - EMAIL: Set up Resend for transactional emails
DAY 14 - AUTH & ADMIN: Add user authentication, build admin dashboard with key metrics
DAY 15 - PAYMENTS: Add Stripe integration for payments
DAY 16 - MOBILE: Test app on phone, fix mobile issues
DAY 17 - TESTING: Write automated tests for core features
DAY 18 - MVP: THE PAUSE POINT - build until MVP is truly ready, submit to Showcase
DAY 19 - SALES PAGE: Create high-converting sales page with AI-generated copy
DAY 20 - SEO: Get found by Google and AI assistants, submit to directories
DAY 21 - GROWTH: Calculate income goals, learn passive/active growth strategies

TECH STACK COVERED:
- Replit (hosting, deployment)
- Claude Code (AI coding assistant)
- Claude Pro / Claude.ai (AI prompts)
- OpenAI API (adding AI to apps)
- Resend (email service)
- Stripe (payments)
- GitHub (version control)
- PostgreSQL/Drizzle (database)
- React/TypeScript/Tailwind (frontend)
- Express/Node.js (backend)`;

      const systemPrompt = `You are the AI Mentor for the 21 Day AI SaaS Challenge. You ONLY help with topics covered in this specific challenge.

${curriculum}

STRICT SCOPE - VERY IMPORTANT:
You ONLY help with:
- Questions about the challenge days listed above
- The specific tech stack: Replit, Claude Code, OpenAI API, Resend, Stripe, React, TypeScript, Tailwind, Express, PostgreSQL
- Building their specific SaaS MVP
- Debugging code issues in their challenge project
- Understanding the challenge curriculum

You DO NOT help with:
- Marketing, sales strategy, pricing strategy, growth hacking (beyond Day 19-21 basics)
- Technologies not in the challenge (AWS, Firebase, Next.js, Vue, Angular, Python, etc.)
- Business strategy, fundraising, hiring, scaling
- Anything not directly related to completing the 21-day challenge

If asked about off-topic subjects, say: "That's outside what we cover in the 21 Day Challenge. I'm here to help you build your MVP using Replit, Claude Code, and the tech stack we teach. What can I help you with for your current day's task?"

USER CONTEXT:
${context.userName ? `Name: ${context.userName}` : ''}
Currently on Day ${context.currentDay}
Completed days: ${context.completedDays?.join(', ') || 'None yet'}
${context.userIdea ? `Their idea: ${context.userIdea}` : 'No idea selected yet'}
${context.painPoints?.length ? `Pain points they solve: ${context.painPoints.join(', ')}` : ''}
${context.features?.length ? `Features planned: ${context.features.join(', ')}` : ''}

RESPONSE RULES:
1. Keep answers focused on their current day's task when possible
2. Reference their specific idea/features when relevant
3. Give ONE clear next step when they're stuck
4. Be concise - no lengthy explanations unless asked
5. Use code examples only when directly helpful
6. If they haven't completed earlier days, gently point them back

${customRules ? `ADDITIONAL RULES:\n${customRules}` : ''}`;

      // Build history for callClaude
      const historyForClaude: { role: "user" | "assistant"; content: string }[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          historyForClaude.push({ role: msg.role, content: msg.content });
        });
      }

      // Check for abuse using aiService's detectAbuse
      const abuseCheck = detectAbuse(message);

      // Save user message with flagging
      await storage.saveChatMessage({
        userId,
        role: "user",
        content: message,
        flagged: abuseCheck.flagged,
        flagReason: abuseCheck.reason,
      });

      // Use callClaude with rate limiting and logging (PREMIUM - stays on Claude for quality)
      const result = await callClaude({
        userId,
        endpoint: 'ai-mentor-chat',
        endpointType: 'chat',
        systemPrompt,
        userMessage: message,
        maxTokens: 500,
        history: historyForClaude,
      });

      if (!result.success) {
        if (result.blocked) {
          return res.status(429).json({
            error: "rate_limit",
            message: result.error
          });
        }
        return res.status(500).json({ message: result.error || "Failed to get AI response" });
      }

      const reply = result.response || "I'm not sure how to help with that. Can you try rephrasing?";

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

  // Challenge testimonial (separate from app showcase)
  app.post("/api/testimonial", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { testimonial, videoUrl, appName, appUrl } = req.body;

      if (!testimonial && !videoUrl) {
        return res.status(400).json({ message: "Please provide a written testimonial or video link" });
      }

      // Check if user already submitted a testimonial
      const existing = await storage.getUserTestimonial(userId);
      if (existing) {
        // Already submitted - just return success without creating duplicate
        return res.json({ success: true, message: "Thank you for your testimonial!" });
      }

      // Store the testimonial in the database
      const created = await storage.createTestimonial({
        userId,
        testimonial: testimonial || null,
        videoUrl: videoUrl || null,
        appName: appName || null,
        appUrl: appUrl || null,
      });

      console.log("=== NEW CHALLENGE TESTIMONIAL ===");
      console.log("User:", user?.email || userId);
      console.log("Testimonial ID:", created.id);
      console.log("================================");

      // Send email notification to Matt
      const userName = user?.firstName
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
        : user?.email || 'Unknown User';

      sendTestimonialNotificationEmail({
        userEmail: user?.email || 'unknown',
        userName,
        testimonial: testimonial || null,
        videoUrl: videoUrl || null,
        appName: appName || null,
        appUrl: appUrl || null,
      }).catch(err => console.error('Testimonial email error:', err));

      // Award Ambassador badge for testimonial
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
      }

      res.json({ success: true, message: "Thank you for your testimonial!" });
    } catch (error: any) {
      console.error("Error submitting testimonial:", error);
      res.status(500).json({ message: "Failed to submit testimonial" });
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
  // TESTIMONIAL ADMIN ROUTES
  // ============================================

  // Get all testimonials (admin)
  app.get("/api/admin/testimonials", isAuthenticated, async (req: any, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error: any) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Toggle testimonial featured status (admin)
  app.post("/api/admin/testimonials/:id/feature", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.toggleTestimonialFeatured(id);
      if (!updated) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error toggling testimonial featured:", error);
      res.status(500).json({ message: "Failed to toggle featured" });
    }
  });

  // ============================================
  // EMAIL TEMPLATE ADMIN ROUTES
  // ============================================

  // Get all email templates (admin)
  app.get("/api/admin/email-templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  // Update email template (admin)
  app.patch("/api/admin/email-templates/:templateKey", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { templateKey } = req.params;
      const { subject, body, isActive } = req.body;

      const updated = await storage.updateEmailTemplate(templateKey, { subject, body, isActive });
      if (!updated) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  // Send test email (admin)
  app.post("/api/admin/email-templates/:templateKey/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { templateKey } = req.params;
      const { testEmail } = req.body;

      const template = await storage.getEmailTemplate(templateKey);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Send test email with placeholder values
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Replace variables with sample values for testing
      let testBody = template.body;
      let testSubject = template.subject;
      const sampleValues: Record<string, string> = {
        firstName: 'Test User',
        userName: 'Test User',
        userEmail: testEmail,
        currencySymbol: '£',
        currency: 'GBP',
        total: '295',
        amount: '995',
        coachingType: '4 x 1-hour coaching sessions',
        testimonial: 'This is a sample testimonial for testing.',
        videoUrl: 'https://example.com/video',
        appName: 'Test App',
        appUrl: 'https://testapp.com',
        day: '5',
        dayTitle: 'Logo Design',
        question: 'This is a sample question?',
        content: 'This is a sample discussion post.',
        answerUrl: 'https://21daysaas.com/admin/answer/test-token',
        salesPageUrl: 'https://example.com/sales',
        productDescription: 'A sample product description.',
        targetAudience: 'Small business owners.',
        specificQuestions: 'Is this headline good?',
        preferredEmail: testEmail,
        timestamp: new Date().toLocaleString(),
        referrerName: 'John Doe',
        referrerEmail: 'john@example.com',
        newUserName: 'Jane Smith',
        newUserEmail: 'jane@example.com',
        referralCount: '5',
      };

      for (const [key, value] of Object.entries(sampleValues)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        testBody = testBody.replace(regex, value);
        testSubject = testSubject.replace(regex, value);
      }

      await resend.emails.send({
        from: 'Matt Webley <matt@challenge.mattwebley.com>',
        to: [testEmail],
        subject: `[TEST] ${testSubject}`,
        text: testBody,
      });

      res.json({ success: true, message: `Test email sent to ${testEmail}` });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
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
        const aiResult = await callClaude({
          userId,
          endpoint: 'ai-suggested-answer',
          endpointType: 'general',
          systemPrompt: `You are Matt Webley's assistant for the 21 Day AI SaaS Challenge. Generate a helpful, concise answer to this student question about Day ${day}: "${dayContent?.title || 'Unknown'}". Keep answers practical and actionable. Use Matt's punchy, direct style with short sentences and ALL CAPS for emphasis occasionally.`,
          userMessage: question,
          maxTokens: 500,
        });

        if (aiResult.success && aiResult.response) {
          await storage.setAiSuggestedAnswer(created.id, aiResult.response);
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

      // Send email notification
      await sendQuestionNotificationEmail({
        userEmail: user?.email || 'unknown@unknown.com',
        userName: `${user?.firstName || 'Unknown'} ${user?.lastName || ''}`.trim(),
        day,
        dayTitle: dayContent?.title || 'Unknown',
        question,
        answerUrl,
      });

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
      const { currency = 'usd' } = req.body;
      const stripe = await getUncachableStripeClient();

      // Price IDs from Stripe - main challenge
      const priceIds: Record<string, string> = {
        usd: 'price_1SqGYdLcRVtxg5yV9eeLLOJK',
        gbp: 'price_1SqGYdLcRVtxg5yVgbtDKL7S'
      };

      const priceId = priceIds[currency.toLowerCase()] || priceIds.usd;
      const host = req.get('host');
      const protocol = req.protocol;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/checkout/success?session_id={CHECKOUT_SESSION_ID}&currency=${currency}`,
        cancel_url: `${protocol}://${host}/order`,
        // Create a customer and save their payment method for one-click upsells
        customer_creation: 'always',
        payment_intent_data: {
          setup_future_usage: 'off_session',
        },
        metadata: {
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
  // Stripe checkout - Coaching (4 x 1-hour sessions) - Traditional checkout flow
  app.post("/api/checkout/coaching", async (req, res) => {
    try {
      const { currency = 'usd' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Expert Coaching 4-Pack by currency
      const coachingPriceIds: Record<string, string> = {
        usd: 'price_1SuRsULcRVtxg5yVjLeczvqS', // $1,195
        gbp: 'price_1SuRt9LcRVtxg5yVeKgcqQfh'  // £995
      };
      const coachingPriceId = coachingPriceIds[currency.toLowerCase()] || coachingPriceIds.usd;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: coachingPriceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching/success`,
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

      // Price IDs for Expert Coaching Single Session by currency
      const singleCoachingPriceIds: Record<string, string> = {
        usd: 'price_1SuRqQLcRVtxg5yVXZEiD90P', // $449
        gbp: 'price_1SuRrJLcRVtxg5yV1VVLj4tb'  // £349
      };
      const priceId = singleCoachingPriceIds[currency.toLowerCase()] || singleCoachingPriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching/success?type=single`,
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
      const mattSinglePriceIds: Record<string, string> = {
        usd: 'price_1SuRuZLcRVtxg5yV0KbmvkJq', // $2,495
        gbp: 'price_1SuRvNLcRVtxg5yVtZjO8frz'  // £1,995
      };
      const priceId = mattSinglePriceIds[currency.toLowerCase()] || mattSinglePriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching/success?type=matt-single`,
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

      // Price IDs for Matt Webley 4-Pack by currency
      const mattCoachingPriceIds: Record<string, string> = {
        usd: 'price_1SuRx2LcRVtxg5yVzHb934Fj', // $4,995
        gbp: 'price_1SuRxbLcRVtxg5yV1o8QJedw'  // £3,995
      };
      const priceId = mattCoachingPriceIds[currency.toLowerCase()] || mattCoachingPriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/coaching/success?type=matt`,
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
      const { currency = 'gbp' } = req.body;
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      const protocol = req.protocol;

      // Price IDs for Video Critique by currency
      const critiquePriceIds: Record<string, string> = {
        usd: 'price_1SuRyALcRVtxg5yVHWUA01js', // $595
        gbp: 'price_1SuRyiLcRVtxg5yVTFd2ME6M'  // £495
      };

      const priceId = critiquePriceIds[currency.toLowerCase()] || critiquePriceIds.gbp;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${protocol}://${host}/critique/success`,
        cancel_url: `${protocol}://${host}/critique`,
        metadata: {
          productType: 'critique',
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
        challengePurchased: true,
      };

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

      // Track A/B test conversion if variant was assigned
      const abVariantId = req.cookies?.ab_variant;
      if (abVariantId) {
        try {
          const variantIdNum = parseInt(abVariantId);
          const [variant] = await db.select().from(abVariants).where(eq(abVariants.id, variantIdNum));
          if (variant) {
            await db.update(abVariants)
              .set({ conversions: (variant.conversions || 0) + 1 })
              .where(eq(abVariants.id, variantIdNum));
          }
        } catch (abError) {
          console.error('A/B conversion tracking error:', abError);
          // Don't fail the purchase if A/B tracking fails
        }
      }

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
          currency,
          total
        }).catch(err => console.error('Email send error:', err));
      }

      res.json({
        success: true,
        challengePurchased: true
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

          // Send coaching confirmation email to customer
          const userEmail = (user as any).email;
          const firstName = (user as any).firstName || 'there';
          const userName = `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'Unknown';
          if (userEmail) {
            sendCoachingConfirmationEmail({
              to: userEmail,
              firstName,
              currency: currency.toLowerCase() as 'usd' | 'gbp',
              amount: priceConfig.amount / 100
            }).catch(err => console.error('Email send error:', err));

            // Send notification to Matt
            sendCoachingPurchaseNotificationEmail({
              userEmail,
              userName,
              coachingType: '4 x 1-hour coaching sessions',
              currency: currency.toLowerCase() as 'usd' | 'gbp',
              amount: priceConfig.amount / 100
            }).catch(err => console.error('Coaching notification error:', err));
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

        // Send coaching confirmation email to customer
        const userEmail = (user as any).email;
        const firstName = (user as any).firstName || 'there';
        const userName = `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'Unknown';
        if (userEmail) {
          sendCoachingConfirmationEmail({
            to: userEmail,
            firstName,
            currency: currency.toLowerCase() as 'usd' | 'gbp',
            amount: priceConfig.amount / 100
          }).catch(err => console.error('Email send error:', err));

          // Send notification to Matt
          sendCoachingPurchaseNotificationEmail({
            userEmail,
            userName,
            coachingType: '4 x 1-hour coaching sessions',
            currency: currency.toLowerCase() as 'usd' | 'gbp',
            amount: priceConfig.amount / 100
          }).catch(err => console.error('Coaching notification error:', err));
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

  // ==========================================
  // A/B TESTING ROUTES
  // ==========================================

  // Public: Get active headline test and assign variant
  app.get("/api/ab/active-headline", async (req, res) => {
    try {
      // Get active test
      const activeTest = await db.select().from(abTests).where(eq(abTests.isActive, true)).limit(1);

      if (activeTest.length === 0) {
        return res.json({ hasTest: false });
      }

      const test = activeTest[0];

      // Get all variants for this test
      const variants = await db.select().from(abVariants).where(eq(abVariants.testId, test.id));

      if (variants.length === 0) {
        return res.json({ hasTest: false });
      }

      // Check if visitor already has a variant assigned (from cookie)
      const existingVariantId = req.cookies?.ab_variant;
      const existingVariant = existingVariantId
        ? variants.find(v => v.id === parseInt(existingVariantId))
        : null;

      if (existingVariant) {
        return res.json({
          hasTest: true,
          testId: test.id,
          variantId: existingVariant.id,
          headline: existingVariant.headline,
          variantName: existingVariant.name
        });
      }

      // Randomly assign a variant
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];

      // Set cookie (30 day expiry)
      res.cookie('ab_variant', randomVariant.id.toString(), {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
      });

      res.json({
        hasTest: true,
        testId: test.id,
        variantId: randomVariant.id,
        headline: randomVariant.headline,
        variantName: randomVariant.name
      });
    } catch (error) {
      console.error("Error fetching active headline test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  // Public: Track a view for a variant
  app.post("/api/ab/track-view", async (req, res) => {
    try {
      const { variantId } = req.body;
      if (!variantId) {
        return res.status(400).json({ message: "Variant ID required" });
      }

      // Check if this visitor already viewed (using cookie)
      const viewedKey = `ab_viewed_${variantId}`;
      if (req.cookies?.[viewedKey]) {
        return res.json({ success: true, alreadyTracked: true });
      }

      // Increment view count
      const [variant] = await db.select().from(abVariants).where(eq(abVariants.id, variantId));
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      await db.update(abVariants)
        .set({ views: (variant.views || 0) + 1 })
        .where(eq(abVariants.id, variantId));

      // Set cookie to prevent duplicate view tracking
      res.cookie(viewedKey, '1', {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Admin: List all A/B tests with variants and stats
  app.get("/api/admin/ab/tests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tests = await db.select().from(abTests).orderBy(abTests.createdAt);

      // Get variants for each test
      const testsWithVariants = await Promise.all(
        tests.map(async (test) => {
          const variants = await db.select().from(abVariants).where(eq(abVariants.testId, test.id));
          const totalViews = variants.reduce((sum, v) => sum + (v.views || 0), 0);
          const totalConversions = variants.reduce((sum, v) => sum + (v.conversions || 0), 0);
          return {
            ...test,
            variants,
            totalViews,
            totalConversions,
            overallConversionRate: totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) : '0.00'
          };
        })
      );

      res.json(testsWithVariants);
    } catch (error) {
      console.error("Error fetching A/B tests:", error);
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  // Admin: Create a new A/B test
  app.post("/api/admin/ab/tests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { name, variants: variantData } = req.body;
      if (!name || !variantData || !Array.isArray(variantData) || variantData.length < 2) {
        return res.status(400).json({ message: "Name and at least 2 variants required" });
      }

      // Create the test
      const [newTest] = await db.insert(abTests).values({ name }).returning();

      // Create variants
      const createdVariants = await Promise.all(
        variantData.map(async (v: { name: string; headline: string }) => {
          const [variant] = await db.insert(abVariants).values({
            testId: newTest.id,
            name: v.name,
            headline: v.headline
          }).returning();
          return variant;
        })
      );

      res.json({ ...newTest, variants: createdVariants });
    } catch (error) {
      console.error("Error creating A/B test:", error);
      res.status(500).json({ message: "Failed to create test" });
    }
  });

  // Admin: Update a test (toggle active, rename)
  app.patch("/api/admin/ab/tests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      const { name, isActive } = req.body;

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (isActive !== undefined) {
        // If activating this test, deactivate all others first
        if (isActive) {
          await db.update(abTests).set({ isActive: false });
        }
        updateData.isActive = isActive;
      }

      const [updated] = await db.update(abTests)
        .set(updateData)
        .where(eq(abTests.id, testId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating A/B test:", error);
      res.status(500).json({ message: "Failed to update test" });
    }
  });

  // Admin: Delete a test
  app.delete("/api/admin/ab/tests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      await db.delete(abTests).where(eq(abTests.id, testId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting A/B test:", error);
      res.status(500).json({ message: "Failed to delete test" });
    }
  });

  // Admin: Add variant to a test
  app.post("/api/admin/ab/tests/:id/variants", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      const { name, headline } = req.body;

      if (!name || !headline) {
        return res.status(400).json({ message: "Name and headline required" });
      }

      const [variant] = await db.insert(abVariants).values({
        testId,
        name,
        headline
      }).returning();

      res.json(variant);
    } catch (error) {
      console.error("Error adding variant:", error);
      res.status(500).json({ message: "Failed to add variant" });
    }
  });

  // Admin: Update a variant
  app.patch("/api/admin/ab/variants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const variantId = parseInt(req.params.id);
      const { name, headline } = req.body;

      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name;
      if (headline !== undefined) updateData.headline = headline;

      const [updated] = await db.update(abVariants)
        .set(updateData)
        .where(eq(abVariants.id, variantId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating variant:", error);
      res.status(500).json({ message: "Failed to update variant" });
    }
  });

  // Admin: Delete a variant
  app.delete("/api/admin/ab/variants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const variantId = parseInt(req.params.id);
      await db.delete(abVariants).where(eq(abVariants.id, variantId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting variant:", error);
      res.status(500).json({ message: "Failed to delete variant" });
    }
  });

  // Admin: Reset stats for a test
  app.post("/api/admin/ab/tests/:id/reset", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const testId = parseInt(req.params.id);
      await db.update(abVariants)
        .set({ views: 0, conversions: 0 })
        .where(eq(abVariants.testId, testId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting stats:", error);
      res.status(500).json({ message: "Failed to reset stats" });
    }
  });

  // Admin: Generate headline alternatives with AI
  app.post("/api/admin/ab/generate-headlines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { currentHeadline } = req.body;
      if (!currentHeadline) {
        return res.status(400).json({ message: "Current headline required" });
      }

      const result = await callClaude({
        userId,
        endpoint: 'generate-ab-headlines',
        endpointType: 'general',
        systemPrompt: 'You are a world-class direct response copywriter. Return ONLY a JSON array of 5 headline strings.',
        userMessage: `Generate 5 alternative headlines for an A/B test. The current control headline is:

"${currentHeadline}"

This is for a product called "21 Day AI SaaS Challenge" - a course that teaches complete beginners how to build working software products using AI, without coding experience, in 21 days, for less than $100.

Generate 5 distinctly different headline approaches. Consider:
- Different emotional angles (fear, curiosity, aspiration, urgency)
- Different structures (how-to, question, story, direct promise)
- Different hooks (specificity, social proof, contrarian, news)

Return ONLY a JSON array of 5 strings, nothing else. Each headline should be compelling, specific, and testable against the control.

Example format:
["Headline 1...", "Headline 2...", "Headline 3...", "Headline 4...", "Headline 5..."]`,
        maxTokens: 1000,
        temperature: 1,
      });

      if (!result.success) {
        return res.status(result.blocked ? 429 : 500).json({
          message: result.error || "Failed to generate headlines"
        });
      }

      const content = result.response || "[]";

      // Parse the JSON array from the response
      let headlines: string[] = [];
      try {
        // Try to extract JSON array from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          headlines = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse headlines:", parseError);
        return res.status(500).json({ message: "Failed to parse generated headlines" });
      }

      if (!Array.isArray(headlines) || headlines.length === 0) {
        return res.status(500).json({ message: "No headlines generated" });
      }

      res.json({ headlines: headlines.slice(0, 5) });
    } catch (error) {
      console.error("Error generating headlines:", error);
      res.status(500).json({ message: "Failed to generate headlines" });
    }
  });

  // Critique submission - save details for Matt to review
  app.post("/api/critique/submit", isAuthenticated, async (req: any, res) => {
    console.log("[CRITIQUE] Endpoint hit, user:", req.user?.claims?.sub);
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { salesPageUrl, preferredEmail, productDescription, targetAudience, specificQuestions } = req.body;

      if (!salesPageUrl) {
        return res.status(400).json({ message: "Sales page URL is required" });
      }

      const userName = user.firstName || user.email || 'Unknown';
      const emailForVideo = preferredEmail || user.email || 'unknown@email.com';

      // Save to database
      await db.insert(critiqueRequests).values({
        userId,
        salesPageUrl,
        preferredEmail: emailForVideo,
        productDescription: productDescription || null,
        targetAudience: targetAudience || null,
        specificQuestions: specificQuestions || null,
        status: 'pending'
      });

      console.log("Critique submission saved:", {
        userId,
        email: user.email,
        preferredEmail: emailForVideo,
        name: userName,
        salesPageUrl
      });

      // Send email notification to Matt
      try {
        await sendCritiqueNotificationEmail({
          userEmail: user.email || 'unknown@email.com',
          preferredEmail: emailForVideo,
          userName,
          salesPageUrl,
          productDescription: productDescription || null,
          targetAudience: targetAudience || null,
          specificQuestions: specificQuestions || null
        });
      } catch (emailError) {
        console.error("Failed to send critique notification email:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ success: true, message: "Critique request submitted" });
    } catch (error) {
      console.error("Error submitting critique request:", error);
      res.status(500).json({ message: "Failed to submit critique request" });
    }
  });

  // Admin: Get all critique requests
  app.get("/api/admin/critiques", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const requests = await db
        .select({
          id: critiqueRequests.id,
          userId: critiqueRequests.userId,
          salesPageUrl: critiqueRequests.salesPageUrl,
          productDescription: critiqueRequests.productDescription,
          targetAudience: critiqueRequests.targetAudience,
          specificQuestions: critiqueRequests.specificQuestions,
          status: critiqueRequests.status,
          videoUrl: critiqueRequests.videoUrl,
          completedAt: critiqueRequests.completedAt,
          createdAt: critiqueRequests.createdAt,
          userEmail: users.email,
          userFirstName: users.firstName
        })
        .from(critiqueRequests)
        .leftJoin(users, eq(critiqueRequests.userId, users.id))
        .orderBy(critiqueRequests.createdAt);

      res.json(requests);
    } catch (error) {
      console.error("Error fetching critique requests:", error);
      res.status(500).json({ message: "Failed to fetch critique requests" });
    }
  });

  // Admin: Update critique status
  app.patch("/api/admin/critiques/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const critiqueId = parseInt(req.params.id);
      const { status, videoUrl } = req.body;

      const updateData: any = { status };
      if (videoUrl) updateData.videoUrl = videoUrl;
      if (status === 'completed') updateData.completedAt = new Date();

      await db
        .update(critiqueRequests)
        .set(updateData)
        .where(eq(critiqueRequests.id, critiqueId));

      // Send email to user when critique is completed with video
      if (status === 'completed' && videoUrl) {
        const [critique] = await db
          .select({
            preferredEmail: critiqueRequests.preferredEmail,
            userEmail: users.email,
            userFirstName: users.firstName
          })
          .from(critiqueRequests)
          .leftJoin(users, eq(critiqueRequests.userId, users.id))
          .where(eq(critiqueRequests.id, critiqueId));

        if (critique) {
          const recipientEmail = critique.preferredEmail || critique.userEmail;
          const firstName = critique.userFirstName || 'there';

          if (recipientEmail) {
            sendCritiqueCompletedEmail({
              to: recipientEmail,
              firstName,
              videoUrl
            }).catch(err => console.error('Critique completed email error:', err));
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating critique request:", error);
      res.status(500).json({ message: "Failed to update critique request" });
    }
  });

  // Admin: Delete critique request
  app.delete("/api/admin/critiques/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const critiqueId = parseInt(req.params.id);

      await db
        .delete(critiqueRequests)
        .where(eq(critiqueRequests.id, critiqueId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting critique request:", error);
      res.status(500).json({ message: "Failed to delete critique request" });
    }
  });

  // Admin: Send test emails (one-time testing endpoint)
  app.post("/api/admin/test-emails", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { emailType, toEmail } = req.body;
      const targetEmail = toEmail || user.email;

      if (!targetEmail) {
        return res.status(400).json({ message: "Email address required" });
      }

      const results: string[] = [];

      // Send test emails based on type (or all if type is 'all')
      if (emailType === 'purchase' || emailType === 'all') {
        await sendPurchaseConfirmationEmail({
          to: targetEmail,
          firstName: 'Matt',
          currency: 'gbp',
          total: 295
        });
        results.push('Purchase confirmation sent');
      }

      if (emailType === 'coaching' || emailType === 'all') {
        await sendCoachingConfirmationEmail({
          to: targetEmail,
          firstName: 'Test User',
          currency: 'gbp',
          amount: 997
        });
        results.push('Coaching confirmation sent');
      }

      if (emailType === 'testimonial' || emailType === 'all') {
        await sendTestimonialNotificationEmail({
          userEmail: 'testuser@example.com',
          userName: 'Test User',
          testimonial: 'This is a test testimonial! The challenge was amazing and helped me build my SaaS in 21 days.',
          videoUrl: 'https://example.com/test-video',
          appName: 'TestApp',
          appUrl: 'https://testapp.example.com',
          sendTo: targetEmail
        });
        results.push('Testimonial notification sent');
      }

      if (emailType === 'critique' || emailType === 'all') {
        await sendCritiqueNotificationEmail({
          userEmail: 'testuser@example.com',
          preferredEmail: 'testuser-preferred@example.com',
          userName: 'Test User',
          salesPageUrl: 'https://example.com/sales-page',
          productDescription: 'This is a test product description for the critique.',
          targetAudience: 'Small business owners looking to automate their workflow.',
          specificQuestions: 'Is the headline compelling enough?\nDoes the CTA stand out?',
          sendTo: targetEmail
        });
        results.push('Critique notification sent');
      }

      if (emailType === 'critique-completed' || emailType === 'all') {
        await sendCritiqueCompletedEmail({
          to: targetEmail,
          firstName: 'Matt',
          videoUrl: 'https://www.loom.com/share/example-critique-video'
        });
        results.push('Critique completed sent');
      }

      if (results.length === 0) {
        return res.status(400).json({
          message: "Invalid emailType. Use: purchase, coaching, testimonial, critique, critique-completed, or all"
        });
      }

      console.log(`Test emails sent to ${targetEmail}:`, results);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Error sending test emails:", error);
      res.status(500).json({ message: "Failed to send test emails", error: String(error) });
    }
  });

  // Admin: Get AI usage logs
  app.get("/api/admin/ai-usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { flagged, blocked, limit } = req.query;

      const logs = await storage.getAIUsageLogs({
        flagged: flagged === 'true' ? true : flagged === 'false' ? false : undefined,
        blocked: blocked === 'true' ? true : blocked === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : 100,
      });

      const stats = await storage.getAIUsageStats();

      // Get user info for each log
      const logsWithUsers = await Promise.all(
        logs.map(async (log) => {
          const logUser = await storage.getUser(log.userId);
          return {
            ...log,
            userName: logUser ? `${logUser.firstName || ''} ${logUser.lastName || ''}`.trim() || logUser.email : 'Unknown',
            userEmail: logUser?.email || 'Unknown',
          };
        })
      );

      res.json({
        logs: logsWithUsers,
        stats,
      });
    } catch (error) {
      console.error("Error fetching AI usage logs:", error);
      res.status(500).json({ message: "Failed to fetch AI usage logs" });
    }
  });

  // Admin: Get AI usage stats
  app.get("/api/admin/ai-usage/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAIUsageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching AI usage stats:", error);
      res.status(500).json({ message: "Failed to fetch AI usage stats" });
    }
  });

  return httpServer;
}
