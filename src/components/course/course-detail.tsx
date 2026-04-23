'use client';

interface CourseDetailProps {
  previewVideoId: string;
}

export function CourseDetail({ previewVideoId }: CourseDetailProps) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black-800 relative">
      <iframe
        src={`https://player.vdocipher.com/v2/?otp=&playbackInfo=&videoId=${previewVideoId}`}
        className="w-full h-full"
        allowFullScreen
        allow="encrypted-media"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
