import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Lock, Play, CheckCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

async function getLibraryData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: {
          plan: {
            include: {
              planCourses: { select: { courseId: true } },
            },
          },
        },
      },
      purchases: {
        where: { status: 'COMPLETED' },
        select: { courseId: true },
      },
      videoProgress: {
        select: { videoId: true, completed: true },
      },
    },
  });

  if (!user) return { courses: [], accessibleCourseIds: new Set<string>(), progressMap: new Map<string, { completed: number; total: number }>() };

  const planCourseIds = user.subscriptions.flatMap(
    (s) => s.plan.planCourses.map((pc) => pc.courseId)
  );

  const purchasedCourseIds = user.purchases.map((p) => p.courseId);
  const accessibleCourseIds = new Set([...planCourseIds, ...purchasedCourseIds]);

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      lessons: {
        include: {
          videos: { select: { id: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const completedVideoIds = new Set(
    user.videoProgress.filter((p) => p.completed).map((p) => p.videoId)
  );

  const progressMap = new Map<string, { completed: number; total: number }>();
  for (const course of courses) {
    const allVideoIds = course.lessons.flatMap((l) => l.videos.map((v) => v.id));
    const completed = allVideoIds.filter((id) => completedVideoIds.has(id)).length;
    progressMap.set(course.id, { completed, total: allVideoIds.length });
  }

  return { courses, accessibleCourseIds, progressMap };
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [{ courses, accessibleCourseIds, progressMap }] = await Promise.all([
    getLibraryData(session.user.id),
  ]);

  const inProgressCourse = courses.find((c) => {
    if (!accessibleCourseIds.has(c.id)) return false;
    const progress = progressMap.get(c.id);
    return progress && progress.completed > 0 && progress.completed < progress.total;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Library</h1>
        <p className="mt-1 text-sm text-white/40">Your learning hub</p>
      </div>

      {/* Continue Watching */}
      {inProgressCourse && (
        <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
            Continue Watching
          </p>
          <Link href={`/student/courses/${inProgressCourse.id}`} className="group flex items-center gap-4">
            <div className="relative flex h-20 w-32 items-center justify-center rounded-xl bg-white/5 overflow-hidden">
              {inProgressCourse.thumbnailUrl ? (
                <img src={inProgressCourse.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <Play size={24} className="text-white/20" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <Play size={28} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-white/80">
                {inProgressCourse.title}
              </h3>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 w-32 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/60"
                    style={{
                      width: `${
                        ((progressMap.get(inProgressCourse.id)?.completed ?? 0) /
                          Math.max(progressMap.get(inProgressCourse.id)?.total ?? 1, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-white/30">
                  {progressMap.get(inProgressCourse.id)?.completed}/{progressMap.get(inProgressCourse.id)?.total} videos
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const hasAccess = accessibleCourseIds.has(course.id);
          const progress = progressMap.get(course.id);
          const pct = progress && progress.total > 0
            ? Math.round((progress.completed / progress.total) * 100)
            : 0;
          const isCompleted = progress && progress.total > 0 && progress.completed === progress.total;

          return (
            <Link
              key={course.id}
              href={hasAccess ? `/student/courses/${course.id}` : '#'}
              className={`group relative rounded-2xl border bg-white/[0.02] transition-all duration-300 ${
                hasAccess
                  ? 'border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                  : 'border-white/[0.03] opacity-60'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-white/5">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen size={32} className="text-white/10" />
                  </div>
                )}
                {!hasAccess && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Lock size={24} className="text-white/40" />
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute right-3 top-3 rounded-full bg-green-500/20 p-1.5">
                    <CheckCircle size={14} className="text-green-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-white">{course.title}</h3>
                <p className="mt-1 text-xs text-white/30 line-clamp-2">
                  {course.shortDesc}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-white/20">
                    {course.lessons.length} lessons
                  </span>
                  {hasAccess && progress && progress.total > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white/50"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/25">{pct}%</span>
                    </div>
                  )}
                  {!hasAccess && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/30">
                      Upgrade Plan
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <BookOpen size={48} className="text-white/10" />
          <p className="mt-4 text-sm text-white/30">No courses available yet</p>
        </div>
      )}
    </div>
  );
}
