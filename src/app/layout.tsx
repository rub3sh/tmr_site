import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { DevToolsBlocker } from '@/components/dev-tools-blocker';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const BASE_URL = 'https://themarketrevelation.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'The Market Revelation | Elite Trading Education',
    template: '%s | The Market Revelation',
  },
  description:
    'Master financial markets with The Market Revelation. Learn time cycles, price action, market structure, and institutional trading logic through precision-engineered courses built for serious traders.',
  keywords: [
    'trading education',
    'price action trading',
    'time cycles trading',
    'market structure',
    'forex trading course',
    'futures trading',
    'institutional trading',
    'trading mentorship',
    'prop firm training',
    'technical analysis',
    'The Market Revelation',
    'TMR trading',
  ],
  authors: [{ name: 'The Market Revelation', url: BASE_URL }],
  creator: 'The Market Revelation',
  publisher: 'The Market Revelation',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'The Market Revelation',
    title: 'The Market Revelation | Elite Trading Education',
    description:
      'Master financial markets with precision-engineered courses. Time cycles, price action, market structure — taught by professional traders.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Market Revelation — Elite Trading Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Market Revelation | Elite Trading Education',
    description:
      'Master financial markets with precision-engineered courses. Time cycles, price action, market structure.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-black text-white font-body antialiased">
        <Providers>{children}</Providers>
        <DevToolsBlocker />
      </body>
    </html>
  );
}
