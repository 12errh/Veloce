import type {Metadata} from 'next';
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

export const metadata: Metadata = {
  title: 'Veloce — Internet Speed Test & Latency Telemetry',
  description:
    'Measure real-time download speed, upload throughput, unloaded and loaded ping, and live network data transfer.',
  openGraph: {
    title: 'Veloce — Internet Speed Test & Latency Telemetry',
    description:
      'Measure real-time download speed, upload throughput, unloaded and loaded ping.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veloce — Internet Speed Test & Latency Telemetry',
    description:
      'Measure real-time download speed, upload throughput, unloaded and loaded ping.',
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
