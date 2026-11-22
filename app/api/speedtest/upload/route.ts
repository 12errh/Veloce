import {NextRequest, NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let received = 0;
  try {
    if (req.body) {
      const reader = req.body.getReader();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        if (value) {
          received += value.byteLength;
        }
      }
    } else {
      const buf = await req.arrayBuffer();
      received = buf.byteLength;
    }
  } catch {
    // Client aborted mid-upload
  }

  return NextResponse.json(
    {received, ts: Date.now()},
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
