'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Mentorship', href: '/services/mentorship' },
  { label: 'Indicator', href: '/services/indicators' },
  { label: 'Prop Firms', href: '/services/prop-firms' },
  { label: 'Trading Education', href: '/market-education' },
] as const;

const STUDENT_NAV_ITEMS = [
  { label: 'Library', href: '/student/library' },
  { label: 'Blog', href: '/student/blog' },
  { label: 'Calendar', href: '/student/calendar' },
  { label: 'The Desk', href: '/student/tools' },
  { label: 'Leaderboards', href: '/student/leaderboards' },
  { label: 'Indicators', href: '/student/indicators' },
  { label: 'Tutor', href: '/student/tutor' },
  { label: 'Giveaways', href: '/student/giveaways' },
] as const;

const MENTORSHIP_FLOATING_ITEMS = [
  { label: 'Models', href: '#models' },
  { label: 'Community', href: '#community' },
  { label: 'Process', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Team', href: '#team' },
  { label: 'FAQ', href: '#faq' },
] as const;

const INDICATOR_FLOATING_ITEMS = [
  { label: 'Indicators', href: '#indicators' },
  { label: 'Preview', href: '#preview' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Custom Indicator', href: '#custom-indicator' },
] as const;

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hasScrolledOnce, setHasScrolledOnce] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isPastThreshold = window.scrollY > 20;
      setScrolled(isPastThreshold);
      if (window.scrollY > 0) {
        setHasScrolledOnce(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isStudentArea = pathname.startsWith('/student');
  const isAdminArea = pathname.startsWith('/admin');
  const isMentorshipPage = pathname.startsWith('/services/mentorship');
  const isIndicatorPage = pathname.startsWith('/services/indicators');
  const enablePopOnScroll = isMentorshipPage || isIndicatorPage;
  const shouldAttachOnTop = hasScrolledOnce && !scrolled;
  const isFloating = enablePopOnScroll && !mobileOpen && !shouldAttachOnTop;
  const isMentorshipFloating = isMentorshipPage && isFloating;
  const isMentorshipAttached = isMentorshipPage && !isFloating;
  const isIndicatorFloating = isIndicatorPage && isFloating;
  const isServiceFloating = isMentorshipFloating || isIndicatorFloating;
  const isHomePage = pathname === '/';

  // Don't render navbar in admin area (admin has its own sidebar)
  if (isAdminArea) return null;

  const floatingNavItems = isMentorshipFloating
    ? MENTORSHIP_FLOATING_ITEMS
    : isIndicatorFloating
    ? INDICATOR_FLOATING_ITEMS
    : isStudentArea
    ? STUDENT_NAV_ITEMS
    : NAV_ITEMS;

  const pageSectionItems = isMentorshipPage
    ? MENTORSHIP_FLOATING_ITEMS
    : isIndicatorPage
    ? INDICATOR_FLOATING_ITEMS
    : isStudentArea
    ? STUDENT_NAV_ITEMS
    : NAV_ITEMS;

  const brandLogoSrc = isMentorshipPage
    ? '/logo/TMR_LOGO.png'
    : isIndicatorPage
    ? '/logo/quantum_logo.png'
    : isHomePage
    ? '/logo/logo.png'
    : '/logo/logo-new-tab.png';

  const brandLogoAlt = isMentorshipPage
    ? 'TMR mentorship logo'
    : isIndicatorPage
    ? 'Quantum indicators logo'
    : isHomePage
    ? "Mellow's Hive home logo"
    : "Mellow's Hive";

  const brandLogoScaleClass = isMentorshipAttached ? 'scale-[2.2]' : '';
  const brandLinkClass = isMentorshipAttached
    ? 'flex items-center gap-2 overflow-hidden'
    : 'flex items-center gap-2';
  const brandLogoSizeClass = isMentorshipFloating
    ? 'h-36 w-36 md:h-36 md:w-36'
    : isMentorshipAttached
    ? 'h-14 w-14 md:h-16 md:w-16'
    : 'h-14 w-14 md:h-16 md:w-16';

  const ctaHref = session
    ? session.user.role === 'ADMIN'
      ? '/admin'
      : '/student/library'
    : '/login';
  const ctaLabel = session ? (session.user.role === 'ADMIN' ? 'Admin' : 'Dashboard') : 'Join now';

  return (
    <motion.nav
      initial={false}
      animate={isFloating ? { y: 10, scale: 0.98 } : { y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="fixed inset-x-0 top-0 z-50 px-0 md:px-4"
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-300 ${
          isServiceFloating
            ? 'mt-2 h-16 max-w-[940px] rounded-full border border-white/10 bg-[rgba(5,5,5,0.92)] px-6 shadow-[0_10px_28px_rgba(0,0,0,0.6)] backdrop-blur-xl'
            : isMentorshipAttached
            ? 'mt-0 h-16 max-w-full border-b border-white/5 bg-black/60 px-6 backdrop-blur-md'
            : isFloating
            ? 'mt-2 h-14 max-w-7xl rounded-xl border border-white/8 bg-black/85 px-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl'
            : 'mt-0 h-16 max-w-full border-b border-white/5 bg-black/60 px-6 backdrop-blur-md'
        }`}
      >
        <Link href={isStudentArea ? '/student/library' : '/'} className={brandLinkClass} onClick={() => setMobileOpen(false)}>
          <Image
            src={brandLogoSrc}
            alt={brandLogoAlt}
            width={64}
            height={64}
            className={`${brandLogoSizeClass} ${brandLogoScaleClass} shrink-0 object-contain`}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className={`hidden items-center lg:flex ${isServiceFloating ? 'gap-6' : 'gap-8'}`}>
          {floatingNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          {isStudentArea && session && (
            <Link
              href="/student/profile"
              className="flex items-center gap-2"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full border border-white/10"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/70">
                  {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
            </Link>
          )}
          <Link
            href={ctaHref}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              isServiceFloating
                ? 'bg-white/10 text-white hover:bg-white/15'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {ctaLabel}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="p-2 text-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation-menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 overflow-hidden border-y border-white/5 bg-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-6 py-6">
              {pageSectionItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-white/70 transition-colors hover:text-white hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href={ctaHref}
                onClick={() => setMobileOpen(false)}
                className="mt-4 block w-full rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-black transition-all hover:bg-white/90"
              >
                {ctaLabel}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
