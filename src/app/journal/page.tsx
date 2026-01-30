'use client';

import { useEffect, useState } from 'react';
import { loadState, deleteEntry, formatRelativeDate } from '@/lib/storage';
import { AppState, MOOD_OPTIONS, ENTRY_TYPES } from '@/types';
import Link from 'next/link';

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
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Journal</h1>
          <p className="text-gray-500 mt-1">Document your journey and reflections</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Entry</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex gap-1 p-1 bg-[#0a0a0a] rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              All
            </button>
            {ENTRY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value as typeof filter)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === type.value 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-white">{state.entries.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Entries</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-white">
            {state.entries.filter(e => e.type === 'journal').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Daily Journals</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-white">
            {state.entries.filter(e => e.type === 'blog').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Blog Posts</p>
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {state.entries.length === 0 ? 'No entries yet' : 'No matching entries'}
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {state.entries.length === 0 
              ? 'Start documenting your journey by creating your first entry.'
              : 'Try adjusting your filters or search query.'}
          </p>
          {state.entries.length === 0 && (
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Write Your First Entry
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
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">{displayDate}</h3>
                <div className="space-y-3">
                  {dayEntries.map((entry) => {
                    const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
                    const entryType = ENTRY_TYPES.find(t => t.value === entry.type);
                    const linkedGoals = state.goals.filter(g => entry.linkedGoals.includes(g.id));
                    
                    return (
                      <div key={entry.id} className="card p-5 group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{mood?.emoji}</span>
                            <div>
                              <h3 className="text-base font-semibold text-white group-hover:text-primary-400 transition-colors">{entry.title}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {entryType?.label}
                                <span className="mx-1.5">·</span>
                                {formatRelativeDate(entry.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/journal/${entry.id}`}
                              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {entry.content}
                        </p>

                        {/* Tags & Goals */}
                        {(entry.tags.length > 0 || linkedGoals.length > 0) && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag) => (
                              <span key={tag} className="tag">
                                #{tag}
                              </span>
                            ))}
                            {linkedGoals.map((goal) => (
                              <span 
                                key={goal.id}
                                className="tag"
                                style={{ 
                                  backgroundColor: goal.color + '15',
                                  color: goal.color 
                                }}
                              >
                                🎯 {goal.title}
                              </span>
                            ))}
                          </div>
                        )}
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
