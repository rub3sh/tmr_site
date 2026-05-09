import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseDetail } from '@/components/course/course-detail';
import { CurriculumList } from '@/components/course/curriculum-list';
import { BuyButton } from '@/components/course/buy-button';
import { formatPrice } from '@/types/course';

interface CoursePageProps {
  params: { courseId: string };
}

async function getCourse(slugOrId: string) {
  return prisma.course.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      isPublished: true,
    },
    include: {
      lessons: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          durationSec: true,
          sortOrder: true,
          isFree: true,
        },
      },
      _count: { select: { purchases: true } },
    },
  });
}

export async function generateMetadata({ params }: CoursePageProps) {
  const course = await getCourse(params.courseId);
  if (!course) return { title: 'Course Not Found' };
  return {
    title: `${course.title} — TheMarketRevelation`,
    description: course.shortDesc,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourse(params.courseId);
  if (!course) notFound();

  const totalDuration = course.lessons.reduce((sum, l) => sum + l.durationSec, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="grid lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-3 space-y-6">
              <span className="text-accent text-sm font-medium tracking-[0.2em] uppercase">
                Premium Course
              </span>
              <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
                {course.title}
              </h1>
              <p className="text-white/50 text-lg leading-relaxed">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-white/40">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  </svg>
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} of content
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {course.lessons.length} lessons
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  DRM Protected
                </span>
              </div>
            </div>

            {/* Buy Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 rounded-xl border border-white/10 bg-black-900 p-8 space-y-6">
                {course.previewVideoId && (
                  <CourseDetail previewVideoId={course.previewVideoId} />
                )}
                <div className="space-y-2">
                  <p className="text-4xl font-heading font-bold text-gradient-accent">
                    {formatPrice(course.priceInPaise, course.currency)}
                  </p>
                  <p className="text-white/30 text-sm">One-time payment. Lifetime access.</p>
                </div>
                <BuyButton
                  courseId={course.id}
                  courseTitle={course.title}
                  priceInPaise={course.priceInPaise}
                  currency={course.currency}
                />
                <div className="pt-4 border-t border-white/10 space-y-2 text-sm text-white/40">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Instant access after payment
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Resume where you left off
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Secure DRM-protected video
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum */}
          <CurriculumList lessons={course.lessons} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
