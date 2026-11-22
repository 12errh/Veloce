'use client';

import React from 'react';
import {motion} from 'motion/react';

interface BackdropCurvesProps {
  stabilityPct: number;
  completionPct: number;
}

const EASE_DRAW = [0.22, 1, 0.36, 1] as const;

export function WieckerBackdropCurves({
  stabilityPct,
  completionPct,
}: BackdropCurvesProps) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 right-0 h-[680px] overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 680"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="veloce-wave-stroke" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#7F1D1D" />
            <stop offset="32%" stopColor="#DC2626" />
            <stop offset="62%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#2B292E" />
          </linearGradient>
        </defs>

        {/* Left geometric U-loop trace in tailored pewter */}
        <motion.path
          d="M 16 250 L 16 320 A 36 36 0 0 0 88 320 L 88 210 A 38 38 0 0 1 164 210 L 164 326 A 40 40 0 0 0 244 326 L 244 108"
          stroke="#3E3D45"
          strokeWidth="1.35"
          initial={{pathLength: 0, opacity: 0}}
          animate={{pathLength: 1, opacity: 1}}
          transition={{duration: 0.95, delay: 0.08, ease: EASE_DRAW}}
        />
        <motion.circle
          cx="244"
          cy="108"
          r="3.2"
          fill="#E6DFD3"
          initial={{scale: 0, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          transition={{type: 'spring', stiffness: 260, damping: 18, delay: 0.85}}
          style={{transformBox: 'fill-box', transformOrigin: 'center'}}
        />
        <motion.circle
          cx="16"
          cy="276"
          r="2.5"
          fill="#C5A059"
          initial={{scale: 0, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          transition={{type: 'spring', stiffness: 260, damping: 18, delay: 0.25}}
          style={{transformBox: 'fill-box', transformOrigin: 'center'}}
        />

        {/* Right geometric U-loop trace */}
        <motion.path
          d="M 1160 194 L 1160 162 A 30 30 0 0 1 1220 162 L 1220 198 A 28 28 0 0 0 1276 198 L 1276 118 A 32 32 0 0 1 1340 118 L 1340 198 A 30 30 0 0 0 1400 198"
          stroke="#3E3D45"
          strokeWidth="1.35"
          initial={{pathLength: 0, opacity: 0}}
          animate={{pathLength: 1, opacity: 1}}
          transition={{duration: 0.9, delay: 0.14, ease: EASE_DRAW}}
        />
        <motion.polygon
          points="1215,174 1220,162 1225,174"
          fill="#E6DFD3"
          initial={{scale: 0, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          transition={{type: 'spring', stiffness: 260, damping: 18, delay: 0.72}}
          style={{transformBox: 'fill-box', transformOrigin: 'center'}}
        />

        {/* Sweeping Oxblood-to-Gold Signal Wave across stage */}
        <motion.path
          d="M -10 500 C 65 452, 130 578, 210 578 C 295 578, 320 420, 405 420 C 480 420, 505 480, 575 420 C 650 356, 710 370, 785 398 C 855 422, 915 432, 990 424 C 1150 408, 1330 335, 1455 245"
          stroke="url(#veloce-wave-stroke)"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{pathLength: 0, opacity: 0.25}}
          animate={{pathLength: 1, opacity: 1}}
          transition={{duration: 1.08, delay: 0.16, ease: EASE_DRAW}}
        />

        {/* Left Champagne-Gold Stability Node */}
        <g transform="translate(108, 496)">
          <motion.g
            initial={{scale: 0, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{type: 'spring', stiffness: 240, damping: 18, delay: 0.45}}
            style={{transformOrigin: '0px 0px'}}
          >
            <text
              x="0"
              y="-22"
              textAnchor="middle"
              className="fill-[#D4AF37] text-[13px] font-semibold"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              {stabilityPct}%
            </text>
            <circle cx="0" cy="0" r="15" fill="#141418" stroke="#363022" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="9.5" fill="#C5A059" />
          </motion.g>
        </g>

        {/* Right Oxblood-Crimson Progress Node */}
        <g transform="translate(940, 427)">
          <motion.g
            initial={{scale: 0, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{type: 'spring', stiffness: 240, damping: 18, delay: 0.82}}
            style={{transformOrigin: '0px 0px'}}
          >
            <text
              x="0"
              y="-22"
              textAnchor="middle"
              className="fill-[#EF4444] text-[13px] font-semibold"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              {completionPct}%
            </text>
            <circle cx="0" cy="0" r="15" fill="#141418" stroke="#3B1E20" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="9.5" fill="#B91C1C" />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
