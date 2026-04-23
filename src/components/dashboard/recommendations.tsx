'use client';

import Link from 'next/link';
import { formatPrice } from '@/types/course';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  priceInPaise: number;
  currency: string;
  _count: { lessons: number };
}

export function Recommendations({ courses }: { courses: Course[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-semibold">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl bg-black-900 border border-white/10 p-5 space-y-3"
          >
            <h3 className="font-heading font-semibold">{course.title}</h3>
            <p className="text-white/40 text-sm line-clamp-2">{course.shortDesc}</p>
            <div className="flex items-center justify-between">
              <span className="text-accent font-heading font-bold">
                {formatPrice(course.priceInPaise, course.currency)}
              </span>
              <span className="text-white/30 text-xs">
                {course._count.lessons} lessons
              </span>
            </div>
            <Link href={`/courses/${course.slug}`}>
              <Button variant="secondary" size="sm" className="w-full">
                View Course
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
