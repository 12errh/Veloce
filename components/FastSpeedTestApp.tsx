'use client';

import React, {useState} from 'react';
import {AnimatePresence, motion, MotionConfig} from 'motion/react';
import {TRANSLATIONS} from '@/lib/i18n';
import {computeStabilityPct} from '@/lib/speedtest-math';
import {useSpeedTest} from '@/hooks/use-speed-test';
import {WieckerHeader} from '@/components/WieckerHeader';
import {WieckerBackdropCurves} from '@/components/WieckerBackdropCurves';
import {WieckerGauge} from '@/components/WieckerGauge';
import {
  WieckerDataStrip,
  WieckerNetworkRail,
} from '@/components/WieckerTelemetryRail';
import {
  WieckerNetworkDialog,
  WieckerTelemetryDrawer,
} from '@/components/WieckerSections';
import {InfoModal, ModalKind} from '@/components/InfoModal';

export function FastSpeedTestApp() {
  const {
    state,
    settings,
    showMoreInfo,
    pauseTest,
    resumeOrRestart,
    restartTest,
    toggleMoreInfo,
    applySettings,
  } = useSpeedTest();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false);
  const [customNetworkName, setCustomNetworkName] = useState<string | null>(null);

  const t = TRANSLATIONS['en-US'];
  const isExpanded = showMoreInfo;
  const displayedNetworkName = customNetworkName ?? state.isp;

  // Real stability (from jitter + bufferbloat) & test progress % for waveform nodes
  const stabilityPct =
    state.unloadedLatencyMs !== null
      ? computeStabilityPct(
          state.jitterMs,
          state.unloadedLatencyMs,
          state.loadedLatencyMs
        )
      : 0;
  const completionPct = state.progressPct;

  const handleToggleDetails = () => {
    if (isExpanded) {
      setSettingsOpen(false);
    }
    toggleMoreInfo();
  };

  const handleExportJson = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      network: displayedNetworkName,
      isp: state.isp,
      asn: state.asn,
      connectionLabel: state.connectionLabel,
      clientIp: state.clientIp,
      clientLocation: state.clientLocation,
      servers: state.servers,
      downloadMbps: Number(state.downloadMbps.toFixed(2)),
      uploadMbps: Number(state.uploadMbps.toFixed(2)),
      unloadedLatencyMs: state.unloadedLatencyMs,
      loadedLatencyMs: state.loadedLatencyMs,
      jitterMs: state.jitterMs,
      downloadedBytes: state.downloadedBytes,
      uploadedBytes: state.uploadedBytes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veloce-speed-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-screen overflow-hidden veloce-matte-bg text-[#F3EFE6] flex flex-col">
        <WieckerHeader
          onRestartTest={restartTest}
          onOpenPrivacy={() => setActiveModal('privacy')}
        />

        {/* Hero Speedometer Stage Only */}
        <main className="relative flex-1 flex flex-col justify-center overflow-hidden">
          <WieckerBackdropCurves
            stabilityPct={stabilityPct}
            completionPct={completionPct}
          />

          <div className="relative z-10 w-full max-w-[1140px] mx-auto px-5 sm:px-8 pt-2 sm:pt-5 pb-8 sm:pb-10">
            {/* Hero Headline assembles cleanly with upward clip reveal */}
            <motion.div
              initial={{opacity: 0, y: 20, clipPath: 'inset(0 0 100% 0)'}}
              animate={{opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)'}}
              transition={{duration: 0.6, delay: 0.14, ease: [0.16, 1, 0.3, 1]}}
              className="text-center max-w-[700px] mx-auto"
            >
              <h1
                className="font-display text-[32px] sm:text-[48px] md:text-[54px] font-semibold leading-[1.12] tracking-[-0.025em] text-[#F3EFE6]"
                style={{textWrap: 'balance'}}
              >
                If the King loves WiFi, it is well with the Speed.
              </h1>
            </motion.div>

          {/* Centerpiece Gauge + Right Network Rail */}
          <div
            id="hero-gauge"
            className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-8"
          >
            {/* Left spacer on desktop to keep gauge dead-center */}
            <div className="hidden md:block md:col-span-3" />

            {/* Center Circular Speedometer */}
            <div className="md:col-span-6 flex flex-col items-center">
              <WieckerGauge
                phase={state.phase}
                downloadMbps={state.downloadMbps}
                uploadMbps={state.uploadMbps}
                onPause={pauseTest}
                onResumeOrRestart={resumeOrRestart}
                onRestart={restartTest}
              />

              {/* Bottom Mini Data-Used Strip */}
              <WieckerDataStrip
                downloadedBytes={state.downloadedBytes}
                uploadedBytes={state.uploadedBytes}
                downloadHistory={state.downloadHistory}
                uploadHistory={state.uploadHistory}
                progressPct={state.progressPct}
                detailsExpanded={isExpanded}
                onToggleDetails={handleToggleDetails}
              />
            </div>

            {/* Right-Hand Network Column ("Your Network") */}
            <div className="md:col-span-3 flex justify-center md:justify-start">
              <WieckerNetworkRail
                state={state}
                networkName={displayedNetworkName}
                onEditNetworkName={() => setNetworkDialogOpen(true)}
                t={t}
              />
            </div>
          </div>

          </div>
      </main>

      {/* More Info Card Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="more-info-overlay"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.18}}
            onClick={handleToggleDetails}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          >
            <motion.div
              key="more-info-card"
              initial={{opacity: 0, scale: 0.94, y: 16}}
              animate={{opacity: 1, scale: 1, y: 0}}
              exit={{opacity: 0, scale: 0.94, y: 16}}
              transition={{duration: 0.26, ease: [0.16, 1, 0.3, 1]}}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[900px] max-h-[85vh] overflow-y-auto rounded-2xl border border-[#2D2A2E] bg-gradient-to-b from-[#141418] to-[#0B0B0F] shadow-[0_40px_120px_rgba(0,0,0,0.85)]"
            >
              <div className="sticky top-0 z-20 h-[3px] w-full bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#C5A059] rounded-t-2xl" />
              <div className="px-5 sm:px-7 pt-5 pb-6">
                <WieckerTelemetryDrawer
                  state={state}
                  settings={settings}
                  settingsOpen={settingsOpen}
                  onToggleSettings={() => setSettingsOpen((v) => !v)}
                  onSaveSettings={(next) => {
                    applySettings(next);
                    setSettingsOpen(false);
                  }}
                  onShare={() => setActiveModal('share')}
                  onExportJson={handleExportJson}
                  onClose={handleToggleDetails}
                  t={t}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InfoModal
        kind={activeModal}
        onClose={() => setActiveModal(null)}
        state={state}
        t={t}
      />

      <WieckerNetworkDialog
        key={`${displayedNetworkName}-${networkDialogOpen ? 'open' : 'closed'}`}
        open={networkDialogOpen}
        onClose={() => setNetworkDialogOpen(false)}
        networkName={displayedNetworkName}
        onSaveNetworkName={setCustomNetworkName}
      />
      </div>
    </MotionConfig>
  );
}
