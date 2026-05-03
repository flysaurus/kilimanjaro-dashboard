import { NextResponse } from 'next/server';

// Temporary raw payload capture for debugging
const payloadLog: Array<{ time: string; preview: string; size: number; type: string }> = [];

export async function POST(request: Request) {
  try {
    let body: unknown;
    const contentType = request.headers.get('content-type') || '';
    
    try {
      body = await request.json();
    } catch {
      const text = await request.text();
      body = { rawText: text.slice(0, 5000) };
    }

    const bodyStr = JSON.stringify(body);
    const preview = bodyStr.slice(0, 800);
    
    // Detect if this contains workouts
    const hasWorkouts = bodyStr.toLowerCase().includes('workout');
    const hasMetrics = bodyStr.toLowerCase().includes('step') || bodyStr.toLowerCase().includes('heart');
    const type = hasWorkouts && hasMetrics ? 'both' : hasWorkouts ? 'workouts' : hasMetrics ? 'metrics' : 'unknown';

    payloadLog.unshift({
      time: new Date().toISOString(),
      preview,
      size: bodyStr.length,
      type,
    });
    if (payloadLog.length > 10) payloadLog.pop();

    return NextResponse.json({ 
      success: true, 
      message: 'Captured',
      detectedType: type,
    });
  } catch {
    return NextResponse.json({ success: false });
  }
}

export async function GET() {
  return NextResponse.json({
    captured: payloadLog.length,
    payloads: payloadLog,
    instruction: 'Temporarily change your Health Auto Export webhook URL to this endpoint to inspect payloads',
    currentEndpoint: '/api/capture',
    realEndpoint: '/api/webhook/health',
  });
}
