import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { HealthMetric, Workout } from './data';
import { getCutoffDate } from './data';

// Supabase client — lazily initialized
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

export async function initSupabaseTables(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.rpc('create_health_tables');
    return !error;
  } catch {
    return false;
  }
}

export async function addMetricToSupabase(metric: Omit<HealthMetric, 'id' | 'createdAt'>): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('metrics').insert({
      date: metric.date,
      metric_type: metric.metricType,
      value: metric.value,
      unit: metric.unit,
      source: metric.source,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function addWorkoutToSupabase(workout: Omit<Workout, 'id' | 'createdAt'>): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('workouts').insert({
      date: workout.date,
      workout_type: workout.workoutType,
      duration: workout.duration,
      distance: workout.distance ?? null,
      elevation_gain: workout.elevationGain ?? null,
      active_energy: workout.activeEnergy ?? null,
      avg_heart_rate: workout.avgHeartRate ?? null,
      max_heart_rate: workout.maxHeartRate ?? null,
      notes: workout.notes ?? null,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function getMetricsFromSupabase(type?: string, days = 90): Promise<HealthMetric[]> {
  const client = getSupabase();
  if (!client) return [];
  try {
    const cutoff = getCutoffDate(days);
    let query = client
      .from('metrics')
      .select('*')
      .gte('date', cutoff.toISOString())
      .order('date', { ascending: true });
    if (type) {
      query = query.eq('metric_type', type);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      date: String(row.date),
      metricType: String(row.metric_type) as HealthMetric['metricType'],
      value: Number(row.value),
      unit: String(row.unit),
      source: String(row.source),
      createdAt: String(row.created_at),
    }));
  } catch {
    return [];
  }
}

export async function getWorkoutsFromSupabase(days = 90): Promise<Workout[]> {
  const client = getSupabase();
  if (!client) return [];
  try {
    const cutoff = getCutoffDate(days);
    const { data, error } = await client
      .from('workouts')
      .select('*')
      .gte('date', cutoff.toISOString())
      .order('date', { ascending: true });
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      date: String(row.date),
      workoutType: String(row.workout_type),
      duration: Number(row.duration),
      distance: row.distance ? Number(row.distance) : undefined,
      elevationGain: row.elevation_gain ? Number(row.elevation_gain) : undefined,
      activeEnergy: row.active_energy ? Number(row.active_energy) : undefined,
      avgHeartRate: row.avg_heart_rate ? Number(row.avg_heart_rate) : undefined,
      maxHeartRate: row.max_heart_rate ? Number(row.max_heart_rate) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      createdAt: String(row.created_at),
    }));
  } catch {
    return [];
  }
}

export async function getStatsFromSupabase(days = 30) {
  const metrics = await getMetricsFromSupabase(undefined, days);
  const workouts = await getWorkoutsFromSupabase(days);

  const steps = metrics.filter(m => m.metricType === 'steps');
  const avgSteps = steps.length ? Math.round(steps.reduce((a, b) => a + b.value, 0) / steps.length) : 0;

  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((a, b) => a + b.duration, 0);
  const totalElevation = workouts.reduce((a, b) => a + (b.elevationGain || 0), 0);

  return {
    avgSteps,
    totalWorkouts,
    totalDuration,
    totalElevation: Math.round(totalElevation),
    avgWorkoutDuration: totalWorkouts ? Math.round(totalDuration / totalWorkouts) : 0,
  };
}

export async function clearSupabaseData(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    await client.rpc('truncate_health_tables');
    return true;
  } catch {
    return false;
  }
}
