import React from 'react';

export function FastLogo() {
  return (
    <div
      className="flex flex-col items-center select-none"
      role="img"
      aria-label="FAST.com logo"
    >
      <svg
        width="128"
        height="68"
        viewBox="0 0 108 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-0.5"
      >
        {/* Outer red gauge semicircle */}
        <path
          d="M 10 50 A 44 44 0 0 1 98 50"
          stroke="#E50914"
          strokeWidth="6.5"
          strokeLinecap="butt"
        />
        {/* Left & right base inward ticks */}
        <line x1="6.75" y1="50" x2="17" y2="50" stroke="#E50914" strokeWidth="6" />
        <line x1="91" y1="50" x2="101.25" y2="50" stroke="#E50914" strokeWidth="6" />

        {/* Right-side signal arcs */}
        <path
          d="M 54 20 A 30 30 0 0 1 84 50"
          stroke="#E50914"
          strokeWidth="6"
          fill="none"
        />
        <path
          d="M 54 33 A 17 17 0 0 1 71 50"
          stroke="#E50914"
          strokeWidth="6"
          fill="none"
        />

        {/* Needle */}
        <polygon points="51.2,49 54,13 56.8,49" fill="#111111" />
        <circle cx="54" cy="49" r="5" fill="#111111" />
      </svg>

      <span className="font-display text-[44px] font-extrabold tracking-[0.04em] leading-none text-[#111111]">
        FAST
      </span>
    </div>
  );
}

export function PoweredByNetflix({label}: {label: string}) {
  return (
    <a
      href="https://www.netflix.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by Netflix"
      className="inline-flex items-baseline gap-2 group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E50914] rounded-sm"
    >
      <span className="text-[11px] font-medium tracking-[0.08em] text-[#4A4A4A] uppercase whitespace-nowrap">
        {label}
      </span>
      <span className="font-condensed text-[23px] font-bold tracking-[0.03em] leading-none text-[#E50914] group-hover:opacity-85 transition-opacity">
        NETFLIX
      </span>
    </a>
  );
}
