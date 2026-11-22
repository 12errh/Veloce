'use client';

import React from 'react';
import {Pause, Play, RotateCw} from 'lucide-react';
import {motion} from 'motion/react';
import {
  calculateGaugeArc,
  formatSpeedValue,
  getDynamicGaugeScale,
} from '@/lib/speedtest-math';
import {TestPhase} from '@/hooks/use-speed-test';

interface SpeedGaugeProps {
  phase: TestPhase;
  downloadMbps: number;
  uploadMbps: number;
  onPause: () => void;
  onResumeOrRestart: () => void;
  onRestart: () => void;
}

const DIAL_START_DEG = -130;
const DIAL_END_DEG = 130;
const DIAL_SPAN_DEG = DIAL_END_DEG - DIAL_START_DEG; // 260 deg

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

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 115,
  damping: 20,
  mass: 0.85,
};

const EASE_ASSEMBLE = [0.22, 1, 0.36, 1] as const;

export function WieckerGauge({
  phase,
  downloadMbps,
  uploadMbps,
  onPause,
  onResumeOrRestart,
  onRestart,
}: SpeedGaugeProps) {
  const isDownloading =
    phase === 'idle' || phase === 'measuring-latency' || phase === 'downloading';
  const isUploading = phase === 'uploading';
  const isActive = isDownloading || isUploading;
  const isPaused = phase === 'paused';

  const activeMetric = isUploading ? uploadMbps : downloadMbps;
  const scale = getDynamicGaugeScale(activeMetric);
  const {progress, angleDeg} = calculateGaugeArc(activeMetric, scale.maxMbps);

  const downloadDisplay = formatSpeedValue(downloadMbps);
  const uploadDisplay = formatSpeedValue(uploadMbps);

  const cx = 160;
  const cy = 160;
  const arcRadius = 134;
  const sweepPath = describeArc(cx, cy, arcRadius, DIAL_START_DEG, DIAL_END_DEG);

  // 25 minor graduation ticks evenly spaced across the 260-degree sweep
  const minorTickCount = 25;
  const minorTicks = Array.from({length: minorTickCount + 1}, (_, i) => {
    const ratio = i / minorTickCount;
    const deg = DIAL_START_DEG + ratio * DIAL_SPAN_DEG;
    const isMajor = i % 5 === 0;
    const innerR = isMajor ? 105 : 108;
    const outerR = 113;
    const p1 = polarToCartesian(cx, cy, innerR, deg);
    const p2 = polarToCartesian(cx, cy, outerR, deg);
    const lit = ratio <= progress + 0.005 && activeMetric > 0;
    return {i, p1, p2, isMajor, lit};
  });

  const phaseLabel =
    phase === 'measuring-latency'
      ? 'LATENCY'
      : phase === 'downloading'
        ? 'DOWNLOADING'
        : phase === 'uploading'
          ? 'UPLOADING'
          : phase === 'paused'
            ? 'PAUSED'
            : phase === 'complete'
              ? 'COMPLETE'
              : phase === 'error'
                ? 'ERROR'
                : 'READY';

  const activeGradientId = isUploading
    ? 'veloce-arc-grad-upload'
    : 'veloce-arc-grad-download';

  return (
    <div
      data-testid="speed-display"
      data-phase={phase}
      className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] select-none"
    >
      {/* Dynamic Noir Syndicate aura (Oxblood Crimson / Burnished Brass) */}
      <motion.div
        initial={{opacity: 0, scale: 0.65}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 0.85, delay: 0.2, ease: EASE_ASSEMBLE}}
        className="absolute inset-3 rounded-full pointer-events-none transition-colors duration-500"
        style={{
          background: isUploading
            ? 'radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.20), rgba(153, 27, 27, 0.12) 55%, transparent 76%)'
            : 'radial-gradient(circle at 38% 55%, rgba(185, 28, 28, 0.24), rgba(197, 160, 89, 0.07) 55%, transparent 76%)',
          filter: 'blur(22px)',
        }}
      />

      {/* Calibrated 260-degree Speedometer SVG */}
      <svg
        viewBox="0 0 320 320"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Download: Velvet Oxblood Crimson to Ruby & Brass Rim */}
          <linearGradient id="veloce-arc-grad-download" x1="10%" y1="90%" x2="90%" y2="15%">
            <stop offset="0%" stopColor="#7F1D1D" />
            <stop offset="45%" stopColor="#B91C1C" />
            <stop offset="80%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#C5A059" />
          </linearGradient>
          {/* Upload: Antique Brass / Champagne Gold to Oxblood */}
          <linearGradient id="veloce-arc-grad-upload" x1="10%" y1="90%" x2="90%" y2="15%">
            <stop offset="0%" stopColor="#926C26" />
            <stop offset="48%" stopColor="#C5A059" />
            <stop offset="82%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>

        {/* Matte dark full background ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={arcRadius}
          fill="none"
          stroke="#111115"
          strokeWidth="30"
          initial={{pathLength: 0, opacity: 0}}
          animate={{pathLength: 1, opacity: 1}}
          transition={{duration: 0.72, delay: 0.22, ease: EASE_ASSEMBLE}}
        />

        {/* Calibrated 260-degree gunmetal channel track */}
        <motion.path
          d={sweepPath}
          fill="none"
          stroke="#1A1A20"
          strokeWidth="30"
          strokeLinecap="round"
          initial={{pathLength: 0, opacity: 0}}
          animate={{pathLength: 1, opacity: 1}}
          transition={{duration: 0.78, delay: 0.28, ease: EASE_ASSEMBLE}}
        />

        {/* Active ambient glow arc */}
        <motion.path
          d={sweepPath}
          fill="none"
          stroke={`url(#${activeGradientId})`}
          strokeWidth="36"
          strokeLinecap="round"
          strokeOpacity="0.18"
          initial={{pathLength: 0}}
          animate={{pathLength: progress}}
          transition={SPRING_TRANSITION}
        />

        {/* Active calibrated speed arc synced 1:1 with needle */}
        <motion.path
          d={sweepPath}
          fill="none"
          stroke={`url(#${activeGradientId})`}
          strokeWidth="28"
          strokeLinecap="round"
          strokeOpacity="0.95"
          initial={{pathLength: 0}}
          animate={{pathLength: progress}}
          transition={SPRING_TRANSITION}
        />

        {/* Minor radial bezel ticks cascade sequentially */}
        {minorTicks.map((t) => (
          <motion.line
            key={t.i}
            x1={t.p1.x}
            y1={t.p1.y}
            x2={t.p2.x}
            y2={t.p2.y}
            stroke={
              t.lit
                ? isUploading
                  ? '#D4AF37'
                  : '#DC2626'
                : t.isMajor
                  ? '#4E4A45'
                  : '#2A282D'
            }
            strokeWidth={t.isMajor ? '2' : '1.2'}
            strokeLinecap="round"
            initial={{opacity: 0, pathLength: 0}}
            animate={{opacity: 1, pathLength: 1}}
            transition={{
              duration: 0.24,
              delay: 0.36 + t.i * 0.014,
              ease: EASE_ASSEMBLE,
            }}
          />
        ))}

        {/* Calibrated 6 scale ticks assemble into radial slots */}
        {scale.ticks.map((tickVal, idx) => {
          const ratio = idx / Math.max(1, scale.ticks.length - 1);
          const deg = DIAL_START_DEG + ratio * DIAL_SPAN_DEG;
          const pos = polarToCartesian(cx, cy, arcRadius, deg);
          const isReached = ratio <= progress + 0.02 && activeMetric > 0;
          return (
            <motion.text
              key={idx}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{
                duration: 0.35,
                delay: 0.48 + idx * 0.045,
                ease: EASE_ASSEMBLE,
              }}
              className={`text-[11px] font-bold tabular-nums transition-colors duration-200 ${
                isReached ? 'fill-[#F3EFE6]' : 'fill-[#A8A095]'
              }`}
              style={{
                fontFamily: 'var(--font-display), sans-serif',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)',
              }}
            >
              {tickVal}
            </motion.text>
          );
        })}

        {/* Bottom Scale Unit & Phase Indicator */}
        <motion.text
          x={cx}
          y={278}
          textAnchor="middle"
          initial={{opacity: 0, y: 6}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4, delay: 0.72, ease: EASE_ASSEMBLE}}
          className="fill-[#7D776D] text-[9.5px] font-bold tracking-[0.12em] uppercase"
          style={{fontFamily: 'var(--font-display), sans-serif'}}
        >
          {scale.unitLabel} · {phaseLabel}
        </motion.text>
      </svg>

      {/* Inner Matte Charcoal Dial Face */}
      <motion.div
        initial={{scale: 0.74, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        transition={{type: 'spring', stiffness: 190, damping: 22, delay: 0.34}}
        className="absolute w-[176px] h-[176px] sm:w-[214px] sm:h-[214px] rounded-full bg-[#0E0E12] border border-[#29272E] flex items-center justify-center"
        style={{
          boxShadow:
            'inset 0 2px 22px rgba(0, 0, 0, 0.75), 0 14px 36px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Spring-Damped Precision Needle */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          initial={{rotate: DIAL_START_DEG, opacity: 0}}
          animate={{rotate: angleDeg, opacity: 1}}
          transition={{
            rotate: SPRING_TRANSITION,
            opacity: {duration: 0.35, delay: 0.52},
          }}
        >
          <div
            className="mx-auto mt-2 sm:mt-2.5 w-[4px] h-[72px] sm:h-[88px] rounded-full"
            style={{
              background: isUploading
                ? 'linear-gradient(to bottom, #D4AF37 0%, rgba(212,175,55,0.28) 55%, rgba(212,175,55,0.04) 100%)'
                : 'linear-gradient(to bottom, #F3EFE6 0%, rgba(220,38,38,0.48) 55%, rgba(220,38,38,0.05) 100%)',
              boxShadow: isUploading
                ? '0 0 10px rgba(212, 175, 55, 0.45)'
                : '0 0 10px rgba(220, 38, 38, 0.45)',
            }}
          />
        </motion.div>

        {/* Top-left Upload Readout (Champagne Gold) */}
        <motion.div
          data-testid="gauge-upload-value"
          initial={{opacity: 0, x: -8, y: -6}}
          animate={{opacity: isUploading || uploadMbps > 0 ? 1 : 0.55, x: 0, y: 0}}
          transition={{duration: 0.42, delay: 0.6}}
          className="z-10 absolute top-5 left-6 sm:top-7 sm:left-8 text-left tabular-nums"
        >
          <div className="font-display text-[24px] sm:text-[32px] font-bold leading-none text-[#D4AF37]">
            {uploadDisplay.value}
          </div>
          <div className="mt-1 text-[9px] font-bold tracking-[0.06em] uppercase text-[#C5A059]">
            {uploadDisplay.unit} ↑
          </div>
        </motion.div>

        {/* Bottom-right Download Readout (Crimson) */}
        <motion.div
          data-testid="gauge-download-value"
          initial={{opacity: 0, x: 8, y: 6}}
          animate={{opacity: isDownloading || downloadMbps > 0 ? 1 : 0.65, x: 0, y: 0}}
          transition={{duration: 0.42, delay: 0.66}}
          className="z-10 absolute bottom-5 right-6 sm:bottom-7 sm:right-8 text-right tabular-nums"
        >
          <div
            data-testid="speed-value"
            className="font-display text-[24px] sm:text-[32px] font-bold leading-none text-[#EF4444]"
          >
            {downloadDisplay.value}
          </div>
          <div
            data-testid="speed-unit"
            className="mt-1 text-[9px] font-bold tracking-[0.06em] uppercase text-[#DC2626]"
          >
            {downloadDisplay.unit} ↓
          </div>
        </motion.div>

        {/* Center Matte Obsidian Hub Action Button */}
        <motion.div
          initial={{scale: 0, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          transition={{type: 'spring', stiffness: 260, damping: 18, delay: 0.52}}
          className="relative z-20"
        >
          {isActive ? (
            <button
              type="button"
              onClick={onPause}
              aria-label="Pause speed test"
              data-testid="action-pause"
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#17171C] border border-[#333037] text-[#F3EFE6] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.65)] hover:border-[#C5A059] hover:scale-105 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]"
            >
              <svg
                className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] animate-fast-spin pointer-events-none"
                viewBox="0 0 48 48"
                fill="none"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  stroke={isUploading ? '#D4AF37' : '#DC2626'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="48 75"
                  strokeOpacity="0.9"
                />
              </svg>
              <Pause className="w-4 h-4 fill-[#F3EFE6]" aria-hidden="true" />
            </button>
          ) : isPaused ? (
            <button
              type="button"
              onClick={onResumeOrRestart}
              aria-label="Resume speed test"
              data-testid="action-resume"
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#17171C] border border-[#333037] text-[#F3EFE6] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.65)] hover:border-[#C5A059] hover:scale-105 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]"
            >
              <Play className="w-4 h-4 fill-[#F3EFE6] ml-0.5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onRestart}
              aria-label="Restart speed test"
              data-testid="action-restart"
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#17171C] border border-[#333037] text-[#F3EFE6] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.65)] hover:border-[#C5A059] hover:scale-105 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]"
            >
              <RotateCw className="w-4 h-4 stroke-[2.2] text-[#F3EFE6]" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
