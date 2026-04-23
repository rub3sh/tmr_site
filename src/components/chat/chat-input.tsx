'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setMessage('');
    try {
      await onSend(trimmed);
    } catch {
      setMessage(trimmed); // Restore on failure
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 p-4 flex items-end gap-3"
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 px-4 py-3 rounded-xl bg-black-800 border border-white/10 text-white placeholder-surface-500 focus:outline-none focus:border-primary/60 resize-none text-sm max-h-32"
      />
      <button
        type="submit"
        disabled={!message.trim() || sending}
        className="p-3 rounded-xl bg-accent text-black disabled:opacity-50 hover:bg-accent-light transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
