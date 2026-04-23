"use client";

import { motion } from "framer-motion";
import { GridPattern } from "@/components/ui/grid-pattern";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  company: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Multi Techno transformed the way we manage our operations. Their ERP system is reliable, scalable, and truly easy to use.",
    name: "Ali Khan",
    role: "HR Manager",
    company: "Pak Mission Society",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Their ERP platform streamlined our business processes. What impressed me most is their dedication to client success and support.",
    name: "Sara Ahmed",
    role: "CEO",
    company: "Galaxy Five Home",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "They took time to understand our unique requirements and delivered a system that fits seamlessly into daily operations.",
    name: "Imran Hussain",
    role: "Manager",
    company: "Al-Tayyab Foods",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "From onboarding to ongoing support, the Multi Techno team has been responsive, professional, and incredibly easy to work with.",
    name: "Fatima Noor",
    role: "Director",
    company: "Shafiqe Foods",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Their collaborative approach makes us feel like partners, not just clients. Every strategy session brings new value to our business.",
    name: "Usman Raza",
    role: "CTO",
    company: "NextGen Solutions",
    image: "https://images.unsplash.com/photo-1542204625-de293a4f56f5?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "We rely on their ERP to manage critical operations. The platform is intuitive, and the support team is always proactive.",
    name: "Ayesha Siddiqui",
    role: "Product Lead",
    company: "Bright Future Tech",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Multi Techno gave us better visibility across departments. The insights and efficiency gains have been game-changing for our company.",
    name: "Bilal Sheikh",
    role: "Operations Head",
    company: "Metro Logistics",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "The ERP system brought structure to our finance operations. It is user-friendly and perfectly tailored to our organizational needs.",
    name: "Nadia Karim",
    role: "Finance Manager",
    company: "Alpha Traders",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Dependable, efficient, and forward-thinking. Multi Techno has become a trusted partner in helping us scale confidently worldwide.",
    name: "Omar Farooq",
    role: "Managing Director",
    company: "VisionX Global",
    image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Their attention to detail and continuous improvements keep us ahead of the curve. Working with them feels effortless every time.",
    name: "Sana Iqbal",
    role: "Head of Strategy",
    company: "BlueWave Consulting",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "We tested other ERPs, but nothing matched their level of customization and hands-on support. Highly recommend their services.",
    name: "Hamza Tariq",
    role: "Operations Manager",
    company: "Green Valley Farms",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Multi Techno made our business smarter, not harder. The partnership has been valuable for both efficiency and growth.",
    name: "Mehwish Zafar",
    role: "COO",
    company: "Skyline Apparel",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
];

export function TestimonialsSection() {
  const shouldReduceMotion = usePrefersReducedMotion();

  return (
    <section className="relative w-full px-4 pb-20 pt-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden">
        <div className="absolute -left-16 -top-24 h-[34rem] w-[26rem] -rotate-12 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,123,247,0.12),transparent_70%)]" />
        <div className="absolute left-1/3 top-[-9rem] h-[26rem] w-[20rem] -rotate-12 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_72%)]" />
        <div className="absolute right-[-3rem] top-[-6rem] h-[30rem] w-[16rem] -rotate-12 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,123,247,0.09),transparent_72%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-balance text-3xl font-bold tracking-wide text-white md:text-4xl lg:text-5xl xl:text-6xl xl:font-extrabold">
            Real Results, Real Voices
          </h2>
          <p className="text-sm text-white/50 md:text-base lg:text-lg">
            See how businesses are thriving with our ERP: real stories, real impact, real growth.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map(({ name, role, company, quote, image }, index) => (
            <motion.div
              initial={shouldReduceMotion ? false : { filter: "blur(4px)", translateY: -8, opacity: 0 }}
              whileInView={
                shouldReduceMotion
                  ? { opacity: 1, filter: "blur(0px)", translateY: 0 }
                  : { filter: "blur(0px)", translateY: 0, opacity: 1 }
              }
              viewport={{ once: true }}
              transition={
                shouldReduceMotion
                  ? { delay: 0, duration: 0 }
                  : { delay: 0.08 * index + 0.08, duration: 0.75 }
              }
              key={`${name}-${company}`}
              className="relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden border border-dashed border-foreground/25 bg-black/20 p-4 backdrop-blur-[1px]"
            >
              <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-foreground/2 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                  <GridPattern
                    width={25}
                    height={25}
                    x={-12}
                    y={4}
                    strokeDasharray="3"
                    className="absolute inset-0 h-full w-full stroke-foreground/20 mix-blend-overlay"
                  />
                </div>
              </div>

              <img alt={name} src={image} loading="lazy" className="size-9 rounded-full object-cover" />

              <div>
                <div className="-mt-0.5 -space-y-0.5">
                  <p className="text-sm text-white md:text-base">{name}</p>
                  <span className="block text-[11px] font-light tracking-tight text-white/50">
                    {role} at {company}
                  </span>
                </div>
                <blockquote className="mt-3">
                  <p className="text-sm font-light tracking-wide text-white/70">{quote}</p>
                </blockquote>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
