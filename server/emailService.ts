import { Resend } from 'resend';
import crypto from 'crypto';
import { storage } from './storage';
import { addContactToSysteme } from './systemeService';
import type { DripEmail } from '@shared/schema';

const FROM_EMAIL = 'Matt Webley <matt@mattwebley.com>';
const REPLY_TO = 'matt@mattwebley.com';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not set');
  }
  return {
    client: new Resend(apiKey),
    fromEmail: FROM_EMAIL,
    replyTo: REPLY_TO
  };
}

// Send an email and log the result to the database
async function sendAndLog(options: {
  to: string;
  subject: string;
  text: string;
  recipientName?: string;
  templateKey?: string;
}): Promise<{ success: boolean; id?: string }> {
  const { client, fromEmail, replyTo } = getResendClient();
  try {
    const result = await client.emails.send({
      from: fromEmail,
      replyTo: replyTo,
      to: [options.to],
      subject: options.subject,
      text: options.text,
    });
    const resendId = result?.data?.id || null;
    // Log success (fire and forget - don't let logging failures break email sending)
    storage.logEmail({
      recipientEmail: options.to,
      recipientName: options.recipientName || null,
      subject: options.subject,
      templateKey: options.templateKey || null,
      status: 'sent',
      resendId,
    }).catch(err => console.error('Failed to log email:', err));
    return { success: true, id: resendId || undefined };
  } catch (error: any) {
    // Log failure
    storage.logEmail({
      recipientEmail: options.to,
      recipientName: options.recipientName || null,
      subject: options.subject,
      templateKey: options.templateKey || null,
      status: 'failed',
      error: error?.message || String(error),
    }).catch(err => console.error('Failed to log email:', err));
    throw error;
  }
}

// Helper to replace {{variable}} placeholders in templates
function replaceVariables(template: string, variables: Record<string, string | number | null | undefined>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value?.toString() || '');
  }
  return result;
}

// Get template from database with fallback to provided default
async function getTemplate(templateKey: string, defaultSubject: string, defaultBody: string): Promise<{ subject: string; body: string; isActive: boolean }> {
  try {
    const template = await storage.getEmailTemplate(templateKey);
    if (template && template.isActive) {
      return { subject: template.subject, body: template.body, isActive: true };
    }
    if (template && !template.isActive) {
      return { subject: defaultSubject, body: defaultBody, isActive: false };
    }
  } catch (error) {
    console.error(`Error fetching template ${templateKey}:`, error);
  }
  return { subject: defaultSubject, body: defaultBody, isActive: true };
}

export interface EmailParams {
  to: string;
  firstName: string;
}

export interface PurchaseEmailParams extends EmailParams {
  currency: 'usd' | 'gbp';
  total: number;
}

export interface CoachingEmailParams extends EmailParams {
  currency: 'usd' | 'gbp';
  amount: number;
}

export async function sendPurchaseConfirmationEmail(params: PurchaseEmailParams): Promise<void> {
  const { to, firstName, currency, total } = params;
  const currencySymbol = currency === 'gbp' ? '£' : '$';

  const defaultSubject = `You're in! Welcome to the 21-Day AI SaaS Challenge`;
  const defaultBody = `{{firstName}}... you're IN!

Welcome to the 21-Day AI SaaS Challenge.

ORDER CONFIRMED
---------------
21-Day AI SaaS Challenge
Total: {{currencySymbol}}{{total}}

HERE'S WHAT HAPPENS NEXT
------------------------
In the next 21 days, you're going to build a REAL AI-powered SaaS product from scratch. No coding experience needed.

By the end, you'll have:
- A live product with AI features
- User authentication and accounts
- Payment processing (yes, it will accept real money)
- A sales page, SEO, and a marketing roadmap

This is not a course you watch. This is a challenge you DO.

YOUR FIRST STEP
---------------
Log in now and start Day 0. It takes about 10 minutes, and AI will generate personalised SaaS ideas for you based on your skills and interests.

Start here: https://challenge.mattwebley.com/dashboard

HOW IT WORKS
------------
- One lesson per day (15-30 minutes each)
- Each lesson builds on the last
- AI does the heavy lifting, you make the decisions
- Your progress is saved automatically

I'll be in your inbox with guidance, tips, and motivation along the way.

Let's build something amazing.

Matt

P.S. If you want to work ahead at your own pace (skip the daily drip), you can unlock all 21 days instantly here: https://challenge.mattwebley.com/unlock

P.P.S. If you want someone experienced guiding you 1:1 through the entire challenge, check out my coaching packages: https://challenge.mattwebley.com/coaching` + TRANSACTIONAL_FOOTER;

  try {
    const template = await getTemplate('purchase_confirmation', defaultSubject, defaultBody);
    if (!template.isActive) {
      console.log('Purchase confirmation email is disabled');
      return;
    }

    const variables = { firstName, currencySymbol, total };
    const subject = replaceVariables(template.subject, variables);
    const body = replaceVariables(template.body, variables);

    await sendAndLog({ to, subject, text: body, recipientName: firstName, templateKey: 'purchase_confirmation' });
    console.log('Purchase confirmation email sent to:', to);
  } catch (error) {
    console.error('Failed to send purchase confirmation email:', error);
  }
}

