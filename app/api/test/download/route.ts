import { NextResponse } from 'next/server';

// Pre-allocate a buffer to avoid GC overhead during high-speed transfer
const CHUNK_SIZE = 1024 * 64; // 64KB
const TOTAL_CHUNKS = 800; // ~50MB (Should be enough for a quick test, client can fetch multiple times)
const buffer = new Uint8Array(CHUNK_SIZE);
buffer.fill(Math.floor(Math.random() * 256));

export async function GET() {
  let chunksSent = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (chunksSent >= TOTAL_CHUNKS) {
        controller.close();
        return;
      }
      controller.enqueue(buffer);
      chunksSent++;
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Disposition': 'attachment; filename="speedtest.bin"',
    },
  });
}
