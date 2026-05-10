import { Metadata } from 'next';
import { Navbar } from '../components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { ServiceCards } from '@/components/landing/service-cards';
import { TeamGridSection } from '@/components/landing/team-grid-section';
import { CTASection } from '@/components/landing/cta-section';
import { NewsletterSection } from '@/components/landing/newsletter-section';
import { TradingHub } from '@/components/tools/trading-hub';

export const metadata: Metadata = {
  alternates: { canonical: 'https://themarketrevelation.com' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://themarketrevelation.com/#organization',
      name: 'The Market Revelation',
      url: 'https://themarketrevelation.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://themarketrevelation.com/logo/TMR_LOGO.png',
      },
      sameAs: [],
      description:
        'Elite trading education platform teaching time cycles, price action, and market structure to serious traders worldwide.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://themarketrevelation.com/#website',
      url: 'https://themarketrevelation.com',
      name: 'The Market Revelation',
      publisher: { '@id': 'https://themarketrevelation.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://themarketrevelation.com/student/blog?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://themarketrevelation.com/#edu',
      name: 'The Market Revelation',
      url: 'https://themarketrevelation.com',
      description:
        'Precision-engineered trading courses covering time cycles, price action logic, institutional market structure, and prop firm preparation.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Trading Courses',
        itemListElement: [
          { '@type': 'Course', name: 'Mentorship Program', url: 'https://themarketrevelation.com/services/mentorship' },
          { '@type': 'Course', name: 'Trading Indicators', url: 'https://themarketrevelation.com/services/indicators' },
          { '@type': 'Course', name: 'Prop Firm Preparation', url: 'https://themarketrevelation.com/services/prop-firms' },
        ],
      },
    },
  ],
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
