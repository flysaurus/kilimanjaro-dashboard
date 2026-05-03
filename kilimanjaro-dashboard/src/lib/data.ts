import { NextResponse } from 'next/server';
import { getSupabase, addMetricToSupabase, addWorkoutToSupabase, getMetricsFromSupabase, getWorkoutsFromSupabase, getStatsFromSupabase } from './supabase';

export type HealthMetric = {
  id: string;
  date: string;
  metricType: 'steps' | 'distance' | 'activeEnergy' | 'restingHeartRate' | 'heartRate' | 'sleep' | 'weight' | 'elevation';
  value: number;
  unit: string;
  source: string;
  createdAt: string;
};

export type Workout = {
  id: string;
  date: string;
  workoutType: string;
  duration: number; // minutes
  distance?: number;
  elevationGain?: number;
  activeEnergy?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  notes?: string;
  createdAt: string;
};

// Check if Supabase is configured
function hasSupabase(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

// Load data from static JSON (baked at build time)
function loadStaticData(): { metrics: HealthMetric[]; workouts: Workout[] } {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src/lib/data.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load data.json:', e);
  }
  return { metrics: [], workouts: [] };
}

const staticData = loadStaticData();

// In-memory storage with Supabase persistence
class DataStore {
  private metrics: HealthMetric[] = [...staticData.metrics];
  private workouts: Workout[] = [...staticData.workouts];
  private maxItems = 5000;
  private useSupabase = hasSupabase();

  addMetric(metric: Omit<HealthMetric, 'id' | 'createdAt'>) {
    const newMetric: HealthMetric = {
      ...metric,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.metrics.push(newMetric);
    if (this.metrics.length > this.maxItems) {
      this.metrics = this.metrics.slice(-this.maxItems);
    }
    // Persist to Supabase in background (non-blocking)
    if (this.useSupabase) {
      addMetricToSupabase(metric).catch(() => {});
    }
    return newMetric;
  }

  addWorkout(workout: Omit<Workout, 'id' | 'createdAt'>) {
    const newWorkout: Workout = {
      ...workout,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.workouts.push(newWorkout);
    if (this.workouts.length > this.maxItems / 2) {
      this.workouts = this.workouts.slice(-Math.floor(this.maxItems / 2));
    }
    // Persist to Supabase in background (non-blocking)
    if (this.useSupabase) {
      addWorkoutToSupabase(workout).catch(() => {});
    }
    return newWorkout;
  }

  async getMetrics(type?: string, days = 90): Promise<HealthMetric[]> {
    // If Supabase is available, use it
    if (this.useSupabase) {
      const remote = await getMetricsFromSupabase(type, days);
      if (remote.length > 0) return remote;
    }
    // Fallback to in-memory
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    let filtered = this.metrics.filter(m => new Date(m.date) >= cutoff);
    if (type) {
      filtered = filtered.filter(m => m.metricType === type);
    }
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getWorkouts(days = 90): Promise<Workout[]> {
    if (this.useSupabase) {
      const remote = await getWorkoutsFromSupabase(days);
      if (remote.length > 0) return remote;
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.workouts
      .filter(w => new Date(w.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getAllData() {
    return {
      metrics: this.metrics,
      workouts: this.workouts,
    };
  }

  exportData() {
    return JSON.stringify({ metrics: this.metrics, workouts: this.workouts }, null, 2);
  }

  importData(data: string) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.metrics) this.metrics = parsed.metrics;
      if (parsed.workouts) this.workouts = parsed.workouts;
      return { success: true, metrics: this.metrics.length, workouts: this.workouts.length };
    } catch (e) {
      return { success: false, error: 'Invalid JSON' };
    }
  }

  async getStats(days = 30) {
    if (this.useSupabase) {
      const remote = await getStatsFromSupabase(days);
      if (remote.totalWorkouts > 0 || remote.avgSteps > 0) return remote;
    }
    const metrics = await this.getMetrics(undefined, days);
    const workouts = await this.getWorkouts(days);

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
}

export const dataStore = new DataStore();
