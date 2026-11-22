'use client';

import React from 'react';
import {ArrowDown, ArrowUp, Settings} from 'lucide-react';
import {formatDataTransferred, formatSpeedValue} from '@/lib/speedtest-math';
import {SpeedTestState} from '@/hooks/use-speed-test';
import {TranslationStrings} from '@/lib/i18n';

interface MoreInfoPanelProps {
  state: SpeedTestState;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  t: TranslationStrings;
}

export function MoreInfoPanel({
  state,
  settingsOpen,
  onToggleSettings,
  t,
}: MoreInfoPanelProps) {
  const isUploading = state.phase === 'uploading';
  const uploadFormatted = formatSpeedValue(state.uploadMbps);

  const uploadReady = state.phase === 'complete' || state.uploadMbps > 0;
  const uploadTone = isUploading
    ? 'text-[#B5B5B5]'
    : state.phase === 'complete'
      ? 'text-[#222222]'
      : 'text-[#B5B5B5]';

  const uploadLabelTone =
    state.phase === 'complete' ? 'text-[#222222]' : 'text-[#A0A0A0]';

  const downloadedText = formatDataTransferred(state.downloadedBytes);
  const uploadedText = formatDataTransferred(state.uploadedBytes);

  return (
    <div
      data-testid="more-info-panel"
      className="w-full max-w-[660px] mx-auto mt-6 px-4"
    >
      {/* Two-column Latency & Upload grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
        {/* Latency Column */}
        <div>
          <h2 className="text-[18px] font-semibold text-[#222222] pb-2 border-b border-[#E5E5E5]">
            {t.latency}
          </h2>
          <div className="grid grid-cols-2 gap-6 pt-3">
            <div>
              <div className="text-[14px] text-[#737373] mb-1">{t.unloaded}</div>
              <div
                data-testid="unloaded-latency"
                className="flex items-baseline gap-1.5 tabular-nums"
              >
                <span className="font-display text-[40px] font-medium leading-none text-[#222222]">
                  {state.unloadedLatencyMs !== null ? state.unloadedLatencyMs : '—'}
                </span>
                {state.unloadedLatencyMs !== null && (
                  <span className="text-[14px] text-[#525252]">{t.ms}</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[14px] text-[#737373] mb-1">{t.loaded}</div>
              <div
                data-testid="loaded-latency"
                className="flex items-baseline gap-1.5 tabular-nums"
              >
                <span
                  className={`font-display text-[40px] font-medium leading-none transition-colors ${
                    state.loadedLatencyMs !== null ? 'text-[#222222]' : 'text-[#B5B5B5]'
                  }`}
                >
                  {state.loadedLatencyMs !== null ? state.loadedLatencyMs : '—'}
                </span>
                {state.loadedLatencyMs !== null && (
                  <span className="text-[14px] text-[#525252]">{t.ms}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Column */}
        <div>
          <h2
            className={`text-[18px] font-semibold pb-2 border-b border-[#E5E5E5] transition-colors ${uploadLabelTone}`}
          >
            {t.upload}
          </h2>
          <div className="pt-3">
            <div
              className={`text-[14px] mb-1 transition-colors ${
                state.phase === 'complete' ? 'text-[#737373]' : 'text-[#A0A0A0]'
              }`}
            >
              {t.speed}
            </div>
            <div
              data-testid="upload-speed"
              className="flex items-baseline gap-1.5 tabular-nums"
            >
              <span
                className={`font-display text-[40px] font-medium leading-none transition-colors ${uploadTone}`}
              >
                {uploadReady ? uploadFormatted.value : '—'}
              </span>
              {uploadReady && (
                <span
                  className={`text-[14px] transition-colors ${
                    state.phase === 'complete' ? 'text-[#525252]' : 'text-[#A0A0A0]'
                  }`}
                >
                  {uploadFormatted.unit}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client & Server(s) Metadata */}
      <div className="mt-6 space-y-1 text-[13px] text-[#8C8C8C]">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-[#7A7A7A]">{t.client}</span>
          <span>
            {state.clientLocation} · {state.clientIp}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-[#7A7A7A]">{t.servers}</span>
          <span>{state.servers.join(' | ')}</span>
        </div>
      </div>

      {/* 3-Cell Bordered Action & Data Usage Bar */}
      <div className="mt-4 grid grid-cols-3 border border-[#DCDCDC] rounded-[4px] bg-white divide-x divide-[#DCDCDC] text-[13px] text-[#7A7A7A]">
        <button
          type="button"
          onClick={onToggleSettings}
          aria-expanded={settingsOpen}
          data-testid="settings-toggle"
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 transition-colors cursor-pointer hover:bg-[#F7F7F7] hover:text-[#222222] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#222222] ${
            settingsOpen ? 'bg-[#F5F5F5] text-[#222222] font-medium' : ''
          }`}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{t.settings}</span>
        </button>

        <div
          data-testid="downloaded-bytes"
          className="flex items-center justify-center gap-1 py-2.5 px-3 tabular-nums whitespace-nowrap"
          title="Downloaded data"
        >
          <span>{downloadedText}</span>
          <ArrowDown className="w-3.5 h-3.5 shrink-0 text-[#8C8C8C]" aria-hidden="true" />
        </div>

        <div
          data-testid="uploaded-bytes"
          className="flex items-center justify-center gap-1 py-2.5 px-3 tabular-nums whitespace-nowrap"
          title="Uploaded data"
        >
          <span>{uploadedText}</span>
          <ArrowUp className="w-3.5 h-3.5 shrink-0 text-[#8C8C8C]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
