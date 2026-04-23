'use client';

import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { WHY_WE_ARE_HERE, WHY_YOU_ARE_HERE } from '@/lib/constants';

function RevealLine({ text, index }: { text: string; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.2, ease: 'easeOut' }}
      className="text-lg md:text-xl text-white/50 leading-relaxed"
    >
      &ldquo;{text}&rdquo;
    </motion.p>
  );
}

export function WhySection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 md:py-32 px-6">
      <div ref={sectionRef} className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Why We Are Here */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-accent text-sm font-medium tracking-[0.2em] uppercase">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2">
                Why We Are Here
              </h2>
              <div className="w-16 h-0.5 bg-accent mt-4" />
            </motion.div>

            <div className="space-y-5">
              {WHY_WE_ARE_HERE.map((text, i) => (
                <RevealLine key={text} text={text} index={i} />
              ))}
            </div>
          </div>

          {/* Why You Are Here */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-accent text-sm font-medium tracking-[0.2em] uppercase">
                Your Truth
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2">
                Why You Are Here
              </h2>
              <div className="w-16 h-0.5 bg-accent mt-4" />
            </motion.div>

            <div className="space-y-5">
              {WHY_YOU_ARE_HERE.map((text, i) => (
                <RevealLine key={text} text={text} index={i + 3} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
