import { Navbar } from '../components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { ServiceCards } from '@/components/landing/service-cards';
import { TeamGridSection } from '@/components/landing/team-grid-section';
import { CTASection } from '@/components/landing/cta-section';
import { NewsletterSection } from '@/components/landing/newsletter-section';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <ServiceCards />
      <TeamGridSection />
      <CTASection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
