import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10),
  shortDesc: z.string().min(10).max(300),
  thumbnailUrl: z.string().url(),
  previewVideoId: z.string().optional(),
  priceInPaise: z.number().int().positive(),
  currency: z.string().default('INR'),
  isPublished: z.boolean().default(false),
});

export const createLessonSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  vdoCipherId: z.string().min(1),
  durationSec: z.number().int().nonnegative().default(0),
  sortOrder: z.number().int().nonnegative(),
  isFree: z.boolean().default(false),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