export interface TestimonialNotificationParams {
  userEmail: string;
  userName: string;
  testimonial: string | null;
  videoUrl: string | null;
  appName: string | null;
  appUrl: string | null;
  sendTo?: string;
}

export async function sendTestimonialNotificationEmail(params: TestimonialNotificationParams): Promise<void> {
  const { userEmail, userName, testimonial, videoUrl, appName, appUrl, sendTo } = params;
  const recipient = sendTo || 'matt@mattwebley.com';

  let body = `New Testimonial!

FROM
----
Name: ${userName}
Email: ${userEmail}
`;

  if (testimonial) {
    body += `
WRITTEN TESTIMONIAL
-------------------
${testimonial}
`;
  }

  if (videoUrl) {
    body += `
VIDEO TESTIMONIAL
-----------------
${videoUrl}
`;
  }

  if (appName || appUrl) {
    body += `
THEIR APP
---------
${appName ? `Name: ${appName}` : ''}
${appUrl ? `URL: ${appUrl}` : ''}
`;
  }

  body += `
--
View all testimonials: https://challenge.mattwebley.com/admin
`;

  try {
    await sendAndLog({ to: recipient, subject: `New Challenge Testimonial from ${userName}`, text: body, recipientName: userName });
    console.log('Testimonial notification email sent to', recipient);
  } catch (error) {
    console.error('Failed to send testimonial notification email:', error);
  }
}

export interface CritiqueNotificationParams {
  userEmail: string;
  preferredEmail: string;
  userName: string;
  salesPageUrl: string;
  productDescription: string | null;
  targetAudience: string | null;
  specificQuestions: string | null;
  sendTo?: string;
}

export async function sendCritiqueNotificationEmail(params: CritiqueNotificationParams): Promise<void> {
  const { userEmail, preferredEmail, userName, salesPageUrl, productDescription, targetAudience, specificQuestions, sendTo } = params;
  const recipient = sendTo || 'matt@mattwebley.com';

  let body = `New Critique Request!

FROM
----
Name: ${userName}
Send Video To: ${preferredEmail}
Backup Email: ${userEmail}${preferredEmail !== userEmail ? ' (account email)' : ''}

SALES PAGE URL
--------------
${salesPageUrl}
`;

  if (productDescription) {
    body += `
PRODUCT DESCRIPTION
-------------------
${productDescription}
`;
  }

  if (targetAudience) {
    body += `
TARGET AUDIENCE
---------------
${targetAudience}
`;
  }

  if (specificQuestions) {
    body += `
SPECIFIC QUESTIONS
------------------
${specificQuestions}
`;
  }

  body += `
--
Submitted: ${new Date().toLocaleString()}
View all requests: https://challenge.mattwebley.com/admin
`;

  try {
    await sendAndLog({ to: recipient, subject: `New Critique Request from ${userName}`, text: body, recipientName: userName });
    console.log('Critique notification email sent to', recipient);
  } catch (error) {
    console.error('Failed to send critique notification email:', error);
    throw error;
  }
}

