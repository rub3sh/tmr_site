import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateVideoOTP } from '@/lib/vdocipher';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json({ error: 'videoId required' }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { lesson: { include: { course: true } } },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Allow free videos without purchase check
    if (!video.isFree) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: video.lesson.courseId,
          },
        },
      });

      // Also check plan-based access
      const planAccess = await prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
          plan: {
            planCourses: { some: { courseId: video.lesson.courseId } },
          },
        },
      });

      if ((!purchase || purchase.status !== 'COMPLETED') && !planAccess) {
        return NextResponse.json({ error: 'No access to this content' }, { status: 403 });
      }
    }

    if (!video.vdoCipherId) {
      return NextResponse.json({ error: 'Video not configured' }, { status: 400 });
    }

    const otpData = await generateVideoOTP(video.vdoCipherId, session.user.email);
    return NextResponse.json(otpData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
