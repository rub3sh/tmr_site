"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  className?: string;
  stackStyle?: CSSProperties;
  image?: string;
  name?: string;
  role?: string;
  content?: string;
  onHover?: () => void;
  onLeave?: () => void;
}

function TestimonialCard({
  className,
  stackStyle,
  image = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  name = "Client Name",
  role = "Funded Trader",
  content = "The mentorship gave me a repeatable framework and helped me execute with confidence.",
  onHover,
  onLeave,
}: TestimonialCardProps) {
  const [pointerTilt, setPointerTilt] = useState({ rotateX: 0, rotateY: 0, lift: 0, scale: 1 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const frameRef = useRef<number | null>(null);
  const nextTiltRef = useRef(pointerTilt);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);

      if (mediaQuery.matches) {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }

        setPointerTilt({ rotateX: 0, rotateY: 0, lift: 0, scale: 1 });
      }
    };

    updatePreference();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
    } else {
      mediaQuery.addListener(updatePreference);
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updatePreference);
      } else {
        mediaQuery.removeListener(updatePreference);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    nextTiltRef.current = {
      rotateX: -(percentY * 8),
      rotateY: percentX * 10,
      lift: -14,
      scale: 1.03,
    };

    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(() => {
        setPointerTilt(nextTiltRef.current);
        frameRef.current = null;
      });
    }
  };

  const clearPointerTilt = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    nextTiltRef.current = { rotateX: 0, rotateY: 0, lift: 0, scale: 1 };
    setPointerTilt({ rotateX: 0, rotateY: 0, lift: 0, scale: 1 });
  };

  const handleMouseEnter = () => {
    onHover?.();
  };

  const handleMouseLeave = () => {
    clearPointerTilt();
    onLeave?.();
  };

  const handleFocus = () => {
    if (prefersReducedMotion) {
      onHover?.();
      return;
    }

    setPointerTilt({ rotateX: 0, rotateY: 0, lift: -12, scale: 1.02 });
    onHover?.();
  };

  const handleBlur = () => {
    clearPointerTilt();
    onLeave?.();
  };

  return (
    <article
      tabIndex={0}
      aria-label={`${name} testimonial`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "group relative block h-auto min-h-[140px] w-[260px] select-none transition-all duration-500 motion-reduce:transition-none sm:min-h-[180px] sm:w-[380px]",
        "dark:after:pointer-events-none dark:after:absolute dark:after:-right-1 dark:after:top-[-5%] dark:after:h-[110%] dark:after:w-[20rem] dark:after:bg-gradient-to-l dark:after:from-background dark:after:to-transparent dark:after:content-['']",
        className
      )}
      style={stackStyle}
    >
      <div
        className="flex h-full min-h-[320px] flex-col rounded-2xl border border-white/10 bg-black-900/90 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-transform duration-200 motion-reduce:transition-none group-hover:border-[var(--accent)]/40 sm:min-h-[420px] sm:p-4"
        style={{
          transform: prefersReducedMotion
            ? "none"
            : `perspective(900px) rotateX(${pointerTilt.rotateX}deg) rotateY(${pointerTilt.rotateY}deg) translateY(${pointerTilt.lift}px) scale(${pointerTilt.scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative mb-4 h-44 overflow-hidden rounded-xl sm:h-56">
          <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none motion-reduce:transform-none group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="truncate text-base font-bold text-white sm:text-lg">{name}</h3>
            <p className="text-xs font-medium text-white/60 sm:text-sm">{role}</p>
          </div>
        </div>

        <div className="mt-auto rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-sm leading-relaxed text-white/70 sm:text-base">{content}</p>
          <div className="mt-3 h-[2px] w-16 rounded-full bg-gradient-to-r from-[var(--accent)]/80 to-transparent" />
        </div>
      </div>
    </article>
  );
}

interface TestimonialsProps {
  cards?: TestimonialCardProps[];
}

function Testimonials({ cards }: TestimonialsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const STACK_SPACING = 94;
  const CARD_WIDTH = 380;
  const HOVER_SIDE_SHIFT = 44;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
    } else {
      mediaQuery.addListener(updatePreference);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updatePreference);
      } else {
        mediaQuery.removeListener(updatePreference);
      }
    };
  }, []);

  const defaultCards: TestimonialCardProps[] = [
    {
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80",
      name: "Sarah Chen",
      role: "Forex Trader",
      content: "The structure here removed emotional trading for me. I now follow one clean plan every session.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80",
      name: "Michael Ortiz",
      role: "Swing Trader",
      content: "The strategy model is clear and practical. My entries and exits are finally rule-based.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80",
      name: "Alex Rivera",
      role: "Prop Firm Candidate",
      content: "Execution, risk, review loop. This was the first time all three clicked together for me.",
    },
  ];

  const displayCards = cards || defaultCards;
  const centerOffset = ((displayCards.length - 1) * STACK_SPACING) / 2;

  const getStackStyle = (index: number): CSSProperties => {
    const baseX = index * STACK_SPACING - centerOffset;
    const baseY = index * 6;
    const baseRotate = -4 + index * 1.35;
    const focusedIndex = hoveredIndex;

    let offsetX = 0;
    let offsetY = 0;
    let scale = 1;
    let zIndex = 10 + index;

    if (focusedIndex !== null) {
      if (prefersReducedMotion) {
        if (index === focusedIndex) {
          zIndex = 200;
        }
      } else {
        if (index === focusedIndex) {
          offsetY = -26;
          scale = 1.04;
          zIndex = 300;
        } else if (index > focusedIndex) {
          offsetX = HOVER_SIDE_SHIFT;
        } else {
          offsetX = -HOVER_SIDE_SHIFT;
        }
      }
    }

    const x = baseX + offsetX;
    const y = baseY + offsetY;
    const rotate = prefersReducedMotion ? 0 : baseRotate;

    return {
      zIndex,
      transform: `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
    };
  };

  return (
    <div className="w-full overflow-x-auto px-2 py-6 opacity-100 animate-in fade-in-0 duration-700 motion-reduce:animate-none motion-reduce:transition-none">
      <div
        className="relative mx-auto"
        style={{
          width: `${Math.max(420, CARD_WIDTH + (displayCards.length - 1) * STACK_SPACING + HOVER_SIDE_SHIFT * 2)}px`,
          height: "520px",
        }}
      >
        {displayCards.map((cardProps, index) => (
          <TestimonialCard
            key={`${cardProps.name ?? "card"}-${index}`}
            {...cardProps}
            className={cn("absolute top-6 left-1/2", cardProps.className)}
            stackStyle={getStackStyle(index)}
            onHover={() => setHoveredIndex(index)}
            onLeave={() => setHoveredIndex(null)}
          />
        ))}
      </div>
    </div>
  );
}

function Component() {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center bg-background p-8">
      <Testimonials />
    </div>
  );
}

export { Component, TestimonialCard, Testimonials };
export type { TestimonialCardProps, TestimonialsProps };
