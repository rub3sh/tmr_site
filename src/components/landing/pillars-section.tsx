'use client';

import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { GraduationCap, Activity, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const PILLARS = [
  {
    title: 'Mentorship',
    desc: 'Structured guidance to build consistency',
    icon: GraduationCap,
    href: '/services/mentorship',
  },
  {
    title: 'Indicators',
    desc: 'Market structure & precision execution',
    icon: Activity,
    href: '/services/indicators',
  },
  {
    title: 'Prop Firms',
    desc: 'Scale capital with proven performance',
    icon: Building2,
    href: '/services/prop-firms',
  },
];

const IMPACT_BASE_SECONDS = 1.05;
const IMPACT_STAGGER_SECONDS = 0.3;
const REVEAL_OFFSET_SECONDS = 0.35;

/* Dust particle component — spawns on impact */
function DustCloud({ delay }: { delay: number }) {
  const particles = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: -(Math.random() * 40 + 10),
      size: Math.random() * 4 + 2,
      duration: Math.random() * 0.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.3,
    }))
  ).current;

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: p.opacity, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
          transition={{
            duration: p.duration,
            delay: delay + Math.random() * 0.15,
            ease: 'easeOut',
          }}
          className="absolute rounded-full bg-black-400"
          style={{ width: p.size, height: p.size }}
        />
      ))}
      {/* Wide dust spread */}
      <motion.div
        initial={{ scaleX: 0.2, opacity: 0.4 }}
        animate={{ scaleX: 2.5, opacity: 0 }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-6 w-40 rounded-full bg-black-500/30 blur-xl"
      />
    </div>
  );
}

function PillarColumn({
  pillar,
  index,
  isVisible,
}: {
  pillar: (typeof PILLARS)[number];
  index: number;
  isVisible: boolean;
}) {
  const Icon = pillar.icon;
  const dropDelay = index * IMPACT_STAGGER_SECONDS;
  const impactTime = dropDelay + IMPACT_BASE_SECONDS; // when spring ~lands
  const revealDelay = impactTime + REVEAL_OFFSET_SECONDS;
  const shakeControls = useAnimationControls();
  const shouldReduceMotion = useReducedMotion();
  const [landed, setLanded] = useState(false);
  const [dustBurstKey, setDustBurstKey] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setLanded(false);
      return;
    }

    if (shouldReduceMotion) {
      setLanded(true);
      return;
    }

    const timeout = setTimeout(() => {
      setLanded(true);
      setDustBurstKey((currentKey) => currentKey + 1);
      // Earthquake shake on impact
      shakeControls.start({
        x: [0, -6, 5, -4, 3, -2, 1, 0],
        y: [0, 2, -1, 1, 0],
        transition: { duration: 0.5, ease: 'easeOut' },
      });
    }, impactTime * 1000);

    return () => clearTimeout(timeout);
  }, [isVisible, impactTime, shakeControls, shouldReduceMotion]);

  return (
    <div className="relative flex w-full max-w-[18rem] flex-none flex-col items-center sm:max-w-[20rem] lg:max-w-[22rem]">
      {/* Shake wrapper — whole pillar shakes on impact */}
      <motion.div animate={shakeControls} className="relative flex flex-col items-center w-full">
        {/* Drop animation */}
        <motion.div
          initial={shouldReduceMotion ? { y: 0, opacity: 0 } : { y: -600, opacity: 0 }}
          animate={
            isVisible
              ? { y: 0, opacity: 1 }
              : shouldReduceMotion
                ? { y: 0, opacity: 0 }
                : { y: -600, opacity: 0 }
          }
          transition={{
            duration: shouldReduceMotion ? 0.25 : 1.2,
            delay: shouldReduceMotion ? 0 : dropDelay,
            type: shouldReduceMotion ? 'tween' : 'spring',
            stiffness: shouldReduceMotion ? undefined : 50,
            damping: shouldReduceMotion ? undefined : 11,
          }}
          className="relative flex flex-col items-center w-full"
        >
          {/* Idle float after landing */}
          <motion.div
            animate={landed && !shouldReduceMotion ? { y: [0, -8, 0] } : {}}
            transition={{
              duration: 6,
              delay: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative flex flex-col items-center w-full"
          >
            {/* Pillar image — cropped bigger */}
            <div className="relative h-[360px] sm:h-[460px] md:h-[580px] lg:h-[700px] w-full overflow-hidden">
              <Image
                src="/images/PILLAR.PNG"
                alt={`${pillar.title} pillar`}
                fill
                className="object-cover object-top scale-[1.14] drop-shadow-[0_8px_40px_rgba(255,255,255,0.06)]"
                sizes="(max-width: 639px) 18rem, (max-width: 1023px) 20rem, 22rem"
              />

              {/* Text engraved on the shaft */}
              <div className="absolute inset-x-0 top-[35%] bottom-[15%] flex flex-col items-center justify-center px-6">
                {/* Icon */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0, rotate: -20 }}
                  animate={
                    isVisible
                      ? shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, scale: 1, rotate: 0 }
                      : shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0, rotate: -20 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0.2 : 0.8,
                    delay: shouldReduceMotion ? 0 : revealDelay,
                    type: shouldReduceMotion ? 'tween' : 'spring',
                    stiffness: shouldReduceMotion ? undefined : 100,
                    damping: shouldReduceMotion ? undefined : 10,
                  }}
                  className="mb-5"
                >
                  <div
                    className="flex items-center justify-center rounded-full border-2 border-[var(--accent)]/50 bg-[#121212]/90 shadow-[0_0_32px_rgba(79,123,247,0.2),inset_0_1px_0_rgba(79,123,247,0.2)] backdrop-blur-md"
                    style={{ width: 'clamp(64px,9vw,88px)', height: 'clamp(64px,9vw,88px)' }}
                  >
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 text-[var(--accent)]" strokeWidth={1.2} />
                  </div>
                </motion.div>

                {/* Title + desc — dark engraved on stone */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                  animate={
                    isVisible
                      ? shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, y: 0 }
                      : shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 30 }
                  }
                  transition={{
                    delay: shouldReduceMotion ? 0 : revealDelay + 0.3,
                    duration: shouldReduceMotion ? 0.2 : 0.7,
                    ease: 'easeOut',
                  }}
                  className="rounded-2xl border border-[var(--accent)]/35 bg-black/55 px-4 py-4 text-center shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-[2px]"
                >
                  <h3
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold tracking-wide"
                    style={{
                      color: '#f7df97',
                      WebkitTextStroke: '0.9px rgba(35,24,5,0.85)',
                      textShadow: '0 0 16px rgba(79,123,247,0.45), 0 2px 10px rgba(0,0,0,0.9)',
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className="mx-auto mt-2 max-w-[190px] text-xs font-bold leading-relaxed md:text-sm"
                    style={{
                      color: '#f3d67f',
                      WebkitTextStroke: '0.35px rgba(35,24,5,0.8)',
                      textShadow: '0 1px 10px rgba(0,0,0,0.85), 0 0 8px rgba(79,123,247,0.25)',
                    }}
                  >
                    {pillar.desc}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Gold glow at base */}
            <motion.div
              initial={{ opacity: 0, scale: 0.2 }}
              animate={landed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.6 }}
              className="relative -mt-4"
            >
              <div className="h-16 w-56 rounded-full bg-[var(--accent)]/[0.07] blur-3xl" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-8 w-32 rounded-full bg-[var(--accent)]/[0.12] blur-xl" />
            </motion.div>

            {/* Dust on impact */}
            {!shouldReduceMotion && dustBurstKey > 0 ? <DustCloud key={dustBurstKey} delay={0} /> : null}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Clickable link */}
      <Link href={pillar.href} className="absolute inset-0 z-20" aria-label={pillar.title} />
    </div>
  );
}

