'use client';

interface Lesson {
  id: string;
  title: string;
  durationSec: number;
  sortOrder: number;
  isFree: boolean;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
}

interface LessonSidebarProps {
  lessons: Lesson[];
  progress: LessonProgress[];
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  hasAccess: boolean;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function LessonSidebar({
  lessons,
  progress,
  currentLessonId,
  onSelectLesson,
  hasAccess,
}: LessonSidebarProps) {
  return (
    <div className="w-80 bg-black-900 border-l border-white/10 overflow-y-auto">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-heading font-semibold text-sm">Course Content</h3>
        <p className="text-xs text-white/30 mt-1">
          {progress.filter((p) => p.completed).length}/{lessons.length} completed
        </p>
      </div>

      <div className="divide-y divide-surface-800">
        {lessons.map((lesson, index) => {
          const isActive = lesson.id === currentLessonId;
          const lessonProgress = progress.find((p) => p.lessonId === lesson.id);
          const isCompleted = lessonProgress?.completed ?? false;
          const isLocked = !hasAccess && !lesson.isFree;

          return (
            <button
              key={lesson.id}
              onClick={() => !isLocked && onSelectLesson(lesson.id)}
              disabled={isLocked}
              className={`
                w-full text-left p-4 flex items-start gap-3 transition-all duration-200
                ${isActive ? 'bg-accent/10 border-l-2 border-primary' : 'hover:bg-black-800'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Status icon */}
              <div className="mt-0.5 flex-shrink-0">
                {isLocked ? (
                  <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : isCompleted ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <span className="text-xs text-white/30 font-mono w-4 text-center">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Lesson info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isActive ? 'text-accent font-medium' : 'text-white/50'}`}>
                  {lesson.title}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  {formatDuration(lesson.durationSec)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
