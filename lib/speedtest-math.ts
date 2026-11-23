export interface SpeedSample {
  timestampMs: number;
  totalBytes: number;
}

export interface SpeedTestSettings {
  minConnections: number;
  maxConnections: number;
  minDurationSec: number;
  maxDurationSec: number;
  measureLoadedLatencyDuringUpload: boolean;
  alwaysShowAllMetrics: boolean;
  saveConfigForDevice: boolean;
}

export const DEFAULT_SETTINGS: SpeedTestSettings = {
  minConnections: 4,
  maxConnections: 8,
  minDurationSec: 4,
  maxDurationSec: 12,
  measureLoadedLatencyDuringUpload: true,
  alwaysShowAllMetrics: false,
  saveConfigForDevice: false,
};

export interface FormattedSpeed {
  value: string;
  unit: 'Kbps' | 'Mbps' | 'Gbps';
}

/**
 * Formats throughput in Mbps using clean rounding & unit scaling rules:
 * - < 1 Mbps -> Kbps (integer)
 * - 1..9.99 Mbps -> 1 decimal (e.g. "4.8")
 * - 10..99 Mbps -> integer (e.g. "64")
 * - 100..999 Mbps -> rounded to nearest 10 (e.g. "570")
 * - >= 1000 Mbps -> Gbps with 1 decimal (e.g. "1.2")
 */
export function formatSpeedValue(mbps: number): FormattedSpeed {
  if (!Number.isFinite(mbps) || mbps <= 0) {
    return { value: '0', unit: 'Mbps' };
  }

  if (mbps < 1) {
    const kbps = Math.max(1, Math.round(mbps * 1000));
    return { value: String(kbps), unit: 'Kbps' };
  }

  if (mbps < 10) {
    return { value: mbps.toFixed(1).replace(/\.0$/, ''), unit: 'Mbps' };
  }

  if (mbps < 100) {
    return { value: String(Math.round(mbps)), unit: 'Mbps' };
  }

  if (mbps < 1000) {
    const roundedTen = Math.round(mbps / 10) * 10;
    if (roundedTen >= 1000) {
      return { value: '1.0', unit: 'Gbps' };
    }
    return { value: String(roundedTen), unit: 'Mbps' };
  }

  const gbps = mbps / 1000;
  if (gbps >= 10) {
    return { value: String(Math.round(gbps)), unit: 'Gbps' };
  }
  return { value: gbps.toFixed(1), unit: 'Gbps' };
}

/**
 * Computes raw Mbps from transferred bytes and elapsed milliseconds.
 */
export function calculateThroughputMbps(bytes: number, durationMs: number): number {
  if (!Number.isFinite(bytes) || !Number.isFinite(durationMs) || bytes <= 0 || durationMs <= 0) {
    return 0;
  }
  return (bytes * 8) / (durationMs / 1000) / 1_000_000;
}

/**
 * Computes smoothed Mbps over a sliding time window from cumulative byte samples.
 */
export function computeSlidingBandwidth(
  samples: SpeedSample[],
  windowMs = 2500
): number {
  if (samples.length < 2) return 0;

  const latest = samples[samples.length - 1];
  const cutoff = latest.timestampMs - windowMs;

  let anchor = samples[0];
  for (let i = samples.length - 2; i >= 0; i--) {
    if (samples[i].timestampMs <= cutoff) {
      anchor = samples[i];
      break;
    }
    anchor = samples[i];
  }

  const dt = latest.timestampMs - anchor.timestampMs;
  const dBytes = latest.totalBytes - anchor.totalBytes;
  if (dt <= 0 || dBytes <= 0) return 0;

  return calculateThroughputMbps(dBytes, dt);
}

/**
 * Determines whether throughput buckets have stabilized enough to finish early
 * after minDurationSec has elapsed.
 */
export function hasThroughputConverged(
  recentMbpsReadings: number[],
  requiredReadings = 6,
  maxCv = 0.08
): boolean {
  if (recentMbpsReadings.length < requiredReadings) return false;
  const slice = recentMbpsReadings.slice(-requiredReadings);
  const mean = slice.reduce((sum, val) => sum + val, 0) / slice.length;
  if (mean <= 0) return false;

  const variance =
    slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / slice.length;
  const stdDev = Math.sqrt(variance);
  return stdDev / mean <= maxCv;
}

/**
 * Computes median latency in whole milliseconds from RTT samples.
 * Drops the first warmup sample when at least 3 samples exist.
 */
