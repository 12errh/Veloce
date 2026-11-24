import {ImageResponse} from 'next/og';

export const size = {width: 32, height: 32};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070709',
          borderRadius: 8,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
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
      </div>
    ),
    {...size}
  );
}