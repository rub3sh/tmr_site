import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { verifyPaymentSchema } from '@/validators/payment';
import { sendPurchaseConfirmation } from '@/lib/resend';
import { formatPrice } from '@/types/course';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update purchase
    const purchase = await prisma.purchase.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'COMPLETED',
      },
      include: {
        user: { select: { email: true } },
        course: { select: { title: true, priceInPaise: true, currency: true } },
      },
    });

    // Send confirmation email
    await sendPurchaseConfirmation(
      purchase.user.email,
      purchase.course.title,
      formatPrice(purchase.course.priceInPaise, purchase.course.currency)
    ).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
