'use client';

import { useEffect, useState } from 'react';
import { loadState, deleteEntry } from '@/lib/storage';
import { AppState, MOOD_OPTIONS, ENTRY_TYPES } from '@/types';
import Link from 'next/link';
import { formatRelativeDate } from '@/lib/storage';

export default function JournalPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'journal' | 'blog' | 'reflection'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    setState(loadState());
  }, []);

  const handleDelete = (entryId: string) => {
    if (!state) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      const newState = deleteEntry(state, entryId);
      setState(newState);
    }
  };

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const filteredEntries = state.entries
    .filter(entry => filter === 'all' || entry.type === filter)
    .filter(entry => 
      searchQuery === '' || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Group entries by date
  const groupedEntries: { [key: string]: typeof filteredEntries } = {};
  filteredEntries.forEach(entry => {
    const dateKey = entry.date.split('T')[0];
    if (!groupedEntries[dateKey]) {
      groupedEntries[dateKey] = [];
    }
    groupedEntries[dateKey].push(entry);
  });

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Journal</h1>
          <p className="text-gray-400 mt-1">Document your journey and reflections</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <span>+</span>
          <span>New Entry</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        {/* Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-500/20 text-primary-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {ENTRY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value as typeof filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === type.value 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{state.entries.length}</p>
          <p className="text-sm text-gray-400">Total Entries</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {state.entries.filter(e => e.type === 'journal').length}
          </p>
          <p className="text-sm text-gray-400">Daily Journals</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {state.entries.filter(e => e.type === 'blog').length}
          </p>
          <p className="text-sm text-gray-400">Blog Posts</p>
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {state.entries.length === 0 ? 'No entries yet' : 'No matching entries'}
          </h2>
          <p className="text-gray-400 mb-6">
            {state.entries.length === 0 
              ? 'Start documenting your journey by creating your first entry.'
              : 'Try adjusting your filters or search query.'}
          </p>
          {state.entries.length === 0 && (
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <span>+</span>
              <span>Write Your First Entry</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateKey) => {
            const dayEntries = groupedEntries[dateKey];
            const displayDate = new Date(dateKey).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            
            return (
              <div key={dateKey}>
                <h3 className="text-sm font-medium text-gray-500 mb-4">{displayDate}</h3>
                <div className="space-y-4">
                  {dayEntries.map((entry) => {
                    const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
                    const entryType = ENTRY_TYPES.find(t => t.value === entry.type);
                    const linkedGoals = state.goals.filter(g => entry.linkedGoals.includes(g.id));
                    
                    return (
                      <div key={entry.id} className="glass rounded-xl p-5 card-hover">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{mood?.emoji}</span>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                              <p className="text-xs text-gray-500">
                                {entryType?.label} · {formatRelativeDate(entry.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/journal/${entry.id}`}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              ↗
                            </Link>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {entry.content}
                        </p>

                        {/* Tags & Goals */}
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400"
                            >
                              #{tag}
                            </span>
                          ))}
                          {linkedGoals.map((goal) => (
                            <span 
                              key={goal.id}
                              className="px-2 py-1 rounded text-xs"
                              style={{ 
                                backgroundColor: goal.color + '20',
                                color: goal.color 
                              }}
                            >
                              🎯 {goal.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
