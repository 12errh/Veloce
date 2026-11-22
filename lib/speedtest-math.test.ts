import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSparklinePath,
  calculateGaugeArc,
  calculateThroughputMbps,
  computeJitterMs,
  computeMedianLatencyMs,
  computeSlidingBandwidth,
  computeStabilityPct,
  DEFAULT_SETTINGS,
  evaluateNetworkReadiness,
  formatDataTransferred,
  formatSpeedValue,
  getDynamicGaugeScale,
  hasThroughputConverged,
  validateSettings,
} from './speedtest-math';

test('formatSpeedValue formats Kbps, Mbps, and Gbps cleanly', () => {
  assert.deepEqual(formatSpeedValue(0), { value: '0', unit: 'Mbps' });
  assert.deepEqual(formatSpeedValue(0.65), { value: '650', unit: 'Kbps' });
  assert.deepEqual(formatSpeedValue(4.26), { value: '4.3', unit: 'Mbps' });
  assert.deepEqual(formatSpeedValue(48.4), { value: '48', unit: 'Mbps' });
  assert.deepEqual(formatSpeedValue(574), { value: '570', unit: 'Mbps' });
  assert.deepEqual(formatSpeedValue(998), { value: '1.0', unit: 'Gbps' });
  assert.deepEqual(formatSpeedValue(1420), { value: '1.4', unit: 'Gbps' });
});

test('calculateThroughputMbps returns accurate Mbps', () => {
  // 12,500,000 bytes in 1000ms = 100 Mbps
  assert.equal(calculateThroughputMbps(12_500_000, 1000), 100);
  assert.equal(calculateThroughputMbps(0, 1000), 0);
  assert.equal(calculateThroughputMbps(1000, 0), 0);
});

test('computeSlidingBandwidth calculates smoothed speed over recent window', () => {
  const samples = [
    { timestampMs: 0, totalBytes: 0 },
    { timestampMs: 1000, totalBytes: 5_000_000 }, // 40 Mbps initial ramp
    { timestampMs: 2000, totalBytes: 17_500_000 }, // 100 Mbps
    { timestampMs: 3000, totalBytes: 30_000_000 }, // 100 Mbps
  ];
  // Window of 2000ms from t=1000 to t=3000 => 25,000,000 bytes in 2s = 100 Mbps
  assert.equal(computeSlidingBandwidth(samples, 2000), 100);
});

test('hasThroughputConverged detects stable vs fluctuating readings', () => {
  assert.equal(hasThroughputConverged([100, 102, 99, 101, 100, 101], 6, 0.08), true);
  assert.equal(hasThroughputConverged([20, 80, 140, 60, 190, 90], 6, 0.08), false);
  assert.equal(hasThroughputConverged([100, 100, 100], 6, 0.08), false);
});

test('computeMedianLatencyMs and computeJitterMs drop warmup spike and compute stats', () => {
  assert.equal(computeMedianLatencyMs([]), null);
  assert.equal(computeMedianLatencyMs([42, 4, 2, 3, 2]), 3);
  assert.equal(computeMedianLatencyMs([15, 2, 4]), 3);

  assert.equal(computeJitterMs([10]), null);
  assert.equal(computeJitterMs([45, 10, 12, 10, 14]), 3);
});

test('computeStabilityPct scores jitter and loaded latency cleanly', () => {
  assert.equal(computeStabilityPct(null, null, null), 0);
  assert.equal(computeStabilityPct(1, 12, 14), 99);
  const degraded = computeStabilityPct(25, 20, 220);
  assert.equal(degraded < 85, true);
});

test('formatDataTransferred formats bytes as KB or MB', () => {
  assert.equal(formatDataTransferred(0), '0MB');
  assert.equal(formatDataTransferred(512 * 1024), '512KB');
  assert.equal(formatDataTransferred(4.5 * 1024 * 1024), '4.5MB');
  assert.equal(formatDataTransferred(510 * 1024 * 1024), '510MB');
});

test('validateSettings enforces bounds and min <= max invariants', () => {
  const ok = validateSettings(DEFAULT_SETTINGS);
  assert.equal(ok.valid, true);

  const badConnOrder = validateSettings({
    ...DEFAULT_SETTINGS,
    minConnections: 10,
    maxConnections: 4,
  });
  assert.equal(badConnOrder.valid, false);

  const badDurBounds = validateSettings({
    ...DEFAULT_SETTINGS,
    maxDurationSec: 200,
  });
  assert.equal(badDurBounds.valid, false);
});

test('getDynamicGaugeScale and calculateGaugeArc calibrate 1:1 across 260deg dial', () => {
  const lowScale = getDynamicGaugeScale(45);
  assert.deepEqual(lowScale.ticks, [0, 10, 20, 30, 40, 50]);
  assert.equal(lowScale.unitLabel, 'Mbps');

  const gbpsMid = getDynamicGaugeScale(1500);
  assert.equal(gbpsMid.unitLabel, 'Gbps');
  assert.deepEqual(gbpsMid.ticks, [0, 0.5, 1, 1.5, 2, 2.5]);

  const gbpsHigh = getDynamicGaugeScale(3200);
  assert.equal(gbpsHigh.unitLabel, 'Gbps');
  assert.deepEqual(gbpsHigh.ticks, [0, 1, 2, 3, 4, 5]);

  const arcZero = calculateGaugeArc(0, 50);
  assert.equal(arcZero.progress, 0);
  assert.equal(arcZero.angleDeg, -130);

  const arcHalf = calculateGaugeArc(25, 50);
  assert.equal(arcHalf.progress, 0.5);
  assert.equal(arcHalf.angleDeg, 0);

  const arcMax = calculateGaugeArc(50, 50);
  assert.equal(arcMax.progress, 1);
  assert.equal(arcMax.angleDeg, 130);
});

test('buildSparklinePath produces valid SVG cubic curve path', () => {
  const path = buildSparklinePath([10, 25, 40, 35], 84, 24);
  assert.equal(path.startsWith('M '), true);
  assert.equal(path.includes('C '), true);
});

test('evaluateNetworkReadiness classifies workloads based on real metrics', () => {
  const optimal = evaluateNetworkReadiness(120, 45, 12);
  assert.equal(optimal.every((item) => item.status === 'Optimal'), true);

  const constrained = evaluateNetworkReadiness(8, 2, 95);
  assert.equal(constrained.find((c) => c.id === 'streaming')?.status, 'Limited');
  assert.equal(constrained.find((c) => c.id === 'gaming')?.status, 'Limited');
});
