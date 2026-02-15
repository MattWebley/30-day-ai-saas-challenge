import { Resend } from 'resend';
import crypto from 'crypto';
import { storage } from './storage';
import { db } from './db';
import { addContactToSysteme } from './systemeService';
import { emailLogs, type DripEmail } from '@shared/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

const FROM_EMAIL = 'Matt Webley <matt@mattwebley.com>';
const REPLY_TO = 'matt@mattwebley.com';
const TRACKING_BASE_URL = 'https://challenge.mattwebley.com';

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

// Convert plain text email to HTML with tracking pixel and click-tracked links
function buildTrackedHtml(text: string, trackingId: string): string {
  // Escape HTML entities in the text
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Wrap URLs with click tracking (match http/https URLs)
  html = html.replace(
    /(https?:\/\/[^\s<>"')\]]+)/g,
    (url) => {
      const trackUrl = `${TRACKING_BASE_URL}/api/t/${trackingId}/link?url=${encodeURIComponent(url)}`;
      return `<a href="${trackUrl}" style="color:#2563eb;">${url}</a>`;
    }
  );

  // Convert newlines to <br>
  html = html.replace(/\n/g, '<br>\n');

  // Wrap in minimal HTML with tracking pixel
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#334155;">
${html}
<img src="${TRACKING_BASE_URL}/api/t/${trackingId}/pixel.png" width="1" height="1" alt="" style="display:none;" />
</body></html>`;
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
  const trackingId = crypto.randomUUID();

  try {
    const html = buildTrackedHtml(options.text, trackingId);
    const result = await client.emails.send({
      from: fromEmail,
      replyTo: replyTo,
      to: [options.to],
      subject: options.subject,
      text: options.text,
      html,
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
      trackingId,
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
      trackingId,
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
  const { to, currency, total } = params;
  const firstName = params.firstName || 'there';
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
  const { to, videoUrl } = params;
  const firstName = params.firstName || 'there';

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

  const dayPageUrl = `https://challenge.mattwebley.com/dashboard/${day}`;

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

VIEW THE DAY
-------------
${dayPageUrl}

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
  const { to, currency, amount } = params;
  const firstName = params.firstName || 'there';
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
  const { to, badgeName, badgeDescription } = params;
  const firstName = params.firstName || 'there';

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

// Login help email - sent by admin to help customers who are struggling to log in
export async function sendLoginHelpEmail(email: string, firstName: string, magicLink: string): Promise<boolean> {
  try {
    const name = firstName || 'there';
    const subject = 'How to Log In - 21-Day AI SaaS Challenge';
    const body = `Hi ${name},

Matt here from the 21-Day AI SaaS Challenge. I understand you're having trouble logging in - let me help!

You have two ways to get in:


OPTION 1: MAGIC LINK (EASIEST)

I've generated a fresh login link just for you. Click the link below and you'll be logged straight in - no password needed:

${magicLink}

This link expires in 15 minutes, so click it soon. If it expires, just use Option 2 below.


OPTION 2: EMAIL & PASSWORD

If you've already set up a password, you can log in here:

https://challenge.mattwebley.com/auth/error

1. Enter your email address: ${email}
2. Enter the password you created
3. Click "Log In"

Forgot your password? On that same page, click "Forgot password?" and you'll get a reset link sent to this email.


OPTION 3: REQUEST A NEW MAGIC LINK

If the link above has expired:

1. Go to: https://challenge.mattwebley.com/auth/error
2. Scroll down to "Send Me a Login Link"
3. Enter your email: ${email}
4. Check your inbox (and spam/junk folder!) for the link
5. Click the link in the email to log straight in


STILL STUCK?

Just reply to this email and I'll sort it out for you personally.

- Matt

--
21-Day AI SaaS Challenge by Matt Webley
Questions? Just reply to this email.`;

    await sendAndLog({ to: email, subject, text: body, recipientName: firstName || undefined, templateKey: 'login_help' });

    console.log('Login help email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send login help email:', error);
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
    const { to, day, question, answer } = params;
    const firstName = params.firstName || 'there';

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

-
Matt Webley · Webley Global FZCO · Dubai Silicon Oasis, UAE
Unsubscribe: {{UNSUBSCRIBE_URL}}`;

const TRANSACTIONAL_FOOTER = `

-
Matt Webley · Webley Global FZCO · Dubai Silicon Oasis, UAE`;

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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const MAX_DRIP_EMAILS_PER_DAY = 2;

    // Pre-fetch today's email counts per recipient to enforce daily cap
    const todayLogs = await db
      .select({ email: emailLogs.recipientEmail, count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.status, 'sent'),
        gte(emailLogs.sentAt, startOfToday)
      ))
      .groupBy(emailLogs.recipientEmail);
    const emailsSentToday = new Map(todayLogs.map(r => [r.email, r.count]));

    for (const user of paidUsers) {
      const signupDate = user.createdAt ? new Date(user.createdAt) : null;
      if (!signupDate) continue;

      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / dayMs);
      const completedDays = progressMap.get(user.id) || new Set<number>();
      const stats = statsMap.get(user.id);

      // DAILY CAP: Skip user if they've already received 2+ emails today
      const todayCount = emailsSentToday.get(user.email!) || 0;
      if (todayCount >= MAX_DRIP_EMAILS_PER_DAY) continue;

      // Get which drip emails this user has already received
      const alreadySent = await storage.getDripEmailsSentForUser(user.id);
      const sentIds = new Set(alreadySent.map(s => s.dripEmailId));
      const unsubUrl = generateUnsubscribeUrl(user.id);

      // SMART PRIORITY: Pick the single best email for where this user is right now.
      // Priority order:
      //   1. Milestone (they just achieved something - celebrate it)
      //   2. Regular drip (the core journey - keep them moving)
      //   3. Welcome back (they returned after being inactive - acknowledge it)
      //   4. Initial engagement (haven't started yet - nudge them)
      //   5. Nag (lowest priority - they're already inactive)

      let bestEmail: typeof regularDrips[0] | null = null;
      let bestCategory = '';

      // 1. MILESTONE - user completed a day, congratulate them
      if (!bestEmail && milestoneDrips.length > 0) {
        for (const drip of milestoneDrips) {
          if (sentIds.has(drip.id)) continue;
          if (!completedDays.has(drip.dayTrigger)) continue;
          bestEmail = drip;
          bestCategory = 'milestone';
          break;
        }
      }

      // 2. REGULAR DRIP - the core challenge journey
      if (!bestEmail) {
        for (const drip of regularDrips) {
          if (sentIds.has(drip.id)) continue;

          if (drip.dayTrigger === 0) {
            if (daysSinceSignup !== 0) continue;
            if (completedDays.has(0)) continue;
          } else if (drip.dayTrigger <= 21) {
            if (!completedDays.has(drip.dayTrigger - 1)) continue;
            if (completedDays.has(drip.dayTrigger)) continue;
          } else {
            if (!completedDays.has(21)) continue;
            if (daysSinceSignup < drip.dayTrigger) continue;
          }

          bestEmail = drip;
          bestCategory = 'drip';
          break;
        }
      }

      // 3. WELCOME BACK - user returned after nag emails
      if (!bestEmail && welcomeBackDrips.length > 0 && stats?.lastActivityDate) {
        const lastActivity = new Date(stats.lastActivityDate);
        const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / dayMs);

        if (daysInactive < 2) {
          const nagEmailIds = new Set(nagDrips.map(n => n.id));
          const sentNags = alreadySent
            .filter(s => nagEmailIds.has(s.dripEmailId) && s.sentAt)
            .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());

          if (sentNags.length > 0) {
            const lastNagDate = new Date(sentNags[0].sentAt!);
            if (lastActivity > lastNagDate) {
              for (const wb of welcomeBackDrips) {
                const alreadySentWb = alreadySent.some(s =>
                  s.dripEmailId === wb.id &&
                  s.sentAt &&
                  new Date(s.sentAt) > lastNagDate
                );
                if (!alreadySentWb) {
                  bestEmail = wb;
                  bestCategory = 'welcome-back';
                  break;
                }
              }
            }
          }
        }
      }

      // 4. INITIAL ENGAGEMENT - paid but never started
      if (!bestEmail && initialDrips.length > 0 && !completedDays.has(0)) {
        for (const drip of initialDrips) {
          if (sentIds.has(drip.id)) continue;
          if (daysSinceSignup < drip.dayTrigger) continue;
          bestEmail = drip;
          bestCategory = 'initial';
          break;
        }
      }

      // 5. NAG - inactive user, lowest priority
      if (!bestEmail && nagDrips.length > 0 && stats) {
        const lastCompletedDay = stats.lastCompletedDay;
        if (lastCompletedDay !== null && lastCompletedDay !== undefined && lastCompletedDay >= 0 && lastCompletedDay < 21) {
          const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate) : null;
          if (lastActivity) {
            const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / dayMs);

            if (daysInactive >= 1) {
              const nagResetAt = stats.nagResetAt ? new Date(stats.nagResetAt) : null;
              const personalNags = nagDrips.filter(n => (n.nagLevel || 0) <= 3);
              const gentleNudges = nagDrips.filter(n => (n.nagLevel || 0) > 3);
              const finalPersonalNag = personalNags.find(n => n.nagLevel === 3);
              const completedPersonalCycle = finalPersonalNag && alreadySent.some(s => s.dripEmailId === finalPersonalNag.id);
              const nagsToUse = completedPersonalCycle ? gentleNudges : personalNags;

              for (const nag of nagsToUse) {
                const wasSentAfterReset = alreadySent.some(s =>
                  s.dripEmailId === nag.id &&
                  s.sentAt &&
                  (!nagResetAt || new Date(s.sentAt) > nagResetAt)
                );
                if (wasSentAfterReset) continue;
                if (daysInactive < nag.dayTrigger) continue;

                bestEmail = nag;
                bestCategory = 'nag';
                break;
              }
            }
          }
        }
      }

      // Send the single best email (if any)
      if (bestEmail) {
        console.log(`[Drip] SENDING ${bestCategory} email #${bestEmail.emailNumber} "${bestEmail.subject}" to ${user.email} (${todayCount} already today)`);
        const success = await sendDripEmail(bestEmail, user.email!, user.firstName || '', unsubUrl);
        if (success) {
          await storage.markDripEmailSent(user.id, bestEmail.id);
          sent++;
          emailsSentToday.set(user.email!, todayCount + 1);
          // Tag as stalled in Systeme on first nag
          if (bestCategory === 'nag' && (bestEmail as any).nagLevel === 1) {
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

// =============================================
// COACHING EMAILS
// =============================================

export interface CoachAssignmentEmailParams {
  to: string;
  firstName: string;
  coachName: string;
  calComLink: string;
  sessionsTotal: number;
}

export async function sendCoachAssignmentEmail(params: CoachAssignmentEmailParams): Promise<void> {
  const { to, coachName, calComLink, sessionsTotal } = params;
  const firstName = params.firstName || 'there';

  const bookingLine = calComLink
    ? `Book your first call here: ${calComLink}`
    : 'Your coach will be in touch shortly to arrange your first call.';

  await sendAndLog({
    to,
    subject: `Your coaching sessions are ready! Meet ${coachName}`,
    text: `Hi ${firstName},

Great news - your coaching sessions have been set up!

You've been paired with ${coachName}, who will be guiding you through ${sessionsTotal} 1:1 coaching session${sessionsTotal > 1 ? 's' : ''}.

YOUR NEXT STEP
--------------
${bookingLine}

During your sessions, your coach will:
- Review your progress and give personalised feedback
- Help you overcome any blockers
- Share strategies specific to your product idea
- Keep you accountable and on track

BEFORE YOUR FIRST CALL
-----------------------
Make sure you're as far along in the challenge as possible - the more progress you've made, the more valuable your coaching session will be.

Looking forward to hearing how it goes!

Matt` + TRANSACTIONAL_FOOTER,
    recipientName: firstName,
    templateKey: 'coach_assignment',
  });
}

export interface BookNextSessionEmailParams {
  to: string;
  firstName: string;
  coachName: string;
  calComLink: string;
  sessionsRemaining: number;
}

export async function sendBookNextSessionEmail(params: BookNextSessionEmailParams): Promise<void> {
  const { to, coachName, calComLink, sessionsRemaining } = params;
  const firstName = params.firstName || 'there';

  const bookingLine = calComLink
    ? `Book your next call here: ${calComLink}`
    : `${coachName} will be in touch to arrange your next session.`;

  await sendAndLog({
    to,
    subject: `Great session! You have ${sessionsRemaining} coaching session${sessionsRemaining > 1 ? 's' : ''} remaining`,
    text: `Hi ${firstName},

Your coaching session with ${coachName} has been completed - nice work!

You have ${sessionsRemaining} session${sessionsRemaining > 1 ? 's' : ''} remaining.

BOOK YOUR NEXT SESSION
----------------------
${bookingLine}

Tip: The best time to book your next session is when you've made meaningful progress on the challenge. That way you'll get the most value from your coach's feedback.

Keep building!

Matt` + TRANSACTIONAL_FOOTER,
    recipientName: firstName,
    templateKey: 'book_next_session',
  });
}

// Coach nudge email - sent by coach to get an inactive client to book
export async function sendCoachNudgeEmail(params: {
  to: string;
  firstName: string;
  coachName: string;
  calComLink: string;
  sessionsRemaining: number;
}): Promise<void> {
  const { to, coachName, calComLink, sessionsRemaining } = params;
  const firstName = params.firstName || 'there';

  const bookingLine = calComLink
    ? `Book your next session here: ${calComLink}`
    : `Reply to this email and ${coachName} will arrange a time with you.`;

  await sendAndLog({
    to,
    subject: `${coachName} is ready for your next coaching session`,
    text: `Hi ${firstName},

Just a quick note from your coach ${coachName} - you still have ${sessionsRemaining} coaching session${sessionsRemaining > 1 ? 's' : ''} available and they'd love to help you make progress.

${bookingLine}

These sessions are yours - make the most of them!

Best,
The 21-Day AI SaaS Challenge Team` + TRANSACTIONAL_FOOTER,
    recipientName: firstName,
    templateKey: 'coach_nudge',
  });
}

// Send rebooking payment link to client
export async function sendCoachingRebookEmail(params: {
  to: string;
  firstName: string;
  coachName: string;
  sessionsCount: number;
  paymentUrl: string;
  price: string;
}): Promise<void> {
  const { to, coachName, sessionsCount, paymentUrl, price } = params;
  const firstName = params.firstName || 'there';

  await sendAndLog({
    to,
    subject: `Book another ${sessionsCount} coaching sessions with ${coachName}`,
    text: `Hi ${firstName},

Great news - your coach ${coachName} has sent you a link to book another ${sessionsCount} coaching sessions at the same price you paid before (${price}).

Book your next ${sessionsCount} sessions here:
${paymentUrl}

This is a secure Stripe payment link. Once payment is confirmed, your new sessions will be set up automatically and ${coachName} will be ready to continue working with you.

If you have any questions, just reply to this email.

Best,
The 21-Day AI SaaS Challenge Team` + TRANSACTIONAL_FOOTER,
    recipientName: firstName,
    templateKey: 'coaching_rebook',
  });
}

// Coach invitation email
export async function sendCoachInvitationEmail(email: string, setupLink: string): Promise<boolean> {
  try {
    await sendAndLog({
      to: email,
      subject: 'You\'ve been invited to coach on the 21-Day AI SaaS Challenge',
      text: `Hi there,

You've been invited to join the 21-Day AI SaaS Challenge as a coach.

Before you can start coaching, you'll need to:
1. Review and sign the Independent Contractor Agreement
2. Set up your coach profile

Click the link below to get started:
${setupLink}

This invitation link expires in 7 days.

If you have any questions, just reply to this email.

Matt` + TRANSACTIONAL_FOOTER,
      templateKey: 'coach_invitation',
    });
    console.log('Coach invitation email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send coach invitation email:', error);
    return false;
  }
}

// Send signed coach agreement copy to Matt
export async function sendCoachAgreementCopyEmail(params: {
  coachName: string;
  coachEmail: string;
  signedAt: string;
  ipAddress: string;
  signatureName: string;
  agreementText: string;
}): Promise<boolean> {
  const { coachName, coachEmail, signedAt, ipAddress, signatureName, agreementText } = params;
  try {
    await sendAndLog({
      to: 'matt@mattwebley.com',
      subject: `Signed Coach Agreement: ${coachName}`,
      text: `SIGNED INDEPENDENT CONTRACTOR AGREEMENT

COACH DETAILS
--------------
Name: ${coachName}
Email: ${coachEmail}
Signed At: ${signedAt}
IP Address: ${ipAddress}
E-Signature: ${signatureName}

FULL AGREEMENT TEXT
-------------------
${agreementText}

--
This is an automated record. Store for your records.`,
      templateKey: 'coach_agreement_copy',
    });
    console.log('Coach agreement copy email sent for:', coachName);
    return true;
  } catch (error) {
    console.error('Failed to send coach agreement copy email:', error);
    return false;
  }
}

// Send Cal.com webhook setup instructions to a coach
export async function sendCalcomSetupEmail(params: {
  to: string;
  coachName: string;
  webhookUrl: string;
  webhookSecret: string | null;
}): Promise<boolean> {
  const { to, coachName, webhookUrl, webhookSecret } = params;
  try {
    const secretSection = webhookSecret
      ? `\n5. Under "Secret", paste this: ${webhookSecret}\n   (This verifies the webhook is really from Cal.com)\n`
      : '';

    await sendAndLog({
      to,
      subject: 'Action needed: Connect your Cal.com calendar to the coaching platform',
      text: `Hi ${coachName},

To automatically sync your bookings with the coaching platform, please add a webhook in your Cal.com account. This takes about 2 minutes.

HOW TO SET IT UP:
-----------------

1. Log into Cal.com and go to Settings → Developer → Webhooks
   (Direct link: https://app.cal.com/settings/developer/webhooks)

2. Click "New Webhook"

3. Set the Subscriber URL to:
   ${webhookUrl}

4. Under "Event Triggers", select these 3 events:
   - Booking Created
   - Booking Rescheduled
   - Booking Cancelled
${secretSection}
6. Click "Save"

That's it! Once this is set up, when a client books, reschedules, or cancels a session through your Cal.com link, the coaching platform will update automatically.

WHAT THIS DOES:
- When a client books → their session shows as "Booked" with the date/time
- When they reschedule → the date updates automatically
- When they cancel → the session goes back to "Available" so they can rebook

If you have any issues setting this up, just reply to this email.

Matt` + TRANSACTIONAL_FOOTER,
      templateKey: 'calcom_setup_instructions',
    });
    console.log('Cal.com setup instructions sent to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send Cal.com setup email:', error);
    return false;
  }
}
