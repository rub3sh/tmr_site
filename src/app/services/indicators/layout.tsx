import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Indicators',
  description:
    'Precision trading indicators by The Market Revelation. Built on time cycle logic and market structure — designed to give you an institutional edge in forex and futures markets.',
  alternates: { canonical: 'https://themarketrevelation.com/services/indicators' },
  openGraph: {
    title: 'Trading Indicators | The Market Revelation',
    description:
      'Institutional-grade indicators built on time cycles and market structure for forex and futures traders.',
    url: 'https://themarketrevelation.com/services/indicators',
  },
};

export default function IndicatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
