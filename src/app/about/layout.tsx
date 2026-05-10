import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about The Market Revelation — our mission to deliver precision trading education grounded in time cycles, price action, and institutional market structure.',
  alternates: { canonical: 'https://themarketrevelation.com/about' },
  openGraph: {
    title: 'About The Market Revelation',
    description:
      'We teach mathematical structure, not guesswork. Discover the philosophy and team behind The Market Revelation.',
    url: 'https://themarketrevelation.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
