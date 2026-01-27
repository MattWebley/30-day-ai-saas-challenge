import { Resend } from 'resend';

const FROM_EMAIL = 'Matt Webley <matt@challenge.mattwebley.com>';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not set');
  }
  return {
    client: new Resend(apiKey),
    fromEmail: FROM_EMAIL
  };
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

  try {
    const { client, fromEmail } = getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: `You're in! Welcome to the 21 Day AI SaaS Challenge`,
      text: `You're In, ${firstName}!

Welcome to the 21 Day AI SaaS Challenge. Your journey from idea to launch-ready product starts now.

ORDER CONFIRMED
---------------
21 Day AI SaaS Challenge
Total: ${currencySymbol}${total}

WHAT'S NEXT
-----------
1. Start Day 0 today - it only takes 5 minutes
2. Complete one day at a time - go at your own pace
3. In 21 days, you'll have a working product

Start now: https://21daysaas.com/dashboard

Questions? Just reply to this email.

- Matt

--
21 Day AI SaaS Challenge
You're receiving this because you purchased the challenge.
`,
    });
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
View all testimonials: https://21daysaas.com/admin
`;

  try {
    const { client, fromEmail } = getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: [recipient],
      subject: `New Challenge Testimonial from ${userName}`,
      text: body,
    });
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
View all requests: https://21daysaas.com/admin
`;

  try {
    const { client, fromEmail } = getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: [recipient],
      subject: `New Critique Request from ${userName}`,
      text: body,
    });
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
    const { client, fromEmail } = getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Your Sales Page Video Critique is Ready!`,
      text: `Hey ${firstName}!

Your sales page video critique is ready. I've recorded a detailed walkthrough with specific suggestions to improve your conversions.

WATCH YOUR CRITIQUE
-------------------
${videoUrl}

In this video, I cover:
- First impressions and headline analysis
- Structure and flow improvements
- Specific copy suggestions
- Call-to-action optimization
- Quick wins you can implement today

After watching, if you have questions or want to discuss any of the suggestions, just reply to this email.

Looking forward to seeing your improved sales page!

- Matt

--
21 Day AI SaaS Challenge
`,
    });
    console.log('Critique completed email sent to:', to);
  } catch (error) {
    console.error('Failed to send critique completed email:', error);
  }
}

export async function sendCoachingConfirmationEmail(params: CoachingEmailParams): Promise<void> {
  const { to, firstName, currency, amount } = params;
  const currencySymbol = currency === 'gbp' ? '£' : '$';

  try {
    const { client, fromEmail } = getResendClient();
    await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Coaching Sessions Confirmed - Let's Build Together!`,
      text: `Coaching Confirmed!

Hey ${firstName}, great decision! You've just unlocked 4 hours of 1:1 coaching to supercharge your SaaS build.

YOUR COACHING PACKAGE
---------------------
4 x 1-Hour Live Sessions

- Direct 1:1 video calls
- Screen share building together
- Unblock any issue immediately
- Flexible scheduling

Total: ${currencySymbol}${amount}

HOW TO BOOK YOUR SESSIONS
-------------------------
I'll be in touch within 24 hours with a link to book your first session. Keep an eye on your inbox!

Questions? Just reply to this email.

- Matt

--
21 Day AI SaaS Challenge
You're receiving this because you purchased coaching.
`,
    });
    console.log('Coaching confirmation email sent to:', to);
  } catch (error) {
    console.error('Failed to send coaching confirmation email:', error);
  }
}
