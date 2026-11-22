'use client';

import React from 'react';
import {RotateCw} from 'lucide-react';
import {motion} from 'motion/react';

interface AppHeaderProps {
  onRestartTest: () => void;
  onOpenPrivacy: () => void;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function polarToCartesian(cx: number, cy: number, radius: number, dialDeg: number) {
  const rad = ((dialDeg - 90) * Math.PI) / 180;
  return {
    x: Number((cx + radius * Math.cos(rad)).toFixed(2)),
    y: Number((cy + radius * Math.sin(rad)).toFixed(2)),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startDialDeg: number,
  endDialDeg: number
) {
  const start = polarToCartesian(cx, cy, radius, startDialDeg);
  const end = polarToCartesian(cx, cy, radius, endDialDeg);
  const largeArcFlag = endDialDeg - startDialDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function WieckerHeader({
  onRestartTest,
  onOpenPrivacy,
}: AppHeaderProps) {
  const cx = 16;
  const cy = 16;
  const arcRadius = 11;
  const sweepPath = describeArc(cx, cy, arcRadius, -130, 130);
  const needleTip = polarToCartesian(cx, cy, 8.5, -26);

  return (
    <header className="w-full relative z-30">
      <div className="max-w-[1220px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Veloce Brand Emblem & Wordmark */}
        <a
          href="#"
          className="inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059] rounded-sm"
        >
          <motion.svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            initial={{scale: 0.65, opacity: 0, rotate: -12}}
            animate={{scale: 1, opacity: 1, rotate: 0}}
            transition={{type: 'spring', stiffness: 260, damping: 20, delay: 0.04}}
          >
            <defs>
              <linearGradient
                id="veloce-mark-grad"
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

            {/* Matte obsidian squircle container */}
            <motion.rect
              x="1.5"
              y="1.5"
              width="29"
              height="29"
              rx="8"
              fill="#0E0E12"
              stroke="#2D2A2E"
              strokeWidth="1.25"
              initial={{pathLength: 0, opacity: 0}}
              animate={{pathLength: 1, opacity: 1}}
              transition={{duration: 0.5, delay: 0.06, ease: EASE_OUT}}
            />

            {/* 260-degree calibrated speedometer arc */}
            <motion.path
              d={sweepPath}
              fill="none"
              stroke="url(#veloce-mark-grad)"
              strokeWidth="2.6"
              strokeLinecap="round"
              initial={{pathLength: 0, opacity: 0}}
              animate={{pathLength: 1, opacity: 1}}
              transition={{duration: 0.7, delay: 0.16, ease: EASE_OUT}}
            />

            {/* Spring-damped needle */}
            <motion.line
              x1={cx}
              y1={cy}
              x2={needleTip.x}
              y2={needleTip.y}
              stroke="#F3EFE6"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{pathLength: 0, opacity: 0}}
              animate={{pathLength: 1, opacity: 1}}
              transition={{duration: 0.45, delay: 0.42, ease: EASE_OUT}}
            />

            {/* Gold hub dot */}
            <motion.circle
              cx={cx}
              cy={cy}
              r="2.4"
              fill="#D4AF37"
              initial={{scale: 0, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              transition={{type: 'spring', stiffness: 320, damping: 16, delay: 0.5}}
              style={{transformBox: 'fill-box', transformOrigin: 'center'}}
            />

            {/* Gold tip dot at arc terminus */}
            <motion.circle
              cx={polarToCartesian(cx, cy, arcRadius, 130).x}
              cy={polarToCartesian(cx, cy, arcRadius, 130).y}
              r="1.5"
              fill="#C5A059"
              initial={{scale: 0, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              transition={{type: 'spring', stiffness: 320, damping: 16, delay: 0.62}}
              style={{transformBox: 'fill-box', transformOrigin: 'center'}}
            />
          </motion.svg>
          <motion.span
            initial={{opacity: 0, x: -10}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.42, delay: 0.14, ease: EASE_OUT}}
            className="font-display text-[20px] font-bold tracking-tight text-[#F3EFE6]"
          >
            Veloce
          </motion.span>
        </a>

        {/* Minimal Real Controls assemble from top */}
        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
          <motion.button
            type="button"
            onClick={onOpenPrivacy}
            data-testid="privacy-button"
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.18, ease: EASE_OUT}}
            className="text-[13px] font-medium text-[#9C968B] hover:text-[#F3EFE6] transition-colors cursor-pointer whitespace-nowrap py-1"
          >
            Privacy
          </motion.button>

          <motion.button
            type="button"
            onClick={onRestartTest}
            aria-label="Restart speed test"
            data-testid="header-restart-button"
            initial={{opacity: 0, y: -10, scale: 0.94}}
            animate={{opacity: 1, y: 0, scale: 1}}
            transition={{duration: 0.42, delay: 0.24, ease: EASE_OUT}}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-[13px] font-medium text-[#F3EFE6] border border-[#2F2D33] rounded-[4px] bg-[#111115] hover:bg-[#19181E] hover:border-[#B91C1C] transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
            <span className="hidden sm:inline">Restart test</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