/* Section-level earthquake shake */
function ShakeWrapper({
  children,
  isVisible,
}: {
  children: React.ReactNode;
  isVisible: boolean;
}) {
  const controls = useAnimationControls();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isVisible || shouldReduceMotion) return;

    // Shake the whole section when pillars land
    const timers = Array.from({ length: PILLARS.length }, (_, index) =>
      setTimeout(() => {
        controls.start({
          x: [0, -2, 2, -1.5, 1.5, -0.8, 0],
          transition: { duration: 0.4, ease: 'easeOut' },
        });
      }, (IMPACT_BASE_SECONDS + index * IMPACT_STAGGER_SECONDS) * 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, [isVisible, controls, shouldReduceMotion]);

  return <motion.div animate={controls}>{children}</motion.div>;
}

export function PillarsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="services" className="py-16 sm:py-24 md:py-32 lg:py-36 px-4 sm:px-6 overflow-hidden bg-black">
      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={
            isVisible
              ? shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0 }
              : {}
          }
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.7 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold">
            Built on{' '}
            <span className="text-gradient-accent">Foundations</span>
          </h2>
          <p className="text-white/40 text-sm sm:text-base md:text-lg max-w-md mx-auto">
            Three pillars that define institutional trading
          </p>
        </motion.div>

        {/* Pillars with section-level shake */}
        <ShakeWrapper isVisible={isVisible}>
          <div className="grid w-full grid-cols-1 justify-items-center gap-8 sm:gap-12 md:gap-16 sm:px-4 lg:grid-cols-3 lg:items-end lg:gap-10 lg:px-0 xl:gap-12">
            {PILLARS.map((pillar, index) => (
              <PillarColumn
                key={pillar.title}
                pillar={pillar}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </ShakeWrapper>
      </div>
    </section>
  );
}