export interface CritiqueCompletedParams {
  to: string;
  firstName: string;
  videoUrl: string;
}

export async function sendCritiqueCompletedEmail(params: CritiqueCompletedParams): Promise<void> {
  const { to, firstName, videoUrl } = params;

  try {
    await sendAndLog({
      to,
      subject: `Your Sales Page Video Critique is Ready`,
      text: `Hey ${firstName}!

Your sales page video critique is ready.

WATCH YOUR CRITIQUE
-------------------
${videoUrl}

If you have questions after watching, just reply to this email.

Back to your dashboard:
https://challenge.mattwebley.com/dashboard

- Matt

--
21-Day AI SaaS Challenge
`,
      recipientName: firstName,
    });
    console.log('Critique completed email sent to:', to);
  } catch (error) {
    console.error('Failed to send critique completed email:', error);
  }
}

export interface DiscussionNotificationParams {
  userEmail: string;
  userName: string;
  day: number;
  dayTitle: string;
  content: string;
  sendTo?: string;
}

export async function sendDiscussionNotificationEmail(params: DiscussionNotificationParams): Promise<void> {
  const { userEmail, userName, day, dayTitle, content, sendTo } = params;
  const recipient = sendTo || 'matt@mattwebley.com';

  const body = `New Discussion Post on Day ${day}!

FROM
----
Name: ${userName}
Email: ${userEmail}

DAY ${day}: ${dayTitle}

MESSAGE
-------
${content}

--
View all comments: https://challenge.mattwebley.com/admin
`;

  try {
    await sendAndLog({ to: recipient, subject: `New Comment on Day ${day}: ${dayTitle}`, text: body, recipientName: userName });
    console.log('Discussion notification email sent to', recipient);
  } catch (error) {
    console.error('Failed to send discussion notification email:', error);
  }
}

export interface QuestionNotificationParams {
  userEmail: string;
  userName: string;
  day: number;
  dayTitle: string;
  question: string;
  answerUrl: string;
  sendTo?: string;
}

export async function sendQuestionNotificationEmail(params: QuestionNotificationParams): Promise<void> {
  const { userEmail, userName, day, dayTitle, question, answerUrl, sendTo } = params;
  const recipient = sendTo || 'matt@mattwebley.com';

  const body = `New Question on Day ${day}!

FROM
----
Name: ${userName}
Email: ${userEmail}

DAY ${day}: ${dayTitle}

QUESTION
--------
${question}

ANSWER NOW
----------
${answerUrl}

Click the link above to view the question and submit your answer.

--
View all pending questions: https://challenge.mattwebley.com/admin
`;

  try {
    await sendAndLog({ to: recipient, subject: `New Question on Day ${day}: ${dayTitle}`, text: body, recipientName: userName });
    console.log('Question notification email sent to', recipient);
  } catch (error) {
    console.error('Failed to send question notification email:', error);
  }
}

export interface CoachingPurchaseNotificationParams {
  userEmail: string;
  userName: string;
  coachingType: string;
  currency: 'usd' | 'gbp';
  amount: number;
  sendTo?: string;
}

export async function sendCoachingPurchaseNotificationEmail(params: CoachingPurchaseNotificationParams): Promise<void> {
  const { userEmail, userName, coachingType, currency, amount, sendTo } = params;
  const recipient = sendTo || 'matt@mattwebley.com';
  const currencySymbol = currency === 'gbp' ? '£' : '$';

  const body = `New Coaching Purchase!

FROM
----
Name: ${userName}
Email: ${userEmail}

ORDER DETAILS
-------------
Package: ${coachingType}
Amount: ${currencySymbol}${amount}
Currency: ${currency.toUpperCase()}

ACTION REQUIRED
---------------
Send booking link to customer within 24 hours.

--
View all users: https://challenge.mattwebley.com/admin
`;

  try {
    await sendAndLog({ to: recipient, subject: `New Coaching Purchase: ${coachingType} - ${currencySymbol}${amount}`, text: body, recipientName: userName });
    console.log('Coaching purchase notification email sent to', recipient);
  } catch (error) {
    console.error('Failed to send coaching purchase notification email:', error);
  }
}

