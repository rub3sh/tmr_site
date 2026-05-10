import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentorship Program',
  description:
    'Join The Market Revelation mentorship program. Get direct access to professional traders, live sessions, and a structured curriculum built around time cycles and price action mastery.',
  alternates: { canonical: 'https://themarketrevelation.com/services/mentorship' },
  openGraph: {
    title: 'Trading Mentorship Program | The Market Revelation',
    description:
      'Live sessions, structured curriculum, and direct mentor access. The fastest path to trading mastery.',
    url: 'https://themarketrevelation.com/services/mentorship',
  },
};

export default function MentorshipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
