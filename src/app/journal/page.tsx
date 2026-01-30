'use client';

import { useEffect, useState } from 'react';
import { loadState, formatDate } from '@/lib/storage';
import { AppState, JournalEntry, MOOD_OPTIONS, ENTRY_TYPES } from '@/types';
import Link from 'next/link';

export default function JournalPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    setState(loadState());
  }, []);

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const filteredEntries = state.entries.filter(entry => {
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
    const matchesSearch = searchQuery === '' || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesMood && matchesSearch;
  });

  // Stats
  const todayCount = state.entries.filter(e => 
    e.date.startsWith(new Date().toISOString().split('T')[0])
  ).length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekCount = state.entries.filter(e => new Date(e.date) >= weekAgo).length;
  const avgMood = state.entries.length > 0 
    ? state.entries.reduce((acc, e) => {
        const moodScore = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
        return acc + (moodScore[e.mood as keyof typeof moodScore] || 3);
      }, 0) / state.entries.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Journal</h1>
          <p className="text-gray-500 mt-1">Document your thoughts, progress, and reflections</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Entry</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{state.entries.length}</p>
              <p className="text-xs text-gray-500">Total Entries</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{todayCount}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{weekCount}</p>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <span className="text-xl">{avgMood >= 4 ? '😊' : avgMood >= 3 ? '😐' : '😔'}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgMood.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Avg Mood</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All
            </button>
            {ENTRY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === type.value
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Mood Filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5">
            <button
              onClick={() => setMoodFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                moodFilter === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              All Moods
            </button>
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setMoodFilter(mood.value)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  moodFilter === mood.value
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
                title={mood.label}
              >
                <span className="text-lg">{mood.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {state.entries.length === 0 ? 'No entries yet' : 'No matching entries'}
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {state.entries.length === 0 
              ? 'Start documenting your journey. Every entry is a step towards your goals.'
              : 'Try adjusting your filters or search query.'}
          </p>
          {state.entries.length === 0 && (
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Write Your First Entry
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {filteredEntries.map((entry) => {
            const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
            const type = ENTRY_TYPES.find(t => t.value === entry.type);
            const linkedGoals = state.goals.filter(g => entry.linkedGoals.includes(g.id));
            
            return (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="card p-6 block group hover:border-purple-500/30"
              >
                <div className="flex items-start gap-5">
                  {/* Mood indicator */}
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                    {mood?.emoji}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                          {entry.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <span>{formatDate(entry.date)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            entry.type === 'journal' ? 'bg-blue-500/10 text-blue-400' :
                            entry.type === 'blog' ? 'bg-green-500/10 text-green-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            {type?.label}
                          </span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Preview */}
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {entry.content}
                    </p>

                    {/* Tags and Goals */}
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-500">
                          +{entry.tags.length - 3} more
                        </span>
                      )}
                      {linkedGoals.slice(0, 2).map((goal) => (
                        <span 
                          key={goal.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: goal.color + '15', color: goal.color }}
                        >
                          🎯 {goal.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