export function computeMedianLatencyMs(rtts: number[]): number | null {
  const valid = rtts.filter((v) => Number.isFinite(v) && v >= 0);
  if (valid.length === 0) return null;

  const trimmed = valid.length >= 3 ? valid.slice(1) : valid;
  const sorted = [...trimmed].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  return Math.max(1, Math.round(median));
}

/**
 * Computes network jitter (mean consecutive RTT variance in ms).
 * Drops the first warmup sample when at least 4 samples exist.
 */
export function computeJitterMs(rtts: number[]): number | null {
  const valid = rtts.filter((v) => Number.isFinite(v) && v >= 0);
  const series = valid.length >= 4 ? valid.slice(1) : valid;
  if (series.length < 2) return null;

  let diffSum = 0;
  for (let i = 1; i < series.length; i++) {
    diffSum += Math.abs(series[i] - series[i - 1]);
  }
  const avgDiff = diffSum / (series.length - 1);
  return Math.max(0, Math.round(avgDiff));
}

/**
 * Computes real connection stability percentage (50..99) from jitter and bufferbloat ratio.
 */
export function computeStabilityPct(
  jitterMs: number | null,
  unloadedMs: number | null,
  loadedMs: number | null
): number {
  if (unloadedMs === null) return 0;
  const jitterPenalty = jitterMs !== null ? Math.min(24, jitterMs * 0.7) : 4;
  const bloatRatio =
    loadedMs !== null && unloadedMs > 0
      ? Math.max(0, (loadedMs - unloadedMs) / Math.max(10, unloadedMs))
      : 0;
  const bloatPenalty = Math.min(18, bloatRatio * 3.5);
  return Math.max(50, Math.min(99, Math.round(100 - jitterPenalty - bloatPenalty)));
}

/**
 * Formats byte volume cleanly as MB or KB (e.g., "510MB", "12MB", "480KB").
 */
export function formatDataTransferred(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 10) {
    return `${Math.round(mb)}MB`;
  }
  if (mb >= 1) {
    return `${mb.toFixed(1).replace(/\.0$/, '')}MB`;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb}KB`;
}

export interface SettingsValidationResult {
  valid: boolean;
  error?: string;
  normalized: SpeedTestSettings;
}

export function validateSettings(
  draft: SpeedTestSettings
): SettingsValidationResult {
  const minConn = Math.trunc(draft.minConnections);
  const maxConn = Math.trunc(draft.maxConnections);
  const minDur = Math.trunc(draft.minDurationSec);
  const maxDur = Math.trunc(draft.maxDurationSec);

  if (
    !Number.isFinite(minConn) ||
    !Number.isFinite(maxConn) ||
    minConn < 1 ||
    maxConn > 30
  ) {
    return {
      valid: false,
      error: 'Parallel connections must be between 1 and 30.',
      normalized: draft,
    };
  }
  if (minConn > maxConn) {
    return {
      valid: false,
      error: 'Minimum parallel connections cannot exceed maximum.',
      normalized: draft,
    };
  }
  if (
    !Number.isFinite(minDur) ||
    !Number.isFinite(maxDur) ||
    minDur < 1 ||
    maxDur > 120
  ) {
    return {
      valid: false,
      error: 'Test duration must be between 1 and 120 seconds.',
      normalized: draft,
    };
  }
  if (minDur > maxDur) {
    return {
      valid: false,
      error: 'Minimum test duration cannot exceed maximum.',
      normalized: draft,
    };
  }

  return {
    valid: true,
    normalized: {
      ...draft,
      minConnections: minConn,
      maxConnections: maxConn,
      minDurationSec: minDur,
      maxDurationSec: maxDur,
    },
  };
}

export interface GaugeScale {
  maxMbps: number;
  ticks: number[];
  unitLabel: 'Mbps' | 'Gbps';
}

/**
 * Picks calibrated speedometer tick marks from 0..max spanning the full 260-deg dial.
 */
export function getDynamicGaugeScale(mbps: number): GaugeScale {
  if (!Number.isFinite(mbps) || mbps <= 50) {
    return {maxMbps: 50, ticks: [0, 10, 20, 30, 40, 50], unitLabel: 'Mbps'};
  }
  if (mbps <= 100) {
    return {maxMbps: 100, ticks: [0, 20, 40, 60, 80, 100], unitLabel: 'Mbps'};
  }
  if (mbps <= 250) {
    return {maxMbps: 250, ticks: [0, 50, 100, 150, 200, 250], unitLabel: 'Mbps'};
  }
  if (mbps <= 500) {
    return {maxMbps: 500, ticks: [0, 100, 200, 300, 400, 500], unitLabel: 'Mbps'};
  }
  if (mbps <= 1000) {
    return {maxMbps: 1000, ticks: [0, 200, 400, 600, 800, 1000], unitLabel: 'Mbps'};
  }
  if (mbps <= 2500) {
    return {maxMbps: 2500, ticks: [0, 0.5, 1, 1.5, 2, 2.5], unitLabel: 'Gbps'};
  }
  return {maxMbps: 5000, ticks: [0, 1, 2, 3, 4, 5], unitLabel: 'Gbps'};
}

/**
 * Maps live Mbps into exact normalized gauge progress (0..1) and needle rotation (-130deg..+130deg),
 * calibrated 1:1 with the 6 scale tick marks along the 260-degree dial sweep.
 */
export function calculateGaugeArc(
  mbps: number,
  maxMbps: number
): {progress: number; angleDeg: number} {
  if (!Number.isFinite(mbps) || mbps <= 0 || !Number.isFinite(maxMbps) || maxMbps <= 0) {
    return {progress: 0, angleDeg: -130};
  }
  const ratio = Math.min(1, Math.max(0, mbps / maxMbps));
  const angleDeg = -130 + ratio * 260;
  return {progress: ratio, angleDeg};
}

/**
 * Builds an SVG path string from real measured speed samples for sparklines.
 */
export function buildSparklinePath(
  values: number[],
  width: number,
  height: number,
  padding = 2
): string {
  const usableW = Math.max(1, width - padding * 2);
  const usableH = Math.max(1, height - padding * 2);

  if (values.length === 0) {
    const midY = (height / 2).toFixed(1);
    return `M ${padding} ${midY} L ${(width - padding).toFixed(1)} ${midY}`;
  }

  if (values.length === 1) {
    const y = (padding + usableH * 0.5).toFixed(1);
    return `M ${padding} ${y} L ${(width - padding).toFixed(1)} ${y}`;
  }

  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const span = Math.max(1e-3, maxVal - minVal);

  const pts = values.map((val, idx) => {
    const x = padding + (idx / (values.length - 1)) * usableW;
    const norm = (val - minVal) / span;
    const y = padding + usableH - norm * usableH;
    return {x, y};
  });

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cx = ((prev.x + curr.x) / 2).toFixed(1);
    d += ` C ${cx} ${prev.y.toFixed(1)}, ${cx} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

