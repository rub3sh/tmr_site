import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Mentorship', href: '/services/mentorship' },
  { label: 'Indicator', href: '/services/indicators' },
  { label: 'Prop Firms', href: '/services/prop-firms' },
  { label: 'Trading Education', href: '/market-education' },
  { label: 'About', href: '/about' },
] as const;

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/policy' },
  { label: 'Terms of Service', href: '/policy' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo/logo.png"
                alt="InnerEdgeCapital"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold text-white">InnerEdgeCapital</span>
            </div>
            <p className="text-sm leading-relaxed text-white/40">
              The standard of trading education and guidance.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} InnerEdgeCapital. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
