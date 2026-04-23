export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  lastWatchedLessonId: string | null;
  lastWatchedAt: string | null;
}

export interface LessonProgress {
  lessonId: string;
  watchedSec: number;
  totalSec: number;
  completed: boolean;
  lastPositionSec: number;
}
