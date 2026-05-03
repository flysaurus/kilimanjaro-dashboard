'use client';

import { useState } from 'react';
import { Search, Play, X, Dumbbell, Heart, Mountain, Move, Shield } from 'lucide-react';
import { exercises, exerciseCategories, type CategoryKey } from '@/lib/exercises';

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: typeof exercises[number] }) {
  const [showVideo, setShowVideo] = useState(false);

  const categoryColors: Record<string, string> = {
    strength: 'bg-amber-100 text-amber-800',
    cardio: 'bg-rose-100 text-rose-800',
    hiking: 'bg-emerald-100 text-emerald-800',
    mobility: 'bg-blue-100 text-blue-800',
    balance: 'bg-purple-100 text-purple-800',
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    strength: Dumbbell,
    cardio: Heart,
    hiking: Mountain,
    mobility: Move,
    balance: Shield,
  };

  const Icon = categoryIcons[exercise.category] || Dumbbell;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${categoryColors[exercise.category]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800">{exercise.name}</h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[exercise.category]}`}>
            {exercise.category}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-3">{exercise.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {exercise.targetMuscles.map((muscle) => (
            <span key={muscle} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {muscle}
            </span>
          ))}
        </div>

        {(exercise.sets || exercise.reps || exercise.duration) && (
          <div className="flex gap-4 text-sm text-slate-500 mb-3">
            {exercise.sets && <span>{exercise.sets} sets</span>}
            {exercise.reps && <span>{exercise.reps} reps</span>}
            {exercise.duration && <span>{exercise.duration}</span>}
          </div>
        )}

        {exercise.youtubeId && (
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium mb-3"
          >
            <Play className="w-4 h-4" />
            {showVideo ? 'Hide video' : 'Watch demo'}
          </button>
        )}

        {showVideo && exercise.youtubeId && (
          <div className="mb-4">
            <YouTubeEmbed videoId={exercise.youtubeId} title={exercise.name} />
          </div>
        )}

        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 uppercase mb-1">Why for Kili</p>
            <p className="text-sm text-amber-700">{exercise.forKili}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Tips</p>
            <ul className="space-y-1">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {exercise.progression && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Progression</p>
              <p className="text-sm text-slate-600">{exercise.progression}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [search, setSearch] = useState('');

  const filtered = exercises.filter((ex) => {
    const matchesCategory = activeCategory === 'all' || ex.category === activeCategory;
    const matchesSearch =
      search === '' ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.targetMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
      ex.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Exercise Library</h1>
        <p className="text-sm text-slate-500">
          Targeted training for Kilimanjaro — lower body, core, cardio, and recovery
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search exercises, muscles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {exerciseCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat.key
                ? 'bg-slate-800 text-white'
                : `${cat.color} hover:opacity-80`
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No exercises found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
