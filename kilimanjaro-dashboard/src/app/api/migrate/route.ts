import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dataStatic from '@/lib/data.json';

interface StaticMetric {
  date: string;
  metricType?: string;
  metric_type?: string;
  value: number;
  unit: string;
  source?: string;
}

interface StaticWorkout {
  date: string;
  workoutType?: string;
  workout_type?: string;
  duration: number;
  distance?: number;
  elevationGain?: number;
  elevation_gain?: number;
  activeEnergy?: number;
  active_energy?: number;
  avgHeartRate?: number;
  avg_heart_rate?: number;
  maxHeartRate?: number;
  max_heart_rate?: number;
  notes?: string;
}

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
  const metrics = dataStatic.metrics as StaticMetric[];
  if (Array.isArray(metrics)) {
    for (const m of metrics) {
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
  const workouts = dataStatic.workouts as StaticWorkout[];
  if (Array.isArray(workouts)) {
    for (const w of workouts) {
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
