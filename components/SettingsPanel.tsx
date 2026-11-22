'use client';

import React, {useState} from 'react';
import {
  DEFAULT_SETTINGS,
  SpeedTestSettings,
  validateSettings,
} from '@/lib/speedtest-math';
import {TranslationStrings} from '@/lib/i18n';

interface SettingsPanelProps {
  settings: SpeedTestSettings;
  onSave: (next: SpeedTestSettings) => void;
  onCancel: () => void;
  t: TranslationStrings;
}

export function SettingsPanel({
  settings,
  onSave,
  onCancel,
  t,
}: SettingsPanelProps) {
  const [draft, setDraft] = useState<SpeedTestSettings>(settings);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSettings(draft);
    if (!result.valid) {
      setError(result.error || 'Invalid configuration');
      return;
    }
    setError(null);
    onSave(result.normalized);
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
    setError(null);
  };

  return (
    <form
      onSubmit={handleSave}
      data-testid="settings-panel"
      className="w-full max-w-[540px] mx-auto text-[14px] text-[#D6D1C7]"
    >
      {/* Numeric constraints row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="font-semibold text-[#F3EFE6] mb-1.5">
            {t.parallelConnections}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="min-connections" className="text-[13px] text-[#9C968B]">
              {t.min}
            </label>
            <input
              id="min-connections"
              type="number"
              min={1}
              max={30}
              value={draft.minConnections}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  minConnections: Number(e.target.value),
                }))
              }
              className="w-16 px-2 py-1 border border-[#2F2D33] rounded-[4px] text-[13px] tabular-nums bg-[#070709] text-[#F3EFE6] focus:outline-none focus:border-[#C5A059]"
            />
            <label htmlFor="max-connections" className="text-[13px] text-[#9C968B] ml-1">
              {t.max}
            </label>
            <input
              id="max-connections"
              type="number"
              min={1}
              max={30}
              value={draft.maxConnections}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  maxConnections: Number(e.target.value),
                }))
              }
              className="w-16 px-2 py-1 border border-[#2F2D33] rounded-[4px] text-[13px] tabular-nums bg-[#070709] text-[#F3EFE6] focus:outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>

        <div>
          <div className="font-semibold text-[#F3EFE6] mb-1.5">
            {t.testDuration}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="min-duration" className="text-[13px] text-[#9C968B]">
              {t.min}
            </label>
            <input
              id="min-duration"
              type="number"
              min={1}
              max={120}
              value={draft.minDurationSec}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  minDurationSec: Number(e.target.value),
                }))
              }
              className="w-16 px-2 py-1 border border-[#2F2D33] rounded-[4px] text-[13px] tabular-nums bg-[#070709] text-[#F3EFE6] focus:outline-none focus:border-[#C5A059]"
            />
            <label htmlFor="max-duration" className="text-[13px] text-[#9C968B] ml-1">
              {t.max}
            </label>
            <input
              id="max-duration"
              type="number"
              min={1}
              max={120}
              value={draft.maxDurationSec}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  maxDurationSec: Number(e.target.value),
                }))
              }
              className="w-16 px-2 py-1 border border-[#2F2D33] rounded-[4px] text-[13px] tabular-nums bg-[#070709] text-[#F3EFE6] focus:outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="mt-4 space-y-2 max-w-[380px] mx-auto">
        <label className="flex items-center gap-2.5 cursor-pointer select-none text-[13px] text-[#D6D1C7]">
          <input
            type="checkbox"
            checked={draft.measureLoadedLatencyDuringUpload}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                measureLoadedLatencyDuringUpload: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-[#B91C1C] rounded-[2px] cursor-pointer"
          />
          <span>{t.measureLoadedDuringUpload}</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none text-[13px] text-[#D6D1C7]">
          <input
            type="checkbox"
            checked={draft.alwaysShowAllMetrics}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                alwaysShowAllMetrics: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-[#B91C1C] rounded-[2px] cursor-pointer"
          />
          <span>{t.alwaysShowAllMetrics}</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none text-[13px] text-[#D6D1C7]">
          <input
            type="checkbox"
            checked={draft.saveConfigForDevice}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                saveConfigForDevice: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-[#B91C1C] rounded-[2px] cursor-pointer"
          />
          <span>{t.saveConfigForDevice}</span>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-[13px] text-[#F87171]">
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-1.5 text-[13px] text-[#9C968B] bg-[#16161B] border border-[#2F2D33] rounded-[4px] hover:bg-[#1E1D24] hover:text-[#F3EFE6] transition-colors cursor-pointer"
        >
          {t.reset}
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-[13px] text-[#F3EFE6] font-medium bg-[#991B1B] border border-[#B91C1C] rounded-[4px] hover:bg-[#B91C1C] transition-colors cursor-pointer"
        >
          {t.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-[13px] text-[#9C968B] bg-[#16161B] border border-[#2F2D33] rounded-[4px] hover:bg-[#1E1D24] hover:text-[#F3EFE6] transition-colors cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
