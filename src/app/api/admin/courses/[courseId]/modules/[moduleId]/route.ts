import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { courseId: string; moduleId: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, sortOrder } = await req.json();
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  const module = await prisma.lesson.update({
    where: { id: params.moduleId },
    data: updateData,
    include: { videos: true, attachments: true },
  });

  return NextResponse.json({ success: true, data: module });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const module = await prisma.lesson.findUnique({
    where: { id: params.moduleId },
    include: { _count: { select: { videos: true } } },
  });

  await prisma.lesson.delete({ where: { id: params.moduleId } });

  await prisma.course.update({
    where: { id: params.courseId },
    data: {
      totalLessons: { decrement: 1 },
      totalVideos: { decrement: module?._count.videos ?? 0 },
    },
  });

  return NextResponse.json({ success: true });
}
