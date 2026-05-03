'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, Heart, Mountain, Moon, Sun, Footprints } from 'lucide-react';
import { fullTrainingPlan } from '@/lib/plan';
import Link from 'next/link';

const typeStyles: Record<string, { bg: string; text: string; icon: typeof Dumbbell }> = {
  strength: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Dumbbell },
  cardio: { bg: 'bg-rose-50', text: 'text-rose-700', icon: Heart },
  hike: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Mountain },
  rest: { bg: 'bg-slate-50', text: 'text-slate-500', icon: Moon },
  'active-recovery': { bg: 'bg-blue-50', text: 'text-blue-700', icon: Sun },
};

function WeekCard({ week, isExpanded, onToggle }: {
  week: typeof fullTrainingPlan[number];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const today = new Date();
  const isCurrentWeek = false; // Could add logic to highlight current week

  return (
    <div className={`bg-white rounded-xl border ${isCurrentWeek ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'} overflow-hidden shadow-sm`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700">
            W{week.number}
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-800">{week.phase}</p>
            <p className="text-xs text-slate-500">{week.focus}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
            {week.days.map((day) => {
              const style = typeStyles[day.type] || typeStyles.rest;
              const Icon = style.icon;
              return (
                <div
                  key={day.day}
                  className={`rounded-lg p-3 ${style.bg} border border-slate-100`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${style.text}`} />
                    <span className={`text-xs font-semibold uppercase ${style.text}`}>
                      {day.day}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {day.type === 'rest' ? 'Rest Day' : day.description}
                  </p>
                  {day.duration && (
                    <p className="text-xs text-slate-500">{day.duration}</p>
                  )}
                  {day.exercises && day.exercises.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {day.exercises.map((exId) => (
                        <Link
                          key={exId}
                          href={`/exercises#${exId}`}
                          className="text-xs bg-white/70 hover:bg-white px-1.5 py-0.5 rounded text-slate-600 transition"
                        >
                          {exId}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [filterPhase, setFilterPhase] = useState<string>('all');

  const phases = ['all', ...new Set(fullTrainingPlan.map(w => w.phase))];

  const filtered = filterPhase === 'all'
    ? fullTrainingPlan
    : fullTrainingPlan.filter(w => w.phase === filterPhase);

  const toggleWeek = (num: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const expandAll = () => setExpandedWeeks(new Set(filtered.map(w => w.number)));
  const collapseAll = () => setExpandedWeeks(new Set());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">16-Week Training Plan</h1>
        <p className="text-sm text-slate-500">
          3 days/week · Built for your schedule · Ankle-safe progression
        </p>
      </div>

      {/* Phase filters */}
      <div className="flex flex-wrap items-center gap-2">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setFilterPhase(phase)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filterPhase === phase
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {phase === 'all' ? 'All Weeks' : phase}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={expandAll}
          className="text-sm text-slate-500 hover:text-slate-700 px-2"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="text-sm text-slate-500 hover:text-slate-700 px-2"
        >
          Collapse all
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">16</p>
          <p className="text-xs text-slate-500">Total Weeks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">3</p>
          <p className="text-xs text-slate-500">Days/Week</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">48</p>
          <p className="text-xs text-slate-500">Training Sessions</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{filtered.length}</p>
          <p className="text-xs text-slate-500">Weeks Shown</p>
        </div>
      </div>

      {/* Week cards */}
      <div className="space-y-3">
        {filtered.map((week) => (
          <WeekCard
            key={week.number}
            week={week}
            isExpanded={expandedWeeks.has(week.number)}
            onToggle={() => toggleWeek(week.number)}
          />
        ))}
      </div>

      {/* Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-amber-800 mb-2">Important Notes</h3>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>
            <strong>Ankle caution:</strong> Your previously injured ankle needs extra care. Prioritize
            ankle mobility drills before every session. If you feel any ankle discomfort during a workout, stop immediately.
          </li>
          <li>
            <strong>Pack weight progression:</strong> Start with 5 lbs, add 2-3 lbs every 2 weeks. Peak at 15-20 lbs
            (your estimated pack weight for Kili).
          </li>
          <li>
            <strong>Missing hikes?</strong> Replace Friday hikes with extended StairMaster sessions (45-60 min) or
            treadmill incline walks with pack weight. The key is continuous stepping under load.
          </li>
          <li>
            <strong>Rest is training:</strong> Your 4 rest days/week are non-negotiable. This is when adaptation happens.
            Don&apos;t skip rest days to &quot;catch up&quot; — it leads to injury.
          </li>
          <li>
            <strong>Listen to your body:</strong> If you&apos;re unusually fatigued or sore, take an extra rest day.
            Consistency over 16 weeks beats perfection over 8 weeks.
          </li>
        </ul>
      </div>
    </div>
  );
}
