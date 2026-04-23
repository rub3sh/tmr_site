import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@inneredgecapital.com';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '#';
  }

  return '#';
}

export async function sendWelcomeEmail(
  to: string,
  password: string,
  loginUrl: string
) {
  const safeEmail = escapeHtml(to);
  const safePassword = escapeHtml(password);
  const safeLoginUrl = sanitizeHttpUrl(loginUrl);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to InnerEdgeCapital — Your Credentials',
    html: `
      <div style="font-family: 'Inter', sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F7BF7; font-size: 28px; margin: 0;">InnerEdgeCapital</h1>
          <p style="color: #737373; margin-top: 8px;">Your journey into precision trading begins</p>
        </div>
        <div style="background: #171717; border: 1px solid #404040; border-radius: 12px; padding: 30px; margin-bottom: 24px;">
          <h2 style="color: #4F7BF7; font-size: 18px; margin: 0 0 16px;">Your Login Credentials</h2>
          <p style="color: #A3A3A3; margin: 0 0 8px;">Email: <strong style="color: #FFFFFF;">${safeEmail}</strong></p>
          <p style="color: #A3A3A3; margin: 0 0 20px;">Password: <strong style="color: #4F7BF7;">${safePassword}</strong></p>
          <a href="${safeLoginUrl}" style="display: inline-block; background: linear-gradient(135deg, #3A63D8, #4F7BF7, #6B91FF); color: #0A0A0A; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Login Now
          </a>
        </div>
        <p style="color: #525252; font-size: 12px; text-align: center;">
          Please change your password after your first login.
        </p>
      </div>
    `,
  });
}

export async function sendPurchaseConfirmation(
  to: string,
  courseTitle: string,
  amount: string
) {
  const safeCourseTitle = escapeHtml(courseTitle);
  const safeAmount = escapeHtml(amount);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Purchase Confirmed — ${safeCourseTitle}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F7BF7; font-size: 28px; margin: 0;">Purchase Confirmed</h1>
        </div>
        <div style="background: #171717; border: 1px solid #404040; border-radius: 12px; padding: 30px;">
          <p style="color: #A3A3A3; margin: 0 0 8px;">Course: <strong style="color: #FFFFFF;">${safeCourseTitle}</strong></p>
          <p style="color: #A3A3A3; margin: 0 0 20px;">Amount: <strong style="color: #4F7BF7;">${safeAmount}</strong></p>
          <p style="color: #A3A3A3;">You can now access the course from your dashboard.</p>
        </div>
      </div>
    `,
  });
}

export async function sendInquiryEmail(
  name: string,
  email: string,
  message: string,
  source: string
) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  const safeSource = escapeHtml(source);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: process.env.RESEND_INQUIRY_TO || 'support@inneredgecapital.com',
    subject: 'New Indicator Inquiry',
    html: `
      <div style="font-family: 'Inter', sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 40px; max-width: 640px; margin: 0 auto;">
        <h1 style="color: #4F7BF7; font-size: 24px; margin: 0 0 16px;">New Inquiry Received</h1>
        <div style="background: #171717; border: 1px solid #404040; border-radius: 12px; padding: 24px;">
          <p style="color: #A3A3A3; margin: 0 0 8px;">Name: <strong style="color: #FFFFFF;">${safeName}</strong></p>
          <p style="color: #A3A3A3; margin: 0 0 8px;">Email: <strong style="color: #FFFFFF;">${safeEmail}</strong></p>
          <p style="color: #A3A3A3; margin: 0 0 16px;">Source: <strong style="color: #FFFFFF;">${safeSource}</strong></p>
          <p style="color: #A3A3A3; margin: 0 0 6px;">Message:</p>
          <p style="color: #FFFFFF; white-space: pre-line; margin: 0;">${safeMessage}</p>
        </div>
      </div>
    `,
  });
}
