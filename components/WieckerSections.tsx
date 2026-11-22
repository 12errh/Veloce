'use client';

import React, {useEffect, useState} from 'react';
import {Download, Settings, Share2, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {
  formatDataTransferred,
  formatSpeedValue,
  SpeedTestSettings,
} from '@/lib/speedtest-math';
import {SpeedTestState} from '@/hooks/use-speed-test';
import {TranslationStrings} from '@/lib/i18n';
import {SettingsPanel} from '@/components/SettingsPanel';

interface DetailedDrawerProps {
  state: SpeedTestState;
  settings: SpeedTestSettings;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onSaveSettings: (next: SpeedTestSettings) => void;
  onShare: () => void;
  onExportJson: () => void;
  t: TranslationStrings;
}

export function WieckerTelemetryDrawer({
  state,
  settings,
  settingsOpen,
  onToggleSettings,
  onSaveSettings,
  onShare,
  onExportJson,
  t,
}: DetailedDrawerProps) {
  const down = formatSpeedValue(state.downloadMbps);
  const up = formatSpeedValue(state.uploadMbps);

  const clientDetails = [
    state.isp,
    state.asn,
    state.clientLocation,
    state.clientIp,
    state.connectionLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <motion.section
      initial={{opacity: 0, y: -8}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -8}}
      transition={{duration: 0.2}}
      data-testid="more-info-panel"
      className="w-full max-w-[860px] mx-auto mt-6 bg-[#101014]/95 border border-[#29272E] rounded-[6px] p-5 sm:p-6 text-[#F3EFE6] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232127]">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[17px] font-bold text-[#F3EFE6]">
            Detailed Telemetry & Test Controls
          </h2>
          <p className="text-[12px] text-[#9C968B] mt-0.5 truncate">
            {t.client}: {clientDetails} · {t.servers}: {state.servers.join(' | ')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onShare}
            data-testid="share-result-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#E6DFD3] border border-[#2F2D33] bg-[#16161B] rounded-[4px] hover:bg-[#1E1D24] hover:border-[#C5A059]/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            data-testid="export-json-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#E6DFD3] border border-[#2F2D33] bg-[#16161B] rounded-[4px] hover:bg-[#1E1D24] hover:border-[#C5A059]/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onToggleSettings}
            aria-expanded={settingsOpen}
            data-testid="settings-toggle"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border rounded-[4px] transition-colors cursor-pointer whitespace-nowrap ${
              settingsOpen
                ? 'bg-[#991B1B] text-[#F3EFE6] border-[#B91C1C]'
                : 'text-[#E6DFD3] border-[#2F2D33] bg-[#16161B] hover:bg-[#1E1D24]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.settings}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 pt-4 tabular-nums">
        <div>
          <div className="text-[11px] text-[#9C968B]">Download</div>
          <div className="font-display text-[21px] font-bold text-[#EF4444]">
            {down.value}{' '}
            <span className="text-[11px] font-semibold uppercase">{down.unit}</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#9C968B]">{t.upload}</div>
          <div className="font-display text-[21px] font-bold text-[#D4AF37]">
            {up.value}{' '}
            <span className="text-[11px] font-semibold uppercase">{up.unit}</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#9C968B]">
            {t.unloaded} {t.latency}
          </div>
          <div className="font-display text-[21px] font-semibold text-[#F3EFE6]">
            {state.unloadedLatencyMs !== null ? `${state.unloadedLatencyMs} ms` : '—'}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#9C968B]">
            {t.loaded} {t.latency}
          </div>
          <div
            data-testid="loaded-latency"
            className="font-display text-[21px] font-semibold text-[#F3EFE6]"
          >
            {state.loadedLatencyMs !== null ? `${state.loadedLatencyMs} ms` : '—'}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#9C968B]">Jitter</div>
          <div
            data-testid="jitter-latency"
            className="font-display text-[21px] font-semibold text-[#C5A059]"
          >
            {state.jitterMs !== null ? `${state.jitterMs} ms` : '—'}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#9C968B]">Transferred</div>
          <div
            data-testid="uploaded-bytes"
            className="font-display text-[13px] font-semibold text-[#F3EFE6] mt-1.5 whitespace-nowrap"
          >
            {formatDataTransferred(state.downloadedBytes)} ↓ /{' '}
            {formatDataTransferred(state.uploadedBytes)} ↑
          </div>
        </div>
      </div>

      {settingsOpen && (
        <div className="mt-5 pt-5 border-t border-[#232127]">
          <SettingsPanel
            settings={settings}
            onSave={onSaveSettings}
            onCancel={onToggleSettings}
            t={t}
          />
        </div>
      )}
    </motion.section>
  );
}

interface NetworkLabelDialogProps {
  open: boolean;
  onClose: () => void;
  networkName: string;
  onSaveNetworkName: (name: string | null) => void;
}

export function WieckerNetworkDialog({
  open,
  onClose,
  networkName,
  onSaveNetworkName,
}: NetworkLabelDialogProps) {
  const [netInput, setNetInput] = useState(networkName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.16}}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{opacity: 0, scale: 0.97, y: 6}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.97, y: 6}}
            transition={{duration: 0.18}}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] bg-[#101014] border border-[#29272E] rounded-[6px] shadow-2xl p-6 text-[#F3EFE6]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#232127]">
              <h2 className="font-display text-[18px] font-bold">
                Customize Network Label
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-[4px] text-[#9C968B] hover:text-[#F3EFE6] hover:bg-[#1B1A20] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = netInput.trim();
                if (!trimmed) {
                  setError('Network label cannot be empty.');
                  return;
                }
                setError(null);
                onSaveNetworkName(trimmed);
                onClose();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="network-name-input"
                  className="block text-[12px] font-semibold text-[#D6D1C7] mb-1"
                >
                  Network Label
                </label>
                <input
                  id="network-name-input"
                  type="text"
                  value={netInput}
                  onChange={(e) => setNetInput(e.target.value)}
                  className="w-full px-3 py-2 text-[14px] bg-[#070709] text-[#F3EFE6] border border-[#2F2D33] rounded-[4px] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              {error && (
                <p role="alert" className="text-[12px] text-[#F87171]">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSaveNetworkName(null);
                    onClose();
                  }}
                  className="px-3 py-2 text-[12px] text-[#9C968B] border border-[#2B292E] rounded-[4px] hover:text-[#F3EFE6] hover:bg-[#19181E] cursor-pointer"
                >
                  Auto-detect ISP
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-[13px] text-[#D6D1C7] border border-[#2F2D33] rounded-[4px] hover:bg-[#19181E] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-[13px] font-semibold text-[#F3EFE6] rounded-[4px] bg-[#991B1B] hover:bg-[#B91C1C] cursor-pointer"
                  >
                    Save Label
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
