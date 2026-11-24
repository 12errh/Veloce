import {ImageResponse} from 'next/og';

export const alt = 'Veloce — Internet Speed Test & Network Telemetry';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070709',
          backgroundImage:
            'radial-gradient(900px 600px at 15% 80%, rgba(153,27,27,0.22), transparent 70%), radial-gradient(700px 500px at 85% 20%, rgba(197,160,89,0.10), transparent 70%)',
          color: '#F3EFE6',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 24,
          }}
        >
          <svg width="96" height="96" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient
                id="g"
                x1="4"
                y1="28"
                x2="28"
                y2="4"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#7F1D1D" />
                <stop offset="35%" stopColor="#B91C1C" />
                <stop offset="70%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#C5A059" />
              </linearGradient>
            </defs>
            <rect
              x="1.5"
              y="1.5"
              width="29"
              height="29"
              rx="8"
              fill="#0E0E12"
              stroke="#2D2A2E"
              strokeWidth="1.25"
            />
            <path
              d="M 7.57 23.07 A 11 11 0 1 1 24.43 23.07"
              fill="none"
              stroke="url(#g)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="16"
              x2="12.27"
              y2="8.36"
              stroke="#F3EFE6"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="2.4" fill="#D4AF37" />
            <circle cx="24.43" cy="23.07" r="1.5" fill="#C5A059" />
          </svg>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Veloce
          </span>
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#B5AEA2',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Internet Speed Test &amp; Network Telemetry
        </div>
        <div
          style={{
            marginTop: 40,
            width: 240,
            height: 4,
            borderRadius: 2,
            background:
              'linear-gradient(90deg, #7F1D1D, #B91C1C, #DC2626, #C5A059)',
          }}
        />
      </div>
    ),
    {...size}
  );
}