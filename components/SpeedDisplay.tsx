'use client';

import React from 'react';
import {Pause, Play, RotateCw} from 'lucide-react';
import {formatSpeedValue} from '@/lib/speedtest-math';
import {TestPhase} from '@/hooks/use-speed-test';
import {TranslationStrings} from '@/lib/i18n';

interface SpeedDisplayProps {
  phase: TestPhase;
  downloadMbps: number;
  errorMessage: string | null;
  t: TranslationStrings;
  onPause: () => void;
  onResumeOrRestart: () => void;
  onRestart: () => void;
}

export function SpeedDisplay({
  phase,
  downloadMbps,
  errorMessage,
  t,
  onPause,
  onResumeOrRestart,
  onRestart,
}: SpeedDisplayProps) {
  const isDownloading =
    phase === 'idle' || phase === 'measuring-latency' || phase === 'downloading';
  const isUploading = phase === 'uploading';
  const isActive = isDownloading || isUploading;
  const isDownloadFinished =
    phase === 'download-complete' ||
    phase === 'uploading' ||
    phase === 'complete';
  const isPaused = phase === 'paused';
  const isError = phase === 'error';

  const {value, unit} = formatSpeedValue(downloadMbps);

  const numberColorClass = isDownloading
    ? 'text-[#B5B5B5]'
    : isPaused
      ? 'text-[#8C8C8C]'
      : 'text-[#222222]';

  const unitColorClass = isDownloading ? 'text-[#B5B5B5]' : 'text-[#222222]';

  return (
    <section
      aria-live="polite"
      aria-label="Internet Speed Readout"
      data-testid="speed-display"
      data-phase={phase}
      className="flex flex-col items-center justify-center w-full"
    >
      {/* Top status line */}
      <div className="min-h-[36px] flex items-center justify-center mb-1">
        {isDownloadFinished && (
          <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-[#222222] tracking-[-0.01em] text-center">
            {t.yourSpeedIs}
          </h1>
        )}
        {isPaused && (
          <p className="font-display text-[18px] sm:text-[20px] font-semibold text-[#666666]">
            {t.testPaused}
          </p>
        )}
        {isError && (
          <p className="text-[15px] font-medium text-[#D92D20] text-center max-w-md">
            {errorMessage || t.testingError}
          </p>
        )}
      </div>

      {/* Giant speed readout + unit & action ring */}
      <div className="flex items-start justify-center gap-3 sm:gap-5 select-none">
        <div
          data-testid="speed-value"
          className={`font-display tabular-nums font-medium leading-[0.88] tracking-[-0.03em] transition-colors duration-200 ${numberColorClass} text-[108px] sm:text-[176px] md:text-[220px]`}
        >
          {value}
        </div>

        <div className="flex flex-col items-center pt-2 sm:pt-4 min-w-[74px] sm:min-w-[100px]">
          <span
            data-testid="speed-unit"
            className={`font-display text-[28px] sm:text-[42px] font-bold leading-none transition-colors duration-200 ${unitColorClass}`}
          >
            {unit}
          </span>

          {/* Circular Progress / Pause / Resume / Restart Button */}
          <div className="mt-4 sm:mt-6">
            {isActive ? (
              <button
                type="button"
                onClick={onPause}
                aria-label={t.pauseTest}
                data-testid="action-pause"
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white border border-[#D4D4D4] hover:border-[#A3A3A3] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
              >
                {/* Rotating amber progress arc */}
                <svg
                  className="absolute inset-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] animate-fast-spin pointer-events-none"
                  viewBox="0 0 56 56"
                  fill="none"
                >
                  <circle
                    cx="28"
                    cy="28"
                    r="26"
                    stroke="#F5A623"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="60 110"
                  />
                </svg>
                <Pause
                  className="w-5 h-5 text-[#C8C8C8] fill-[#C8C8C8]"
                  aria-hidden="true"
                />
              </button>
            ) : isPaused ? (
              <button
                type="button"
                onClick={onResumeOrRestart}
                aria-label={t.resumeTest}
                data-testid="action-resume"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white border-2 border-[#F5A623] text-[#F5A623] hover:bg-[#FFF9ED] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onRestart}
                aria-label={t.restartTest}
                data-testid="action-restart"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white border-2 border-[#39B54A] text-[#222222] hover:bg-[#39B54A]/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39B54A]"
              >
                <RotateCw className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
