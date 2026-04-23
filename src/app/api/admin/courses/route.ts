import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    title, slug, description, shortDesc, thumbnailUrl, priceInPaise,
    taxMode, taxPercent, difficulty, category, status, lessons, planIds,
  } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug required' }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description: description || '',
      shortDesc: shortDesc || '',
      thumbnailUrl: thumbnailUrl || '',
      priceInPaise: priceInPaise || 0,
      taxMode: taxMode || 'INCLUSIVE',
      taxPercent: taxPercent ?? 18,
      difficulty: difficulty || 'BEGINNER',
      category: category || null,
      status: status || 'DRAFT',
      isPublished: status === 'PUBLISHED',
      totalLessons: lessons?.length ?? 0,
      totalVideos: lessons?.reduce((acc: number, l: { videos?: unknown[] }) => acc + (l.videos?.length ?? 0), 0) ?? 0,
      lessons: {
        create: (lessons ?? []).map((lesson: {
          title: string;
          description?: string;
          videos?: Array<{ title: string; videoUrl: string; durationSec?: number; isFree?: boolean; isPreview?: boolean }>;
          attachments?: Array<{ type: string; title: string; url: string }>;
        }, li: number) => ({
          title: lesson.title || `Lesson ${li + 1}`,
          description: lesson.description || null,
          sortOrder: li,
          videos: {
            create: (lesson.videos ?? []).map((video, vi: number) => ({
              title: video.title || `Video ${vi + 1}`,
              videoUrl: video.videoUrl || '',
              durationSec: video.durationSec || 0,
              sortOrder: vi,
              isFree: video.isFree || false,
              isPreview: video.isPreview || false,
            })),
          },
          attachments: {
            create: (lesson.attachments ?? []).map((att) => ({
              type: att.type || 'PDF',
              title: att.title || '',
              url: att.url || '',
            })),
          },
        })),
      },
      planCourses: {
        create: (planIds ?? []).map((planId: string) => ({
          planId,
        })),
      },
    },
  });

  return NextResponse.json({ success: true, data: course });
}
