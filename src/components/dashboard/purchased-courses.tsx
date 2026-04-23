'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CourseProgressItem {
  courseId: string;
  courseTitle: string;
  slug: string;
  thumbnailUrl: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
}

interface PurchasedCoursesProps {
  courses: CourseProgressItem[];
}

export function PurchasedCourses({ courses }: PurchasedCoursesProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl bg-black-900 border border-white/10 p-12 text-center">
        <p className="text-white/40 text-lg">No courses yet</p>
        <p className="text-white/30 text-sm mt-2">
          Purchase your first course to begin the journey.
        </p>
        <Link href="/#courses" className="mt-4 inline-block">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-semibold">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.courseId}
            href={`/dashboard/courses/${course.courseId}`}
            className="group"
          >
            <div className="rounded-xl bg-black-900 border border-white/10 overflow-hidden hover:border-primary/30 transition-all duration-300">
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
              >
                <div className="h-full w-full bg-gradient-to-t from-surface-900 to-transparent" />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-heading font-semibold group-hover:text-accent transition-colors">
                  {course.courseTitle}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">
                      {course.completedLessons}/{course.totalLessons} lessons
                    </span>
                    <span className="text-accent font-medium">{course.percentComplete}%</span>
                  </div>
                  <div className="h-1.5 bg-black-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full transition-all duration-500"
                      style={{ width: `${course.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full">
                  {course.percentComplete > 0 ? 'Continue' : 'Start Learning'}
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
