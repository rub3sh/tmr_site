import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLessonSchema } from '@/validators/course';

interface RouteContext {
  params: { courseId: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: params.courseId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, vdoCipherId, durationSec, sortOrder, isFree } = parsed.data;
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        vdoCipherId,
        durationSec: durationSec ?? 0,
        sortOrder,
        isFree: isFree ?? false,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
