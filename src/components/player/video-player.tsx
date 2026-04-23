'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { VideoWatermark } from './video-watermark';
import { TabBlurGuard } from './tab-blur-guard';
import { useVideoProtection } from '@/hooks/use-video-protection';
import { Spinner } from '@/components/ui/spinner';
import { PROGRESS_UPDATE_INTERVAL_MS } from '@/lib/constants';

interface VideoPlayerProps {
  lessonId: string;
  userEmail: string;
  lastPosition?: number;
  onProgress?: (watchedSec: number, totalSec: number, position: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({
  lessonId,
  userEmail,
  lastPosition = 0,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useVideoProtection();

  const loadVideo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/video/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });

      if (!res.ok) {
        throw new Error('Failed to load video');
      }

      const { otp, playbackInfo } = await res.json();

      if (containerRef.current) {
        containerRef.current.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.allow = 'encrypted-media; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;

        containerRef.current.appendChild(iframe);
      }

      setLoading(false);

      // Start progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      let elapsed = lastPosition;
      progressIntervalRef.current = setInterval(() => {
        elapsed += PROGRESS_UPDATE_INTERVAL_MS / 1000;
        onProgress?.(elapsed, 0, elapsed);
      }, PROGRESS_UPDATE_INTERVAL_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video');
      setLoading(false);
    }
  }, [lessonId, lastPosition, onProgress]);

  useEffect(() => {
    loadVideo();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [loadVideo]);

  return (
    <TabBlurGuard>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden video-protected">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black-900 z-20">
            <Spinner size="lg" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black-900 z-20">
            <div className="text-center space-y-3">
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadVideo}
                className="text-accent hover:text-accent-light text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
        <VideoWatermark email={userEmail} />
      </div>
    </TabBlurGuard>
  );
}