export interface NetworkCategoryStatus {
  id: 'streaming' | 'gaming' | 'calls' | 'cloud';
  title: string;
  requirement: string;
  status: 'Optimal' | 'Good' | 'Limited';
  summary: string;
}

/**
 * Evaluates real-world workload readiness based on measured download, upload, and latency.
 */
export function evaluateNetworkReadiness(
  downloadMbps: number,
  uploadMbps: number,
  latencyMs: number | null
): NetworkCategoryStatus[] {
  const ping = latencyMs ?? 25;
  return [
    {
      id: 'streaming',
      title: '4K & HDR Streaming',
      requirement: '25+ Mbps download',
      status: downloadMbps >= 25 ? 'Optimal' : downloadMbps >= 10 ? 'Good' : 'Limited',
      summary:
        downloadMbps >= 25
          ? 'Supports multiple simultaneous 4K HDR streams without buffering.'
          : 'Adequate for HD streaming; 4K streams may adapt bitrate.',
    },
    {
      id: 'gaming',
      title: 'Competitive Gaming',
      requirement: '< 35 ms ping · 15+ Mbps',
      status: ping <= 35 && downloadMbps >= 15 ? 'Optimal' : ping <= 75 ? 'Good' : 'Limited',
      summary:
        ping <= 35
          ? 'Low round-trip latency keeps frame updates responsive.'
          : 'Moderate latency; wired Ethernet can further tighten response.',
    },
    {
      id: 'calls',
      title: 'HD Video Conferencing',
      requirement: '10+ Mbps up & down',
      status:
        downloadMbps >= 10 && (uploadMbps === 0 || uploadMbps >= 8)
          ? 'Optimal'
          : downloadMbps >= 5
            ? 'Good'
            : 'Limited',
      summary:
        'Clean bidirectional capacity for multi-participant screen sharing.',
    },
    {
      id: 'cloud',
      title: 'Cloud Sync & Large Transfers',
      requirement: '50+ Mbps symmetric',
      status:
        downloadMbps >= 50 && (uploadMbps === 0 || uploadMbps >= 25)
          ? 'Optimal'
          : downloadMbps >= 20
            ? 'Good'
            : 'Limited',
      summary:
        'Fast repository pulls, backups, and media asset uploads.',
    },
  ];
}
