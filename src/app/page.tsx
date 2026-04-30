import { Navbar } from '../components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { ServiceCards } from '@/components/landing/service-cards';
import { TeamGridSection } from '@/components/landing/team-grid-section';
import { CTASection } from '@/components/landing/cta-section';
import { NewsletterSection } from '@/components/landing/newsletter-section';
import { TradingHub } from '@/components/tools/trading-hub';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <ServiceCards />
      <TeamGridSection />

      {/* Trading Tools section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">Free Tools</p>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">The Desk</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/40">
              Position sizing, economic calendar, futures specs, and market sentiment — all in one place.
            </p>
          </div>
          <TradingHub />
        </div>
      </section>

      <CTASection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
