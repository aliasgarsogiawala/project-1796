'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadState, updateEntry, deleteEntry, formatDate } from '@/lib/storage';
import { AppState, JournalEntry, MOOD_OPTIONS, ENTRY_TYPES, GOAL_CATEGORIES } from '@/types';
import Link from 'next/link';

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<JournalEntry['mood']>('okay');
  const [editLinkedGoals, setEditLinkedGoals] = useState<string[]>([]);
  const [editTagsInput, setEditTagsInput] = useState('');

  useEffect(() => {
    setMounted(true);
    const loadedState = loadState();
    setState(loadedState);
    
    const foundEntry = loadedState.entries.find(e => e.id === params.id);
    if (foundEntry) {
      setEntry(foundEntry);
      setEditTitle(foundEntry.title);
      setEditContent(foundEntry.content);
      setEditMood(foundEntry.mood);
      setEditLinkedGoals(foundEntry.linkedGoals);
      setEditTagsInput(foundEntry.tags.join(', '));
    }
  }, [params.id]);

  const handleDelete = () => {
    if (!state || !entry) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(state, entry.id);
      router.push('/journal');
    }
  };

  const handleSaveEdit = () => {
    if (!state || !entry || !editTitle.trim() || !editContent.trim()) return;

    const tags = editTagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const updatedState = updateEntry(state, entry.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      mood: editMood,
      linkedGoals: editLinkedGoals,
      tags,
    });

    setState(updatedState);
    const updatedEntry = updatedState.entries.find(e => e.id === entry.id);
    if (updatedEntry) {
      setEntry(updatedEntry);
    }
    setIsEditing(false);
  };

  const toggleGoal = (goalId: string) => {
    setEditLinkedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto fade-in">
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Entry not found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            This entry may have been deleted or the link is incorrect.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
  const entryType = ENTRY_TYPES.find(t => t.value === entry.type);
  const linkedGoals = state.goals.filter(g => entry.linkedGoals.includes(g.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/journal"
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Journal
        </Link>
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Mood */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-400 mb-4">
              Mood
            </label>
            <div className="flex gap-3 justify-center">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setEditMood(m.value as JournalEntry['mood'])}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                    editMood === m.value
                      ? 'bg-white/10 scale-105 ring-2 ring-primary-500/50'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-3xl mb-2">{m.emoji}</span>
                  <span className={`text-xs font-medium ${editMood === m.value ? 'text-white' : 'text-gray-500'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Content */}
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="input resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                placeholder="Separate tags with commas"
                className="input"
              />
            </div>
          </div>

          {/* Link to Goals */}
          {state.goals.length > 0 && (
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-400 mb-4">
                Linked Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {state.goals.map((goal) => {
                  const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        editLinkedGoals.includes(goal.id)
                          ? 'ring-2 ring-offset-2 ring-offset-[#111]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: goal.color + (editLinkedGoals.includes(goal.id) ? '30' : '15'),
                        color: editLinkedGoals.includes(goal.id) ? goal.color : '#999',
                        ['--tw-ring-color' as string]: editLinkedGoals.includes(goal.id) ? goal.color : undefined
                      }}
                    >
                      <span>{category?.emoji}</span>
                      <span>{goal.title}</span>
                      {editLinkedGoals.includes(goal.id) && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || !editContent.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <article className="space-y-6">
          {/* Entry Header Card */}
          <div className="card p-8">
            {/* Type Badge & Date */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  entry.type === 'journal' 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : entry.type === 'blog' 
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {entryType?.label}
                </span>
                <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl">{mood?.emoji}</span>
                <span className="text-xs text-gray-500 mt-1">{mood?.label}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-6">{entry.title}</h1>

            {/* Tags & Linked Goals */}
            {(entry.tags.length > 0 || linkedGoals.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-[#1a1a1a]">
                {entry.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1.5 bg-[#1a1a1a] rounded-lg text-xs text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
                {linkedGoals.map((goal) => {
                  const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
                  return (
                    <Link
                      key={goal.id}
                      href="/goals"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: goal.color + '15',
                        color: goal.color 
                      }}
                    >
                      <span>{category?.emoji}</span>
                      <span>{goal.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-[15px]">
                {entry.content}
              </div>
            </div>
          </div>

          {/* Meta Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Created {formatDate(entry.createdAt)}</span>
          </div>
        </article>
      )}
    </div>
  );
}
