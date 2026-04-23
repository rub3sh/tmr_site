'use client';

import { useEffect, useRef, useState } from 'react';

export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const frameId = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      position.current.x = lerp(position.current.x, target.current.x, 0.12);
      position.current.y = lerp(position.current.y, target.current.y, 0.12);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px) translate(-50%, -50%)`;
      }

      frameId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    frameId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(frameId.current);
    };
  }, [visible]);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] transition-opacity duration-200"
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        boxShadow: '0 0 8px 2px rgba(255,255,255,0.2)',
        opacity: visible ? 1 : 0,
        willChange: 'transform',
      }}
    />
  );
}
