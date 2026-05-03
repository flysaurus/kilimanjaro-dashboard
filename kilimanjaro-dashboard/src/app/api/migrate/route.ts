import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dataStatic from '@/lib/data.json';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const expected = process.env.WEBHOOK_TOKEN;
  if (expected) {
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match || match[1] !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(url, key);
  let metricsInserted = 0;
  let workoutsInserted = 0;

  // Insert metrics
  if (Array.isArray(dataStatic.metrics)) {
    for (const m of dataStatic.metrics) {
      const { error } = await supabase.from('metrics').insert({
        date: m.date,
        metric_type: m.metricType ?? m.metric_type,
        value: m.value,
        unit: m.unit,
        source: m.source ?? '',
      });
      if (!error) metricsInserted++;
    }
  }

  // Insert workouts
  if (Array.isArray(dataStatic.workouts)) {
    for (const w of dataStatic.workouts) {
      const { error } = await supabase.from('workouts').insert({
        date: w.date,
        workout_type: w.workoutType ?? w.workout_type,
        duration: w.duration,
        distance: w.distance ?? null,
        elevation_gain: w.elevationGain ?? w.elevation_gain ?? null,
        active_energy: w.activeEnergy ?? w.active_energy ?? null,
        avg_heart_rate: w.avgHeartRate ?? w.avg_heart_rate ?? null,
        max_heart_rate: w.maxHeartRate ?? w.max_heart_rate ?? null,
        notes: w.notes ?? null,
      });
      if (!error) workoutsInserted++;
    }
  }

  return NextResponse.json({ success: true, metricsInserted, workoutsInserted });
}
