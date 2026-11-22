'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {
  computeJitterMs,
  computeMedianLatencyMs,
  computeSlidingBandwidth,
  DEFAULT_SETTINGS,
  hasThroughputConverged,
  SpeedSample,
  SpeedTestSettings,
} from '@/lib/speedtest-math';

export type TestPhase =
  | 'idle'
  | 'measuring-latency'
  | 'downloading'
  | 'download-complete'
  | 'uploading'
  | 'complete'
  | 'paused'
  | 'error';

export interface SpeedTestState {
  phase: TestPhase;
  pausedFrom: 'downloading' | 'uploading' | null;
  downloadMbps: number;
  uploadMbps: number;
  unloadedLatencyMs: number | null;
  loadedLatencyMs: number | null;
  jitterMs: number | null;
  downloadedBytes: number;
  uploadedBytes: number;
  downloadHistory: number[];
  uploadHistory: number[];
  progressPct: number;
  clientIp: string;
  clientLocation: string;
  isp: string;
  org: string | null;
  asn: string | null;
  connectionLabel: string | null;
  servers: string[];
  errorMessage: string | null;
}

interface NavigatorConnectionLike {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

function detectBrowserConnectionLabel(): string | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & {
    connection?: NavigatorConnectionLike;
    mozConnection?: NavigatorConnectionLike;
    webkitConnection?: NavigatorConnectionLike;
  };
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return null;

  const typeMap: Record<string, string> = {
    wifi: 'Wi-Fi',
    ethernet: 'Ethernet',
    cellular: 'Cellular',
    wimax: 'WiMAX',
    bluetooth: 'Bluetooth',
  };

