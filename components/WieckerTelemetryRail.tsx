'use client';

import React from 'react';
import {Activity, ArrowDown, ArrowUp, ChevronUp, Flame} from 'lucide-react';
import {motion} from 'motion/react';
import {buildSparklinePath, formatSpeedValue} from '@/lib/speedtest-math';
import {SpeedTestState} from '@/hooks/use-speed-test';
import {TranslationStrings} from '@/lib/i18n';

interface NetworkRailProps {
  state: SpeedTestState;
  networkName: string;
  onEditNetworkName: () => void;
  t: TranslationStrings;
}

const EASE_ASSEMBLE = [0.22, 1, 0.36, 1] as const;

export function WieckerNetworkRail({
  state,
  networkName,
  onEditNetworkName,
  t,
}: NetworkRailProps) {
  const down = formatSpeedValue(state.downloadMbps);
  const up = formatSpeedValue(state.uploadMbps);
  const pingValue = state.unloadedLatencyMs ?? 0;

  const metaLine = [
    state.clientIp,
    state.clientLocation,
    state.asn,
    state.connectionLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <aside
      aria-label="Network Metrics"
      className="flex flex-col items-center md:items-start text-center md:text-left w-full max-w-[360px] md:max-w-none md:min-w-[195px]"
    >
      <motion.div
        initial={{opacity: 0, y: 14}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.48, delay: 0.48, ease: EASE_ASSEMBLE}}
        className="mb-4 md:mb-6"
      >
        <div className="text-[12px] text-[#9C968B] tracking-wide">Your Network</div>
        <button
          type="button"
          onClick={onEditNetworkName}
          title="Click to customize network label"
          data-testid="network-name-button"
          className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight text-[#F3EFE6] hover:text-[#C5A059] transition-colors cursor-pointer md:text-left leading-tight mt-0.5"
        >
          {networkName}
        </button>
        <div
          data-testid="network-meta-line"
          className="text-[11px] text-[#7D776D] mt-1 tabular-nums leading-snug max-w-[260px]"
        >
          {metaLine}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-4 w-full">
        {/* Download */}
        <motion.div
          initial={{opacity: 0, x: 18}}
          animate={{opacity: 1, x: 0}}
          transition={{duration: 0.45, delay: 0.6, ease: EASE_ASSEMBLE}}
        >
          <div className="text-[11px] sm:text-[12px] text-[#9C968B] mb-0.5">Download</div>
          <div className="flex items-baseline justify-center md:justify-start gap-1 sm:gap-1.5 tabular-nums">
            <span className="font-display text-[26px] sm:text-[36px] font-normal leading-none text-[#F3EFE6]">
              {down.value}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#EF4444]">
              {down.unit}
              <ArrowDown className="w-3 h-3" aria-hidden="true" />
            </span>
          </div>
        </motion.div>

        {/* Upload */}
        <motion.div
          initial={{opacity: 0, x: 18}}
          animate={{opacity: 1, x: 0}}
          transition={{duration: 0.45, delay: 0.72, ease: EASE_ASSEMBLE}}
        >
          <div className="text-[11px] sm:text-[12px] text-[#9C968B] mb-0.5">{t.upload}</div>
          <div
            data-testid="upload-speed"
            className="flex items-baseline justify-center md:justify-start gap-1 sm:gap-1.5 tabular-nums"
          >
            <span className="font-display text-[26px] sm:text-[36px] font-normal leading-none text-[#F3EFE6]">
              {up.value}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#D4AF37]">
              {up.unit}
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
            </span>
          </div>
        </motion.div>

        {/* Ping + Jitter */}
        <motion.div
          initial={{opacity: 0, x: 18}}
          animate={{opacity: 1, x: 0}}
          transition={{duration: 0.45, delay: 0.84, ease: EASE_ASSEMBLE}}
        >
          <div className="text-[11px] sm:text-[12px] text-[#9C968B] mb-0.5">Ping</div>
          <div
            data-testid="unloaded-latency"
            className="flex items-baseline justify-center md:justify-start gap-1 sm:gap-1.5 tabular-nums"
          >
            <span className="font-display text-[26px] sm:text-[36px] font-normal leading-none text-[#F3EFE6]">
              {state.unloadedLatencyMs !== null ? pingValue : '—'}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#D6D1C7]">
              MS
              <ArrowDown className="w-3 h-3" aria-hidden="true" />
            </span>
          </div>
          {state.jitterMs !== null && (
            <div className="text-[11px] text-[#7D776D] mt-0.5 tabular-nums">
              Jitter {state.jitterMs} ms
            </div>
          )}
        </motion.div>
      </div>
    </aside>
  );
}

