import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Matt from 21 Day Challenge <matt@updates.mattwebley.com>';

export interface EmailParams {
  to: string;
  firstName: string;
}

export interface PurchaseEmailParams extends EmailParams {
  includesPromptPack?: boolean;
  includesLaunchPack?: boolean;
  currency: 'usd' | 'gbp';
  total: number;
}

export interface CoachingEmailParams extends EmailParams {
  currency: 'usd' | 'gbp';
  amount: number;
}

// Send welcome email after main challenge purchase
export async function sendPurchaseConfirmationEmail(params: PurchaseEmailParams): Promise<void> {
  const { to, firstName, includesPromptPack, includesLaunchPack, currency, total } = params;

  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email');
    return;
  }

  const currencySymbol = currency === 'gbp' ? '£' : '$';

  const addOns = [];
  if (includesPromptPack) addOns.push('Sales Letter Pack');
  if (includesLaunchPack) addOns.push('Launch & Marketing Playbook');

  const addOnsList = addOns.length > 0
    ? `<p style="margin: 0 0 8px 0;"><strong>Add-ons:</strong> ${addOns.join(', ')}</p>`
    : '';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `You're in! Welcome to the 21 Day AI SaaS Challenge`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 32px;">
    <div style="width: 64px; height: 64px; background: #22c55e; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
      <span style="color: white; font-size: 32px;">✓</span>
    </div>
    <h1 style="color: #0f172a; margin: 0; font-size: 28px;">You're In, ${firstName}!</h1>
  </div>

  <p style="font-size: 18px; margin-bottom: 24px;">
    Welcome to the 21 Day AI SaaS Challenge. Your journey from idea to launch-ready product starts now.
  </p>

  <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px;">Order Confirmed</h2>
    <p style="margin: 0 0 8px 0;"><strong>21 Day AI SaaS Challenge</strong></p>
    ${addOnsList}
    <p style="margin: 16px 0 0 0; padding-top: 12px; border-top: 1px solid #e2e8f0;">
      <strong>Total:</strong> ${currencySymbol}${total}
    </p>
  </div>

  <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px;">What's Next?</h2>
    <ol style="margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;"><strong>Start Day 0 today</strong> - it only takes 5 minutes</li>
      <li style="margin-bottom: 8px;"><strong>Complete one day at a time</strong> - go at your own pace</li>
      <li style="margin-bottom: 0;"><strong>In 21 days</strong>, you'll have a working product</li>
    </ol>
  </div>

  <div style="text-align: center; margin-bottom: 24px;">
    <a href="https://21daysaas.com/dashboard" style="display: inline-block; background: #22c55e; color: white; font-weight: bold; font-size: 18px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
      Start Day 0 Now →
    </a>
  </div>

  <p style="color: #64748b; font-size: 14px; text-align: center;">
    Questions? Just reply to this email or reach me at matt@mattwebley.com
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
    21 Day AI SaaS Challenge<br/>
    You're receiving this because you purchased the challenge.
  </p>

</body>
</html>
      `,
    });
    console.log('Purchase confirmation email sent to:', to);
  } catch (error) {
    console.error('Failed to send purchase confirmation email:', error);
  }
}

// Send confirmation email after coaching upsell purchase
export async function sendCoachingConfirmationEmail(params: CoachingEmailParams): Promise<void> {
  const { to, firstName, currency, amount } = params;

  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email');
    return;
  }

  const currencySymbol = currency === 'gbp' ? '£' : '$';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Coaching Sessions Confirmed - Let's Build Together!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 32px;">
    <div style="width: 64px; height: 64px; background: #8b5cf6; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
      <span style="color: white; font-size: 32px;">🎯</span>
    </div>
    <h1 style="color: #0f172a; margin: 0; font-size: 28px;">Coaching Confirmed!</h1>
  </div>

  <p style="font-size: 18px; margin-bottom: 24px;">
    Hey ${firstName}, great decision! You've just unlocked 4 hours of 1:1 coaching to supercharge your SaaS build.
  </p>

  <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px;">Your Coaching Package</h2>
    <p style="margin: 0 0 8px 0;"><strong>4 x 1-Hour Live Sessions</strong></p>
    <ul style="margin: 12px 0; padding-left: 20px;">
      <li style="margin-bottom: 4px;">Direct 1:1 video calls</li>
      <li style="margin-bottom: 4px;">Screen share building together</li>
      <li style="margin-bottom: 4px;">Unblock any issue immediately</li>
      <li style="margin-bottom: 0;">Flexible scheduling</li>
    </ul>
    <p style="margin: 16px 0 0 0; padding-top: 12px; border-top: 1px solid #e2e8f0;">
      <strong>Total:</strong> ${currencySymbol}${amount}
    </p>
  </div>

  <div style="background: #fefce8; border: 2px solid #fef08a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px;">How to Book Your Sessions</h2>
    <p style="margin: 0;">
      I'll be in touch within 24 hours with a link to book your first session. Keep an eye on your inbox!
    </p>
  </div>

  <p style="color: #64748b; font-size: 14px; text-align: center;">
    Questions? Reply to this email or reach me at matt@mattwebley.com
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
    21 Day AI SaaS Challenge<br/>
    You're receiving this because you purchased coaching.
  </p>

</body>
</html>
      `,
    });
    console.log('Coaching confirmation email sent to:', to);
  } catch (error) {
    console.error('Failed to send coaching confirmation email:', error);
  }
}