export interface ReferralNotificationParams {
  referrerEmail: string;
  referrerName: string;
  newUserEmail: string;
  newUserName: string;
  referralCount: number;
  sendTo?: string;
}

export async function sendReferralNotificationEmail(params: ReferralNotificationParams): Promise<void> {
  const { referrerEmail, referrerName, newUserEmail, newUserName, referralCount, sendTo } = params;
  const recipient = sendTo || 'matt@mattwebley.com';

  const body = `New Referral!

REFERRER
--------
Name: ${referrerName}
Email: ${referrerEmail}
Total Referrals: ${referralCount}

NEW USER (REFERRED)
-------------------
Name: ${newUserName}
Email: ${newUserEmail}

--
View all users: https://challenge.mattwebley.com/admin
`;

  try {
    await sendAndLog({ to: recipient, subject: `New Referral: ${referrerName} referred ${newUserName}`, text: body });
    console.log('Referral notification email sent to', recipient);
  } catch (error) {
    console.error('Failed to send referral notification email:', error);
  }
}

export async function sendCoachingConfirmationEmail(params: CoachingEmailParams): Promise<void> {
  const { to, firstName, currency, amount } = params;
  const currencySymbol = currency === 'gbp' ? '£' : '$';

  try {
    await sendAndLog({
      to,
      subject: `Coaching Sessions Confirmed`,
      text: `Coaching Confirmed!

Hey ${firstName}, your coaching purchase is confirmed.

Total: ${currencySymbol}${amount}

WHAT HAPPENS NEXT
-----------------
I'll email you within 24 hours with details on how to book your sessions.

In the meantime, keep going with the challenge:
https://challenge.mattwebley.com/dashboard

Questions? Just reply to this email.

- Matt` + TRANSACTIONAL_FOOTER,
      recipientName: firstName,
    });
    console.log('Coaching confirmation email sent to:', to);
  } catch (error) {
    console.error('Failed to send coaching confirmation email:', error);
  }
}

export interface AbuseAlertParams {
  userId: string;
  userEmail: string;
  userName: string;
  reason: string;
  input: string;
  sendTo?: string;
}

export async function sendAbuseAlertEmail(params: AbuseAlertParams): Promise<void> {
  const { userId, userEmail, userName, reason, input, sendTo } = params;
  const recipient = sendTo || 'matt@mattwebley.com';

  const body = `AI ABUSE ALERT

FLAGGED USER
------------
Name: ${userName}
Email: ${userEmail}
User ID: ${userId}

REASON
------
${reason}

USER INPUT (TRUNCATED)
----------------------
${input}

TIMESTAMP
---------
${new Date().toISOString()}

--
Review AI usage: https://challenge.mattwebley.com/admin
`;

  try {
    await sendAndLog({ to: recipient, subject: `AI Abuse Alert: ${reason}`, text: body, recipientName: userName });
    console.log('Abuse alert email sent to', recipient);
  } catch (error) {
    console.error('Failed to send abuse alert email:', error);
  }
}

// Badge earned notification email
export interface BadgeEarnedEmailParams {
  to: string;
  firstName: string;
  badgeName: string;
  badgeDescription: string;
}

export async function sendBadgeEarnedEmail(params: BadgeEarnedEmailParams): Promise<void> {
  const { to, firstName, badgeName, badgeDescription } = params;

  try {
    await sendAndLog({
      to,
      subject: `You just earned the "${badgeName}" badge!`,
      text: `Hey ${firstName}!

You just earned a new badge: ${badgeName}

${badgeDescription}

Every badge you earn is proof of progress. Keep going and see how many you can collect.

View your badges: https://challenge.mattwebley.com/dashboard

Know someone who should be doing this challenge too? Share your referral link and earn rewards for every person who signs up: https://challenge.mattwebley.com/referrals

Keep building!

Matt` + TRANSACTIONAL_FOOTER,
      recipientName: firstName,
      templateKey: `badge_earned_${badgeName}`,
    });
    console.log(`Badge earned email sent to ${to}: ${badgeName}`);
  } catch (error) {
    console.error('Failed to send badge earned email:', error);
  }
}

