interface MessageBubbleProps {
  content: string;
  isSent: boolean;
  timestamp: string;
  senderName?: string;
}

export function MessageBubble({ content, isSent, timestamp, senderName }: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isSent
            ? 'bg-accent/20 border border-primary/30 rounded-br-sm'
            : 'bg-black-800 border border-white/10 rounded-bl-sm'
        }`}
      >
        {!isSent && senderName && (
          <p className="text-xs text-accent font-medium mb-1">{senderName}</p>
        )}
        <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{content}</p>
        <p className={`text-xs mt-1 ${isSent ? 'text-accent/50' : 'text-white/30'}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
