import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { courseId: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const modules = await prisma.lesson.findMany({
    where: { courseId: params.courseId },
    include: {
      videos: { orderBy: { sortOrder: 'asc' } },
      attachments: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ success: true, data: modules });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description } = await req.json();
  if (!title) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 });
  }

  const lastModule = await prisma.lesson.findFirst({
    where: { courseId: params.courseId },
    orderBy: { sortOrder: 'desc' },
  });

  const module = await prisma.lesson.create({
    data: {
      courseId: params.courseId,
      title,
      description: description || null,
      sortOrder: (lastModule?.sortOrder ?? -1) + 1,
    },
    include: { videos: true, attachments: true },
  });

  await prisma.course.update({
    where: { id: params.courseId },
    data: { totalLessons: { increment: 1 } },
  });

  return NextResponse.json({ success: true, data: module });
}
