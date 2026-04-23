'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Play, CheckCircle, Lock, ChevronDown, ChevronRight,
  FileText, Link as LinkIcon, Package, StickyNote, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  durationSec: number;
  sortOrder: number;
  isFree: boolean;
  isPreview: boolean;
}

interface AttachmentData {
  id: string;
  type: string;
  title: string;
  url: string;
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  videos: VideoData[];
  attachments: AttachmentData[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  lessons: LessonData[];
}

interface ProgressData {
  videoId: string;
  completed: boolean;
  lastPositionSec: number;
}

const ATTACHMENT_ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  LINK: LinkIcon,
  TOOL: Package,
  NOTE: StickyNote,
};

export default function CoursePlayerPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'lessons' | 'attachments'>('lessons');

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setCourse(d.data);
          // Expand first lesson and select first video
          if (d.data.lessons.length > 0) {
            setExpandedLessons(new Set([d.data.lessons[0].id]));
            if (d.data.lessons[0].videos.length > 0) {
              setActiveVideoId(d.data.lessons[0].videos[0].id);
            }
          }
        }
      })
      .catch(() => {});

    fetch(`/api/progress?courseId=${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setProgress(d.data); })
      .catch(() => {});
  }, [courseId]);

  function toggleLesson(lessonId: string): void {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  }

  function isVideoCompleted(videoId: string): boolean {
    return progress.some((p) => p.videoId === videoId && p.completed);
  }

  const activeVideo = course?.lessons
    .flatMap((l) => l.videos)
    .find((v) => v.id === activeVideoId);

  const activeLesson = course?.lessons.find((l) =>
    l.videos.some((v) => v.id === activeVideoId)
  );

  const totalVideos = course?.lessons.reduce((acc, l) => acc + l.videos.length, 0) ?? 0;
  const completedVideos = progress.filter((p) => p.completed).length;
  const progressPct = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  if (!course) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Progress */}
      <div className="flex items-center justify-between">
        <Link href="/student/library" className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white/60">
          <ArrowLeft size={16} /> Back to Library
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-32 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-white/60 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs text-white/30">{progressPct}% complete</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Video Player */}
        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/5 bg-black">
            {activeVideo ? (
              <div className="flex h-full items-center justify-center">
                {/* VdoCipher or iframe player would go here */}
                <div className="text-center">
                  <Play size={48} className="mx-auto text-white/20" />
                  <p className="mt-3 text-sm text-white/30">{activeVideo.title}</p>
                  <p className="mt-1 text-xs text-white/15">
                    Video URL: {activeVideo.videoUrl || 'Not set'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-white/20">Select a video to start</p>
              </div>
            )}
          </div>

          {/* Video Info */}
          {activeVideo && (
            <div>
              <h2 className="text-xl font-semibold text-white">{activeVideo.title}</h2>
              {activeLesson && (
                <p className="mt-1 text-sm text-white/30">{activeLesson.title}</p>
              )}
            </div>
          )}

          {/* Attachments for active lesson */}
          {activeLesson && activeLesson.attachments.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
                Lesson Resources
              </p>
              <div className="space-y-2">
                {activeLesson.attachments.map((att) => {
                  const Icon = ATTACHMENT_ICONS[att.type] ?? FileText;
                  return (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-white/[0.03] bg-white/[0.01] p-3 transition hover:bg-white/[0.03]"
                    >
                      <Icon size={16} className="text-white/30" />
                      <div>
                        <p className="text-sm text-white/70">{att.title}</p>
                        <p className="text-[10px] text-white/20">{att.type}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Lesson List */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">{course.title}</h3>
            <p className="mt-1 text-xs text-white/25">
              {completedVideos}/{totalVideos} videos completed
            </p>
          </div>

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            {course.lessons.map((lesson) => {
              const isExpanded = expandedLessons.has(lesson.id);
              const lessonCompleted = lesson.videos.every((v) => isVideoCompleted(v.id));

              return (
                <div key={lesson.id} className="border-b border-white/[0.03]">
                  <button
                    onClick={() => toggleLesson(lesson.id)}
                    className="flex w-full items-center justify-between p-4 text-left transition hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2">
                      {lessonCompleted ? (
                        <CheckCircle size={14} className="text-green-400/60" />
                      ) : isExpanded ? (
                        <ChevronDown size={14} className="text-white/30" />
                      ) : (
                        <ChevronRight size={14} className="text-white/30" />
                      )}
                      <span className="text-sm font-medium text-white/70">{lesson.title}</span>
                    </div>
                    <span className="text-[10px] text-white/20">{lesson.videos.length} videos</span>
                  </button>

                  {isExpanded && (
                    <div className="bg-white/[0.01] pb-2">
                      {lesson.videos.map((video) => {
                        const completed = isVideoCompleted(video.id);
                        const isActive = video.id === activeVideoId;

                        return (
                          <button
                            key={video.id}
                            onClick={() => setActiveVideoId(video.id)}
                            className={`flex w-full items-center gap-3 px-6 py-2.5 text-left transition ${
                              isActive
                                ? 'bg-white/[0.05]'
                                : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            {completed ? (
                              <CheckCircle size={12} className="text-green-400/60 shrink-0" />
                            ) : (
                              <Play size={12} className={`shrink-0 ${isActive ? 'text-white/60' : 'text-white/20'}`} />
                            )}
                            <span
                              className={`text-xs ${
                                isActive ? 'text-white' : completed ? 'text-white/40' : 'text-white/50'
                              }`}
                            >
                              {video.title}
                            </span>
                            <span className="ml-auto text-[10px] text-white/15">
                              {Math.floor(video.durationSec / 60)}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
