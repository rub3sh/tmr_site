import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const progressUpdateSchema = z.object({
  videoId: z.string().min(1),
  watchedSec: z.number().int().nonnegative(),
  totalSec: z.number().int().nonnegative(),
  lastPositionSec: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = req.nextUrl.searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    }

    const progress = await prisma.videoProgress.findMany({
      where: {
        userId: session.user.id,
        video: { lesson: { courseId } },
      },
      include: {
        video: {
          select: { id: true, title: true, sortOrder: true, durationSec: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: progress });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = progressUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { videoId, watchedSec, totalSec, lastPositionSec, completed } = parsed.data;

    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
      create: {
        userId: session.user.id,
        videoId,
        watchedSec,
        totalSec,
        lastPositionSec,
        completed: completed ?? false,
      },
      update: {
        watchedSec,
        totalSec,
        lastPositionSec,
        ...(completed !== undefined ? { completed } : {}),
      },
    });

    return NextResponse.json({ success: true, data: progress });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
