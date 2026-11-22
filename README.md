# Veloce — Internet Speed Test & Latency Telemetry

![Next.js](https://img.shields.io/badge/Next.js-15-070709?style=for-the-badge&logo=next.js&logoColor=F3EFE6)
![React](https://img.shields.io/badge/React-19-070709?style=for-the-badge&logo=react&logoColor=D4AF37)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-070709?style=for-the-badge&logo=typescript&logoColor=C5A059)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-070709?style=for-the-badge&logo=tailwindcss&logoColor=EF4444)
![Motion](https://img.shields.io/badge/Motion-12-070709?style=for-the-badge&logo=framer&logoColor=F3EFE6)

**Veloce** is a high-precision internet speed test and real-time network telemetry web application. Built with Next.js App Router, TypeScript, Tailwind CSS, and Motion, it measures download throughput, upload bandwidth, unloaded latency, loaded latency (bufferbloat), and connection jitter through a calibrated 260° speedometer interface styled in a dark Noir Syndicate palette (obsidian, smoked charcoal, oxblood crimson, burnished champagne gold, and warm ivory).

---

## Key Features

- **Real Multi-Phase Speed Test Engine**
  - **Unloaded Latency & Jitter**: Measures baseline round-trip ping and packet jitter before load saturation.
  - **Parallel Download Streaming**: Opens configurable concurrent HTTP streams against `/api/speedtest/download` with sliding-window bandwidth smoothing and stability convergence detection.
  - **Upload Throughput & Loaded Latency**: Streams randomized payloads to `/api/speedtest/upload` while concurrently sampling latency under load.
- **Calibrated 260° Circular Speedometer**
  - Dynamic scale auto-ranging (`50 Mbps` → `10 Gbps`) with 25 radial bezel graduations, live progress arcs, and a spring-damped needle synced 1:1 with real throughput.
  - Interactive center hub controls for **Pause**, **Resume**, and **Restart**.
- **Live Network & ISP Telemetry**
  - Automatic server-side detection of client IP, ISP/organization, ASN, location, and browser network link type via `/api/speedtest/info`, with support for custom persistent network labels.
  - Live crimson & champagne-gold SVG throughput sparklines, stability score node, and progress indicator along a choreographed circuit-trace backdrop.
- **Detailed Telemetry Drawer & Controls**
  - Two-way expandable drawer displaying Download, Upload, Unloaded Latency, Loaded Latency, Jitter, and Total Data Transferred.
  - Built-in **Share** summary copy, **JSON Telemetry Export**, **Privacy** modal, and **Settings** panel (concurrent stream min/max bounds, test duration, and loaded-latency toggles).
- **Choreographed Self-Assembling Animations**
  - Entrance line-drawing and spring animations across the header emblem, geometric U-loop traces, signal wave, radial bezel ticks, and telemetry columns with `prefers-reduced-motion` support.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, API Routes)
- **Language**: TypeScript 5.9
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons (`lucide-react`)
- **Animation**: Motion (`motion/react`)
- **Testing**: Node built-in test runner (`node:test`) with `tsx`

---

## Architecture & API Routes

```text
app/
├── api/speedtest/
│   ├── download/route.ts   # Binary stream generator for parallel download tests
│   ├── upload/route.ts     # Payload ingestion endpoint for upload throughput tests
│   ├── ping/route.ts       # Low-overhead round-trip latency & jitter probe
│   └── info/route.ts       # Real client IP, ISP, ASN, and geolocation lookup
├── globals.css             # Matte obsidian surfaces & Noir Syndicate radial glows
├── layout.tsx              # Font setup (Plus Jakarta Sans, DM Sans, JetBrains Mono) & metadata
└── page.tsx                # Application entry page
components/
├── FastSpeedTestApp.tsx    # Top-level test orchestration & view state
├── WieckerHeader.tsx       # Veloce emblem, Privacy trigger, and Restart control
├── WieckerBackdropCurves.tsx # Self-drawing geometric traces, signal wave & nodes
├── WieckerGauge.tsx        # Calibrated 260° SVG speedometer & center action hub
├── WieckerTelemetryRail.tsx # Network summary rail, sparklines & two-way drawer toggle
├── WieckerSections.tsx     # Detailed Telemetry Drawer & Network Label editor
├── SettingsPanel.tsx       # Stream concurrency & duration configuration modal
└── InfoModal.tsx           # Privacy & methodology modal
hooks/
└── use-speed-test.ts       # Multi-phase HTTP speed test state machine
lib/
├── speedtest-math.ts       # Pure throughput, jitter, stability, sparkline & dial math
└── speedtest-math.test.ts  # Unit tests for core telemetry & gauge calibration math
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- `npm` or `bun`

### Installation & Local Development

```bash
# Install dependencies
npm install

# Run the development server on http://localhost:3000
npm run dev
```

### Production Build & Linting

```bash
# Lint codebase
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Running Unit Tests

```bash
npx --yes tsx --test lib/speedtest-math.test.ts
```

---

## Tags / Topics

`speed-test` · `network-telemetry` · `bandwidth-monitor` · `latency` · `jitter` · `nextjs` · `react` · `typescript` · `tailwindcss` · `motion` · `dark-ui`
