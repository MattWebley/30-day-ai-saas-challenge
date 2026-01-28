import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { storage } from "./storage";

// Initialize API clients
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  { pattern: /jailbreak|bypass|hack|exploit/i, reason: "Abuse keywords detected" },
  { pattern: /repeat after me|say exactly/i, reason: "Output manipulation attempt" },
  { pattern: /what('s| is) (your|the) (system|initial) (prompt|message)/i, reason: "Prompt extraction attempt" },
  { pattern: /act as|roleplay|pretend to be/i, reason: "Role hijacking attempt" },
  { pattern: /DAN|developer mode|unrestricted/i, reason: "Known jailbreak attempt" },
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
      error: "I can only help with questions about the 21 Day Challenge. Let's get back on track - what are you working on today?",
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
// CLAUDE API (Premium - for chat & PRD)
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

  // Pre-call checks
  const checks = await preCallChecks(options);
  if (!checks.allowed) {
    return { success: false, error: checks.error, blocked: checks.blocked };
  }

  // Make the API call
  try {
    const messages: { role: "user" | "assistant"; content: string }[] = [
      ...history,
      { role: "user", content: userMessage },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    });

    const responseText = response.content[0].type === "text"
      ? response.content[0].text
      : "I couldn't generate a response. Please try again.";

    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

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
    console.error(`Claude API error (${endpoint}):`, error.message);

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
  const result = await callClaude({
    ...options,
    maxTokens: options.maxTokens || 2000,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    let jsonStr = result.response!;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const data = JSON.parse(jsonStr.trim()) as T;
    return { success: true, data };
  } catch (parseError) {
    console.error("Failed to parse Claude JSON response:", parseError);
    return { success: false, error: "Failed to parse AI response. Please try again." };
  }
}

// ============================================
// GPT-4o-mini API (Cheap - for most features)
// ============================================

export async function callGPT(options: AICallOptions): Promise<{ success: boolean; response?: string; error?: string; blocked?: boolean }> {
  const {
    userId,
    endpoint,
    systemPrompt,
    userMessage,
    maxTokens = 1000,
    temperature = 1,
    history = [],
  } = options;

  // Pre-call checks
  const checks = await preCallChecks(options);
  if (!checks.allowed) {
    return { success: false, error: checks.error, blocked: checks.blocked };
  }

  // Make the API call
  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: maxTokens,
      temperature,
      messages,
    });

    const responseText = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    const tokensUsed = (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0);

    await logAIUsage({
      userId,
      endpoint: endpoint + " (gpt-mini)",
      tokensUsed,
      blocked: false,
      flagged: false,
      timestamp: new Date(),
    });

    return { success: true, response: responseText };
  } catch (error: any) {
    console.error(`GPT API error (${endpoint}):`, error.message);

    await logAIUsage({
      userId,
      endpoint: endpoint + " (gpt-error)",
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

export async function callGPTForJSON<T>(options: Omit<AICallOptions, 'history'>): Promise<{ success: boolean; data?: T; error?: string }> {
  const {
    userId,
    endpoint,
    endpointType,
    systemPrompt,
    userMessage,
    maxTokens = 2000,
  } = options;

  // Pre-call checks
  const checks = await preCallChecks(options);
  if (!checks.allowed) {
    return { success: false, error: checks.error };
  }

  // Make the API call with JSON mode
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt + "\n\nRespond with valid JSON only." },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0]?.message?.content || "{}";
    const tokensUsed = (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0);

    await logAIUsage({
      userId,
      endpoint: endpoint + " (gpt-mini)",
      tokensUsed,
      blocked: false,
      flagged: false,
      timestamp: new Date(),
    });

    const data = JSON.parse(responseText) as T;
    return { success: true, data };
  } catch (error: any) {
    console.error(`GPT API error (${endpoint}):`, error.message);

    await logAIUsage({
      userId,
      endpoint: endpoint + " (gpt-error)",
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
