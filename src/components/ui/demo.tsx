'use client';

import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import { BentoPricing } from '@/components/ui/bento-pricing';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import { Calendar, Code, FileText, User, Clock } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/lib/utils';

const DemoVariant1 = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatedGradientBackground />

      <div className="relative z-10 flex h-full flex-col items-center justify-start px-4 pt-32 text-center">
        <div>
          <DotLottieReact
            src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json"
            loop
            autoplay
          />
        </div>
        <p className="mt-4 max-w-lg text-lg text-gray-300 md:text-xl">
          A customizable animated radial gradient background with a subtle breathing effect.
        </p>
      </div>
    </div>
  );
};

const timelineData = [
  {
    id: 1,
    title: 'Planning',
    icon: Calendar,
    href: '/about',
    angle: 288,
  },
  {
    id: 2,
    title: 'Design',
    icon: FileText,
    href: '/services/indicators',
    angle: 0,
  },
  {
    id: 3,
    title: 'Development',
    icon: Code,
    href: '/services/mentorship',
    angle: 72,
  },
  {
    id: 4,
    title: 'Testing',
    icon: User,
    href: '/dashboard',
    angle: 144,
  },
  {
    id: 5,
    title: 'Release',
    icon: Clock,
    href: '/market-education',
    angle: 216,
  },
];

const RadialOrbitalTimelineDemo = () => {
  return <RadialOrbitalTimeline items={timelineData} />;
};

const BentoPricingDemo = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-4 py-16">
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 size-full',
          'bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)]',
          'bg-[size:12px_12px] opacity-15'
        )}
      />

      <section className="mx-auto w-full max-w-6xl p-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-6xl">
            Data-Driven Growth
          </h1>
          <p className="mt-4 text-sm text-white/45 md:text-base">
            Built for serious trading performance, from free starter tools to long-term growth plans.
          </p>
        </div>
        <BentoPricing />
      </section>
    </div>
  );
};

export { DemoVariant1, RadialOrbitalTimelineDemo, BentoPricingDemo };
