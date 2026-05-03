import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';
import { getCutoffDate } from '@/lib/date-utils';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);

  const now = new Date();
  const cutoff = getCutoffDate(days);
  const allData = dataStore.getAllData();

  const metrics = await dataStore.getMetrics(undefined, days);
  const workouts = await dataStore.getWorkouts(days);
  const stats = await dataStore.getStats(days);

  return NextResponse.json({
    server: {
      now: now.toISOString(),
      nowUnix: now.getTime(),
    },
    filtering: {
      requestedDays: days,
      cutoffISO: cutoff.toISOString(),
      cutoffUnix: cutoff.getTime(),
    },
    store: {
      totalMetrics: allData.metrics.length,
      totalWorkouts: allData.workouts.length,
      metricTypes: [...new Set(allData.metrics.map(m => m.metricType))],
      metricDateRange: {
        first: allData.metrics[0]?.date,
        last: allData.metrics[allData.metrics.length - 1]?.date,
      },
      workoutDateRange: {
        first: allData.workouts[0]?.date,
        last: allData.workouts[allData.workouts.length - 1]?.date,
      },
    },
    filtered: {
      metricCount: metrics.length,
      workoutCount: workouts.length,
      metricTypes: [...new Set(metrics.map(m => m.metricType))],
      metricDateRange: {
        first: metrics[0]?.date,
        last: metrics[metrics.length - 1]?.date,
      },
    },
    stats,
    sampleMetrics: metrics.slice(0, 3),
    sampleWorkouts: workouts.slice(0, 3),
  });
}
