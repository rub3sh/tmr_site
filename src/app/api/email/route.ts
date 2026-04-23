import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPurchaseConfirmation } from '@/lib/resend';

// Internal-only email endpoint (called server-side only)
export async function POST(req: NextRequest) {
  // Verify internal call via secret header
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { type, ...data } = await req.json();

    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(data.email, data.password, data.loginUrl);
        break;
      case 'purchase':
        await sendPurchaseConfirmation(data.email, data.courseTitle, data.amount);
        break;
      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
