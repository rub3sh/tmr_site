'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { HERO_QUOTES } from '@/lib/constants';

export function AnimatedQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const lineRef = useRef<HTMLDivElement | null>(null);

  const currentQuote = HERO_QUOTES[currentQuoteIndex];

  const typeNextChar = useCallback(() => {
    if (!isTyping) return;
    setDisplayText((prev) => {
      if (prev.length >= currentQuote.length) {
        setIsTyping(false);
        return prev;
      }
      return currentQuote.slice(0, prev.length + 1);
    });
  }, [currentQuote, isTyping]);

  // Typing effect
  useEffect(() => {
    if (!isTyping) {
      const pauseTimer = setTimeout(() => {
        setDisplayText('');
        setCurrentQuoteIndex((prev) => (prev + 1) % HERO_QUOTES.length);
        setIsTyping(true);
      }, 3000);
      return () => clearTimeout(pauseTimer);
    }

    const timer = setTimeout(typeNextChar, 50);
    return () => clearTimeout(timer);
  }, [isTyping, typeNextChar, displayText]);

  useEffect(() => {
    if (!lineRef.current) {
      return;
    }

    lineRef.current.scrollLeft = lineRef.current.scrollWidth;
  }, [displayText]);

  return (
    <div className="min-h-[72px] w-full max-w-5xl flex items-center justify-start">
      <div
        ref={lineRef}
        className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <p className="w-max min-w-full text-[clamp(0.95rem,2.35vw,1.85rem)] font-heading text-left leading-relaxed whitespace-nowrap">
          <span className="text-white/90">&ldquo;</span>
          <span className="text-gradient-accent">{displayText}</span>
          <span className={`${isTyping ? 'typewriter-cursor' : ''}`} />
          <span className="text-white/90">&rdquo;</span>
        </p>
      </div>
    </div>
  );
}
