import { prisma } from '@/lib/prisma';
import { CoursesClient } from '@/components/admin/courses-client';

async function getCourses() {
  return prisma.course.findMany({
    include: {
      lessons: { select: { videos: { select: { id: true } } } },
      planCourses: { include: { plan: { select: { name: true } } } },
      _count: { select: { purchases: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminCoursesPage() {
  let courses: Awaited<ReturnType<typeof getCourses>> = [];
  try {
    courses = await getCourses();
  } catch {
    // DB not ready
  }

  return <CoursesClient initialCourses={JSON.parse(JSON.stringify(courses))} />;
}
