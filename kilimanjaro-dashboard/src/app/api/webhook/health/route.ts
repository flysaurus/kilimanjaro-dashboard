import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';
import type { HealthMetric, Workout } from '@/lib/data';

// Health Auto Export sends JSON in multiple formats:
// 1. { data: { metrics: [...], workouts: [...] } } — Health Auto Export app
// 2. Array of flat records
// 3. Single flat record

function detectAndStore(body: unknown): { stored: number; type: string } {
  if (!body || typeof body !== 'object') {
    return { stored: 0, type: 'unknown' };
  }

  let stored = 0;
  let type = 'unknown';

  const obj = body as Record<string, unknown>;

  // Handle Health Auto Export format: { data: { metrics, workouts } }
  if (obj.data && typeof obj.data === 'object') {
    const data = obj.data as Record<string, unknown>;

    if (Array.isArray(data.metrics)) {
      for (const metricGroup of data.metrics) {
        const result = storeHaeMetricGroup(metricGroup as Record<string, unknown>);
        if (result) {
          stored += result.count;
          type = result.type;
        }
      }
    }

    if (Array.isArray(data.workouts)) {
      for (const workout of data.workouts) {
        const result = storeHaeWorkout(workout as Record<string, unknown>);
        if (result) {
          stored++;
          type = 'workout';
        }
      }
    }

    return { stored, type };
  }

  // Handle array of records (flat format)
  if (Array.isArray(body)) {
    for (const item of body) {
      const result = detectAndStoreSingle(item);
      if (result) {
        stored++;
        type = result;
      }
    }
    return { stored, type };
  }

  // Handle direct object (flat format)
  const result = detectAndStoreSingle(obj);
  if (result) {
    stored = 1;
    type = result;
  }

  return { stored, type };
}

// Store a Health Auto Export metric group: { name, units, data: [...] }
function storeHaeMetricGroup(group: Record<string, unknown>): { count: number; type: string } | null {
  const metricType = mapHaeMetricName(String(group.name || ''));
  if (!metricType) return null;

  const dataArray = group.data;
  if (!Array.isArray(dataArray)) return null;

  let count = 0;
  const unit = String(group.units || 'count');

  for (const point of dataArray) {
    if (!point || typeof point !== 'object') continue;
    const pt = point as Record<string, unknown>;

    let value: number | undefined;
    if (metricType === 'heartRate' && pt.Avg !== undefined) {
      value = parseFloatAny(pt.Avg);
    } else {
      value = parseFloatAny(pt.qty);
    }
    if (value === undefined) continue;

    const metric: Omit<HealthMetric, 'id' | 'createdAt'> = {
      date: parseDate(pt.date) || new Date().toISOString(),
      metricType,
      value,
      unit,
      source: String(pt.source || 'Health Auto Export').split('|')[0].trim(),
    };
    dataStore.addMetric(metric);
    count++;
  }

  return { count, type: metricType };
}

// Store a Health Auto Export workout
function storeHaeWorkout(item: Record<string, unknown>): boolean {
  const workout: Omit<Workout, 'id' | 'createdAt'> = {
    date: parseDate(item.startDate || item.date || item.creationDate) || new Date().toISOString(),
    workoutType: String(item.workoutType || item.name || item.type || 'Unknown'),
    duration: parseDuration(item.duration),
    distance: parseFloatAny(item.distance),
    elevationGain: parseFloatAny(item.elevationAscended || item.totalElevationGain),
    activeEnergy: parseFloatAny(item.activeEnergyBurned || item.activeEnergy || item.calories),
    avgHeartRate: parseFloatAny(item.averageHeartRate || item.heartRate),
    maxHeartRate: parseFloatAny(item.maximumHeartRate || item.maxHeartRate),
    notes: item.notes ? String(item.notes) : undefined,
  };
  dataStore.addWorkout(workout);
  return true;
}

// Map Health Auto Export metric names to our internal types
function mapHaeMetricName(name: string): HealthMetric['metricType'] | null {
  const n = name.toLowerCase();
  if (n.includes('step')) return 'steps';
  if (n.includes('distance') && !n.includes('elevation')) return 'distance';
  if (n.includes('active_energy') || n.includes('calorie')) return 'activeEnergy';
  if (n.includes('resting') && n.includes('heart')) return 'restingHeartRate';
  if (n.includes('heart_rate') && !n.includes('resting') && !n.includes('variability')) return 'heartRate';
  if (n.includes('sleep')) return 'sleep';
  if (n.includes('weight') || n.includes('mass')) return 'weight';
  if (n.includes('elevation') || n.includes('flights')) return 'elevation';
  // Skip types we don't track
  return null;
}

