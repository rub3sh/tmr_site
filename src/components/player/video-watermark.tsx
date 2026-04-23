'use client';

interface VideoWatermarkProps {
  email: string;
}

export function VideoWatermark({ email }: VideoWatermarkProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Multiple watermarks at different positions */}
      <div className="absolute top-[15%] left-[10%] rotate-[-15deg] opacity-20">
        <span className="text-accent text-sm font-mono">{email}</span>
      </div>
      <div className="absolute top-[45%] right-[5%] rotate-[10deg] opacity-15">
        <span className="text-accent text-xs font-mono">{email}</span>
      </div>
      <div className="absolute bottom-[20%] left-[30%] rotate-[-8deg] opacity-20">
        <span className="text-accent text-sm font-mono">{email}</span>
      </div>
    </div>
  );
}
