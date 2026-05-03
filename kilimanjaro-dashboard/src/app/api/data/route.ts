import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '90', 10);
  const type = url.searchParams.get('type') || undefined;

  const metrics = await dataStore.getMetrics(type, days);
  const workouts = await dataStore.getWorkouts(days);
  const stats = await dataStore.getStats(days);

  return NextResponse.json({
    metrics,
    workouts,
    stats,
    summary: {
      metricCount: metrics.length,
      workoutCount: workouts.length,
      dateRange: days,
    },
  });
}

export async function DELETE() {
  // Reset store
  // @ts-expect-error accessing private for reset
  dataStore.metrics = [];
  // @ts-expect-error accessing private for reset
  dataStore.workouts = [];
  return NextResponse.json({ success: true, message: 'All data cleared' });
}
