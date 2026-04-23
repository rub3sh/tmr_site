'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatPrice } from '@/types/course';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  thumbnailUrl: string;
  priceInPaise: number;
  currency: string;
  lessonCount: number;
}

export function CourseCard3D({
  id,
  slug,
  title,
  shortDesc,
  thumbnailUrl,
  priceInPaise,
  currency,
  lessonCount,
}: CourseCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 w-full h-[400px] cursor-pointer group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden border border-white/10 bg-black-900">
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          >
            <div className="h-full w-full bg-gradient-to-t from-surface-900 to-transparent" />
          </div>
          <div className="p-6 space-y-3">
            <h3 className="text-xl font-heading font-bold line-clamp-2">{title}</h3>
            <p className="text-white/40 text-sm">{lessonCount} lessons</p>
            <p className="text-2xl font-heading font-bold text-gradient-accent">
              {formatPrice(priceInPaise, currency)}
            </p>
          </div>
          {/* Gold glow on hover */}
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/30 rounded-xl transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(79,123,247,0.15)]" />
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden border border-primary/30 bg-black-900 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-accent">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{shortDesc}</p>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
              {lessonCount} premium lessons
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-2xl font-heading font-bold text-gradient-accent">
              {formatPrice(priceInPaise, currency)}
            </p>
            <Link href={`/courses/${slug}`}>
              <Button className="w-full">View Course</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* Mobile: auto-rotating carousel card */
export function CourseCardMobile({
  slug,
  title,
  shortDesc,
  priceInPaise,
  currency,
  lessonCount,
}: Omit<CourseCardProps, 'thumbnailUrl'>) {
  return (
    <Link href={`/courses/${slug}`}>
      <div className="rounded-xl border border-white/10 bg-black-900 p-5 space-y-3 hover:border-primary/30 transition-all duration-300">
        <h3 className="text-lg font-heading font-bold">{title}</h3>
        <p className="text-white/40 text-sm line-clamp-2">{shortDesc}</p>
        <div className="flex items-center justify-between">
          <span className="text-accent font-heading font-bold">
            {formatPrice(priceInPaise, currency)}
          </span>
          <span className="text-white/30 text-xs">{lessonCount} lessons</span>
        </div>
      </div>
    </Link>
  );
}
