'use client';

import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { ExternalLink } from 'lucide-react';

const TEAM = [
  { name: 'MELLOW', role: 'Founder', initials: 'ME' },
  { name: 'INNEREDGE', role: 'Founder', initials: 'IE' },
  { name: 'JUNO', role: 'Team', initials: 'JU' },
  { name: 'BRAY', role: 'Mentor', initials: 'BR' },
  { name: 'MIKE', role: 'Mentor', initials: 'MI' },
  { name: 'LEO', role: 'Mentor', initials: 'LE' },
];

export function TeamGridSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30">
            Proven Results
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold text-white md:text-5xl">
            THE MELLOW&apos;S HIVE TEAM
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/40">
            The mentors and team behind the systems, coaching, and community that drives consistent results.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-6">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 16 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
              className="group flex flex-col items-center rounded-xl border border-white/5 bg-[#0a0a0a] px-2 py-4 transition-colors hover:border-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-sm font-bold tracking-wider text-white/20">
                {member.initials}
              </div>
              <h3 className="mt-2.5 text-[11px] font-bold tracking-wide text-white">
                {member.name}
              </h3>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-white/30">
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