// Broadcast email interface
export interface BroadcastEmailParams {
  to: string;
  firstName: string;
  subject: string;
  body: string;
}

export async function sendBroadcastEmail(params: BroadcastEmailParams): Promise<boolean> {
  const { to, firstName, subject, body } = params;

  try {
    // Replace {{firstName}} placeholder
    const processedBody = body.replace(/\{\{firstName\}\}/g, firstName || 'there');
    const processedSubject = subject.replace(/\{\{firstName\}\}/g, firstName || 'there');

    await sendAndLog({ to, subject: processedSubject, text: processedBody, recipientName: firstName, templateKey: 'broadcast' });

    return true;
  } catch (error) {
    console.error('Failed to send broadcast email:', error);
    return false;
  }
}

// Magic link login email
export async function sendMagicLinkEmail(email: string, magicLink: string): Promise<boolean> {
  try {
    const subject = 'Your Login Link - 21-Day AI SaaS Challenge';
    const body = `Hi there!

You requested a login link for the 21-Day AI SaaS Challenge.

Click here to log in:
${magicLink}

This link expires in 15 minutes and can only be used once.

If you didn't request this, you can safely ignore this email.

- Matt

--
21-Day AI SaaS Challenge`;

    await sendAndLog({ to: email, subject, text: body, templateKey: 'magic_link' });

    console.log('Magic link email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
}

export async function sendWelcomeAccessEmail(email: string, magicLink: string): Promise<boolean> {
  try {
    const subject = 'Your Access to the 21-Day AI SaaS Challenge';
    const body = `Hey!

Great news - your access to the 21-Day AI SaaS Challenge is ready.

Click this link to get started:
${magicLink}

This will log you in and take you straight to your dashboard where you can begin Day 0.

This link is valid for 30 days, but you only need to use it once. After that, you can set up a password to log in anytime.

Let's build something amazing!

- Matt

--
21-Day AI SaaS Challenge
Questions? Just reply to this email.`;

    await sendAndLog({ to: email, subject, text: body, templateKey: 'welcome_access' });

    console.log('Welcome access email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome access email:', error);
    return false;
  }
}

// Password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  try {
    const subject = 'Reset Your Password - 21-Day AI SaaS Challenge';
    const body = `Hi there!

You requested a password reset for the 21-Day AI SaaS Challenge.

Click here to reset your password:
${resetLink}

This link expires in 1 hour and can only be used once.

If you didn't request this, you can safely ignore this email - your password won't be changed.

- Matt

--
21-Day AI SaaS Challenge`;

    await sendAndLog({ to: email, subject, text: body, templateKey: 'password_reset' });

    console.log('Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export interface QuestionAnsweredEmailParams {
  to: string;
  firstName: string;
  day: number;
  question: string;
  answer: string;
}

export async function sendQuestionAnsweredEmail(params: QuestionAnsweredEmailParams): Promise<boolean> {
  try {
    const { to, firstName, day, question, answer } = params;

    const subject = `Your Day ${day} question has been answered!`;
    const body = `Hey ${firstName}!

You asked a question on Day ${day} and it's been answered.

YOUR QUESTION
${question}

ANSWER
${answer}

You can see this answer (and others) on your Day ${day} lesson page.

Log in here: https://challenge.mattwebley.com/dashboard

Keep building!

- Matt

--
21-Day AI SaaS Challenge
Questions? Just reply to this email.`;

    await sendAndLog({ to, subject, text: body, recipientName: firstName });

    console.log('Question answered email sent to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send question answered email:', error);
    return false;
  }
}

// ============================================================
// DRIP EMAIL SEQUENCE
// ============================================================

const DRIP_VARIABLES: Record<string, string> = {
  DASHBOARD_URL: 'https://challenge.mattwebley.com/dashboard',
  UNLOCK_URL: 'https://challenge.mattwebley.com/unlock',
  READINESS_CALL_URL: 'https://cal.com/mattwebley/readiness-review',
  COACHING_URL: 'https://challenge.mattwebley.com/coaching',
  REFERRAL_URL: 'https://challenge.mattwebley.com/referrals',
  CRITIQUE_URL: 'https://challenge.mattwebley.com/critique',
  SHOWCASE_URL: 'https://challenge.mattwebley.com/showcase',
};

function generateUnsubscribeUrl(userId: string): string {
  const token = crypto.createHmac('sha256', 'drip-unsubscribe-salt')
    .update(userId)
    .digest('hex')
    .slice(0, 16);
  return `https://challenge.mattwebley.com/api/drip/unsubscribe?uid=${encodeURIComponent(userId)}&token=${token}`;
}

const LEGAL_FOOTER = `

--
21-Day AI SaaS Challenge by Matt Webley
Webley Global - FZCO
Building A1, Dubai Digital Park
Silicon Oasis, Dubai

You're receiving this because you purchased the 21-Day AI SaaS Challenge.
Unsubscribe from these emails: {{UNSUBSCRIBE_URL}}`;

const TRANSACTIONAL_FOOTER = `

--
21-Day AI SaaS Challenge by Matt Webley
Webley Global - FZCO
Building A1, Dubai Digital Park
Silicon Oasis, Dubai`;

async function sendDripEmail(dripEmail: DripEmail, userEmail: string, firstName: string, unsubscribeUrl: string): Promise<boolean> {
  try {
    const variables: Record<string, string> = {
      ...DRIP_VARIABLES,
      firstName: firstName || 'there',
      UNSUBSCRIBE_URL: unsubscribeUrl,
    };

    const subject = replaceVariables(dripEmail.subject, variables);
    const bodyWithFooter = dripEmail.body + LEGAL_FOOTER;
    const body = replaceVariables(bodyWithFooter, variables);

    const { client, fromEmail, replyTo } = getResendClient();
    const result = await client.emails.send({
      from: fromEmail,
      replyTo: replyTo,
      to: [userEmail],
      subject,
      text: body,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    const resendId = result?.data?.id || null;
    storage.logEmail({
      recipientEmail: userEmail,
      recipientName: firstName,
      subject,
      templateKey: `drip_email_${dripEmail.emailNumber}`,
      status: 'sent',
      resendId,
    }).catch(err => console.error('Failed to log drip email:', err));

    return true;
  } catch (error) {
    console.error(`[Drip] Failed to send email #${dripEmail.emailNumber} to ${userEmail}:`, error);
    storage.logEmail({
      recipientEmail: userEmail,
      recipientName: firstName,
      subject: dripEmail.subject,
      templateKey: `drip_email_${dripEmail.emailNumber}`,
      status: 'failed',
      error: (error as any)?.message || String(error),
    }).catch(err => console.error('Failed to log drip email:', err));
    return false;
  }
}

export async function processDripEmails(): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;

  try {
    // Get all active drip emails, split by type
    const activeDrips = await storage.getActiveDripEmails();
    if (activeDrips.length === 0) {
      console.log('[Drip] No active drip emails found, skipping');
      return { sent, errors };
    }
    console.log(`[Drip] Found ${activeDrips.length} active drip emails: ${activeDrips.map(d => `#${d.emailNumber} "${d.subject.substring(0, 40)}"`).join(', ')}`);

    const regularDrips = activeDrips.filter(d => !d.emailType || d.emailType === 'drip');
    const initialDrips = activeDrips.filter(d => d.emailType === 'initial');
    const nagDrips = activeDrips.filter(d => d.emailType === 'nag');
    const milestoneDrips = activeDrips.filter(d => d.emailType === 'milestone');
    const welcomeBackDrips = activeDrips.filter(d => d.emailType === 'welcome_back');

    // Get all paid users (skip unsubscribed and banned)
    const allUsers = await storage.getAllUsers();
    const paidUsers = allUsers.filter(u => u.challengePurchased && !u.isBanned && !u.dripUnsubscribed && u.email);

    if (paidUsers.length === 0) return { sent, errors };

    // Pre-fetch all user stats and progress for efficiency
    const allStats = await storage.getAllUserStats();
    const allProgress = await storage.getAllUserProgress();
    const statsMap = new Map(allStats.map(s => [s.userId, s]));
    const progressMap = new Map<string, Set<number>>();
    for (const p of allProgress) {
      if (p.completed) {
        if (!progressMap.has(p.userId)) progressMap.set(p.userId, new Set());
        progressMap.get(p.userId)!.add(p.day);
      }
    }

    const now = new Date();
    const dayMs = 1000 * 60 * 60 * 24;

    for (const user of paidUsers) {
      const signupDate = user.createdAt ? new Date(user.createdAt) : null;
      if (!signupDate) continue;

      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / dayMs);
      const completedDays = progressMap.get(user.id) || new Set<number>();
      const stats = statsMap.get(user.id);

      // Get which drip emails this user has already received
      const alreadySent = await storage.getDripEmailsSentForUser(user.id);
      const sentIds = new Set(alreadySent.map(s => s.dripEmailId));
      const unsubUrl = generateUnsubscribeUrl(user.id);

      // --- REGULAR DRIP EMAILS (progress-based for challenge days, calendar-based for post-completion) ---
      for (const drip of regularDrips) {
        if (sentIds.has(drip.id)) continue; // Already sent

        if (drip.dayTrigger === 0) {
          // Day 0 welcome email: send on signup day only
          if (daysSinceSignup !== 0) continue;
          if (completedDays.has(0)) continue;
        } else if (drip.dayTrigger <= 21) {
          // Challenge emails (Days 1-21): send when user completed previous day but hasn't done this one yet
          if (!completedDays.has(drip.dayTrigger - 1)) continue;
          if (completedDays.has(drip.dayTrigger)) continue;
        } else {
          // Post-completion emails (Days 22+): send after finishing the challenge, calendar-spaced
          if (!completedDays.has(21)) continue;
          if (daysSinceSignup < drip.dayTrigger) continue;
        }

        console.log(`[Drip] SENDING email #${drip.emailNumber} "${drip.subject}" to ${user.email}`);
        const success = await sendDripEmail(drip, user.email!, user.firstName || '', unsubUrl);
        if (success) {
          await storage.markDripEmailSent(user.id, drip.id);
          sent++;
        } else {
          errors++;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // --- INITIAL ENGAGEMENT (paid but never started, never completed Day 0) ---
      if (initialDrips.length > 0 && !completedDays.has(0)) {
        for (const drip of initialDrips) {
          if (sentIds.has(drip.id)) continue; // Already sent (one-time only)
          if (daysSinceSignup < drip.dayTrigger) continue; // Not enough days since signup

          console.log(`[Drip] SENDING initial email #${drip.emailNumber} "${drip.subject}" to ${user.email}`);
          const success = await sendDripEmail(drip, user.email!, user.firstName || '', unsubUrl);
          if (success) {
            await storage.markDripEmailSent(user.id, drip.id);
            sent++;
          } else {
            errors++;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // --- NAG EMAILS (inactivity-based) ---
      if (nagDrips.length > 0 && stats) {
        const lastCompletedDay = stats.lastCompletedDay;
        // Only nag users who started (completed at least day 0) but haven't finished
        if (lastCompletedDay !== null && lastCompletedDay !== undefined && lastCompletedDay >= 0 && lastCompletedDay < 21) {
          const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate) : null;
          if (lastActivity) {
            const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / dayMs);

            if (daysInactive >= 1) {
              const nagResetAt = stats.nagResetAt ? new Date(stats.nagResetAt) : null;

              // Personal nags (levels 1-3) only play once ever. Generic nudges (4+) repeat each cycle.
              const personalNags = nagDrips.filter(n => (n.nagLevel || 0) <= 3);
              const gentleNudges = nagDrips.filter(n => (n.nagLevel || 0) > 3);

              // Has the user ever received the final personal nag (level 3)?
              const finalPersonalNag = personalNags.find(n => n.nagLevel === 3);
              const completedPersonalCycle = finalPersonalNag && alreadySent.some(s => s.dripEmailId === finalPersonalNag.id);

              const nagsToUse = completedPersonalCycle ? gentleNudges : personalNags;

              for (const nag of nagsToUse) {
                // Skip if already sent after last nag reset
                const wasSentAfterReset = alreadySent.some(s =>
                  s.dripEmailId === nag.id &&
                  s.sentAt &&
                  (!nagResetAt || new Date(s.sentAt) > nagResetAt)
                );
                if (wasSentAfterReset) continue;

                if (daysInactive < nag.dayTrigger) continue; // Not inactive long enough

                console.log(`[Drip] SENDING nag email #${nag.emailNumber} (level ${nag.nagLevel}) "${nag.subject}" to ${user.email}`);
                const success = await sendDripEmail(nag, user.email!, user.firstName || '', unsubUrl);
                if (success) {
                  await storage.markDripEmailSent(user.id, nag.id);
                  sent++;
                  // Tag as stalled in Systeme on first nag
                  if (nag.nagLevel === 1) {
                    addContactToSysteme({
                      email: user.email!,
                      firstName: user.firstName || undefined,
                      lastName: user.lastName || undefined,
                      tags: ['Challenge Stalled'],
                    }).catch(err => console.error('[Systeme] Stalled tag error:', err));
                  }
                } else {
                  errors++;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
          }
        }
      }

      // --- MILESTONE EMAILS (one-time, fires when user completes the specified day) ---
      if (milestoneDrips.length > 0) {
        for (const drip of milestoneDrips) {
          if (sentIds.has(drip.id)) continue; // Already sent (one-time only)
          if (!completedDays.has(drip.dayTrigger)) continue; // Haven't completed this day yet

          console.log(`[Drip] SENDING milestone email #${drip.emailNumber} "${drip.subject}" to ${user.email}`);
          const success = await sendDripEmail(drip, user.email!, user.firstName || '', unsubUrl);
          if (success) {
            await storage.markDripEmailSent(user.id, drip.id);
            sent++;
          } else {
            errors++;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // --- WELCOME BACK EMAIL (fires when user returns after receiving nag emails) ---
      if (welcomeBackDrips.length > 0 && stats?.lastActivityDate) {
        const lastActivity = new Date(stats.lastActivityDate);
        const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / dayMs);

        // User is currently active (last activity within 2 days)
        if (daysInactive < 2) {
          // Find the most recent nag sent to this user
          const nagEmailIds = new Set(nagDrips.map(n => n.id));
          const sentNags = alreadySent
            .filter(s => nagEmailIds.has(s.dripEmailId) && s.sentAt)
            .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());

          if (sentNags.length > 0) {
            const lastNagDate = new Date(sentNags[0].sentAt!);

            // User's activity is more recent than the last nag (they came back)
            if (lastActivity > lastNagDate) {
              for (const wb of welcomeBackDrips) {
                // Only send if not already sent after the last nag
                const alreadySentWb = alreadySent.some(s =>
                  s.dripEmailId === wb.id &&
                  s.sentAt &&
                  new Date(s.sentAt) > lastNagDate
                );
                if (!alreadySentWb) {
                  console.log(`[Drip] SENDING welcome-back email #${wb.emailNumber} "${wb.subject}" to ${user.email}`);
                  const success = await sendDripEmail(wb, user.email!, user.firstName || '', unsubUrl);
                  if (success) {
                    await storage.markDripEmailSent(user.id, wb.id);
                    sent++;
                  } else {
                    errors++;
                  }
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }
            }
          }
        }
      }
    }

    if (sent > 0 || errors > 0) {
      console.log(`[Drip] Processed: ${sent} sent, ${errors} errors`);
    }
  } catch (error) {
    console.error('[Drip] Error processing drip emails:', error);
  }

  return { sent, errors };
}

// Start the drip email processor - runs every hour
let dripInterval: ReturnType<typeof setInterval> | null = null;

export function startDripEmailProcessor(): void {
  if (dripInterval) return; // Already running

  // Run every hour (3600000ms)
  dripInterval = setInterval(async () => {
    try {
      await processDripEmails();
    } catch (error) {
      console.error('[Drip] Processor error:', error);
    }
  }, 60 * 60 * 1000);

  // Also run once on startup (after a 30-second delay to let the server fully initialize)
  setTimeout(async () => {
    try {
      await processDripEmails();
    } catch (error) {
      console.error('[Drip] Initial run error:', error);
    }
  }, 30000);

  console.log('[Drip] Email processor started (runs every hour)');
}
