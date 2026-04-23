import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { courseId: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { lessonId, title, videoUrl, vdoCipherId, durationSec, isFree, isPreview } = await req.json();

  if (!lessonId || !title) {
    return NextResponse.json({ error: 'Module and title required' }, { status: 400 });
  }

  const module = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!module || module.courseId !== params.courseId) {
    return NextResponse.json({ error: 'Module not found in this course' }, { status: 404 });
  }

  const lastVideo = await prisma.video.findFirst({
    where: { lessonId },
    orderBy: { sortOrder: 'desc' },
  });

  const video = await prisma.video.create({
    data: {
      lessonId,
      title,
      videoUrl: videoUrl || '',
      vdoCipherId: vdoCipherId || null,
      durationSec: durationSec || 0,
      sortOrder: (lastVideo?.sortOrder ?? -1) + 1,
      isFree: isFree || false,
      isPreview: isPreview || false,
    },
  });

  await prisma.course.update({
    where: { id: params.courseId },
    data: { totalVideos: { increment: 1 } },
  });

  return NextResponse.json({ success: true, data: video });
}
