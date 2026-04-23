'use client';

import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Trash2 } from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  priceInPaise: number;
  status: string;
  lessons: Array<{ videos: unknown[] }>;
  planCourses: Array<{ plan: { name: string } }>;
  _count: { purchases: number };
}

function formatPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);
}

export function CoursesClient({ initialCourses }: { initialCourses: CourseItem[] }) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent, course: CourseItem): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${course.title}"? This will remove all modules, videos, and student progress for this course.`)) return;
    const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Courses</h1>
          <p className="mt-1 text-sm text-white/40">Manage your course catalog</p>
        </div>
        <button onClick={() => router.push('/admin/courses/new')}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90">
          <Plus size={16} /> Create Course
        </button>
      </div>

      {initialCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-20">
          <BookOpen size={48} className="text-white/10" />
          <p className="mt-4 text-sm text-white/30">No courses yet</p>
          <button onClick={() => router.push('/admin/courses/new')}
            className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10">
            Create your first course
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {initialCourses.map((course) => {
            const totalVideos = course.lessons?.reduce((acc, l) => acc + (l.videos?.length ?? 0), 0) ?? 0;
            const plans = course.planCourses?.map((pc) => pc.plan.name) ?? [];

            return (
              <div
                key={course.id}
                onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt="" className="h-16 w-24 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-white/5">
                      <BookOpen size={20} className="text-white/20" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{course.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-white/30">
                      <span>{course.lessons?.length ?? 0} modules</span>
                      <span>{totalVideos} videos</span>
                      <span>{course._count?.purchases ?? 0} students</span>
                      <span>{formatPrice(course.priceInPaise)}</span>
                    </div>
                    {plans.length > 0 && (
                      <div className="mt-2 flex gap-1.5">
                        {plans.map((p) => (
                          <span key={p} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    course.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {course.status}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, course)}
                    className="rounded p-1.5 text-white/10 transition hover:bg-red-500/10 hover:text-red-400"
                    title="Delete course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
