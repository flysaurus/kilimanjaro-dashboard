import type { Exercise } from '@/lib/exercises';

interface Week {
  number: number;
  phase: string;
  focus: string;
  days: Array<{
    day: string;
    type: 'strength' | 'cardio' | 'hike' | 'rest' | 'active-recovery';
    exercises?: string[];
    description: string;
    duration?: string;
  }>;
}

export const trainingPlan: Week[] = [
  {
    number: 1,
    phase: 'Base Building',
    focus: 'Build movement patterns, establish consistency',
    days: [
      { day: 'Mon', type: 'strength', description: 'Lower body + core', exercises: ['goblet-squat', 'lunge', 'plank', 'stepup'], duration: '45 min' },
      { day: 'Tue', type: 'cardio', description: 'Incline walk or stairmaster', duration: '30 min' },
      { day: 'Wed', type: 'rest', description: 'Full rest or light walk' },
      { day: 'Thu', type: 'strength', description: 'Lower body + ankle mobility', exercises: ['rdl', 'calfraise', 'singleleg', 'anklemobility'], duration: '45 min' },
      { day: 'Fri', type: 'hike', description: 'Light hike, flat terrain', duration: '60 min' },
      { day: 'Sat', type: 'active-recovery', description: 'Foam rolling + hip mobility', exercises: ['hipmobility', 'foamroll'], duration: '20 min' },
      { day: 'Sun', type: 'rest', description: 'Rest' },
    ],
  },
  {
    number: 2,
    phase: 'Base Building',
    focus: 'Increase volume slightly, maintain form',
    days: [
      { day: 'Mon', type: 'strength', description: 'Lower body + core', exercises: ['goblet-squat', 'lunge', 'plank', 'stepup'], duration: '50 min' },
      { day: 'Tue', type: 'cardio', description: 'Incline walk, start adding pack weight (5 lbs)', duration: '35 min' },
      { day: 'Wed', type: 'rest', description: 'Full rest' },
      { day: 'Thu', type: 'strength', description: 'Lower body + ankle focus', exercises: ['rdl', 'calfraise', 'singleleg', 'anklemobility'], duration: '50 min' },
      { day: 'Fri', type: 'hike', description: 'Hike with some elevation, 5 lb pack', duration: '90 min' },
      { day: 'Sat', type: 'active-recovery', description: 'Foam rolling + stretching', exercises: ['hipmobility', 'foamroll'], duration: '30 min' },
      { day: 'Sun', type: 'rest', description: 'Rest' },
    ],
  },
  {
    number: 3,
    phase: 'Base Building',
    focus: 'Consistency and recovery audit',
    days: [
      { day: 'Mon', type: 'strength', description: 'Lower body + core', exercises: ['goblet-squat', 'lunge', 'plank', 'stepup'], duration: '50 min' },
      { day: 'Tue', type: 'cardio', description: 'Stairmaster, intervals', duration: '35 min' },
      { day: 'Wed', type: 'rest', description: 'Full rest' },
      { day: 'Thu', type: 'strength', description: 'Lower body + balance', exercises: ['rdl', 'calfraise', 'singleleg', 'deadbug'], duration: '50 min' },
      { day: 'Fri', type: 'hike', description: 'Hike with 8 lb pack', duration: '2 hours' },
      { day: 'Sat', type: 'active-recovery', description: 'Mobility work', exercises: ['hipmobility', 'foamroll'], duration: '30 min' },
      { day: 'Sun', type: 'rest', description: 'Rest' },
    ],
  },
  {
    number: 4,
    phase: 'Recovery / Deload',
    focus: 'Reduce volume 30-40%, let body adapt',
    days: [
      { day: 'Mon', type: 'strength', description: 'Light lower body', exercises: ['goblet-squat', 'plank'], duration: '30 min' },
      { day: 'Tue', type: 'cardio', description: 'Easy incline walk', duration: '20 min' },
      { day: 'Wed', type: 'rest', description: 'Rest' },
      { day: 'Thu', type: 'strength', description: 'Light lower body', exercises: ['rdl', 'calfraise'], duration: '30 min' },
      { day: 'Fri', type: 'active-recovery', description: 'Easy walk or swim', duration: '30 min' },
      { day: 'Sat', type: 'rest', description: 'Rest' },
      { day: 'Sun', type: 'rest', description: 'Rest' },
    ],
  },
];

