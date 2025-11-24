import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: 'No body' }, { status: 400 });
    }

    const reader = req.body.getReader();
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalSize += value.length;
      }
    }

    return NextResponse.json({ 
      success: true, 
      size: totalSize,
      message: "Upload received"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
