"use client";

import Image from "next/image";
import Link from "next/link";
import type { ElementType } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type OrbitItem = {
  id: number;
  title: string;
  icon: ElementType;
  href: string;
  angle: number;
};

interface RadialOrbitalTimelineProps {
  items: OrbitItem[];
  centerLogoSrc?: string;
  centerLogoAlt?: string;
  className?: string;
}

const DEG = Math.PI / 180;
const ORBIT_RADIUS = 40;

function orbitPos(angleDeg: number) {
  return {
    x: 50 + ORBIT_RADIUS * Math.sin(angleDeg * DEG),
    y: 50 - ORBIT_RADIUS * Math.cos(angleDeg * DEG),
  };
}

export default function RadialOrbitalTimeline({
  items,
  centerLogoSrc = "/logo/tmr_text.png",
  centerLogoAlt = "The Market Revelation ",
  className,
}: RadialOrbitalTimelineProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const positionedItems = items.map((item) => ({
    ...item,
    ...orbitPos(item.angle),
  }));

  return (
    <div className={cn("group/orbit relative aspect-square w-[320px] sm:w-[380px] md:w-[440px] lg:w-[480px]", className)}>
      <div
        className={cn(
          "absolute inset-0",
          !prefersReducedMotion &&
            "orbital-spin-slow will-change-transform [transform:translateZ(0)] group-hover/orbit:[animation-play-state:paused] group-focus-within/orbit:[animation-play-state:paused]"
        )}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
          <circle
            cx="50"
            cy="50"
            r={ORBIT_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="0.25"
            strokeDasharray="1.5 2.5"
          />
          {positionedItems.map((item) => (
            <line
              key={`line-${item.id}`}
              x1="50"
              y1="50"
              x2={item.x}
              y2={item.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.3"
            />
          ))}
          {positionedItems.map((item) => (
            <circle
              key={`dot-${item.id}`}
              cx={item.x}
              cy={item.y}
              r="0.8"
              fill="rgba(255,255,255,0.08)"
            />
          ))}
        </svg>

        {positionedItems.map((item) => {
          const Icon = item.icon;
          const accessibleTitle = item.title.replace(/\n/g, " ");
          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div
                  className={cn(
                    "relative",
                    !prefersReducedMotion &&
                      "orbital-counter-spin will-change-transform [transform:translateZ(0)] group-hover/orbit:[animation-play-state:paused] group-focus-within/orbit:[animation-play-state:paused]"
                  )}
                >
                  <Link
                    href={item.href}
                    aria-label={accessibleTitle}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#131313] shadow-md ring-2 ring-white transition-colors hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:h-[52px] md:w-[52px]"
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                  </Link>
                  <span className="absolute left-1/2 top-[calc(100%+2px)] -translate-x-1/2 whitespace-pre-line text-center text-[8px] font-semibold uppercase leading-tight tracking-wide text-white sm:text-[9px] md:text-[10px]">
                    {item.title}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="absolute z-10 flex items-center justify-center rounded-2xl bg-[#131313] shadow-[0_12px_48px_rgba(0,0,0,0.6)] ring-2 ring-white"
        style={{
          width: "29%",
          height: "29%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src={centerLogoSrc}
          alt={centerLogoAlt}
          fill
          className="object-cover scale-150"
          priority
        />
      </div>
    </div>
  );
}