function detectAndStoreSingle(item: Record<string, unknown>): string | null {
  // Check for workout indicators
  if (item.workoutType || item.type === 'Workout' || (item.duration !== undefined && item.distance !== undefined)) {
    const workout: Omit<Workout, 'id' | 'createdAt'> = {
      date: parseDate(item.startDate || item.date || item.creationDate) || new Date().toISOString(),
      workoutType: String(item.workoutType || item.name || item.type || 'Unknown'),
      duration: parseDuration(item.duration),
      distance: parseFloatAny(item.distance),
      elevationGain: parseFloatAny(item.elevationAscended || item.totalElevationGain),
      activeEnergy: parseFloatAny(item.activeEnergyBurned || item.activeEnergy || item.calories),
      avgHeartRate: parseFloatAny(item.averageHeartRate || item.heartRate),
      maxHeartRate: parseFloatAny(item.maximumHeartRate || item.maxHeartRate),
      notes: item.notes ? String(item.notes) : undefined,
    };
    dataStore.addWorkout(workout);
    return 'workout';
  }

  // Check for health metric indicators
  const metricType = detectMetricType(item);
  if (metricType) {
    const metric: Omit<HealthMetric, 'id' | 'createdAt'> = {
      date: parseDate(item.startDate || item.date || item.creationDate || item.endDate) || new Date().toISOString(),
      metricType,
      value: parseFloatAny(item.quantity || item.value || item.count || item.avg) || 0,
      unit: String(item.unit || 'count'),
      source: String(item.sourceName || item.source || 'Health Auto Export'),
    };
    dataStore.addMetric(metric);
    return 'metric';
  }

  return null;
}

function detectMetricType(item: Record<string, unknown>): HealthMetric['metricType'] | null {
  const typeField = String(item.type || item.dataType || item.metricType || item.name || '').toLowerCase();
  
  if (typeField.includes('step')) return 'steps';
  if (typeField.includes('distance') && !typeField.includes('elevation')) return 'distance';
  if (typeField.includes('activeenergy') || typeField.includes('calorie')) return 'activeEnergy';
  if (typeField.includes('resting') && typeField.includes('heart')) return 'restingHeartRate';
  if (typeField.includes('heart') && typeField.includes('rate')) return 'heartRate';
  if (typeField.includes('sleep')) return 'sleep';
  if (typeField.includes('weight') || typeField.includes('mass')) return 'weight';
  if (typeField.includes('elevation') || typeField.includes('flights')) return 'elevation';
  
  // Try to infer from unit
  const unit = String(item.unit || '').toLowerCase();
  if (unit.includes('step')) return 'steps';
  if (unit.includes('km') || unit.includes('mile')) return 'distance';
  if (unit.includes('kcal') || unit.includes('cal')) return 'activeEnergy';
  if (unit.includes('bpm') || unit.includes('count/min')) return 'heartRate';
  if (unit.includes('kg') || unit.includes('lb')) return 'weight';
  if (unit.includes('m') && !unit.includes('km')) return 'elevation';

  return null;
}

function parseDate(val: unknown): string | null {
  if (!val) return null;
  const d = new Date(String(val));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function parseDuration(val: unknown): number {
  if (typeof val === 'number') {
    // Could be seconds or minutes — if > 100 assume seconds
    return val > 100 ? Math.round(val / 60) : val;
  }
  if (typeof val === 'string') {
    const num = parseFloat(val);
    if (!isNaN(num)) return num > 100 ? Math.round(num / 60) : num;
  }
  return 0;
}

function parseFloatAny(val: unknown): number | undefined {
  if (val === undefined || val === null) return undefined;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return isNaN(num) ? undefined : num;
}

export async function POST(request: Request) {
  // Bearer token auth
  const authHeader = request.headers.get('authorization') || '';
  const expected = process.env.WEBHOOK_TOKEN;
  if (expected) {
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match || match[1] !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const result = detectAndStore(body);

    return NextResponse.json({
      success: true,
      stored: result.stored,
      type: result.type,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }
}

// GET for debugging
export async function GET() {
  const data = dataStore.getAllData();
  return NextResponse.json({
    metrics: data.metrics.length,
    workouts: data.workouts.length,
    preview: {
      lastMetrics: data.metrics.slice(-3),
      lastWorkouts: data.workouts.slice(-3),
    },
  });
}
