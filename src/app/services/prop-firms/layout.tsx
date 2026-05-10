import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prop Firm Preparation',
  description:
    'Pass your prop firm challenge with The Market Revelation. Structured preparation covering risk management, trade execution, and the discipline required to trade funded accounts.',
  alternates: { canonical: 'https://themarketrevelation.com/services/prop-firms' },
  openGraph: {
    title: 'Prop Firm Preparation | The Market Revelation',
    description:
      'Structured training to help you pass funded account challenges. Risk management, execution, and mindset.',
    url: 'https://themarketrevelation.com/services/prop-firms',
  },
};

export default function PropFirmsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
