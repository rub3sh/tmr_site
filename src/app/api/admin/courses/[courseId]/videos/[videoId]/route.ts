import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { courseId: string; videoId: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, videoUrl, vdoCipherId, durationSec, isFree, isPreview, lessonId, sortOrder } = await req.json();

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
  if (vdoCipherId !== undefined) updateData.vdoCipherId = vdoCipherId;
  if (durationSec !== undefined) updateData.durationSec = durationSec;
  if (isFree !== undefined) updateData.isFree = isFree;
  if (isPreview !== undefined) updateData.isPreview = isPreview;
  if (lessonId !== undefined) updateData.lessonId = lessonId;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  const video = await prisma.video.update({
    where: { id: params.videoId },
    data: updateData,
  });

  return NextResponse.json({ success: true, data: video });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.video.delete({ where: { id: params.videoId } });

  await prisma.course.update({
    where: { id: params.courseId },
    data: { totalVideos: { decrement: 1 } },
  });

  return NextResponse.json({ success: true });
}