interface DataStripProps {
  downloadedBytes: number;
  uploadedBytes: number;
  downloadHistory: number[];
  uploadHistory: number[];
  progressPct: number;
  detailsExpanded: boolean;
  onToggleDetails: () => void;
}

export function WieckerDataStrip({
  downloadedBytes,
  uploadedBytes,
  downloadHistory,
  uploadHistory,
  progressPct,
  detailsExpanded,
  onToggleDetails,
}: DataStripProps) {
  const totalMb = (downloadedBytes + uploadedBytes) / (1024 * 1024);
  const formattedTotalMb = totalMb > 0 ? `${totalMb.toFixed(2)} MB` : '0.00 MB';

  const downloadSparkPath = buildSparklinePath(downloadHistory, 84, 24, 3);
  const uploadSparkPath = buildSparklinePath(
    uploadHistory.length > 0 ? uploadHistory : downloadHistory,
    74,
    14,
    2
  );

  return (
    <div className="w-full max-w-[360px] mx-auto mt-4 sm:mt-6 flex items-center justify-between gap-4 px-2">
      {/* Left: DATA Used + live oxblood crimson sparkline */}
      <motion.div
        initial={{opacity: 0, x: -16}}
        animate={{opacity: 1, x: 0}}
        transition={{duration: 0.45, delay: 0.64, ease: EASE_ASSEMBLE}}
        className="flex flex-col items-start min-w-[96px]"
      >
        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9C968B] mb-1">
          <Flame className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
          <span>
            <strong className="font-bold text-[#F3EFE6]">DATA</strong> Used
          </span>
        </div>
        <svg
          width="84"
          height="24"
          viewBox="0 0 84 24"
          fill="none"
          aria-hidden="true"
        >
          <motion.path
            d={downloadSparkPath}
            stroke="url(#veloce-data-wave)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{pathLength: 0}}
            animate={{pathLength: 1}}
            transition={{duration: 0.6, delay: 0.72, ease: EASE_ASSEMBLE}}
          />
          <defs>
            <linearGradient
              id="veloce-data-wave"
              x1="0"
              y1="0"
              x2="84"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#991B1B" />
              <stop offset="1" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Center: Oxblood Crimson Syndicate Seal Toggle Button */}
      <motion.button
        type="button"
        onClick={onToggleDetails}
        aria-expanded={detailsExpanded}
        data-state={detailsExpanded ? 'open' : 'closed'}
        aria-label={
          detailsExpanded
            ? 'Close detailed telemetry'
            : 'Open detailed telemetry'
        }
        title={detailsExpanded ? 'Close detailed telemetry' : 'Open detailed telemetry'}
        data-testid="show-more-info"
        initial={{scale: 0, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        whileHover={{scale: 1.07}}
        whileTap={{scale: 0.94}}
        transition={{type: 'spring', stiffness: 280, damping: 18, delay: 0.58}}
        className={`w-11 h-11 rounded-full text-[#F3EFE6] flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] ${
          detailsExpanded
            ? 'bg-[#B91C1C] ring-2 ring-[#D4AF37]/75 shadow-[0_6px_22px_rgba(185,28,28,0.55)]'
            : 'bg-[#991B1B] hover:bg-[#B91C1C] border border-[#DC2626]/40 shadow-[0_6px_18px_rgba(153,27,27,0.45)]'
        }`}
      >
        <Activity
          className="w-4 h-4 stroke-[2.2] transition-transform duration-300 ease-out"
          aria-hidden="true"
        />
      </motion.button>

      {/* Right: Total MB + Champagne Gold sparkline + progress % */}
      <motion.div
        initial={{opacity: 0, x: 16}}
        animate={{opacity: 1, x: 0}}
        transition={{duration: 0.45, delay: 0.7, ease: EASE_ASSEMBLE}}
        className="flex flex-col items-end min-w-[96px] tabular-nums"
      >
        <div
          data-testid="downloaded-bytes"
          className="text-[11px] font-semibold text-[#F3EFE6] mb-0.5"
        >
          {formattedTotalMb}
        </div>
        <svg
          width="74"
          height="14"
          viewBox="0 0 74 14"
          fill="none"
          aria-hidden="true"
        >
          <motion.path
            d={uploadSparkPath}
            stroke="#C5A059"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{pathLength: 0}}
            animate={{pathLength: 1}}
            transition={{duration: 0.6, delay: 0.78, ease: EASE_ASSEMBLE}}
          />
        </svg>
        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#D6D1C7]">
          <ChevronUp className="w-3 h-3 text-[#9C968B]" aria-hidden="true" />
          <span>{progressPct}%</span>
        </div>
      </motion.div>
    </div>
  );
}
