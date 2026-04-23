'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Spinner } from '@/components/ui/spinner';
import type { ChatMessage } from '@/types/chat';

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
}

export function ChatWindow({ currentUserId, otherUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    setLoading(true);
    fetch(`/api/chat/messages?userId=${otherUserId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [otherUserId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/messages?userId=${otherUserId}`);
        const data = await res.json();
        setMessages(data);
      } catch {
        // Silently fail
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [otherUserId]);

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  async function handleSend(content: string) {
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: otherUserId, content }),
    });

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 50);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            Start the conversation
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              isSent={msg.senderId === currentUserId}
              timestamp={msg.createdAt}
              senderName={msg.sender?.name || msg.sender?.email}
            />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
