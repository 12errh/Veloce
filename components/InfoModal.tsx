'use client';

import React, {useEffect, useState} from 'react';
import {Check, Copy, ExternalLink, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {formatSpeedValue} from '@/lib/speedtest-math';
import {SpeedTestState} from '@/hooks/use-speed-test';
import {TranslationStrings} from '@/lib/i18n';

export type ModalKind = 'privacy' | 'share' | null;

interface InfoModalProps {
  kind: ModalKind;
  onClose: () => void;
  state: SpeedTestState;
  t: TranslationStrings;
}

export function InfoModal({kind, onClose, state, t}: InfoModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!kind) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCopied(false);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [kind, onClose]);

  const down = formatSpeedValue(state.downloadMbps);
  const up = formatSpeedValue(state.uploadMbps);

  const shareSummary = [
    `Download: ${down.value} ${down.unit}`,
    state.uploadMbps > 0 ? `Upload: ${up.value} ${up.unit}` : null,
    state.unloadedLatencyMs !== null
      ? `Latency: ${state.unloadedLatencyMs} ms (Unloaded)${
          state.loadedLatencyMs !== null
            ? ` / ${state.loadedLatencyMs} ms (Loaded)`
            : ''
        }`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const shareTweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `My Internet speed is ${down.value} ${down.unit}${
      state.uploadMbps > 0 ? ` (Upload: ${up.value} ${up.unit})` : ''
    } — measured on Veloce`
  )}`;

  const shareFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.origin : 'https://veloce.app'
  )}&quote=${encodeURIComponent(shareSummary)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  return (
    <AnimatePresence>
      {kind && (
        <motion.div
          key="modal-backdrop"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.16}}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <motion.div
            key={`modal-${kind}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="veloce-modal-title"
            initial={{opacity: 0, scale: 0.97, y: 6}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.97, y: 6}}
            transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-[8px] border border-[#29272E] bg-[#101014] text-[#F3EFE6] p-6 shadow-[inset_0_2px_0_0_#B91C1C,0_40px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#232127]">
              <h2
                id="veloce-modal-title"
                className="font-display text-[19px] font-bold text-[#F3EFE6]"
              >
                {kind === 'privacy' ? t.privacyTitle : t.shareTitle}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="p-1.5 rounded-[4px] text-[#9C968B] hover:text-[#F3EFE6] hover:bg-[#1B1A20] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {kind === 'privacy' && (
              <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#B5AEA2]">
                {t.privacyBody.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}

            {kind === 'share' && (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-[4px] border border-[#29272E] bg-[#070709] tabular-nums">
                  <div className="text-[13px] text-[#9C968B] mb-1">
                    {t.yourSpeedIs}
                  </div>
                  <div className="font-display text-[32px] font-bold text-[#F3EFE6] leading-tight">
                    {down.value}{' '}
                    <span className="text-[18px] font-semibold text-[#EF4444]">
                      {down.unit}
                    </span>
                  </div>
                  <div className="mt-2 text-[13px] text-[#B5AEA2]">
                    {shareSummary}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[#991B1B] text-[#F3EFE6] rounded-[4px] hover:bg-[#B91C1C] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
                        <span>{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        <span>{t.copyResult}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={shareFacebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium border border-[#2F2D33] bg-[#16161B] text-[#E6DFD3] rounded-[4px] hover:bg-[#1E1D24] transition-colors whitespace-nowrap"
                  >
                    <span>{t.shareOnFacebook}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
                  </a>

                  <a
                    href={shareTweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium border border-[#2F2D33] bg-[#16161B] text-[#E6DFD3] rounded-[4px] hover:bg-[#1E1D24] transition-colors whitespace-nowrap"
                  >
                    <span>{t.shareOnX}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
