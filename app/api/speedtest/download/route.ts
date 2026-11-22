import {NextRequest} from 'next/server';

export const dynamic = 'force-dynamic';

// Pre-build a 512 KB pseudo-random incompressible chunk once at module load
const CHUNK_SIZE = 1024 * 1024;
const NOISE_CHUNK = new Uint8Array(CHUNK_SIZE);
{
  let seed = 0x9e3779b9;
  for (let i = 0; i < CHUNK_SIZE; i++) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    NOISE_CHUNK[i] = seed & 0xff;
  }
}

export async function GET(req: NextRequest) {
  const bytesParam = req.nextUrl.searchParams.get('bytes');
  const requested = bytesParam ? Number.parseInt(bytesParam, 10) : 16 * 1024 * 1024;
  const totalBytes = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 65_536), 64 * 1024 * 1024)
    : 16 * 1024 * 1024;

  let remaining = totalBytes;
  const signal = req.signal;

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (signal.aborted || remaining <= 0) {
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
        return;
      }

      const toSend = Math.min(CHUNK_SIZE, remaining);
      remaining -= toSend;
      if (toSend === CHUNK_SIZE) {
        controller.enqueue(NOISE_CHUNK);
      } else {
        controller.enqueue(NOISE_CHUNK.subarray(0, toSend));
      }

      if (remaining <= 0) {
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(totalBytes),
      'Content-Encoding': 'identity',
      'X-Accel-Buffering': 'no',
      'Cache-Control': 'no-store, no-cache, must-revalidate, no-transform',
      Pragma: 'no-cache',
    },
  });
}
