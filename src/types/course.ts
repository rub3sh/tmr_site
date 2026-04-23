export interface CourseWithLessons {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  thumbnailUrl: string;
  previewVideoId: string | null;
  priceInPaise: number;
  currency: string;
  isPublished: boolean;
  lessons: LessonSummary[];
  _count?: {
    purchases: number;
  };
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  durationSec: number;
  sortOrder: number;
  isFree: boolean;
}

export interface LessonWithProgress extends LessonSummary {
  vdoCipherId: string;
  progress?: {
    watchedSec: number;
    totalSec: number;
    completed: boolean;
    lastPositionSec: number;
  } | null;
}

export function formatPrice(paise: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(paise / 100);
}
