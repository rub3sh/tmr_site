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

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      lessons: {
        orderBy: { sortOrder: 'asc' },
        include: {
          videos: { orderBy: { sortOrder: 'asc' } },
          attachments: true,
        },
      },
      planCourses: { include: { plan: { select: { id: true, name: true } } } },
      _count: { select: { purchases: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: course });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, description, shortDesc, thumbnailUrl, priceInPaise, taxMode, taxPercent, difficulty, category, status, planIds } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description;
  if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
  if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
  if (priceInPaise !== undefined) updateData.priceInPaise = priceInPaise;
  if (taxMode !== undefined) updateData.taxMode = taxMode;
  if (taxPercent !== undefined) updateData.taxPercent = taxPercent;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (category !== undefined) updateData.category = category;
  if (status !== undefined) {
    updateData.status = status;
    updateData.isPublished = status === 'PUBLISHED';
  }

  const course = await prisma.course.update({
    where: { id: params.courseId },
    data: updateData,
  });

  if (planIds !== undefined) {
    await prisma.planCourse.deleteMany({ where: { courseId: params.courseId } });
    if (planIds.length > 0) {
      await prisma.planCourse.createMany({
        data: planIds.map((planId: string) => ({ planId, courseId: params.courseId })),
      });
    }
  }

  return NextResponse.json({ success: true, data: course });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.course.delete({ where: { id: params.courseId } });
  return NextResponse.json({ success: true });
}
