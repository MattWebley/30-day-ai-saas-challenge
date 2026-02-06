import { Resend } from 'resend';
import { storage } from './storage';

const FROM_EMAIL = 'Matt Webley <matt@challenge.mattwebley.com>';
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
    // Log success (fire and forget — don't let logging failures break email sending)
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
  const defaultBody = `You're In, {{firstName}}!

Welcome to the 21-Day AI SaaS Challenge.

ORDER CONFIRMED
---------------
21-Day AI SaaS Challenge
Total: {{currencySymbol}}{{total}}

WHAT'S NEXT
-----------
1. Log in and start Day 0
2. Complete one day at a time at your own pace
3. The challenge covers 21 days of lessons and exercises

Start now: https://challenge.mattwebley.com/dashboard

Questions? Just reply to this email.

- Matt

--
21-Day AI SaaS Challenge
You're receiving this because you purchased the challenge.`;

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

YOUR COACHING PACKAGE
---------------------
4 x 1-Hour Sessions

What's included:
- 1:1 video calls
- Screen sharing

Total: ${currencySymbol}${amount}

HOW TO BOOK YOUR SESSIONS
-------------------------
I'll email you within 24 hours with a booking link.

Questions? Just reply to this email.

- Matt

--
21-Day AI SaaS Challenge
You're receiving this because you purchased coaching.
`,
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

If you didn't request this, you can safely ignore this email — your password won't be changed.

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
