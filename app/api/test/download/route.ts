import { NextResponse } from 'next/server';

// Pre-allocate a buffer with HIGH ENTROPY to prevent compression
const CHUNK_SIZE = 1024 * 1024; // 1MB
const buffer = new Uint8Array(CHUNK_SIZE);

// Fill with random data
for (let i = 0; i < CHUNK_SIZE; i++) {
  buffer[i] = Math.floor(Math.random() * 256);
}

// Total size per request approx 4GB (enough to avoid reconnection)
const TOTAL_CHUNKS = 4000; 

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
