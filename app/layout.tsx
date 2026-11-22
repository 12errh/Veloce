import type {Metadata, Viewport} from 'next';
import {Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#070709',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Veloce — Internet Speed Test & Network Telemetry',
  description:
    'High-precision internet speed test and real-time network telemetry. Measures download throughput, upload bandwidth, unloaded and loaded latency, and connection jitter through a calibrated 260° speedometer.',
  applicationName: 'Veloce',
  colorScheme: 'dark',
  openGraph: {
    title: 'Veloce — Internet Speed Test & Network Telemetry',
    description:
      'High-precision internet speed test and real-time network telemetry.',
    type: 'website',
    siteName: 'Veloce',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veloce — Internet Speed Test & Network Telemetry',
    description:
      'High-precision internet speed test and real-time network telemetry.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark scroll-smooth`}
    >
      <body
        className="bg-[#070709] text-[#F3EFE6] antialiased selection:bg-[#991B1B]/40 selection:text-[#F3EFE6]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