  const parts: string[] = [];
  if (conn.type && typeMap[conn.type]) {
    parts.push(typeMap[conn.type]);
  }
  if (conn.effectiveType) {
    parts.push(conn.effectiveType.toUpperCase());
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

const STORAGE_KEY = 'fast_replica_settings_v1';

const uploadBufferCache = new Map<number, Uint8Array<ArrayBuffer>>();
function getUploadPayload(sizeBytes = 1024 * 1024): Uint8Array<ArrayBuffer> {
  const cached = uploadBufferCache.get(sizeBytes);
  if (cached) return cached;

  const buf = new ArrayBuffer(sizeBytes);
  const arr = new Uint8Array(buf);
  let seed = 0x13579bdf ^ sizeBytes;
  for (let i = 0; i < arr.length; i++) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    arr[i] = seed & 0xff;
  }
  uploadBufferCache.set(sizeBytes, arr);
  return arr;
}

export function loadSavedSettings(): SpeedTestSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SpeedTestSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      saveConfigForDevice: true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function persistSettings(settings: SpeedTestSettings) {
  if (typeof window === 'undefined') return;
  try {
    if (settings.saveConfigForDevice) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function useSpeedTest() {
  const [settings, setSettings] = useState<SpeedTestSettings>(DEFAULT_SETTINGS);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const [state, setState] = useState<SpeedTestState>({
    phase: 'idle',
    pausedFrom: null,
    downloadMbps: 0,
    uploadMbps: 0,
    unloadedLatencyMs: null,
    loadedLatencyMs: null,
    jitterMs: null,
    downloadedBytes: 0,
    uploadedBytes: 0,
    downloadHistory: [],
    uploadHistory: [],
    progressPct: 0,
    clientIp: 'Detecting...',
    clientLocation: 'Detecting location...',
    isp: 'Detecting Network...',
    org: null,
    asn: null,
    connectionLabel: null,
    servers: ['Detecting server...'],
    errorMessage: null,
  });

  const runIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeXhrsRef = useRef<Set<XMLHttpRequest>>(new Set());
  const settingsRef = useRef<SpeedTestSettings>(settings);
  const showMoreInfoRef = useRef(showMoreInfo);
  const phaseRef = useRef<TestPhase>('idle');

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    showMoreInfoRef.current = showMoreInfo;
  }, [showMoreInfo]);

  useEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

  const abortInFlight = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    for (const xhr of activeXhrsRef.current) {
      try {
        xhr.abort();
      } catch {
        // Ignore abort errors
      }
    }
    activeXhrsRef.current.clear();
  }, []);

  const measurePing = useCallback(async (signal: AbortSignal): Promise<number | null> => {
    const start = performance.now();
    try {
      const res = await fetch(`/api/speedtest/ping?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal,
      });
      if (!res.ok) return null;
      await res.text();
      return Math.max(1, performance.now() - start);
    } catch {
      return null;
    }
  }, []);

  const runUploadPhase = useCallback(
    async (runId: number) => {
      if (runId !== runIdRef.current) return;

      abortInFlight();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const cfg = settingsRef.current;

      setState((prev) => ({
        ...prev,
        phase: 'uploading',
        pausedFrom: null,
        progressPct: Math.max(prev.progressPct, 56),
      }));

      const startTime = performance.now();
      let totalUploadedBytes = 0;
      let latestMbps = 0;
      const samples: SpeedSample[] = [{timestampMs: startTime, totalBytes: 0}];
      const recentBuckets: number[] = [];
      const history: number[] = [];
      const loadedRtts: number[] = [];
      let activeWorkers = 0;
      let stopped = false;

      const minMs = Math.max(3, cfg.minDurationSec) * 1000;
      const maxMs = Math.max(minMs, cfg.maxDurationSec * 1000);

      const chooseUploadSize = () => {
        if (latestMbps >= 120) return 2 * 1024 * 1024;
        if (latestMbps >= 25) return 1024 * 1024;
        return 512 * 1024;
      };

      const spawnUploadWorker = () => {
        if (stopped || controller.signal.aborted || runId !== runIdRef.current) {
          return;
        }
        activeWorkers++;
        const xhr = new XMLHttpRequest();
        activeXhrsRef.current.add(xhr);
        const chunkBytes = chooseUploadSize();
        const payload = getUploadPayload(chunkBytes);
        let lastLoaded = 0;

        xhr.open('POST', `/api/speedtest/upload?r=${Math.random().toString(36).slice(2)}`, true);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');

        xhr.upload.onprogress = (evt) => {
          if (stopped || runId !== runIdRef.current) return;
          const delta = Math.max(0, evt.loaded - lastLoaded);
          lastLoaded = evt.loaded;
          totalUploadedBytes += delta;
        };

        const finishWorker = (success: boolean) => {
          activeXhrsRef.current.delete(xhr);
          activeWorkers--;
          if (success && !stopped && !controller.signal.aborted && runId === runIdRef.current) {
            spawnUploadWorker();
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText) as {received?: number};
              if (typeof parsed.received === 'number' && parsed.received > lastLoaded) {
                totalUploadedBytes += parsed.received - lastLoaded;
                lastLoaded = parsed.received;
              }
            } catch {
              // Ignore non-JSON fallback
            }
            finishWorker(true);
          } else {
            finishWorker(false);
          }
        };
        xhr.onerror = () => finishWorker(false);
        xhr.onabort = () => finishWorker(false);

        try {
          xhr.send(payload);
        } catch {
          finishWorker(false);
        }
      };

      const targetInitial = Math.min(Math.max(1, cfg.minConnections), cfg.maxConnections);
      for (let i = 0; i < targetInitial; i++) {
        spawnUploadWorker();
      }

      const rampTimer = window.setTimeout(() => {
        if (stopped || controller.signal.aborted || runId !== runIdRef.current) return;
        const needed = Math.max(0, Math.min(cfg.maxConnections, 6) - activeWorkers);
        for (let i = 0; i < needed; i++) {
          spawnUploadWorker();
        }
      }, 380);

      let pingInFlight = false;
      const pingTimer = cfg.measureLoadedLatencyDuringUpload
        ? window.setInterval(async () => {
            if (stopped || pingInFlight || controller.signal.aborted) return;
            pingInFlight = true;
            const rtt = await measurePing(controller.signal);
            pingInFlight = false;
            if (rtt !== null && !stopped && runId === runIdRef.current) {
              loadedRtts.push(rtt);
              const med = computeMedianLatencyMs(loadedRtts);
              if (med !== null) {
                setState((prev) => ({...prev, loadedLatencyMs: med}));
              }
            }
          }, 850)
        : null;

      await new Promise<void>((resolve) => {
        let lastSampleTs = startTime;
        let lastHistoryTs = startTime;
        const tick = window.setInterval(() => {
          if (controller.signal.aborted || runId !== runIdRef.current) {
            stopped = true;
            window.clearInterval(tick);
            resolve();
            return;
          }

          const now = performance.now();
          const elapsed = now - startTime;
          samples.push({timestampMs: now, totalBytes: totalUploadedBytes});
          if (samples.length > 90) samples.shift();

          // Exclude initial 350ms OS TCP buffer fill burst once enough steady samples exist
          const steadySamples =
            elapsed > 1400
              ? samples.filter((s) => s.timestampMs - startTime >= 350)
              : samples;
          const activeSamples = steadySamples.length >= 2 ? steadySamples : samples;

          const currentMbps = computeSlidingBandwidth(activeSamples, 2200);
          if (currentMbps > 0) {
            latestMbps = currentMbps;
          }

          if (now - lastSampleTs >= 450 && currentMbps > 0) {
            recentBuckets.push(currentMbps);
            lastSampleTs = now;
          }
          if (now - lastHistoryTs >= 240 && currentMbps > 0) {
            history.push(currentMbps);
            if (history.length > 24) history.shift();
            lastHistoryTs = now;
          }

          const phaseProgress = Math.min(1, elapsed / minMs);
          const pct = Math.min(99, Math.round(56 + phaseProgress * 43));

          setState((prev) => ({
            ...prev,
            uploadMbps: currentMbps > 0 ? currentMbps : prev.uploadMbps,
            uploadedBytes: totalUploadedBytes,
            uploadHistory: history.length > 0 ? [...history] : prev.uploadHistory,
            progressPct: Math.max(prev.progressPct, pct),
          }));

          const converged =
            elapsed >= minMs && hasThroughputConverged(recentBuckets, 5, 0.09);
          if (elapsed >= maxMs || converged) {
            stopped = true;
            window.clearInterval(tick);
            resolve();
          }
        }, 120);
      });

      window.clearTimeout(rampTimer);
      if (pingTimer !== null) window.clearInterval(pingTimer);
      abortInFlight();

      if (runId !== runIdRef.current) return;

      setState((prev) => ({
        ...prev,
        phase: 'complete',
        pausedFrom: null,
        uploadedBytes: totalUploadedBytes,
        progressPct: 100,
      }));
    },
    [abortInFlight, measurePing]
  );

  const runTest = useCallback(
    async (overrideSettings?: SpeedTestSettings) => {
      const cfg = overrideSettings ?? settingsRef.current;
      const runId = ++runIdRef.current;
      abortInFlight();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const browserLink = detectBrowserConnectionLabel();

      setState((prev) => ({
        ...prev,
        phase: 'measuring-latency',
        pausedFrom: null,
        downloadMbps: 0,
        uploadMbps: 0,
        unloadedLatencyMs: null,
        loadedLatencyMs: null,
        jitterMs: null,
        downloadedBytes: 0,
        uploadedBytes: 0,
        downloadHistory: [],
        uploadHistory: [],
        progressPct: 4,
        connectionLabel: browserLink ?? prev.connectionLabel,
        errorMessage: null,
      }));

      // Step 1: Fetch real IP / ISP / Geo metadata + Unloaded Latency & Jitter pings
      const infoPromise = fetch('/api/speedtest/info', {
        cache: 'no-store',
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && runId === runIdRef.current) {
            setState((prev) => ({
              ...prev,
              clientIp: data.clientIp || prev.clientIp,
              clientLocation: data.clientLocation || prev.clientLocation,
              isp: data.isp || prev.isp,
              org: data.org ?? prev.org,
              asn: data.asn ?? prev.asn,
              servers: Array.isArray(data.servers) ? data.servers : prev.servers,
            }));
          }
        })
        .catch(() => {});

      const unloadedRtts: number[] = [];
      for (let i = 0; i < 6; i++) {
        if (controller.signal.aborted || runId !== runIdRef.current) return;
        const rtt = await measurePing(controller.signal);
        if (rtt !== null) unloadedRtts.push(rtt);
      }

      if (controller.signal.aborted || runId !== runIdRef.current) return;

      if (unloadedRtts.length === 0) {
        setState((prev) => ({
          ...prev,
          phase: 'error',
          errorMessage: 'Network request failed',
        }));
        return;
      }

      const unloadedMedian = computeMedianLatencyMs(unloadedRtts);
      const jitter = computeJitterMs(unloadedRtts);
      setState((prev) => ({
        ...prev,
        phase: 'downloading',
        unloadedLatencyMs: unloadedMedian,
        jitterMs: jitter,
        progressPct: 12,
      }));

      void infoPromise;

      // Step 2: Parallel Download Throughput + Loaded Latency
      const startTime = performance.now();
      let totalDownloadedBytes = 0;
      let latestMbps = 0;
      const samples: SpeedSample[] = [{timestampMs: startTime, totalBytes: 0}];
      const recentBuckets: number[] = [];
      const history: number[] = [];
      const loadedRtts: number[] = [];
      let stopped = false;
      let activeWorkers = 0;
      let failedStreams = 0;

      const minMs = Math.max(1, cfg.minDurationSec) * 1000;
      const maxMs = Math.max(minMs, cfg.maxDurationSec * 1000);

      const spawnDownloadWorker = async () => {
        while (!stopped && !controller.signal.aborted && runId === runIdRef.current) {
          activeWorkers++;
          try {
            const bytesToRequest = latestMbps > 80 ? 33554432 : 16777216;
            const res = await fetch(
              `/api/speedtest/download?bytes=${bytesToRequest}&r=${Math.random().toString(36).slice(2)}`,
              {
                cache: 'no-store',
                signal: controller.signal,
              }
            );
            if (!res.ok || !res.body) {
              failedStreams++;
              break;
            }
            const reader = res.body.getReader();
            while (!stopped && !controller.signal.aborted && runId === runIdRef.current) {
              const {done, value} = await reader.read();
              if (done) break;
              if (value) {
                totalDownloadedBytes += value.byteLength;
              }
            }
            try {
              await reader.cancel();
            } catch {
              // Already closed
            }
          } catch {
            if (!controller.signal.aborted && !stopped) {
              failedStreams++;
            }
            break;
          } finally {
            activeWorkers--;
          }
        }
      };

      const initialCount = Math.min(Math.max(1, cfg.minConnections), cfg.maxConnections);
      for (let i = 0; i < initialCount; i++) {
        void spawnDownloadWorker();
      }

      const rampTimer = window.setTimeout(() => {
        if (stopped || controller.signal.aborted || runId !== runIdRef.current) return;
        const target = Math.min(cfg.maxConnections, 8);
        const extra = Math.max(0, target - activeWorkers);
        for (let i = 0; i < extra; i++) {
          void spawnDownloadWorker();
        }
      }, 300);

      let pingBusy = false;
      const loadedPingInterval = window.setInterval(async () => {
        if (stopped || pingBusy || controller.signal.aborted) return;
        pingBusy = true;
        const rtt = await measurePing(controller.signal);
        pingBusy = false;
        if (rtt !== null && !stopped && runId === runIdRef.current) {
          loadedRtts.push(rtt);
          const med = computeMedianLatencyMs(loadedRtts);
          if (med !== null) {
            setState((prev) => ({...prev, loadedLatencyMs: med}));
          }
        }
      }, 800);

      await new Promise<void>((resolve) => {
        let lastBucketTs = startTime;
        let lastHistoryTs = startTime;
        const ticker = window.setInterval(() => {
          if (controller.signal.aborted || runId !== runIdRef.current) {
            stopped = true;
            window.clearInterval(ticker);
            resolve();
            return;
          }

          const now = performance.now();
          const elapsed = now - startTime;
          samples.push({timestampMs: now, totalBytes: totalDownloadedBytes});
          if (samples.length > 90) samples.shift();

          const steadySamples =
            elapsed > 1400
              ? samples.filter((s) => s.timestampMs - startTime >= 250)
              : samples;
          const activeSamples = steadySamples.length >= 2 ? steadySamples : samples;

          const currentMbps = computeSlidingBandwidth(activeSamples, 2400);
          if (currentMbps > 0) {
            latestMbps = currentMbps;
          }

          if (now - lastBucketTs >= 450 && currentMbps > 0) {
            recentBuckets.push(currentMbps);
            lastBucketTs = now;
          }
          if (now - lastHistoryTs >= 240 && currentMbps > 0) {
            history.push(currentMbps);
            if (history.length > 24) history.shift();
            lastHistoryTs = now;
          }

          const phaseProgress = Math.min(1, elapsed / minMs);
          const pct = Math.min(55, Math.round(12 + phaseProgress * 43));

          setState((prev) => ({
            ...prev,
            downloadMbps: currentMbps > 0 ? currentMbps : prev.downloadMbps,
            downloadedBytes: totalDownloadedBytes,
            downloadHistory: history.length > 0 ? [...history] : prev.downloadHistory,
            progressPct: Math.max(prev.progressPct, pct),
          }));

          const converged =
            elapsed >= minMs && hasThroughputConverged(recentBuckets, 6, 0.08);
          if (elapsed >= maxMs || converged || (failedStreams > 4 && totalDownloadedBytes === 0)) {
            stopped = true;
            window.clearInterval(ticker);
            resolve();
          }
        }, 120);
      });

      window.clearTimeout(rampTimer);
      window.clearInterval(loadedPingInterval);
      abortInFlight();

      if (runId !== runIdRef.current) return;

      if (totalDownloadedBytes === 0) {
        setState((prev) => ({
          ...prev,
          phase: 'error',
          errorMessage: 'No bytes received from server',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        phase: 'uploading',
        downloadedBytes: totalDownloadedBytes,
        loadedLatencyMs: prev.loadedLatencyMs ?? prev.unloadedLatencyMs,
        progressPct: 56,
      }));

      await runUploadPhase(runId);
    },
    [abortInFlight, measurePing, runUploadPhase]
  );

  const invalidateAndAbort = useCallback(() => {
    runIdRef.current++;
    abortInFlight();
  }, [abortInFlight]);

  useEffect(() => {
    let cancelled = false;
    const saved = loadSavedSettings();
    settingsRef.current = saved;
    if (saved.alwaysShowAllMetrics) {
      showMoreInfoRef.current = true;
    }

    void Promise.resolve().then(() => {
      if (cancelled) return;
      setSettings(saved);
      if (saved.alwaysShowAllMetrics) {
        setShowMoreInfo(true);
      }
      void runTest(saved);
    });

    return () => {
      cancelled = true;
      invalidateAndAbort();
    };
  }, [invalidateAndAbort, runTest]);

  const pauseTest = useCallback(() => {
    const current = phaseRef.current;
    if (current !== 'downloading' && current !== 'measuring-latency' && current !== 'uploading') {
      return;
    }
    runIdRef.current++;
    abortInFlight();
    setState((prev) => ({
      ...prev,
      phase: 'paused',
      pausedFrom: current === 'uploading' ? 'uploading' : 'downloading',
    }));
  }, [abortInFlight]);

  const resumeOrRestart = useCallback(() => {
    if (state.phase === 'paused' && state.pausedFrom === 'uploading') {
      const nextRunId = ++runIdRef.current;
      void runUploadPhase(nextRunId);
      return;
    }
    void runTest();
  }, [runTest, runUploadPhase, state.pausedFrom, state.phase]);

  const restartTest = useCallback(() => {
    void runTest();
  }, [runTest]);

  const revealMoreInfo = useCallback(() => {
    setShowMoreInfo(true);
    showMoreInfoRef.current = true;
    if (phaseRef.current === 'download-complete') {
      void runUploadPhase(runIdRef.current);
    }
  }, [runUploadPhase]);

  const toggleMoreInfo = useCallback(() => {
    setShowMoreInfo((prev) => {
      const next = !prev;
      showMoreInfoRef.current = next;
      if (next && phaseRef.current === 'download-complete') {
        void runUploadPhase(runIdRef.current);
      }
      return next;
    });
  }, [runUploadPhase]);

  const applySettings = useCallback(
    (next: SpeedTestSettings) => {
      setSettings(next);
      settingsRef.current = next;
      persistSettings(next);
      if (next.alwaysShowAllMetrics) {
        setShowMoreInfo(true);
        showMoreInfoRef.current = true;
        if (phaseRef.current === 'download-complete') {
          void runUploadPhase(runIdRef.current);
        }
      }
    },
    [runUploadPhase]
  );

  return {
    state,
    settings,
    showMoreInfo,
    pauseTest,
    resumeOrRestart,
    restartTest,
    revealMoreInfo,
    toggleMoreInfo,
    applySettings,
  };
}