// Build a full 16-week plan by repeating and progressing the pattern
function buildFullPlan(): Week[] {
  const fullPlan: Week[] = [];
  const basePlan = trainingPlan;

  // Phase durations
  const phases = [
    { name: 'Base Building', weeks: 4, progression: 'volume' },
    { name: 'Build Phase', weeks: 6, progression: 'intensity' },
    { name: 'Peak Phase', weeks: 4, progression: 'specificity' },
    { name: 'Taper', weeks: 2, progression: 'reduce' },
  ];

  let weekNum = 1;

  for (const phase of phases) {
    for (let w = 0; w < phase.weeks; w++) {
      const isDeload = phase.name === 'Base Building' && w === 3;
      const isTaper = phase.name === 'Taper';
      const isPeak = phase.name === 'Peak Phase';
      const isBuild = phase.name === 'Build Phase';

      const week: Week = {
        number: weekNum,
        phase: phase.name,
        focus: getFocus(phase.name, w),
        days: [
          { day: 'Mon', type: 'strength', description: getStrengthDesc(phase.name, w), exercises: getStrengthExercises(phase.name), duration: getDuration('strength', phase.name, w) },
          { day: 'Tue', type: 'cardio', description: getCardioDesc(phase.name, w), duration: getDuration('cardio', phase.name, w) },
          { day: 'Wed', type: 'rest', description: 'Full rest' },
          { day: 'Thu', type: 'strength', description: getStrengthDesc2(phase.name, w), exercises: getStrengthExercises2(phase.name), duration: getDuration('strength', phase.name, w) },
          { day: 'Fri', type: 'hike', description: getHikeDesc(phase.name, w), duration: getDuration('hike', phase.name, w) },
          { day: 'Sat', type: 'active-recovery', description: 'Foam rolling + mobility', exercises: ['hipmobility', 'foamroll'], duration: '30 min' },
          { day: 'Sun', type: 'rest', description: 'Rest' },
        ],
      };

      if (isDeload || isTaper) {
        week.days = week.days.map(d => ({
          ...d,
          duration: d.duration ? reduceDuration(d.duration, isTaper ? 0.5 : 0.6) : d.duration,
        }));
      }

      fullPlan.push(week);
      weekNum++;
    }
  }

  return fullPlan;
}

function getFocus(phase: string, week: number): string {
  switch (phase) {
    case 'Base Building':
      return week < 3 ? 'Build movement patterns, establish consistency' : 'Recovery week — reduce volume';
    case 'Build Phase':
      return `Progressive overload, week ${week + 1} of 6`;
    case 'Peak Phase':
      return 'Maximum specificity — simulate Kili conditions';
    case 'Taper':
      return 'Reduce volume, maintain intensity, arrive fresh';
    default:
      return 'Training';
  }
}

function getStrengthDesc(phase: string, week: number): string {
  if (phase === 'Peak Phase') return 'Heavy lower body + core, simulate fatigue';
  if (phase === 'Taper') return 'Moderate strength, maintain muscle';
  return 'Lower body + core foundation';
}

function getStrengthDesc2(phase: string, week: number): string {
  if (phase === 'Peak Phase') return 'Unilateral focus + ankle stability under load';
  if (phase === 'Taper') return 'Light lower body, focus on form';
  return 'Lower body + posterior chain';
}

function getStrengthExercises(phase: string): string[] {
  if (phase === 'Peak Phase') return ['stepup', 'goblet-squat', 'lunge', 'plank'];
  return ['goblet-squat', 'lunge', 'plank', 'stepup'];
}

function getStrengthExercises2(phase: string): string[] {
  if (phase === 'Peak Phase') return ['singleleg', 'rdl', 'calfraise', 'deadbug'];
  return ['rdl', 'calfraise', 'singleleg', 'anklemobility'];
}

function getCardioDesc(phase: string, week: number): string {
  if (phase === 'Base Building') return week === 0 ? 'Incline walk' : 'Incline walk with pack weight';
  if (phase === 'Build Phase') return `Stairmaster or incline walk, pack weight ${5 + week * 2} lbs`;
  if (phase === 'Peak Phase') return 'Long stairmaster session with full pack weight';
  if (phase === 'Taper') return 'Easy cardio, maintain aerobic base';
  return 'Cardio';
}

function getHikeDesc(phase: string, week: number): string {
  if (phase === 'Base Building') return week < 2 ? 'Flat terrain hike' : 'Hills with pack weight';
  if (phase === 'Build Phase') return `Hike with ${8 + week * 2} lb pack, increasing elevation`;
  if (phase === 'Peak Phase') return 'Long hike with full pack (15-20 lbs), maximize elevation';
  if (phase === 'Taper') return 'Short easy hike, keep legs fresh';
  return 'Hike';
}

function getDuration(type: string, phase: string, week: number): string {
  const multipliers: Record<string, number> = {
    'Base Building': 1,
    'Build Phase': 1 + week * 0.15,
    'Peak Phase': 1.8,
    'Taper': 0.5,
  };
  const base = multipliers[phase] || 1;

  switch (type) {
    case 'strength':
      return `${Math.round(45 * base)}-${Math.round(60 * base)} min`;
    case 'cardio':
      return `${Math.round(30 * base)}-${Math.round(45 * base)} min`;
    case 'hike':
      if (phase === 'Base Building') return `${Math.round(60 * base)}-${Math.round(90 * base)} min`;
      if (phase === 'Build Phase') return `${Math.round(90 * base)}-${Math.round(180 * base)} min`;
      if (phase === 'Peak Phase') return `${Math.round(180 * base)}-${Math.round(360 * base)} min`;
      return `${Math.round(60 * base)} min`;
    default:
      return '30 min';
  }
}

function reduceDuration(duration: string, factor: number): string {
  const match = duration.match(/(\d+)-(\d+)/);
  if (match) {
    const min = Math.round(parseInt(match[1]) * factor);
    const max = Math.round(parseInt(match[2]) * factor);
    return `${min}-${max} min`;
  }
  const single = duration.match(/(\d+)/);
  if (single) {
    return `${Math.round(parseInt(single[1]) * factor)} min`;
  }
  return duration;
}

export const fullTrainingPlan = buildFullPlan();
