import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendInquiryEmail } from '@/lib/resend';

const inquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  message: z.string().min(10).max(2000),
  source: z.string().min(1).max(100).default('web'),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = inquirySchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid inquiry payload' }, { status: 400 });
    }

    const { name, email, message, source } = parsed.data;
    await sendInquiryEmail(name, email, message, source);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inquiry email error:', error);
    return NextResponse.json({ error: 'Failed to send inquiry' }, { status: 500 });
  }
}
