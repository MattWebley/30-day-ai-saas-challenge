import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";

// Initialize Claude API client
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Rate limit settings per endpoint type
const RATE_LIMITS = {
  chat: { hourly: 20, daily: 100 },      // AI Mentor chat
  ideaGen: { hourly: 5, daily: 20 },     // Idea generation (expensive)
  features: { hourly: 10, daily: 50 },   // Feature generation
  general: { hourly: 15, daily: 75 },    // Other AI calls
};

// Track usage in memory (resets on server restart, but DB tracking persists)
const usageCache: Map<string, { hourly: Map<string, number>, daily: Map<string, number> }> = new Map();

// Abuse patterns to detect
const ABUSE_PATTERNS = [
  { pattern: /ignore (previous|all|your) (instructions|rules|prompt)/i, reason: "Prompt injection attempt" },
  { pattern: /pretend you('re| are) (not|a different)/i, reason: "Role manipulation attempt" },
  { pattern: /jailbreak|bypass (security|filter|restriction)|hack (this|the|your|into)/i, reason: "Abuse keywords detected" },
  { pattern: /repeat after me|say exactly/i, reason: "Output manipulation attempt" },
  { pattern: /what('s| is) (your|the) (system|initial) (prompt|message)/i, reason: "Prompt extraction attempt" },
  { pattern: /act as|roleplay|pretend to be/i, reason: "Role hijacking attempt" },
  { pattern: /\bDAN\b|developer mode|unrestricted mode/i, reason: "Known jailbreak attempt" },
];

interface AIUsageLog {
  userId: string;
  endpoint: string;
  tokensUsed: number;
  blocked: boolean;
  blockReason?: string;
  flagged: boolean;
  flagReason?: string;
  timestamp: Date;
}

// Check for abuse patterns in user input
export function detectAbuse(input: string): { flagged: boolean; reason: string | null } {
  for (const { pattern, reason } of ABUSE_PATTERNS) {
    if (pattern.test(input)) {
      return { flagged: true, reason };
    }
  }
  return { flagged: false, reason: null };
}

// Get rate limit key for current hour/day
function getTimeKeys(): { hourKey: string; dayKey: string } {
  const now = new Date();
  const hourKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
  const dayKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  return { hourKey, dayKey };
}

// Check and increment rate limit
export async function checkRateLimit(
  userId: string,
  endpointType: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; reason?: string; resetIn?: number }> {
  const limits = RATE_LIMITS[endpointType];
  const { hourKey, dayKey } = getTimeKeys();

  // Initialize user cache if needed
  if (!usageCache.has(userId)) {
    usageCache.set(userId, { hourly: new Map(), daily: new Map() });
  }
  const userCache = usageCache.get(userId)!;

  // Get current counts
  const hourlyCount = userCache.hourly.get(hourKey) || 0;
  const dailyCount = userCache.daily.get(dayKey) || 0;

  // Check limits
  if (hourlyCount >= limits.hourly) {
    const minutesUntilReset = 60 - new Date().getMinutes();
    return {
      allowed: false,
      reason: `You've reached the hourly limit (${limits.hourly} requests). Please wait ${minutesUntilReset} minutes.`,
      resetIn: minutesUntilReset * 60 * 1000,
    };
  }

  if (dailyCount >= limits.daily) {
    return {
      allowed: false,
      reason: `You've reached the daily limit (${limits.daily} requests). Limit resets at midnight UTC.`,
      resetIn: 24 * 60 * 60 * 1000,
    };
  }

  // Increment counts
  userCache.hourly.set(hourKey, hourlyCount + 1);
  userCache.daily.set(dayKey, dailyCount + 1);

  // Clean old entries
  Array.from(userCache.hourly.keys()).forEach((key) => {
    if (key !== hourKey) userCache.hourly.delete(key);
  });
  Array.from(userCache.daily.keys()).forEach((key) => {
    if (key !== dayKey) userCache.daily.delete(key);
  });

  return { allowed: true };
}

// Log AI usage to database
export async function logAIUsage(log: AIUsageLog): Promise<void> {
  try {
    await storage.logAIUsage(log);
  } catch (error) {
    console.error("Failed to log AI usage:", error);
  }
}

// Send abuse alert email
export async function sendAbuseAlert(
  userId: string,
  reason: string,
  input: string
): Promise<void> {
  try {
    // Import dynamically to avoid circular deps
    const { sendAbuseAlertEmail } = await import("./emailService");
    const user = await storage.getUser(userId);
    await sendAbuseAlertEmail({
      userId,
      userEmail: user?.email || "unknown",
      userName: user?.firstName || "Unknown User",
      reason,
      input: input.substring(0, 500), // Truncate for email
    });
  } catch (error) {
    console.error("Failed to send abuse alert:", error);
  }
}

// Shared options interface
interface AICallOptions {
  userId: string;
  endpoint: string;
  endpointType: keyof typeof RATE_LIMITS;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
  history?: { role: "user" | "assistant"; content: string }[];
}

// Pre-call checks (abuse detection, rate limiting)
async function preCallChecks(options: AICallOptions): Promise<{ allowed: boolean; error?: string; blocked?: boolean }> {
  const { userId, endpoint, endpointType, userMessage } = options;

  // 1. Check for abuse patterns
  const abuse = detectAbuse(userMessage);
  if (abuse.flagged) {
    await logAIUsage({
      userId,
      endpoint,
      tokensUsed: 0,
      blocked: true,
      blockReason: abuse.reason!,
      flagged: true,
      flagReason: abuse.reason!,
      timestamp: new Date(),
    });

    await sendAbuseAlert(userId, abuse.reason!, userMessage);

    return {
      allowed: false,
      error: "I can only help with questions about the 21-Day Challenge. Let's get back on track - what are you working on today?",
      blocked: true,
    };
  }

  // 2. Check rate limits
  const rateCheck = await checkRateLimit(userId, endpointType);
  if (!rateCheck.allowed) {
    await logAIUsage({
      userId,
      endpoint,
      tokensUsed: 0,
      blocked: true,
      blockReason: "Rate limit exceeded",
      flagged: false,
      timestamp: new Date(),
    });

    return {
      allowed: false,
      error: rateCheck.reason,
      blocked: true,
    };
  }

  return { allowed: true };
}

// ============================================
// CLAUDE API
// ============================================

export async function callClaude(options: AICallOptions): Promise<{ success: boolean; response?: string; error?: string; blocked?: boolean }> {
  const {
    userId,
    endpoint,
    systemPrompt,
    userMessage,
    maxTokens = 1000,
    history = [],
  } = options;

  console.log(`[callClaude] Starting for endpoint: ${endpoint}, userId: ${userId}, maxTokens: ${maxTokens}`);

  // Pre-call checks
  const checks = await preCallChecks(options);
  if (!checks.allowed) {
    console.log(`[callClaude] Pre-check failed: ${checks.error}`);
    return { success: false, error: checks.error, blocked: checks.blocked };
  }

  console.log(`[callClaude] Pre-checks passed, calling Claude API...`);

  // Make the API call
  try {
    const messages: { role: "user" | "assistant"; content: string }[] = [
      ...history,
      { role: "user", content: userMessage },
    ];

    const response = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    });

    console.log(`[callClaude] API response received, stop_reason: ${response.stop_reason}`);

    const responseText = response.content[0].type === "text"
      ? response.content[0].text
      : "I couldn't generate a response. Please try again.";

    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
    console.log(`[callClaude] Tokens used: ${tokensUsed}, response length: ${responseText.length}`);

    await logAIUsage({
      userId,
      endpoint: endpoint + " (claude)",
      tokensUsed,
      blocked: false,
      flagged: false,
      timestamp: new Date(),
    });

    return { success: true, response: responseText };
  } catch (error: any) {
    console.error(`[callClaude] API error (${endpoint}):`, error.message);
    console.error(`[callClaude] Error status:`, error.status);
    console.error(`[callClaude] Full error:`, error);

    await logAIUsage({
      userId,
      endpoint: endpoint + " (claude-error)",
      tokensUsed: 0,
      blocked: false,
      flagged: false,
      timestamp: new Date(),
    });

    if (error.status === 401) {
      return { success: false, error: "AI service not configured. Please contact support." };
    }
    if (error.status === 429) {
      return { success: false, error: "AI service is busy. Please wait a moment and try again." };
    }

    return { success: false, error: "Failed to get AI response. Please try again." };
  }
}

export async function callClaudeForJSON<T>(options: Omit<AICallOptions, 'history'>): Promise<{ success: boolean; data?: T; error?: string }> {
  console.log(`[callClaudeForJSON] Starting for endpoint: ${options.endpoint}`);

  const result = await callClaude({
    ...options,
    maxTokens: options.maxTokens || 2000,
  });

  console.log(`[callClaudeForJSON] callClaude result: success=${result.success}, error=${result.error || 'none'}, responseLength=${result.response?.length || 0}`);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    let jsonStr = result.response!;

    // Log first 500 chars of response for debugging
    console.log(`[callClaudeForJSON] Raw response (first 500 chars): ${jsonStr.substring(0, 500)}`);

    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      console.log(`[callClaudeForJSON] Found JSON in code block`);
      jsonStr = jsonMatch[1];
    }

    const data = JSON.parse(jsonStr.trim()) as T;
    console.log(`[callClaudeForJSON] Successfully parsed JSON`);
    return { success: true, data };
  } catch (parseError: any) {
    console.error("[callClaudeForJSON] Failed to parse JSON:", parseError.message);
    console.error("[callClaudeForJSON] Full response was:", result.response);
    return { success: false, error: "Failed to parse AI response. Please try again." };
  }
}
