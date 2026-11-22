import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Veloce — Internet Speed Test & Network Telemetry',
    short_name: 'Veloce',
    description:
      'High-precision internet speed test and real-time network telemetry.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070709',
    theme_color: '#070709',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}