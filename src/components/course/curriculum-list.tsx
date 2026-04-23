'use client';

import { useState } from 'react';
import type { LessonSummary } from '@/types/course';
import { Badge } from '@/components/ui/badge';

interface CurriculumListProps {
  lessons: LessonSummary[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function CurriculumList({ lessons }: CurriculumListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-bold">Curriculum</h2>
        <p className="text-white/40">
          {lessons.length} lessons &middot;{' '}
          {formatDuration(lessons.reduce((s, l) => s + l.durationSec, 0))} total
        </p>
      </div>

      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <button
            key={lesson.id}
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            className="w-full text-left rounded-lg border border-white/10 bg-black-900 hover:border-white/10 transition-all duration-200"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white/20 text-sm font-mono w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {lesson.isFree ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                <span className="font-medium text-sm">{lesson.title}</span>
                {lesson.isFree && <Badge variant="green">Free Preview</Badge>}
              </div>
              <span className="text-white/30 text-sm">
                {formatDuration(lesson.durationSec)}
              </span>
            </div>
            {expandedIndex === i && lesson.description && (
              <div className="px-4 pb-4 pl-14">
                <p className="text-white/40 text-sm">{lesson.description}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
